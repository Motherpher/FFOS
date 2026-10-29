import {
  hash,
  now,
  uid,
  type Criterion,
  type Evidence,
} from "../../contracts/index.js";
import type {
  FileObservation,
  CIObservation,
} from "../../github-adapter/index.js";
export interface VerificationInput {
  run_id: string;
  commit_sha: string;
  criteria: Criterion[];
  files: Record<string, FileObservation>;
  ci: CIObservation[];
  workflow_integrity: Record<number, boolean>;
  require_ci: boolean;
  required_workflow_ids: number[];
  policy_scope_pass: boolean;
  disconnected: boolean;
  scope_observation: unknown;
}
export function evaluate(input: VerificationInput): Evidence[] {
  const context_id = uid("verifier-context");
  const criteria: Criterion[] = [...input.criteria];
  // CI is mandatory for any mutation even when a WP author omitted a CI criterion.
  for (const workflow_id of input.required_workflow_ids)
    if (
      input.require_ci &&
      !criteria.some(
        (c) => c.method === "ci_workflow" && c.workflow_id === workflow_id,
      )
    )
      criteria.push({
        id: `ci-${workflow_id}`,
        text: "Required trusted CI workflow",
        method: "ci_workflow",
        workflow_id,
      });
  const rows: Evidence[] = [];
  for (const c of criteria) {
    let result: Evidence["result"] = "INCONCLUSIVE";
    let raw: unknown = {};
    let uri = "";
    let ci_check_id: number | null = null;
    if (input.disconnected) {
      raw = { error: "Repository or CI observation disconnected" };
    } else if (c.method === "file_contains") {
      const f = input.files[c.path];
      raw = f ?? { error: "Missing raw observation" };
      uri = f?.source ?? "";
      if (f)
        result =
          f.content !== null && f.content.includes(c.value) ? "PASS" : "FAIL";
    } else if (c.method === "json_equals") {
      const f = input.files[c.path];
      raw = f ?? { error: "Missing raw observation" };
      uri = f?.source ?? "";
      if (f)
        try {
          let value: unknown = JSON.parse(f.content ?? "null");
          if (c.pointer !== "")
            for (const key of c.pointer
              .replace(/^\//, "")
              .split("/")
              .map((x) => x.replace(/~1/g, "/").replace(/~0/g, "~"))) {
              if (
                value === null ||
                typeof value !== "object" ||
                !Object.hasOwn(value, key)
              )
                throw new Error("Missing JSON pointer");
              value = (value as Record<string, unknown>)[key];
            }
          result = hash(value) === hash(c.value) ? "PASS" : "FAIL";
        } catch {
          result = "FAIL";
        }
    } else {
      const ci = input.ci
        .filter(
          (x) =>
            x.workflow_id === c.workflow_id && x.head_sha === input.commit_sha,
        )
        .sort(
          (a, b) => b.run_id - a.run_id || b.run_attempt - a.run_attempt,
        )[0];
      raw = ci ?? { error: "No exact-commit workflow run" };
      uri = ci?.html_url ?? "";
      ci_check_id = ci?.run_id ?? null;
      if (!input.workflow_integrity[c.workflow_id]) result = "FAIL";
      else if (ci?.status === "completed")
        result =
          ci.conclusion === "success" &&
          ["push", "pull_request"].includes(ci.event)
            ? "PASS"
            : "FAIL";
    }
    rows.push({
      evidence_id: uid("evidence"),
      run_id: input.run_id,
      role: "VERIFIER",
      criterion_id: c.id,
      check: c.method,
      result,
      artifact_uri: uri,
      artifact_digest: hash(raw),
      commit_sha: input.commit_sha,
      ci_check_id,
      observed_at: now(),
      verifier_identity: `isolated-node:${process.pid}`,
      context_id,
      raw: JSON.parse(JSON.stringify(raw)),
    });
  }
  const raw = JSON.parse(
    JSON.stringify({
      policy_scope_pass: input.policy_scope_pass,
      observation: input.scope_observation,
    }),
  );
  rows.push({
    evidence_id: uid("evidence"),
    run_id: input.run_id,
    role: "VERIFIER",
    criterion_id: "policy-scope",
    check: "commit_diff_allowlist",
    result: input.policy_scope_pass ? "PASS" : "FAIL",
    artifact_uri: "",
    artifact_digest: hash(raw),
    commit_sha: input.commit_sha,
    ci_check_id: null,
    observed_at: now(),
    verifier_identity: `isolated-node:${process.pid}`,
    context_id,
    raw,
  });
  return rows;
}
