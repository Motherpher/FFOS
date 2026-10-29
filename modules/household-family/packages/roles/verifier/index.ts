import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  Evidence,
  hash,
  Gate,
  type Run,
  type Project,
  type DirectorSnapshot,
} from "../../contracts/index.js";
import type {
  GitHub,
  FileObservation,
  CIObservation,
} from "../../github-adapter/index.js";
import { within } from "../../policy-engine/index.js";
import type { VerificationInput } from "./checks.js";

export async function collect(
  github: GitHub,
  p: Project,
  r: Run,
  policy: DirectorSnapshot,
): Promise<VerificationInput> {
  const files: Record<string, FileObservation> = {};
  let ci: CIObservation[] = [],
    disconnected = false,
    policy_scope_pass = false;
  const workflow_integrity: Record<number, boolean> = {};
  let scope_observation: unknown = {};
  try {
    // Fetch directly from GitHub at the immutable candidate, never from a Handyman assertion.
    const required = [
      ...new Set(
        r.wp.acceptance_criteria
          .filter((c) => c.method !== "ci_workflow")
          .map((c) => c.path),
      ),
    ];
    for (const path of required)
      files[path] = await github.read(p, path, r.commit_sha);
    ci = await github.ci(p, r.commit_sha);
    for (const workflow of p.allowed_ci_workflows) {
      const current = await github.read(p, workflow.path, r.commit_sha),
        base = await github.read(p, workflow.path, r.baseline_sha);
      workflow_integrity[workflow.id] =
        current.content !== null &&
        base.content !== null &&
        hash(current.content) === workflow.sha256 &&
        hash(base.content) === workflow.sha256;
    }
    const diff = await github.compare(p, r.baseline_sha, r.commit_sha);
    const approved = [
      r.wp.mutation_recipe_id,
      ...r.wp.repair_recipe_ids,
    ].flatMap(
      (id) =>
        policy.recipes
          .find((x) => x.recipe_id === id)
          ?.changes.map((c) => c.path) ?? [],
    );
    policy_scope_pass =
      diff.length <= p.max_changed_files &&
      diff.every(
        (path) =>
          approved.includes(path) &&
          within(path, p.allowed_paths) &&
          within(path, policy.allowed_paths),
      );
    let pr: unknown = null;
    if (r.pr_ref) {
      const observed = await github.observePR(p, r.pr_ref);
      pr = observed;
      if (
        observed.state !== "open" ||
        observed.head_sha !== r.commit_sha ||
        observed.base !== p.protected_branches[0] ||
        observed.repo !== r.repo ||
        (await github.head(p, r.branch)) !== r.commit_sha
      )
        policy_scope_pass = false;
    }
    if (diff.length && r.wp.requested_action === "branch_pr" && !r.pr_ref)
      policy_scope_pass = false;
    scope_observation = {
      baseline_sha: r.baseline_sha,
      commit_sha: r.commit_sha,
      diff_paths: diff,
      observed_pr: pr,
      project_paths: p.allowed_paths,
      director_paths: policy.allowed_paths,
    };
  } catch (e) {
    if (e instanceof Gate && e.state === "HOLD_HUMAN") throw e;
    disconnected = true;
  }
  return {
    run_id: r.run_id,
    commit_sha: r.commit_sha,
    criteria: r.wp.acceptance_criteria,
    files,
    ci,
    workflow_integrity,
    require_ci: p.require_ci,
    required_workflow_ids: p.allowed_ci_workflows.map((x) => x.id),
    policy_scope_pass,
    disconnected,
    scope_observation,
  };
}
export async function independentVerify(
  input: VerificationInput,
): Promise<Evidence[]> {
  let path = fileURLToPath(new URL("./process.js", import.meta.url));
  if (!existsSync(path))
    path = resolve("dist/packages/roles/verifier/process.js");
  return new Promise((done, reject) => {
    const child = spawn(process.execPath, [path], {
      env: { NODE_ENV: "production" },
      stdio: ["pipe", "pipe", "pipe"],
      timeout: 20000,
    });
    let out = "",
      err = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (s: string) => {
      out += s;
      if (out.length > 10000000) child.kill();
    });
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (s: string) => {
      err += s;
    });
    child.on("error", () => reject(new Gate("VERIFIER_PROCESS_UNAVAILABLE")));
    child.on("close", (code) => {
      if (code !== 0) return reject(new Gate("VERIFIER_PROCESS_FAILED"));
      try {
        const rows = Evidence.array().parse(JSON.parse(out));
        if (
          rows.some(
            (x) => x.verifier_identity === `isolated-node:${process.pid}`,
          )
        )
          throw new Error("Verifier not isolated");
        done(rows);
      } catch {
        reject(new Gate("VERIFIER_INVALID_OUTPUT"));
      }
    });
    child.stdin.end(JSON.stringify(input));
  });
}
