/** TEST-ONLY services. Never selected by the production runtime. No real acceptance authority. */
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import {
  generateKeyPair,
  exportSPKI,
  exportPKCS8,
  exportJWK,
  SignJWT,
  jwtVerify,
  type CryptoKey,
} from "jose";
import { createHash } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  Project,
  WorkPackage,
  DirectorSnapshot,
  Decision,
  Gate,
  hash,
  scopeHash,
  now,
  uid,
  type Run,
  type Recipe,
} from "../packages/contracts/index.js";
import { Database, Store } from "../packages/state/index.js";
import type { Director } from "../packages/director-adapter/index.js";
import { SignedDirector } from "../packages/director-adapter/index.js";
import {
  AppGitHub,
  type GitHub,
  type FileObservation,
  type CIObservation,
} from "../packages/github-adapter/index.js";
import { Household, type Principal } from "../apps/orchestrator-api/service.js";
import { OAuthAuthority } from "../apps/mcp-server/auth.js";
import {
  SignedGovernance,
  type Governance,
} from "../packages/governance-adapter/index.js";
export const fixtureGovernance: Governance = {
  evaluate: async (intent) => ({
    receipt: {
      decision: "ALLOW",
      intent_hash: hash(intent),
      authority_ref: intent.authority_ref,
      mandate_ref: intent.mandate_ref,
      policy_pin: "test-only-pin",
      policy_version: "fixture-1",
      revoked: false,
      observed_at: now(),
      expires_at: new Date(Date.now() + 30000).toISOString(),
      spetl_ref: "urn:test-only:spetl",
      control_results: [
        { control_id: "fixture-only", pass: true, decision: "ALLOW" },
      ],
    },
    signed_provenance: "TEST_FIXTURE_NOT_REAL_GOVERNANCE",
  }),
};

const sha1 = (v: unknown) =>
  createHash("sha1").update(JSON.stringify(v)).digest("hex");
export const WORKFLOW =
  "name: fixture-ci\non: [push]\npermissions: {contents: read}\njobs:\n  check:\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo test-only\n";
export class SandboxGitHub implements GitHub {
  commits = new Map<string, Record<string, string>>();
  branches = new Map<string, string>();
  prs: {
    url: string;
    number: number;
    head_sha: string;
    branch: string;
    base: string;
  }[] = [];
  mutations: string[] = [];
  disconnect = false;
  defaultProtected = true;
  pendingCI = false;
  failedCI = false;
  afterCommit?: (sha: string) => Promise<void>;
  constructor() {
    const tree = {
      "src/value.txt": "initial",
      "src/next.txt": "initial",
      ".github/workflows/ci.yml": WORKFLOW,
    };
    const base = sha1(tree);
    this.commits.set(base, tree);
    this.branches.set("main", base);
  }
  check() {
    if (this.disconnect) throw new Gate("GITHUB_DISCONNECTED");
  }
  async head(p: Project, branch: string) {
    this.check();
    const h = this.branches.get(branch);
    if (!h) throw new Gate("GITHUB_HTTP_404");
    return h;
  }
  async read(p: Project, path: string, ref: string): Promise<FileObservation> {
    this.check();
    const tree = this.commits.get(ref);
    if (!tree) throw new Gate("GITHUB_HTTP_404");
    const content = tree[path] ?? null;
    return {
      path,
      content,
      blob_sha: content === null ? null : sha1(content),
      mode: content === null ? null : "100644",
      source: `https://github.com/${p.repo_full_name}/blob/${ref}/${path}`,
    };
  }
  async ci(p: Project, commit: string): Promise<CIObservation[]> {
    this.check();
    return [
      {
        workflow_id: 1,
        run_id: 101,
        head_sha: commit,
        conclusion: this.pendingCI
          ? null
          : this.failedCI
            ? "failure"
            : "success",
        status: this.pendingCI ? "in_progress" : "completed",
        html_url: `https://github.com/${p.repo_full_name}/actions/runs/101`,
        path: ".github/workflows/ci.yml",
        event: "push",
        run_attempt: 1,
      },
    ];
  }
  async branch(p: Project, branch: string, baseline: string) {
    this.check();
    if (!this.branches.has(branch)) {
      this.branches.set(branch, baseline);
      this.mutations.push("branch");
    }
    return {
      sha: this.branches.get(branch)!,
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
    this.check();
    await guard();
    const current = this.branches.get(branch)!;
    if (current !== baseline) {
      const tree = this.commits.get(current)!;
      if (recipe.changes.every((c) => tree[c.path] === c.content))
        return {
          sha: current,
          url: `https://github.com/${p.repo_full_name}/commit/${current}`,
          paths: recipe.changes.map((c) => c.path),
        };
      throw new Gate("BRANCH_DRIFT_OR_UNCERTAIN_WRITE", "HOLD_HUMAN");
    }
    const tree = { ...this.commits.get(baseline) };
    for (const c of recipe.changes) {
      if (
        (tree[c.path] === undefined ? null : hash(tree[c.path])) !==
        c.previous_sha256
      )
        throw new Gate("RECIPE_PRECONDITION_FAILED");
      tree[c.path] = c.content;
    }
    const sha = sha1([tree, baseline, message]);
    this.commits.set(sha, tree);
    this.branches.set(branch, sha);
    this.mutations.push("commit");
    if (this.afterCommit) await this.afterCommit(sha);
    return {
      sha,
      url: `https://github.com/${p.repo_full_name}/commit/${sha}`,
      paths: recipe.changes.map((c) => c.path),
    };
  }
  async pullRequest(
    p: Project,
    branch: string,
    base: string,
    wp: string,
    commit: string,
  ) {
    this.check();
    let pr = this.prs.find((x) => x.branch === branch);
    if (!pr) {
      pr = {
        url: `https://github.com/${p.repo_full_name}/pull/${this.prs.length + 1}`,
        number: this.prs.length + 1,
        head_sha: commit,
        branch,
        base,
      };
      this.prs.push(pr);
      this.mutations.push("pull_request");
    }
    pr.head_sha = commit;
    return pr;
  }
  async compare(p: Project, baseline: string, commit: string) {
    this.check();
    const a = this.commits.get(baseline)!,
      b = this.commits.get(commit)!;
    if (!a || !b) throw new Gate("GITHUB_HTTP_404");
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter(
      (k) => a[k] !== b[k],
    );
  }
  async observePR(p: Project, url: string) {
    this.check();
    const pr = this.prs.find((x) => x.url === url);
    if (!pr) throw new Gate("GITHUB_HTTP_404");
    return {
      url,
      head_sha: this.branches.get(pr.branch)!,
      base: pr.base,
      state: "open",
      repo: p.repo_full_name,
    };
  }
}
export class SandboxDirector implements Director {
  snapshot!: DirectorSnapshot;
  decisions = new Map<string, string>();
  key!: CryptoKey;
  publicKey!: string;
  issuer = "urn:ffos:test-director";
  audience = "urn:ffos:household:test";
  available = true;
  async init() {
    const { privateKey, publicKey } = await generateKeyPair("EdDSA", {
      extractable: true,
    });
    this.key = privateKey;
    this.publicKey = await exportSPKI(publicKey);
  }
  async sign(data: unknown, kind: string) {
    return new SignJWT({ kind, data })
      .setProtectedHeader({ alg: "EdDSA" })
      .setIssuer(this.issuer)
      .setAudience(this.audience)
      .setIssuedAt()
      .setExpirationTime("10m")
      .setJti(uid("signed"))
      .sign(this.key);
  }
  async authorization(project_id: string) {
    if (!this.available) throw new Gate("DIRECTOR_DISCONNECTED");
    if (project_id !== this.snapshot.project_id)
      throw new Gate("DIRECTOR_POLICY_MISSING");
    return structuredClone(this.snapshot);
  }
  async verifyDecision(signed: string) {
    const { payload } = await jwtVerify(
      signed,
      await import("jose").then((j) => j.importSPKI(this.publicKey, "EdDSA")),
      { issuer: this.issuer, audience: this.audience },
    );
    return Decision.parse(payload.data);
  }
  async pollDecision(run_id: string) {
    return this.decisions.get(run_id) ?? null;
  }
  async decision(
    run: Run,
    decision: "ACCEPT" | "REJECT" | "HOLD" | "REQUEST_CHANGES" = "ACCEPT",
  ) {
    const d: Decision = {
      decision_id: uid("decision"),
      run_id: run.run_id,
      wp_id: run.wp_id,
      wp_version: run.wp_version,
      project_id: run.project_id,
      actor: "Director",
      authority_ref: this.snapshot.authority_ref,
      director_policy_version: run.policy_version,
      eligibility_revision: run.eligibility_revision,
      decision,
      scope_hash: run.wp.scope_hash,
      commit_sha: run.commit_sha,
      evidence_bundle_hash: run.evidence_bundle_hash!,
      reason: "TEST FIXTURE ONLY: external Director decision protocol exercise",
      timestamp: now(),
    };
    const signed = await this.sign(d, "decision");
    this.decisions.set(run.run_id, signed);
    return signed;
  }
}
export const principal: Principal = {
  subject: "test-director",
  projects: ["test-project"],
  scopes: ["household:read", "household:execute", "household:control"],
};
export async function sandbox(
  options: {
    read?: boolean;
    repair?: boolean;
    two?: boolean;
    database?: string;
  } = {},
) {
  const github = new SandboxGitHub(),
    director = new SandboxDirector();
  await director.init();
  const baseline = github.branches.get("main")!;
  const project = Project.parse({
    project_id: "test-project",
    repo_full_name: "test-owner/household-sandbox",
    enabled: true,
    policy_ref: "director:test-policy",
    allowed_paths: ["src"],
    allowed_actions: ["read", "branch", "commit", "pull_request"],
    protected_branches: ["main"],
    max_concurrent_runs: 1,
    max_repair_attempts: 2,
    cost_ceiling: 0,
    allowed_ci_workflows: [
      { id: 1, path: ".github/workflows/ci.yml", sha256: hash(WORKFLOW) },
    ],
    environment: "test",
    owner_ref: "test-director",
    permission: options.read ? "OBSERVE" : "EXECUTE_BOUNDED",
    updated_at: now(),
    installation_id: 1,
    require_ci: !options.read,
    ci_cost_policy: "DIRECTOR_APPROVED_EXISTING_CAPACITY",
  });
  const make = (wp_id: string, path: string, dependency_ids: string[] = []) => {
    const raw = {
      wp_id,
      project_id: project.project_id,
      repo: project.repo_full_name,
      version: 1,
      title: wp_id,
      description_ref: "test fixture (not authority)",
      dependency_ids,
      acceptance_criteria: [
        {
          id: "content",
          text: "Expected independent raw-file check",
          method: "file_contains",
          path,
          value: "good",
        },
      ],
      priority: 1,
      eligibility_revision: "revision-1",
      baseline_sha: baseline,
      risk_tier: "LOW",
      director_policy_ref: project.policy_ref,
      max_repair_attempts: 2,
      requested_action: options.read ? "read" : "branch_pr",
      time_budget_seconds: 600,
      mutation_recipe_id: `recipe-${wp_id}`,
      repair_recipe_ids: options.repair ? [`repair-${wp_id}`] : [],
      status: "DISPATCHED",
    };
    return WorkPackage.parse({
      ...raw,
      scope_hash: scopeHash(raw as WorkPackage),
    });
  };
  const wp = make("WP01", "src/value.txt"),
    second = make("WP02", "src/next.txt", ["WP01"]);
  const recipes: Recipe[] = [
    {
      recipe_id: "recipe-WP01",
      class: "J1",
      auto_repair: true,
      changes: [
        {
          path: "src/value.txt",
          previous_sha256: hash("initial"),
          content: options.repair ? "bad" : "good",
        },
      ],
    },
    {
      recipe_id: "recipe-WP02",
      class: "J1",
      auto_repair: true,
      changes: [
        {
          path: "src/next.txt",
          previous_sha256: hash("initial"),
          content: "good",
        },
      ],
    },
  ];
  if (options.repair)
    recipes.push({
      recipe_id: "repair-WP01",
      class: "J1",
      auto_repair: true,
      changes: [
        {
          path: "src/value.txt",
          previous_sha256: hash("bad"),
          content: "good",
        },
      ],
    });
  director.snapshot = DirectorSnapshot.parse({
    project_id: project.project_id,
    policy_ref: project.policy_ref,
    policy_version: "policy-1",
    revision: "revision-1",
    issued_at: now(),
    expires_at: new Date(Date.now() + 600000).toISOString(),
    authority_ref: "urn:test-only:external-director",
    mandate_ref: "urn:test-only:mandate",
    hcc_review_ref: "urn:test-only:hcc-review",
    ci_cost_approved: true,
    permission: project.permission,
    allowed_paths: ["src"],
    allowed_actions: project.allowed_actions,
    canonical_j_source:
      "https://github.com/Motherpher/form-flode/blob/e24a11c3944fadcf222520c12a567e7c81c8ffa1/17-ffos/household/README.md",
    ama_status: "AMBIGUOUS_SOURCE_AMA",
    cost_ceiling: 0,
    max_repair_attempts: 2,
    auto_dispatch: true,
    auto_dispatch_subject: "test-worker",
    revoked: false,
    allowed_subjects: ["test-director", "test-worker"],
    accepted_versions: {},
    eligible_ids: ["WP01"],
    work_packages: options.two ? [wp, second] : [wp],
    recipes,
  });
  const path =
    options.database ??
    join(mkdtempSync(join(tmpdir(), "hf-test-")), "state.sqlite");
  const db = new Database(path);
  await db.migrate();
  const store = new Store(db);
  await store.register(project);
  const service = new Household(store, director, github, fixtureGovernance);
  return { github, director, project, wp, db, store, service, path };
}
export async function until(
  service: Household,
  store: Store,
  run_id: string,
  state: string,
  limit = 30,
) {
  for (let i = 0; i < limit; i++) {
    const run = await store.run(run_id);
    if (run.state === state) return run;
    if (["BLOCKED", "HOLD_HUMAN", "FAILED", "STOPPED"].includes(run.state))
      throw new Error(`${run.state}: ${run.last_error}`);
    await store.db.tx((s) =>
      s.query(
        "UPDATE hf_jobs SET available_at=0 WHERE run_id=? AND state='WAITING'",
        [run_id],
      ),
    );
    await service.tick();
  }
  throw new Error(
    `Never reached ${state}; current ${(await store.run(run_id)).state}`,
  );
}

/** Faithful HTTP contract fixture for the production GitHub and signed Director adapters. */
export async function remoteLab(lab: Awaited<ReturnType<typeof sandbox>>) {
  const { privateKey: appKey, publicKey: appPublic } = await generateKeyPair(
    "RS256",
    { extractable: true },
  );
  const { privateKey: oauthKey, publicKey: oauthPublic } =
    await generateKeyPair("EdDSA", { extractable: true });
  const jwk = await exportJWK(oauthPublic);
  jwk.kid = "test-oauth";
  const revoked = new Set<string>();
  const trees = new Map<string, Record<string, string>>();
  let baseUrl = "";
  const reply = (res: ServerResponse, status: number, data: unknown) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };
  const raw = async (req: IncomingMessage) => {
    const parts: Buffer[] = [];
    for await (const b of req) parts.push(Buffer.from(b));
    return Buffer.concat(parts).toString();
  };
  const server = createServer(async (req, res) => {
    try {
      const u = new URL(req.url!, baseUrl),
        path = decodeURIComponent(u.pathname),
        body = await raw(req);
      const data =
        body && req.headers["content-type"]?.includes("json")
          ? JSON.parse(body)
          : {};
      if (path === "/jwks") return reply(res, 200, { keys: [jwk] });
      if (path === "/introspect") {
        const token = new URLSearchParams(body).get("token")!;
        return reply(res, 200, {
          active: !revoked.has(token),
          sub: "test-director",
          scope: principal.scopes.join(" "),
        });
      }
      if (path === "/cdx/evaluate") {
        const result = await fixtureGovernance.evaluate(data.intent);
        res.end(await lab.director.sign(result.receipt, "cdx-decision"));
        return;
      }
      if (path.endsWith("/authorization")) {
        if (!lab.director.available) return reply(res, 503, {});
        res.end(
          await lab.director.sign(lab.director.snapshot, "authorization"),
        );
        return;
      }
      if (/^\/runs\/[^/]+\/decision$/.test(path)) {
        const token = lab.director.decisions.get(path.split("/")[2]!);
        if (!token) return reply(res, 404, {});
        res.end(token);
        return;
      }
      if (path === "/app/installations/1/access_tokens") {
        await jwtVerify(req.headers.authorization!.slice(7), appPublic, {
          issuer: "test-app",
          algorithms: ["RS256"],
        });
        return reply(res, 201, {
          token: "test-installation-token",
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        });
      }
      if (path === "/installation/repositories")
        return reply(res, 200, {
          repositories: [
            { full_name: lab.project.repo_full_name, default_branch: "main" },
          ],
        });
      if (req.headers.authorization !== "Bearer test-installation-token")
        return reply(res, 401, {});
      if (lab.github.disconnect) return reply(res, 503, {});
      const suffix = path.replace(`/repos/${lab.project.repo_full_name}`, "");
      if (suffix === "/branches/main")
        return reply(res, 200, {
          name: "main",
          protected: lab.github.defaultProtected,
          commit: { sha: lab.github.branches.get("main") },
        });
      if (suffix === "/git/refs" && req.method === "POST") {
        const branch = data.ref.replace("refs/heads/", "");
        lab.github.branches.set(branch, data.sha);
        lab.github.mutations.push("branch");
        return reply(res, 201, { object: { sha: data.sha } });
      }
      if (suffix.startsWith("/git/ref/heads/")) {
        const branch = suffix.slice("/git/ref/heads/".length),
          sha = lab.github.branches.get(branch);
        return reply(res, sha ? 200 : 404, { object: { sha } });
      }
      if (suffix.startsWith("/git/refs/heads/") && req.method === "PATCH") {
        const branch = suffix.slice("/git/refs/heads/".length);
        lab.github.branches.set(branch, data.sha);
        lab.github.mutations.push("commit");
        return reply(res, 200, { object: { sha: data.sha } });
      }
      if (suffix.startsWith("/contents/")) {
        const path = suffix.slice("/contents/".length),
          commit = u.searchParams.get("ref")!,
          content = lab.github.commits.get(commit)?.[path];
        return reply(res, content === undefined ? 404 : 200, {
          type: "file",
          encoding: "base64",
          size: content?.length ?? 0,
          content:
            content === undefined
              ? ""
              : Buffer.from(content).toString("base64"),
          sha: sha1(content),
          html_url: `https://github.com/${lab.project.repo_full_name}/blob/${commit}/${path}`,
        });
      }
      if (suffix === "/git/trees" && req.method === "POST") {
        const tree = { ...trees.get(data.base_tree) };
        for (const row of data.tree) tree[row.path] = row.content;
        const sha = sha1(tree);
        trees.set(sha, tree);
        return reply(res, 201, { sha });
      }
      if (suffix.startsWith("/git/trees/")) {
        const sha = suffix.split("/").at(-1)!,
          tree = lab.github.commits.get(sha) ?? trees.get(sha);
        if (!tree) return reply(res, 404, {});
        return reply(res, 200, {
          truncated: false,
          tree: Object.entries(tree).map(([path, content]) => ({
            path,
            mode: "100644",
            type: "blob",
            sha: sha1(content),
          })),
        });
      }
      if (suffix === "/git/commits" && req.method === "POST") {
        const sha = sha1(data);
        lab.github.commits.set(sha, { ...trees.get(data.tree)! });
        return reply(res, 201, { sha });
      }
      if (suffix.startsWith("/git/commits/")) {
        const sha = suffix.split("/").at(-1)!,
          tree = lab.github.commits.get(sha)!;
        const treeSha = sha1(tree);
        trees.set(treeSha, tree);
        return reply(res, 200, { sha, tree: { sha: treeSha } });
      }
      if (suffix.startsWith("/compare/")) {
        const [a, b] = suffix.slice("/compare/".length).split("...");
        const paths = await lab.github.compare(lab.project, a!, b!);
        return reply(res, 200, {
          status: a === b ? "identical" : "ahead",
          files: paths.map((filename) => ({ filename, status: "modified" })),
        });
      }
      if (suffix === "/actions/runs") {
        const runs = await lab.github.ci(
          lab.project,
          u.searchParams.get("head_sha")!,
        );
        return reply(res, 200, {
          total_count: runs.length,
          workflow_runs: runs.map((r) => ({ ...r, id: r.run_id })),
        });
      }
      if (/^\/actions\/runs\/\d+\/jobs$/.test(suffix))
        return reply(res, 200, {
          total_count: 1,
          jobs: [
            {
              id: 1001,
              name: "test-only-check",
              conclusion: "success",
              steps: [
                { name: "fixture deterministic check", conclusion: "success" },
              ],
            },
          ],
        });
      if (/^\/actions\/runs\/\d+\/artifacts$/.test(suffix))
        return reply(res, 200, { total_count: 0, artifacts: [] });
      if (suffix === "/pulls" && req.method === "GET")
        return reply(
          res,
          200,
          lab.github.prs.map((p) => ({
            number: p.number,
            state: "open",
            head: { ref: p.branch },
            base: { ref: p.base },
          })),
        );
      if (suffix === "/pulls" && req.method === "POST") {
        const branch = data.head.split(":").at(-1)!;
        const pr = await lab.github.pullRequest(
          lab.project,
          branch,
          data.base,
          "WP01",
          lab.github.branches.get(branch)!,
        );
        return reply(res, 201, pr);
      }
      if (suffix.startsWith("/pulls/")) {
        const pr = lab.github.prs.find(
          (p) => p.number === Number(suffix.split("/").at(-1)),
        )!;
        return reply(res, 200, {
          number: pr.number,
          state: "open",
          html_url: pr.url,
          head: {
            sha: lab.github.branches.get(pr.branch),
            repo: { full_name: lab.project.repo_full_name },
          },
          base: { ref: pr.base },
        });
      }
      return reply(res, 404, { path, suffix });
    } catch {
      return reply(res, 500, { error: "test-fixture-error" });
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as { port: number };
  baseUrl = `http://127.0.0.1:${address.port}`;
  const github = new AppGitHub("test-app", await exportPKCS8(appKey), baseUrl),
    director = new SignedDirector(
      baseUrl,
      lab.director.publicKey,
      lab.director.issuer,
      lab.director.audience,
    );
  const resource = "http://127.0.0.1:3000";
  const authority = new OAuthAuthority(
    baseUrl,
    resource,
    `${baseUrl}/jwks`,
    `${baseUrl}/introspect`,
    [{ subject: "test-director", projects: ["test-project"] }],
  );
  const token = await new SignJWT({ scope: principal.scopes.join(" ") })
    .setProtectedHeader({ alg: "EdDSA", kid: "test-oauth" })
    .setIssuer(baseUrl)
    .setAudience(resource)
    .setSubject("test-director")
    .setIssuedAt()
    .setExpirationTime("10m")
    .sign(oauthKey);
  const governance = new SignedGovernance(
    `${baseUrl}/cdx/evaluate`,
    lab.director.publicKey,
    lab.director.issuer,
    lab.director.audience,
    "test-only-pin",
  );
  return {
    server,
    github,
    director,
    authority,
    token,
    resource,
    revoked,
    issueToken: async (
      claims: {
        audience?: string;
        issuer?: string;
        expires?: number;
        scope?: string;
      } = {},
    ) =>
      new SignJWT({ scope: claims.scope ?? principal.scopes.join(" ") })
        .setProtectedHeader({ alg: "EdDSA", kid: "test-oauth" })
        .setIssuer(claims.issuer ?? baseUrl)
        .setAudience(claims.audience ?? resource)
        .setSubject("test-director")
        .setIssuedAt()
        .setExpirationTime(
          claims.expires ?? Math.floor(Date.now() / 1000) + 600,
        )
        .sign(oauthKey),
    governance,
    service: new Household(lab.store, director, github, governance),
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}
