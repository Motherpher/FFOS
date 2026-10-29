/** AMA 0.2 CANDIDATE ONLY. v1 runtime types and wire identifiers remain unchanged.
 * Structural types mirror packages/agent-model/schemas/v0.2/*.schema.json.
 * This module is not an authority decision or executable agent runtime.
 */
export type AMASemver = `${number}.${number}.${number}`;
export type AMASha256Digest = `sha256:${string}`;
export type AMAPinnedRef = Readonly<{id:string;version:AMASemver;digest:AMASha256Digest}>;
export type AMAAssuranceClass = "STATIC_CONTRACT_ONLY";
export type AMAEffectClass = "E0_OBSERVE"|"E1_INTERNAL_STATE"|"E2_REPOSITORY_CHANGE"|"E3_EXTERNAL_EFFECT"|"E4_AUTHORITY_CHANGE";
export type AMALifecycleState = "DRAFT"|"REGISTERED"|"VALIDATED"|"DEPLOYABLE"|"ACTIVE"|"SUSPENDED"|"DEPRECATED"|"RETIRED";
export type AMABindingState = "DRAFT"|"VALIDATED"|"ACTIVE"|"SUSPENDED"|"DEPRECATED";
export type AMARuntimeClass = "REQUEST_RESPONSE"|"DURABLE_WORKER"|"SCHEDULED"|"EVENT_DRIVEN"|"COMPOSITE"|"HYBRID";
export type AMAModuleKind = "MEMORY"|"RETRIEVAL"|"SCHEDULING"|"EVENTS"|"REVIEW"|"MULTI_AGENT"|"CONNECTOR"|"REASONING"|"OTHER";
export interface AMAOptionalModule {
  readonly moduleId:string;readonly version:AMASemver;
  readonly enabled:boolean;readonly kind:AMAModuleKind;
}
export interface AMAAgentVNext {
  readonly schema:"ama.agent/v0.2-candidate";
  readonly agentId:string;readonly agentVersion:AMASemver;readonly amaVersion:"0.2.0";
  readonly name:string;readonly purpose:string;
  readonly mandate:Readonly<{scope:readonly string[];nonGoals:readonly string[]}>;
  readonly authority:Readonly<{governingPrincipalRef:string;mandateRequired:true;
    selfApprovalProhibited:true;approvalMode:"INDEPENDENT"|"HUMAN_RESERVED"}>;
  readonly runtimeClass:AMARuntimeClass;readonly lifecycleState:AMALifecycleState;
  readonly effectCeiling:AMAEffectClass;
  readonly workflowRefs:readonly AMAPinnedRef[];
  readonly commandRefs:readonly AMAPinnedRef[];
  readonly capabilityRefs:readonly AMAPinnedRef[];
  readonly modules:readonly AMAOptionalModule[];
  readonly profileRefs?:readonly AMAPinnedRef[];
}
export type AMAIOJSONSchema = Readonly<Record<string,unknown>>;
export interface AMAStepVNext {
  readonly stepId:string;readonly kind:"ACTION"|"CHECK"|"REVIEW"|"END";
  readonly dependsOn:readonly string[];readonly capabilityRef?:AMAPinnedRef;
}
export interface AMAWorkflowVNext {
  readonly schema:"ama.workflow/v0.2-candidate";readonly agentId:string;
  readonly workflowId:string;readonly version:AMASemver;readonly status:AMABindingState;
  readonly effectCeiling:AMAEffectClass;readonly requiredCapabilities:readonly AMAPinnedRef[];
  readonly entryStep:string;readonly steps:readonly AMAStepVNext[];
  readonly terminalStepIds:readonly string[];
  readonly inputSchema:AMAIOJSONSchema;readonly outputSchema:AMAIOJSONSchema;
}
export interface AMACommandVNext {
  readonly schema:"ama.command/v0.2-candidate";readonly agentId:string;
  readonly commandId:string;readonly version:AMASemver;readonly token:string;
  readonly workflowRef:AMAPinnedRef;readonly inputSchema:AMAIOJSONSchema;
}
export interface AMACapabilityVNext {
  readonly schema:"ama.capability/v0.2-candidate";readonly agentId:string;
  readonly capabilityId:string;readonly version:AMASemver;readonly status:AMABindingState;
  readonly effectClass:AMAEffectClass;readonly resourceScopes:readonly string[];
  readonly adapterRef:AMAPinnedRef;readonly moduleId?:string;
  readonly permissionRefs:readonly string[];readonly inputSchema:AMAIOJSONSchema;
  readonly outputSchema:AMAIOJSONSchema;
}
export interface AMAToolAdapterVNext {
  readonly schema:"ama.tool-adapter/v0.2-candidate";readonly adapterId:string;
  readonly version:AMASemver;readonly status:AMABindingState;
  readonly invocationKind:"IN_PROCESS"|"HTTP"|"MCP"|"OTHER";
  readonly supportedEffects:readonly AMAEffectClass[];
  readonly inputSchema:AMAIOJSONSchema;readonly outputSchema:AMAIOJSONSchema;
  readonly credentialBindingRequired:boolean;
}
export interface AMAProfileVNext {
  readonly schema:"ama.profile/v0.2-candidate";readonly profileId:string;
  readonly version:AMASemver;readonly status:AMABindingState;
  readonly kind:AMAModuleKind;
  readonly moduleId:string;readonly config:Readonly<Record<string,unknown>>;
}
export interface AMATaskVNext {
  readonly schema:"ama.task/v0.2-candidate";readonly taskId:string;
  readonly version:AMASemver;readonly agentRef:AMAPinnedRef;
  readonly workflowRef:AMAPinnedRef;readonly commandRef:AMAPinnedRef;
  readonly state:"QUEUED"|"RUNNING"|"HOLD"|"PASS"|"FAIL"|"CANCELLED";
  readonly requestedScopes:readonly string[];readonly maxSteps:number;readonly runId:string;
}
export interface AMAEffectVNext {
  readonly schema:"ama.effect/v0.2-candidate";readonly effectId:string;
  readonly version:AMASemver;readonly taskRef:AMAPinnedRef;readonly runId:string;
  readonly capabilityRef:AMAPinnedRef;readonly effectClass:AMAEffectClass;
  readonly actionKind:"OBSERVE"|"STATE_MUTATION"|"REPOSITORY_MUTATION"|"EXTERNAL_ACTION"|"AUTHORITY_CHANGE";
  readonly resourceScope:string;
  readonly state:"PREPARED"|"AUTHORIZED"|"EXECUTING"|"COMMITTED"|"UNKNOWN"|"BLOCKED";
  readonly evidenceRefs:readonly string[];
}
export interface AMARunEventVNext {
  readonly schema:"ama.run-event/v0.2-candidate";readonly eventId:string;
  readonly runId:string;readonly agentRef:AMAPinnedRef;readonly workflowRef:AMAPinnedRef;
  readonly state:"QUEUED"|"RUNNING"|"PASS"|"FAIL"|"HOLD"|"CANCELLED"|"SKIPPED"|"WAIVED";
  readonly eventType:"START"|"TRANSITION"|"AUTHORIZATION"|"EFFECT"|"END";
  readonly correlationId:string;readonly evidenceRefs:readonly AMAPinnedRef[];
}
export interface AMAEvidenceVNext {
  readonly schema:"ama.evidence/v0.2-candidate";readonly evidenceId:string;readonly runId:string;
  readonly kind:"DECISION"|"OBSERVATION"|"EFFECT_INTENT"|"EFFECT_OUTCOME"|"VERIFICATION";
  readonly agentRef:AMAPinnedRef;readonly sourceRef:string;
  readonly contentDigest:AMASha256Digest;readonly correlationId:string;
  readonly status:"OBSERVED"|"UNCERTAIN"|"BLOCKED"|"VERIFIED";
  readonly accepted?:false;
}
export interface AMABundleVNext {
  readonly schema:"ama.bundle/v0.2-candidate";readonly agent:AMAAgentVNext;
  readonly workflows:readonly AMAWorkflowVNext[];
  readonly commands:readonly AMACommandVNext[];
  readonly capabilities:readonly AMACapabilityVNext[];
  readonly toolAdapters:readonly AMAToolAdapterVNext[];
  readonly profiles:readonly AMAProfileVNext[];
  readonly tasks?:readonly AMATaskVNext[];
  readonly effects?:readonly AMAEffectVNext[];
  readonly runEvents?:readonly AMARunEventVNext[];
  readonly evidenceRecords?:readonly AMAEvidenceVNext[];
}
