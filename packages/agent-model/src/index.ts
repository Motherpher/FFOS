export type AMARuntimeClass =
  | "REQUEST_RESPONSE"
  | "DURABLE_WORKER"
  | "SCHEDULED"
  | "EVENT_DRIVEN"
  | "COMPOSITE"
  | "HYBRID";

export type AgentLifecycleState =
  | "DRAFT"
  | "REGISTERED"
  | "VALIDATED"
  | "DEPLOYABLE"
  | "ACTIVE"
  | "SUSPENDED"
  | "DEPRECATED"
  | "RETIRED";

export type EffectClass =
  | "E0_OBSERVE"
  | "E1_INTERNAL_STATE"
  | "E2_REPOSITORY_CHANGE"
  | "E3_EXTERNAL_EFFECT"
  | "E4_AUTHORITY_CHANGE";

export type MemoryMode = "NONE" | "RUN" | "SESSION" | "PERSISTENT_BOUNDED";

export interface AgentMandate {
  scope: string[];
  nonGoals: string[];
}

export interface AgentAuthorityContract {
  governingAuthority: string;
  authorityRefRequired: boolean;
  mandateRefRequired: boolean;
  selfApprovalProhibited: true;
}

export interface InternalAgentRole {
  roleId: string;
  purpose: string;
  workflowIds: string[];
  capabilityIds: string[];
  effectCeiling: EffectClass;
  mayVerifyOtherRoleWork?: boolean;
  mayCreateExternalEffects?: boolean;
}

export interface AgentStatePolicy {
  durableState: boolean;
  memoryMode: MemoryMode;
  stateStoreRef?: string;
}

export interface AgentEvidenceContract {
  runRecordRequired: true;
  failedRunRecordRequired: true;
  requiredArtifacts?: string[];
}

export interface AgentConformanceContract {
  profile: string;
  regressionRequired: true;
  authorityDenialTestsRequired: true;
  suiteRef?: string;
}

export interface AgentModuleBinding {
  enabled: boolean;
  version: string;
  configRef?: string;
}

export interface AMAAgentManifest {
  schema: "ffos.ama.agent-manifest/v1";
  agentId: string;
  name: string;
  agentVersion: string;
  amaVersion: string;
  purpose: string;
  mandate: AgentMandate;
  runtimeClass: AMARuntimeClass;
  lifecycleState: AgentLifecycleState;
  authority: AgentAuthorityContract;
  effectCeiling: EffectClass;
  workflows: string[];
  commands: string[];
  capabilities: string[];
  internalRoles?: InternalAgentRole[];
  statePolicy: AgentStatePolicy;
  evidence: AgentEvidenceContract;
  conformance: AgentConformanceContract;
  modules?: Record<string, AgentModuleBinding>;
}

export interface AMAExecutionContext {
  runId: string;
  agentId: string;
  agentVersion: string;
  amaVersion: string;
  workflowId: string;
  workflowVersion: string;
  principalRef: string;
  authorityRef?: string;
  mandateRef?: string;
  requestedEffect: EffectClass;
  targetScope?: string[];
  policyVersion?: string;
  inputRefs: string[];
  correlationId?: string;
}

const EFFECT_RANK: Record<EffectClass, number> = {
  E0_OBSERVE: 0,
  E1_INTERNAL_STATE: 1,
  E2_REPOSITORY_CHANGE: 2,
  E3_EXTERNAL_EFFECT: 3,
  E4_AUTHORITY_CHANGE: 4,
};

export function effectWithinCeiling(
  requested: EffectClass,
  ceiling: EffectClass,
): boolean {
  return EFFECT_RANK[requested] <= EFFECT_RANK[ceiling];
}

export function requiresExplicitAuthority(effect: EffectClass): boolean {
  return EFFECT_RANK[effect] >= EFFECT_RANK.E1_INTERNAL_STATE;
}

export function assertExecutionContext(
  manifest: AMAAgentManifest,
  context: AMAExecutionContext,
): void {
  if (manifest.agentId !== context.agentId) {
    throw new Error("Execution context agentId does not match manifest.");
  }

  if (manifest.agentVersion !== context.agentVersion) {
    throw new Error("Execution context agentVersion does not match manifest.");
  }

  if (manifest.amaVersion !== context.amaVersion) {
    throw new Error("Execution context amaVersion does not match manifest.");
  }

  if (!effectWithinCeiling(context.requestedEffect, manifest.effectCeiling)) {
    throw new Error("Requested effect exceeds agent effect ceiling.");
  }

  if (
    (manifest.authority.authorityRefRequired ||
      requiresExplicitAuthority(context.requestedEffect)) &&
    !context.authorityRef
  ) {
    throw new Error("Explicit authority_ref is required.");
  }

  if ((manifest.authority.mandateRefRequired ||
      requiresExplicitAuthority(context.requestedEffect)) && !context.mandateRef) {
    throw new Error("Explicit mandate_ref is required.");
  }

  if (!context.principalRef?.trim() || !context.runId?.trim()) {
    throw new Error("Principal and run IDs are required.");
  }

  if (!manifest.workflows.includes(context.workflowId)) {
    throw new Error("Workflow is not registered to this agent.");
  }

  // This structural check is NOT CDX policy evaluation or effect authorization.
  if (manifest.lifecycleState !== "ACTIVE") {
    throw new Error(
      `Agent is not ACTIVE (state=${manifest.lifecycleState}).`,
    );
  }
}

export interface AMACommandDefinition {
  commandId: string;
  token: string;
  agentId: string;
  workflowId: string;
  workflowVersion: string;
  inputSchemaRef?: string;
  activationModes: string[];
  requiredAuthority?: string;
  status: "DRAFT" | "ACTIVE" | "SUSPENDED" | "DEPRECATED";
}

export interface AMAWorkflowDefinition {
  workflowId: string;
  version: string;
  agentId: string;
  purpose: string;
  requiredCapabilities: string[];
  effectCeiling: EffectClass;
  authorityRequirements: string[];
  verification: string[];
  evidenceRequirements: string[];
  terminalStates: string[];
  rollbackPolicy?: string;
  status: "DRAFT" | "VALIDATED" | "ACTIVE" | "SUSPENDED" | "DEPRECATED";
}

/** Agent Stable bindings, distinct from agent manifest and runtime authority. */
export interface AMACapabilityDefinition {
  capabilityId: string;
  agentId: string;
  effectClass: EffectClass;
  status: "DRAFT" | "VALIDATED" | "ACTIVE" | "SUSPENDED" | "DEPRECATED";
  moduleId?: string;
}

export interface AMABindingRegistry {
  schema: "ffos.ama.bindings/v1";
  workflows: AMAWorkflowDefinition[];
  commands: AMACommandDefinition[];
  capabilities: AMACapabilityDefinition[];
}

export interface AMAConformanceFinding {
  gate: "C1" | "C2" | "C3" | "C6";
  code: string;
  path: string;
  message: string;
  severity: "ERROR";
}

export interface AMAStaticConformanceReport {
  contract: "ffos.ama.conformance-report/v1";
  status: "FAIL" | "STATIC_PASS";
  assurance: "STATIC_CONTRACT_ONLY";
  agent_id: string | null;
  agent_version: string | null;
  ama_version: string | null;
  checked_gates: Array<"C1" | "C2" | "C3" | "C6">;
  not_proven: string[];
  findings: AMAConformanceFinding[];
}
