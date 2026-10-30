import { CDX_POLICY_1_0_0 } from "./policy-registry";

export const CDX_RELEASE_REF = "1.0.0";
export const CDX_POLICY_GIT_BLOB = "git-blob-sha1:55dbcdac2f822b59a5a5f0f19eeadfa61d2c7ed0";
export const CDX_RUNTIME_CONTRACT = "CDX-RUNTIME-001";
export const CDX_RUNTIME_CONTRACT_VERSION = "1.0.0";

const RESTRICTIVE = new Set([
  "REQUIRE_HUMAN",
  "QUARANTINE",
  "DENY",
  "SECURITY_STOP",
  "CONSTITUTIONAL_STOP",
]);

type Decision =
  | "ALLOW"
  | "ALLOW_WITH_CONTROLS"
  | "REQUIRE_HUMAN"
  | "QUARANTINE"
  | "DENY"
  | "SECURITY_STOP"
  | "CONSTITUTIONAL_STOP";

type Rule = Record<string, any>;
type Control = {
  control_id: string;
  section_id: string;
  enforcement_surface: string;
  decision_on_fail?: Decision;
  predicate: Rule;
};
type PolicyRegistry = {
  schema: string;
  law_id: string;
  policy_version: string;
  controls: Control[];
};

export type CdxDecisionContext = {
  surface: string;
  actor_id: string;
  action: string;
  authority_ref: string;
  mandate_ref: string;
  correlation_id: string;
  causation_id: string;
  run_id: string;
  trace_ref: string;
  attempted_effect: {
    surface: string;
    operation: string;
    target_ref: string | null;
  };
  data_minimization: {
    personal_data_present: boolean;
    redacted_fields: string[];
    rationale: string;
  };
  subject_ref?: string | null;
  resource_id?: string | null;
  reviewer_ref?: string | null;
  evidence_refs?: string[];
  [key: string]: unknown;
};

export type CdxDecisionResult = {
  decision: Decision;
  reason?: string;
  policyVersion: string;
  policyDigest: string;
  controlResults: Array<{
    control_id: string;
    section_id: string;
    pass: boolean;
    decision: Decision;
    error: string | null;
  }>;
};

function get(obj: any, path: string): any {
  let current = obj;
  for (const part of path.split(".")) {
    if (!current || typeof current !== "object" || !(part in current)) return undefined;
    current = current[part];
  }
  return current;
}

function evaluateRule(rule: Rule, context: CdxDecisionContext): boolean {
  switch (rule.op) {
    case "exists": return get(context, rule.path) !== undefined && get(context, rule.path) !== null;
    case "equals": return get(context, rule.path) === rule.value;
    case "equals_path": return get(context, rule.path) === get(context, rule.other_path);
    case "not_equals": return get(context, rule.path) !== get(context, rule.other_path);
    case "not_equals_value": return get(context, rule.path) !== rule.value;
    case "in": return (rule.values ?? []).includes(get(context, rule.path));
    case "not_in": return !(rule.values ?? []).includes(get(context, rule.path));
    case "contains": return (get(context, rule.path) ?? []).includes(get(context, rule.value_path));
    case "subset": {
      const a = new Set(get(context, rule.path) ?? []);
      const b = new Set(get(context, rule.of_path) ?? []);
      return [...a].every((value) => b.has(value));
    }
    case "lte": {
      const a = get(context, rule.path);
      const b = get(context, rule.other_path);
      return a !== undefined && a !== null && b !== undefined && b !== null && a <= b;
    }
    case "semver": return /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(String(get(context, rule.path) ?? ""));
    case "all": return (rule.rules ?? []).every((child: Rule) => evaluateRule(child, context));
    case "any": return (rule.rules ?? []).some((child: Rule) => evaluateRule(child, context));
    case "implies": return !evaluateRule(rule.if, context) || evaluateRule(rule.then, context);
    default: throw new Error(`UNKNOWN_OPERATOR:${String(rule.op)}`);
  }
}

function ordered(value: any): any {
  if (Array.isArray(value)) return value.map(ordered);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, ordered(value[key])]));
  }
  return value;
}

function canonical(value: any): string {
  return JSON.stringify(ordered(value));
}

async function digest(algorithm: "SHA-1" | "SHA-256", value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const result = await crypto.subtle.digest(algorithm, bytes);
  return [...new Uint8Array(result)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function releasedPolicyRaw(policy: PolicyRegistry): string {
  // The CDX 1.0 artifact is normalized as two-space JSON plus a trailing newline.
  return JSON.stringify(policy, null, 2) + "\n";
}

export async function verifyPinnedPolicy(policy: PolicyRegistry = CDX_POLICY_1_0_0 as unknown as PolicyRegistry) {
  const raw = releasedPolicyRaw(policy);
  const gitBlob = await digest("SHA-1", `blob ${new TextEncoder().encode(raw).length}\0${raw}`);
  const policyDigest = "sha256:" + await digest("SHA-256", raw);
  return {
    valid: `git-blob-sha1:${gitBlob}` === CDX_POLICY_GIT_BLOB &&
      policy.schema === "cdx.control-registry/v1.0" &&
      policy.law_id === "CDX-LAW-001" &&
      policy.policy_version === CDX_RELEASE_REF,
    gitBlob: `git-blob-sha1:${gitBlob}`,
    policyDigest,
  };
}

export async function evaluateCdxDecision(
  context: CdxDecisionContext,
  options?: { policy?: PolicyRegistry | null },
): Promise<CdxDecisionResult> {
  const supplied = options && Object.prototype.hasOwnProperty.call(options, "policy");
  const policy = supplied ? options?.policy ?? null : CDX_POLICY_1_0_0 as unknown as PolicyRegistry;

  if (!policy) {
    return {
      decision: "SECURITY_STOP",
      reason: "POLICY_UNAVAILABLE",
      policyVersion: "UNAVAILABLE",
      policyDigest: "UNAVAILABLE",
      controlResults: [],
    };
  }

  const integrity = await verifyPinnedPolicy(policy);
  if (!integrity.valid) {
    return {
      decision: "SECURITY_STOP",
      reason: "POLICY_INTEGRITY_MISMATCH",
      policyVersion: policy.policy_version ?? "UNAVAILABLE",
      policyDigest: integrity.policyDigest,
      controlResults: [],
    };
  }

  const controls = policy.controls.filter((control) => control.enforcement_surface === context.surface);
  if (!controls.length) {
    return {
      decision: "DENY",
      reason: "NO_APPLICABLE_CONTROL",
      policyVersion: policy.policy_version,
      policyDigest: integrity.policyDigest,
      controlResults: [],
    };
  }

  const rank: Record<Decision, number> = {
    ALLOW: 0,
    ALLOW_WITH_CONTROLS: 1,
    REQUIRE_HUMAN: 2,
    QUARANTINE: 3,
    DENY: 4,
    SECURITY_STOP: 5,
    CONSTITUTIONAL_STOP: 6,
  };

  let finalDecision: Decision = "ALLOW";
  const controlResults: CdxDecisionResult["controlResults"] = [];

  for (const control of controls) {
    let pass = false;
    let error: string | null = null;
    try {
      pass = evaluateRule(control.predicate, context);
    } catch (cause) {
      error = cause instanceof Error ? cause.message : String(cause);
    }
    const decision = pass ? "ALLOW" : (control.decision_on_fail ?? "DENY");
    controlResults.push({
      control_id: control.control_id,
      section_id: control.section_id,
      pass,
      decision,
      error,
    });
    if (rank[decision] > rank[finalDecision]) finalDecision = decision;
  }

  return {
    decision: finalDecision,
    policyVersion: policy.policy_version,
    policyDigest: integrity.policyDigest,
    controlResults,
  };
}

export function buildDirectorSessionContext(credentialsMatch: boolean): CdxDecisionContext {
  const correlation = crypto.randomUUID();
  return {
    surface: "IDENTITY_AUTHORITY",
    actor_id: "FFOS:AUTHENTICATION_ATTEMPT",
    action: "ISSUE_DIRECTOR_SESSION",
    authority_ref: "FFOS-AUTH-PHASE0-DIRECTOR",
    mandate_ref: "FFOS-MANDATE-AUTHENTICATION-001",
    correlation_id: correlation,
    causation_id: correlation,
    run_id: `FFOS-AUTH-${crypto.randomUUID()}`,
    trace_ref: `FFOS-CDX-WP11-${crypto.randomUUID()}`,
    attempted_effect: {
      surface: "FFOS_AUTH",
      operation: "ISSUE_DIRECTOR_SESSION",
      target_ref: "FFOS:DIRECTOR_SESSION",
    },
    data_minimization: {
      personal_data_present: false,
      redacted_fields: ["user", "password", "session_token"],
      rationale: "CDX evidence records role-level authentication state only; credentials and session secrets are excluded.",
    },
    subject_ref: "FFOS:DIRECTOR",
    reviewer_ref: null,
    evidence_refs: ["CDX-WP11", "CDX-RUNTIME-001@1.0.0"],
    principal_class: "HUMAN",
    principal_id: credentialsMatch ? "FFOS:DIRECTOR" : null,
    model_id: "NOT_APPLICABLE:HUMAN_PRINCIPAL",
    asserted_identity: "FFOS:DIRECTOR",
    authenticated_identity: credentialsMatch ? "FFOS:DIRECTOR" : "UNAUTHENTICATED",
  };
}

export function buildRuntimeProbeContext(tokenMatch: boolean): CdxDecisionContext {
  const correlation = crypto.randomUUID();
  return {
    surface: "IDENTITY_AUTHORITY",
    actor_id: "FFOS:CDX_RUNTIME_PROBE",
    action: "ISSUE_RUNTIME_PROOF_RECEIPT",
    authority_ref: "FFOS-AUTH-CDX-RUNTIME-PROBE",
    mandate_ref: "FFOS-MANDATE-CDX-RUNTIME-VERIFICATION-001",
    correlation_id: correlation,
    causation_id: correlation,
    run_id: `FFOS-CDX-PROBE-${crypto.randomUUID()}`,
    trace_ref: `FFOS-CDX-PROD-${crypto.randomUUID()}`,
    attempted_effect: {
      surface: "FFOS_RUNTIME_PROOF",
      operation: "ISSUE_RUNTIME_PROOF_RECEIPT",
      target_ref: "FFOS:CDX_RUNTIME_PROBE_COOKIE",
    },
    data_minimization: {
      personal_data_present: false,
      redacted_fields: ["probe_token", "runtime_probe_cookie"],
      rationale: "Runtime verification uses a dedicated non-privileged probe secret and records no user credentials.",
    },
    subject_ref: "FFOS:CDX_RUNTIME_PROBE",
    reviewer_ref: null,
    evidence_refs: ["CDX-RUNTIME-001@1.0.0", "FFOS:RUNTIME_PROOF"],
    principal_class: "SERVICE",
    principal_id: tokenMatch ? "FFOS:CDX_RUNTIME_PROBE" : null,
    model_id: "NOT_APPLICABLE:SERVICE_PRINCIPAL",
    asserted_identity: "FFOS:CDX_RUNTIME_PROBE",
    authenticated_identity: tokenMatch ? "FFOS:CDX_RUNTIME_PROBE" : "UNAUTHENTICATED",
  };
}

export type SpetlEvent = Record<string, unknown> & {
  schema_version: "1.1";
  event_id: string;
  event_type: string;
  recorded_at: string;
  effect_status: "NOT_ATTEMPTED" | "PERMITTED" | "BLOCKED" | "FAILED";
  decision: Decision;
  previous_hash: string | null;
  event_hash: string;
};

export async function createSpetlEvent(
  context: CdxDecisionContext,
  result: CdxDecisionResult,
  effectStatus: SpetlEvent["effect_status"],
  previousHash: string | null = null,
  eventType = "POLICY_DECISION",
): Promise<SpetlEvent> {
  const base: Record<string, unknown> = {
    schema_version: "1.1",
    event_id: "CDX-EVT-" + crypto.randomUUID().replaceAll("-", "").toUpperCase(),
    event_type: eventType,
    recorded_at: new Date().toISOString(),
    actor_id: context.actor_id,
    subject_ref: context.subject_ref ?? null,
    action: context.action,
    resource_id: context.resource_id ?? null,
    attempted_effect: context.attempted_effect,
    effect_status: effectStatus,
    decision: result.decision,
    authority_ref: context.authority_ref,
    mandate_ref: context.mandate_ref,
    policy_version: result.policyVersion,
    policy_digest: result.policyDigest,
    correlation_id: context.correlation_id,
    causation_id: context.causation_id,
    run_id: context.run_id,
    trace_ref: context.trace_ref,
    reviewer_ref: context.reviewer_ref ?? null,
    data_minimization: context.data_minimization,
    control_results: result.controlResults,
    evidence_refs: context.evidence_refs ?? [],
    previous_hash: previousHash,
  };
  const eventHash = "sha256:" + await digest("SHA-256", canonical(base));
  return { ...base, event_hash: eventHash } as SpetlEvent;
}

export function emitSpetlEvent(event: SpetlEvent): void {
  // Runtime logs are the local operational evidence surface. Terminal verification
  // independently preserves the production proof in GitHub/CDX evidence. No credentials,
  // tokens or personal identifiers are included in the event.
  console.info("FFOS_CDX_SPETL " + JSON.stringify(event));
}

export function isPermissive(decision: Decision): boolean {
  return !RESTRICTIVE.has(decision);
}
