import { importPKCS8, SignJWT } from "jose";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  Gate,
  hash,
  sha,
  pathSchema,
  type Project,
  type Recipe,
} from "../contracts/index.js";

export interface FileObservation {
  path: string;
  content: string | null;
  blob_sha: string | null;
  mode: string | null;
  source: string;
}
export interface CIObservation {
  workflow_id: number;
  run_id: number;
  head_sha: string;
  conclusion: string | null;
  status: string;
  html_url: string;
  path: string;
  event: string;
  run_attempt: number;
  jobs?: unknown[];
  artifacts?: unknown[];
}
export interface GitHub {
  head(project: Project, branch: string): Promise<string>;
  read(project: Project, path: string, ref: string): Promise<FileObservation>;
  ci(project: Project, commit: string): Promise<CIObservation[]>;
  branch(
    project: Project,
    branch: string,
    baseline: string,
  ): Promise<{ sha: string; url: string }>;
  commit(
    project: Project,
    branch: string,
    baseline: string,
    recipe: Recipe,
    message: string,
    guard: () => Promise<void>,
  ): Promise<{ sha: string; url: string; paths: string[] }>;
  pullRequest(
    project: Project,
    branch: string,
    base: string,
    wp: string,
    commit: string,
  ): Promise<{ url: string; number: number; head_sha: string }>;
  observePR(
    project: Project,
    url: string,
  ): Promise<{
    url: string;
    head_sha: string;
    base: string;
    state: string;
    repo: string;
  }>;
  compare(
    project: Project,
    baseline: string,
    commit: string,
  ): Promise<string[]>;
}
type JSONRecord = Record<string, any>;
export class AppGitHub implements GitHub {
  private key: ReturnType<typeof importPKCS8>;
  constructor(
    private appId: string,
    privateKey: string,
    private api = "https://api.github.com",
  ) {
    if (
      api !== "https://api.github.com" &&
      !/^http:\/\/127\.0\.0\.1:\d+$/.test(api)
    )
      throw new Gate("GITHUB_API_NOT_APPROVED");
    this.key = importPKCS8(privateKey, "RS256");
  }
  private async raw(
    path: string,
    token: string,
    method = "GET",
    body?: unknown,
  ): Promise<JSONRecord> {
    let r: Response;
    try {
      r = await fetch(`${this.api}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2026-03-10",
          "User-Agent": "FFOS-Household-Family/2.0",
          "Content-Type": "application/json",
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(15000),
        redirect: "error",
      });
    } catch {
      throw new Gate("GITHUB_DISCONNECTED");
    }
    if (!r.ok) throw new Gate(`GITHUB_HTTP_${r.status}`);
    if (r.status === 204) return {};
    const text = await r.text();
    if (text.length > 4000000) throw new Gate("GITHUB_RESPONSE_TOO_LARGE");
    return JSON.parse(text);
  }
  private async token(p: Project, write = false): Promise<string> {
    const jwt = await new SignJWT({})
      .setProtectedHeader({ alg: "RS256" })
      .setIssuer(this.appId)
      .setIssuedAt(Math.floor(Date.now() / 1000) - 30)
      .setExpirationTime("5m")
      .sign(await this.key);
    // Fresh reduced token each operation; revoked installation cannot be hidden by a cached permission.
    const perms: Record<string, string> = {
      contents: write ? "write" : "read",
      metadata: "read",
      actions: "read",
      checks: "read",
      pull_requests: write ? "write" : "read",
    };
    const d = await this.raw(
      `/app/installations/${p.installation_id}/access_tokens`,
      jwt,
      "POST",
      { repositories: [p.repo_full_name.split("/")[1]], permissions: perms },
    );
    if (
      typeof d.token !== "string" ||
      !d.expires_at ||
      Date.parse(d.expires_at) <= Date.now()
    )
      throw new Gate("GITHUB_TOKEN_INVALID");
    const repos = await this.raw(
      "/installation/repositories?per_page=100",
      d.token,
    );
    const installed = repos.repositories?.find(
      (r: JSONRecord) => r.full_name === p.repo_full_name,
    );
    if (!installed)
      throw new Gate("GITHUB_REPOSITORY_NOT_INSTALLED", "HOLD_HUMAN");
    if (installed.default_branch !== p.protected_branches[0])
      throw new Gate("DEFAULT_BRANCH_CONFIGURATION_MISMATCH", "HOLD_HUMAN");
    if (write) {
      const branch = await this.raw(
        `${this.prefix(p)}/branches/${encodeURIComponent(p.protected_branches[0]!)}`,
        d.token,
      );
      if (branch.protected !== true)
        throw new Gate("DEFAULT_BRANCH_NOT_PROTECTED", "HOLD_HUMAN");
    }
    return d.token;
  }
  private prefix(p: Project) {
    return `/repos/${p.repo_full_name}`;
  }
  private async optional(
    path: string,
    token: string,
  ): Promise<JSONRecord | null> {
    try {
      return await this.raw(path, token);
    } catch (e) {
      if (e instanceof Gate && e.code === "GITHUB_HTTP_404") return null;
      throw e;
    }
  }
  async head(p: Project, branch: string) {
    const t = await this.token(p);
    const d = await this.raw(
      `${this.prefix(p)}/git/ref/heads/${encodeURIComponent(branch)}`,
      t,
    );
    return sha.parse(d.object.sha);
  }
  async read(p: Project, path: string, ref: string): Promise<FileObservation> {
    pathSchema.parse(path);
    sha.parse(ref);
    const t = await this.token(p),
      d = await this.optional(
        `${this.prefix(p)}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${ref}`,
        t,
      );
    if (!d)
      return {
        path,
        content: null,
        blob_sha: null,
        mode: null,
        source: `https://github.com/${p.repo_full_name}/blob/${ref}/${path}`,
      };
    if (d.type !== "file" || d.encoding !== "base64" || d.size > 100000)
      throw new Gate("UNSUPPORTED_REPOSITORY_OBJECT");
    // Tree mode must be a regular file. Contents API can dereference a symlink.
    const tree = await this.raw(
      `${this.prefix(p)}/git/trees/${ref}?recursive=1`,
      t,
    );
    if (tree.truncated) throw new Gate("GITHUB_TREE_TRUNCATED");
    const entry = tree.tree.find((x: JSONRecord) => x.path === path);
    if (!entry || !["100644", "100755"].includes(entry.mode))
      throw new Gate("SYMLINK_OR_SUBMODULE_NOT_ALLOWED", "HOLD_HUMAN");
    return {
      path,
      content: Buffer.from(d.content, "base64").toString("utf8"),
      blob_sha: d.sha,
      mode: entry.mode,
      source: d.html_url,
    };
  }
  async ci(p: Project, commit: string) {
    sha.parse(commit);
    const t = await this.token(p),
      d = await this.raw(
        `${this.prefix(p)}/actions/runs?head_sha=${commit}&per_page=100`,
        t,
      );
    if (d.total_count > 100) throw new Gate("CI_PAGINATION_LIMIT");
    const latest: JSONRecord[] = [];
    for (const w of p.allowed_ci_workflows) {
      const r = (d.workflow_runs ?? [])
        .filter((r: JSONRecord) => r.workflow_id === w.id)
        .sort(
          (a: JSONRecord, b: JSONRecord) =>
            b.id - a.id || b.run_attempt - a.run_attempt,
        )[0];
      if (r) latest.push(r);
    }
    const rows = [];
    for (const r of latest) {
      const jobs = await this.raw(
          `${this.prefix(p)}/actions/runs/${r.id}/jobs?filter=latest&per_page=100`,
          t,
        ),
        artifacts = await this.raw(
          `${this.prefix(p)}/actions/runs/${r.id}/artifacts?per_page=100`,
          t,
        );
      if (jobs.total_count > 100 || artifacts.total_count > 100)
        throw new Gate("CI_EVIDENCE_PAGINATION_LIMIT");
      rows.push({
        workflow_id: r.workflow_id,
        run_id: r.id,
        head_sha: r.head_sha,
        conclusion: r.conclusion,
        status: r.status,
        html_url: r.html_url,
        path: r.path,
        event: r.event,
        run_attempt: r.run_attempt,
        jobs: jobs.jobs ?? [],
        artifacts: artifacts.artifacts ?? [],
      });
    }
    return rows as CIObservation[];
  }
  async branch(p: Project, branch: string, baseline: string) {
    if (
      !/^hf\/[A-Za-z0-9_.-]+$/.test(branch) ||
      p.protected_branches.includes(branch)
    )
      throw new Gate("PROTECTED_BRANCH", "HOLD_HUMAN");
    sha.parse(baseline);
    const t = await this.token(p, true),
      url = `${this.prefix(p)}/git/ref/heads/${encodeURIComponent(branch)}`;
    const exists = await this.optional(url, t);
    if (exists) {
      return {
        sha: sha.parse(exists.object.sha),
        url: `https://github.com/${p.repo_full_name}/tree/${branch}`,
      };
    }
    await this.raw(`${this.prefix(p)}/git/refs`, t, "POST", {
      ref: `refs/heads/${branch}`,
      sha: baseline,
    });
    const readback = await this.raw(url, t);
    if (readback.object.sha !== baseline)
      throw new Gate("BRANCH_READBACK_MISMATCH");
    return {
      sha: baseline,
      url: `https://github.com/${p.repo_full_name}/tree/${branch}`,
    };
  }
  async commit(
    p: Project,
    branch: string,
    baseline: string,
    recipe: Recipe,
    message: string,
    guard: () => Promise<void>,
  ) {
    if (
      !/^hf\/[A-Za-z0-9_.-]+$/.test(branch) ||
      p.protected_branches.includes(branch)
    )
      throw new Gate("PROTECTED_BRANCH", "HOLD_HUMAN");
    const current = await this.head(p, branch);
    if (current !== baseline) {
      // Recovery only recognizes this recipe's exact expected contents and no extra paths.
      const files = await Promise.all(
        recipe.changes.map((c) => this.read(p, c.path, current)),
      );
      const paths = await this.compare(p, baseline, current);
      const expected = recipe.changes.map((c) => c.path);
      if (
        files.every((f, i) => f.content === recipe.changes[i]!.content) &&
        paths.every((x) => expected.includes(x)) &&
        paths.length === expected.length
      )
        return {
          sha: current,
          url: `https://github.com/${p.repo_full_name}/commit/${current}`,
          paths,
        };
      throw new Gate("BRANCH_DRIFT_OR_UNCERTAIN_WRITE", "HOLD_HUMAN");
    }
    const t = await this.token(p, true);
    const base = await this.raw(`${this.prefix(p)}/git/commits/${baseline}`, t);
    const elements = [];
    for (const c of recipe.changes) {
      await guard();
      const old = await this.read(p, c.path, baseline);
      if (
        (old.content === null ? null : hash(old.content)) !== c.previous_sha256
      )
        throw new Gate("RECIPE_PRECONDITION_FAILED");
      elements.push({
        path: c.path,
        mode: old.mode ?? "100644",
        type: "blob",
        content: c.content,
      });
    }
    await guard();
    const tree = await this.raw(`${this.prefix(p)}/git/trees`, t, "POST", {
      base_tree: base.tree.sha,
      tree: elements,
    });
    await guard();
    const commit = await this.raw(`${this.prefix(p)}/git/commits`, t, "POST", {
      message,
      tree: tree.sha,
      parents: [baseline],
    });
    // Re-read before advancing a non-force feature ref. Guard refreshes Director authorization.
    if ((await this.head(p, branch)) !== baseline)
      throw new Gate("CONCURRENT_BRANCH_WRITE");
    await guard();
    await this.raw(
      `${this.prefix(p)}/git/refs/heads/${encodeURIComponent(branch)}`,
      t,
      "PATCH",
      { sha: commit.sha, force: false },
    );
    const confirmed = await this.head(p, branch);
    if (confirmed !== commit.sha) throw new Gate("COMMIT_READBACK_MISMATCH");
    const paths = await this.compare(p, baseline, confirmed);
    if (paths.some((x) => !recipe.changes.some((c) => c.path === x)))
      throw new Gate("UNAUTHORIZED_COMMIT_DIFF", "HOLD_HUMAN");
    return {
      sha: confirmed,
      url: `https://github.com/${p.repo_full_name}/commit/${confirmed}`,
      paths,
    };
  }
  async pullRequest(
    p: Project,
    branch: string,
    base: string,
    wp: string,
    commit: string,
  ) {
    if (p.protected_branches.includes(branch))
      throw new Gate("PROTECTED_BRANCH");
    const t = await this.token(p, true),
      head = `${p.repo_full_name.split("/")[0]}:${branch}`;
    const old = (await this.raw(
      `${this.prefix(p)}/pulls?state=all&head=${encodeURIComponent(head)}&base=${encodeURIComponent(base)}&per_page=100`,
      t,
    )) as unknown as JSONRecord[];
    let pr = old.find((x) => x.head.ref === branch && x.base.ref === base);
    if (pr && pr.state !== "open")
      throw new Gate("PR_ALREADY_CLOSED", "HOLD_HUMAN");
    if (!pr)
      pr = await this.raw(`${this.prefix(p)}/pulls`, t, "POST", {
        title: `Household candidate: ${wp}`,
        head: branch,
        base,
        draft: true,
        body: `Director-authorized bounded candidate for ${wp}. Commit: ${commit}. Acceptance remains external to Household.`,
      });
    const back = await this.raw(`${this.prefix(p)}/pulls/${pr.number}`, t);
    if (
      back.head.sha !== commit ||
      back.base.ref !== base ||
      back.head.repo.full_name !== p.repo_full_name
    )
      throw new Gate("PR_READBACK_MISMATCH");
    return { url: back.html_url, number: back.number, head_sha: back.head.sha };
  }
  async compare(p: Project, baseline: string, commit: string) {
    sha.parse(baseline);
    sha.parse(commit);
    if (baseline === commit) return [];
    const t = await this.token(p),
      d = await this.raw(
        `${this.prefix(p)}/compare/${baseline}...${commit}`,
        t,
      );
    if (
      !["ahead", "identical"].includes(d.status) ||
      !d.files ||
      d.files.length >= 300
    )
      throw new Gate("DIFF_NOT_FULLY_OBSERVABLE");
    return d.files.flatMap((f: JSONRecord) =>
      f.previous_filename ? [f.filename, f.previous_filename] : [f.filename],
    ) as string[];
  }
  async observePR(p: Project, url: string) {
    const prefix = `https://github.com/${p.repo_full_name}/pull/`;
    if (!url.startsWith(prefix) || !/^\d+$/.test(url.slice(prefix.length)))
      throw new Gate("INVALID_PR_REFERENCE");
    const t = await this.token(p),
      d = await this.raw(
        `${this.prefix(p)}/pulls/${url.slice(prefix.length)}`,
        t,
      );
    return {
      url: d.html_url,
      head_sha: d.head.sha,
      base: d.base.ref,
      state: d.state,
      repo: d.head.repo.full_name,
    };
  }
}
export function verifyWebhook(
  secret: string,
  body: Buffer,
  signature: string | undefined,
) {
  if (!secret || !signature || !/^sha256=[a-f0-9]{64}$/.test(signature))
    return false;
  const expected = Buffer.from(
    `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`,
  );
  const received = Buffer.from(signature);
  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}
