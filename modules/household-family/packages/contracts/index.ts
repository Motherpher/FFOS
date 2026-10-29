import { z } from "zod";
import { createHash, randomUUID } from "node:crypto";

export const id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,119}$/);
export const sha = z.string().regex(/^[a-f0-9]{40}$/);
export const digest = z.string().regex(/^[a-f0-9]{64}$/);
export const repo = z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);
export const pathSchema = z
  .string()
  .min(1)
  .max(400)
  .refine(
    (p) =>
      !p.startsWith("/") &&
      !p.includes("\\") &&
      !p.split("/").some((s) => ["", ".", ".."].includes(s)) &&
      !/[\x00-\x1f\x7f]/.test(p),
    "Unsafe repository path",
  );
export const State = z.enum([
  "DISCOVERED",
  "ELIGIBLE",
  "LEASED",
  "INSPECTING",
  "EXECUTING",
  "VERIFYING",
  "REPAIRING",
  "READY_FOR_DIRECTOR",
  "ACCEPTED",
  "RECORDED",
  "RECOVERY_CHECK",
  "HOLD_HUMAN",
  "BLOCKED",
  "FAILED",
  "CANCEL_REQUESTED",
  "STOPPED",
]);
export type State = z.infer<typeof State>;
export const permission = z.enum(["OBSERVE", "PROPOSE", "EXECUTE_BOUNDED"]);
export const Project = z
  .object({
    project_id: id,
    repo_full_name: repo,
    enabled: z.boolean(),
    policy_ref: z.string().min(1),
    allowed_paths: z.array(pathSchema).min(1),
    allowed_actions: z.array(
      z.enum(["read", "branch", "commit", "pull_request"]),
    ),
    protected_branches: z.array(z.string()).min(1),
    max_concurrent_runs: z.number().int().min(1).max(4),
    max_repair_attempts: z.number().int().min(0).max(3),
    cost_ceiling: z.number().min(0),
    allowed_ci_workflows: z.array(
      z.object({
        id: z.number().int().positive(),
        path: pathSchema,
        sha256: digest,
      }),
    ),
    environment: z.enum(["test", "sandbox", "production"]),
    owner_ref: id,
    permission,
    updated_at: z.iso.datetime(),
    installation_id: z.number().int().positive(),
    max_changed_files: z.number().int().min(1).max(20).default(5),
    max_patch_bytes: z.number().int().min(1).max(100000).default(16384),
    require_ci: z.boolean().default(true),
    ci_cost_policy: z
      .enum(["UNCONFIRMED", "DIRECTOR_APPROVED_EXISTING_CAPACITY"])
      .default("UNCONFIRMED"),
  })
  .strict();
export type Project = z.infer<typeof Project>;
export const Criterion = z.discriminatedUnion("method", [
  z
    .object({
      id,
      text: z.string().min(1),
      method: z.literal("file_contains"),
      path: pathSchema,
      value: z.string().min(1),
    })
    .strict(),
  z
    .object({
      id,
      text: z.string().min(1),
      method: z.literal("json_equals"),
      path: pathSchema,
      pointer: z.string(),
      value: z.json(),
    })
    .strict(),
  z
    .object({
      id,
      text: z.string().min(1),
      method: z.literal("ci_workflow"),
      workflow_id: z.number().int().positive(),
    })
    .strict(),
]);
export type Criterion = z.infer<typeof Criterion>;
export const WorkPackage = z
  .object({
    wp_id: id,
    project_id: id,
    repo,
    version: z.number().int().positive(),
    title: z.string().min(1),
    description_ref: z.string(),
    dependency_ids: z.array(id),
    acceptance_criteria: z.array(Criterion).min(1),
    priority: z.number().int(),
    eligibility_revision: id,
    baseline_sha: sha,
    risk_tier: z.enum(["LOW", "SENSITIVE", "UNKNOWN"]),
    scope_hash: digest,
    director_policy_ref: z.string(),
    max_repair_attempts: z.number().int().min(0).max(3),
    requested_action: z.enum([
      "read",
      "branch_pr",
      "deploy",
      "delete",
      "release",
      "permissions",
    ]),
    time_budget_seconds: z.number().int().min(1).max(3600),
    mutation_recipe_id: id.nullable(),
    repair_recipe_ids: z.array(id),
    status: z.enum(["DISPATCHED", "NOT_DISPATCHED", "CLOSED"]),
  })
  .strict();
export type WorkPackage = z.infer<typeof WorkPackage>;
export const Recipe = z
  .object({
    recipe_id: id,
    class: z.literal("J1"),
    auto_repair: z.boolean(),
    changes: z
      .array(
        z
          .object({
            path: pathSchema,
            previous_sha256: digest.nullable(),
            content: z.string().max(100000),
          })
          .strict(),
      )
      .min(1)
      .max(20),
  })
  .strict();
export type Recipe = z.infer<typeof Recipe>;
export const DirectorSnapshot = z
  .object({
    project_id: id,
    policy_ref: z.string(),
    policy_version: id,
    revision: id,
    issued_at: z.iso.datetime(),
    expires_at: z.iso.datetime(),
    authority_ref: z.string().min(1),
    permission,
    allowed_paths: z.array(pathSchema),
    allowed_actions: z.array(z.string()),
    canonical_j_source: z.string().min(1),
    ama_status: z.enum(["AMBIGUOUS_SOURCE_AMA", "SOURCE_VERIFIED"]),
    cost_ceiling: z.number().min(0),
    max_repair_attempts: z.number().int().min(0).max(3),
    auto_dispatch: z.boolean(),
    auto_dispatch_subject: id.nullable(),
    revoked: z.boolean(),
    allowed_subjects: z.array(id).min(1),
    mandate_ref: z.string().min(1),
    hcc_review_ref: z.string().nullable(),
    ci_cost_approved: z.boolean(),
    accepted_versions: z.record(id, z.number().int().positive()),
    eligible_ids: z.array(id),
    work_packages: z.array(WorkPackage),
    recipes: z.array(Recipe),
  })
  .strict();
export type DirectorSnapshot = z.infer<typeof DirectorSnapshot>;
export const Decision = z
  .object({
    decision_id: id,
    run_id: id,
    wp_id: id,
    wp_version: z.number().int().positive(),
    project_id: id,
    actor: z.literal("Director"),
    authority_ref: z.string(),
    director_policy_version: id,
    eligibility_revision: id,
    decision: z.enum(["ACCEPT", "REJECT", "REQUEST_CHANGES", "HOLD", "WAIVE"]),
    scope_hash: digest,
    commit_sha: sha,
    evidence_bundle_hash: digest,
    reason: z.string().min(1),
    timestamp: z.iso.datetime(),
  })
  .strict();
export type Decision = z.infer<typeof Decision>;
export const Evidence = z
  .object({
    evidence_id: id,
    run_id: id,
    role: z.enum(["JANITOR", "VERIFIER"]),
    criterion_id: id,
    check: z.string(),
    result: z.enum(["PASS", "FAIL", "INCONCLUSIVE"]),
    artifact_uri: z.string(),
    artifact_digest: digest,
    commit_sha: sha,
    ci_check_id: z.number().int().nullable(),
    observed_at: z.iso.datetime(),
    verifier_identity: z.string(),
    context_id: id,
    raw: z.json(),
  })
  .strict();
export type Evidence = z.infer<typeof Evidence>;
export interface Run {
  run_id: string;
  wp_id: string;
  wp_version: number;
  project_id: string;
  repo: string;
  policy_version: string;
  policy_hash: string;
  eligibility_revision: string;
  eligibility_snapshot_hash: string;
  baseline_sha: string;
  commit_sha: string;
  branch: string;
  pr_ref: string | null;
  state: State;
  revision: number;
  lease_owner: string | null;
  lease_expires_at: number | null;
  current_attempt: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  last_error: string | null;
  correlation_id: string;
  idempotency_key: string;
  wp: WorkPackage;
  evidence_bundle_hash: string | null;
  stop_requested: boolean;
  origin_subject: string;
  recipe_bases: Record<string, string>;
  recovery_state: State | null;
}
export interface AuditEvent {
  event_id: string;
  run_id: string | null;
  project_id: string;
  actor: string;
  event_type: string;
  previous_state: string | null;
  new_state: string | null;
  policy_hash: string | null;
  source_ref: string;
  evidence_refs: string[];
  timestamp: string;
  correlation_id: string;
  external_write_id: string | null;
  readback_verified: boolean;
  previous_hash: string;
  event_hash: string;
  detail: Record<string, unknown>;
}
export const RunSchema = z
  .object({
    run_id: id,
    wp_id: id,
    wp_version: z.number().int().positive(),
    project_id: id,
    repo,
    policy_version: id,
    policy_hash: digest,
    eligibility_revision: id,
    eligibility_snapshot_hash: digest,
    baseline_sha: sha,
    commit_sha: sha,
    branch: z.string(),
    pr_ref: z.string().nullable(),
    state: State,
    revision: z.number().int().positive(),
    lease_owner: id.nullable(),
    lease_expires_at: z.number().nullable(),
    current_attempt: z.number().int().nonnegative(),
    created_at: z.iso.datetime(),
    updated_at: z.iso.datetime(),
    completed_at: z.iso.datetime().nullable(),
    last_error: z.string().nullable(),
    correlation_id: id,
    idempotency_key: id,
    wp: WorkPackage,
    evidence_bundle_hash: digest.nullable(),
    stop_requested: z.boolean(),
    origin_subject: id,
    recipe_bases: z.record(id, sha),
    recovery_state: State.nullable(),
  })
  .strict();
export const AuditEventSchema = z
  .object({
    event_id: id,
    run_id: id.nullable(),
    project_id: id,
    actor: z.string(),
    event_type: z.string(),
    previous_state: z.string().nullable(),
    new_state: z.string().nullable(),
    policy_hash: digest.nullable(),
    source_ref: z.string(),
    evidence_refs: z.array(id),
    timestamp: z.iso.datetime(),
    correlation_id: id,
    external_write_id: z.string().nullable(),
    readback_verified: z.boolean(),
    previous_hash: digest,
    event_hash: digest,
    detail: z.record(z.string(), z.json()),
  })
  .strict();
export const Fault = z
  .object({
    defect_id: id,
    J_class: z.enum(["J0", "J1", "J2", "UNDETERMINED"]),
    observed_in: z.string(),
    evidence: z.array(z.string()),
    scope: z.array(pathSchema),
    severity: z.enum([
      "INFO",
      "HYGIENE",
      "DRIFT",
      "CONTRADICTION",
      "CONTROL_DEFECT",
      "SECURITY_STOP",
      "CONSTITUTIONAL_STOP",
    ]),
    suggested_fix: z.string().nullable(),
    attempt_limit: z.number().int().nonnegative(),
    status: z.enum(["OPEN", "RESOLVED", "HOLD"]),
  })
  .strict();
export const now = () => new Date().toISOString();
export const uid = (prefix: string) => `${prefix}-${randomUUID()}`;
export function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  return `{${Object.keys(value)
    .sort()
    .map(
      (k) =>
        `${JSON.stringify(k)}:${stable((value as Record<string, unknown>)[k])}`,
    )
    .join(",")}}`;
}
export const hash = (v: unknown) =>
  createHash("sha256")
    .update(typeof v === "string" ? v : stable(v))
    .digest("hex");
export function scopeHash(
  wp: Omit<WorkPackage, "scope_hash"> | WorkPackage,
): string {
  const { scope_hash: _, ...rest } = wp as WorkPackage;
  return hash(rest);
}
export class Gate extends Error {
  constructor(
    public code: string,
    public state: "HOLD_HUMAN" | "BLOCKED" = "BLOCKED",
  ) {
    super(code);
  }
}
export function ffosRunState(s: State): string {
  if (["ACCEPTED", "RECORDED"].includes(s)) return "PASS";
  if (s === "ELIGIBLE" || s === "DISCOVERED") return "QUEUED";
  if (s === "FAILED") return "FAIL";
  if (s === "STOPPED") return "CANCELLED";
  if (["HOLD_HUMAN", "BLOCKED", "READY_FOR_DIRECTOR"].includes(s))
    return "HOLD";
  return "RUNNING";
}
