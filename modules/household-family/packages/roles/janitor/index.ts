import {
  hash,
  now,
  uid,
  type Evidence,
  type Project,
  type Run,
  type DirectorSnapshot,
} from "../../contracts/index.js";
import type { GitHub } from "../../github-adapter/index.js";
import { collect } from "../verifier/index.js";

export async function inspect(
  github: GitHub,
  p: Project,
  r: Run,
  policy: DirectorSnapshot,
): Promise<{ evidence: Evidence[]; already_fulfilled: boolean }> {
  const raw = await collect(github, p, r, policy);
  const context_id = uid("janitor-context");
  // Preflight is only a diagnostic. Its claims are never used as acceptance evidence.
  const available = Object.values(raw.files).every((f) => f.content !== null);
  const evidence: Evidence = {
    evidence_id: uid("evidence"),
    run_id: r.run_id,
    role: "JANITOR",
    criterion_id: "preflight",
    check: "read_only_repository_snapshot",
    result: raw.disconnected ? "INCONCLUSIVE" : "PASS",
    artifact_uri: `https://github.com/${p.repo_full_name}/tree/${r.commit_sha}`,
    artifact_digest: hash(raw),
    commit_sha: r.commit_sha,
    ci_check_id: null,
    observed_at: now(),
    verifier_identity: "JANITOR",
    context_id,
    raw: JSON.parse(JSON.stringify(raw)),
  };
  // Use the simple already-fulfilled path only for file checks. CI still runs through Verifier.
  const fulfilled =
    available &&
    r.wp.acceptance_criteria.every((c) =>
      c.method === "file_contains"
        ? raw.files[c.path]?.content?.includes(c.value)
        : false,
    );
  return {
    evidence: [evidence],
    already_fulfilled: !raw.disconnected && fulfilled,
  };
}
