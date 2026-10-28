import {
  Gate,
  hash,
  pathSchema,
  scopeHash,
  type DirectorSnapshot,
  type Project,
  type Run,
  type WorkPackage,
  type Recipe,
} from "../contracts/index.js";

// These meanings were read from the September 2026 canonical Household source.
export const J_CLASSES = Object.freeze({
  J0: "ephemeral cleanup",
  J1: "deterministic registered repair",
  J2: "interpretive or constitutional stop",
});
const sensitive =
  /^(?:\.git(?:\/|$)|\.github(?:\/|$)|\.env(?:[./]|$)|\.security(?:\/|$)|\.cdx(?:\/|$))|(?:^|\/)(?:policy|policies|governance|director|codex|constitution|secrets?|credentials?|private[_-]?key|wp-manifest|household-manifest|authority)(?:[./_-]|$)|\.(?:pem|key)$/i;
export function within(path: string, allowed: string[]): boolean {
  pathSchema.parse(path);
  return allowed.some(
    (p) => path === p || path.startsWith(p.replace(/\/$/, "") + "/"),
  );
}
export function authorize(
  project: Project,
  policy: DirectorSnapshot,
  wp: WorkPackage,
  run?: Run,
) {
  if (!project.enabled) throw new Gate("PROJECT_DISABLED", "HOLD_HUMAN");
  if (
    policy.revoked ||
    Date.parse(policy.expires_at) <= Date.now() ||
    Date.parse(policy.issued_at) > Date.now() + 30000
  )
    throw new Gate("DIRECTOR_AUTHORITY_EXPIRED_OR_REVOKED", "HOLD_HUMAN");
  if (
    policy.project_id !== project.project_id ||
    policy.policy_ref !== project.policy_ref ||
    wp.director_policy_ref !== policy.policy_ref ||
    wp.project_id !== project.project_id ||
    wp.repo !== project.repo_full_name
  )
    throw new Gate("AUTHORITY_SCOPE_MISMATCH", "HOLD_HUMAN");
  if (wp.scope_hash !== scopeHash(wp))
    throw new Gate("WP_SCOPE_HASH_INVALID", "HOLD_HUMAN");
  if (wp.status !== "DISPATCHED" || !policy.eligible_ids.includes(wp.wp_id))
    throw new Gate("WP_NOT_DISPATCHED");
  if (wp.dependency_ids.some((dep) => !policy.accepted_versions[dep]))
    throw new Gate("UNMET_DIRECTOR_DEPENDENCY");
  if (wp.eligibility_revision !== policy.revision)
    throw new Gate("STALE_ELIGIBILITY_REVISION", "HOLD_HUMAN");
  if (
    wp.risk_tier !== "LOW" ||
    !["read", "branch_pr"].includes(wp.requested_action)
  )
    throw new Gate("SENSITIVE_OPERATION", "HOLD_HUMAN");
  if (
    !project.allowed_actions.includes("read") ||
    !policy.allowed_actions.includes("read")
  )
    throw new Gate("READ_NOT_AUTHORIZED", "HOLD_HUMAN");
  if (run) {
    if (
      run.wp.scope_hash !== wp.scope_hash ||
      run.wp_version !== wp.version ||
      run.policy_version !== policy.policy_version ||
      run.policy_hash !== hash(policy) ||
      run.eligibility_revision !== policy.revision
    )
      throw new Gate("STALE_POLICY_AFTER_LEASE", "HOLD_HUMAN");
    if (
      run.stop_requested ||
      run.state === "CANCEL_REQUESTED" ||
      run.state === "STOPPED"
    )
      throw new Gate("CANCELLATION_REQUESTED");
    if (Date.now() - Date.parse(run.created_at) > wp.time_budget_seconds * 1000)
      throw new Gate("TIME_BUDGET_EXHAUSTED");
  }
  if (wp.requested_action === "branch_pr") {
    if (!policy.hcc_review_ref)
      throw new Gate("HCC_REVIEW_REFERENCE_REQUIRED", "HOLD_HUMAN");
    if (
      project.ci_cost_policy !== "DIRECTOR_APPROVED_EXISTING_CAPACITY" ||
      !policy.ci_cost_approved
    )
      throw new Gate("CI_COST_APPROVAL_REQUIRED", "HOLD_HUMAN");
    if (
      project.permission !== "EXECUTE_BOUNDED" ||
      policy.permission !== "EXECUTE_BOUNDED"
    )
      throw new Gate("MUTATION_NOT_AUTHORIZED", "HOLD_HUMAN");
    if (!project.require_ci || !project.allowed_ci_workflows.length)
      throw new Gate("TRUSTED_CI_REQUIRED", "HOLD_HUMAN");
    for (const action of ["read", "branch", "commit", "pull_request"])
      if (
        !project.allowed_actions.includes(action as "read") ||
        !policy.allowed_actions.includes(action)
      )
        throw new Gate("ACTION_NOT_ALLOWLISTED", "HOLD_HUMAN");
  }
  // This executor has no paid model calls or workflow-dispatch operations. It never spends a budget.
  if (policy.cost_ceiling > project.cost_ceiling)
    throw new Gate("COST_ENVELOPE_MISMATCH", "HOLD_HUMAN");
  const criterionIDs = wp.acceptance_criteria.map((c) => c.id);
  if (new Set(criterionIDs).size !== criterionIDs.length)
    throw new Gate("DUPLICATE_CRITERION_ID");
  for (const c of wp.acceptance_criteria) {
    if (
      c.method !== "ci_workflow" &&
      (!within(c.path, project.allowed_paths) ||
        !within(c.path, policy.allowed_paths))
    )
      throw new Gate("CRITERION_PATH_OUTSIDE_SCOPE", "HOLD_HUMAN");
    if (
      c.method === "ci_workflow" &&
      !project.allowed_ci_workflows.some((x) => x.id === c.workflow_id)
    )
      throw new Gate("CI_WORKFLOW_NOT_ALLOWLISTED", "HOLD_HUMAN");
  }
}
export function authorizeRecipe(
  project: Project,
  policy: DirectorSnapshot,
  wp: WorkPackage,
  recipe: Recipe,
  repair: boolean,
) {
  if (recipe.class !== "J1" || (repair && !recipe.auto_repair))
    throw new Gate("REPAIR_CLASS_NOT_AUTOMATIC", "HOLD_HUMAN");
  if (
    repair
      ? !wp.repair_recipe_ids.includes(recipe.recipe_id)
      : wp.mutation_recipe_id !== recipe.recipe_id
  )
    throw new Gate("RECIPE_NOT_REGISTERED_FOR_WP", "HOLD_HUMAN");
  if (
    recipe.changes.length > project.max_changed_files ||
    new Set(recipe.changes.map((c) => c.path)).size !== recipe.changes.length
  )
    throw new Gate("BLAST_RADIUS_EXCEEDED", "HOLD_HUMAN");
  let bytes = 0;
  for (const change of recipe.changes) {
    if (
      sensitive.test(change.path) ||
      !within(change.path, project.allowed_paths) ||
      !within(change.path, policy.allowed_paths)
    )
      throw new Gate("UNAUTHORIZED_PATH_MUTATION", "HOLD_HUMAN");
    bytes += Buffer.byteLength(change.content);
  }
  if (bytes > project.max_patch_bytes)
    throw new Gate("PATCH_BYTE_BUDGET_EXCEEDED", "HOLD_HUMAN");
  if (project.protected_branches.some((b) => b.startsWith("hf/")))
    throw new Gate("FEATURE_NAMESPACE_PROTECTED", "HOLD_HUMAN");
}
export function validateDAG(policy: DirectorSnapshot) {
  if (
    policy.auto_dispatch &&
    (!policy.auto_dispatch_subject ||
      !policy.allowed_subjects.includes(policy.auto_dispatch_subject))
  )
    throw new Gate("DIRECTOR_AUTOMATION_IDENTITY_NOT_DELEGATED", "HOLD_HUMAN");
  const packages = new Map(policy.work_packages.map((w) => [w.wp_id, w]));
  if (
    packages.size !== policy.work_packages.length ||
    new Set(policy.eligible_ids).size !== policy.eligible_ids.length
  )
    throw new Gate("DUPLICATE_WP_ID", "HOLD_HUMAN");
  const visiting = new Set<string>(),
    done = new Set<string>();
  const visit = (id: string) => {
    if (done.has(id)) return;
    if (visiting.has(id)) throw new Gate("DIRECTOR_DAG_CYCLE", "HOLD_HUMAN");
    const w = packages.get(id);
    if (!w) {
      if (!policy.accepted_versions[id])
        throw new Gate("DIRECTOR_DEPENDENCY_UNKNOWN");
      return;
    }
    visiting.add(id);
    w.dependency_ids.forEach(visit);
    visiting.delete(id);
    done.add(id);
  };
  policy.work_packages.forEach((w) => visit(w.wp_id));
  if (policy.eligible_ids.some((id) => !packages.has(id)))
    throw new Gate("ELIGIBLE_WP_UNKNOWN", "HOLD_HUMAN");
}
