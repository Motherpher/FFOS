/** AMA M3 candidate declarations only; no model runner, memory store, authority or evaluator. */
import type { AMAPinnedRef, AMASemver, AMASha256Digest, AMABindingState } from "./vnext.ts";
export type AMAModuleProfileKind="REASONING"|"MEMORY"|"RETRIEVAL";
export interface AMAModelProfileVNext {
 readonly schema:"ama.model-profile/v0.2-candidate"; readonly profileId:string;
 readonly version:AMASemver;readonly status:AMABindingState;readonly moduleId:string;
 readonly providerRef:string;readonly modelId:string;readonly modelRevision:string;
 readonly maxContextTokens:number;readonly maxOutputTokens:number;
 readonly supportsToolCalling:boolean;readonly allowedFallbackRefs:readonly AMAPinnedRef[];
}
export interface AMAInstructionLayerVNext {
 readonly layerId:string;readonly priority:number;readonly role:"SYSTEM"|"DEVELOPER"|"USER";
 readonly sourceRef:string;readonly contentDigest:AMASha256Digest;
 readonly sourceTrust:"DECLARED_UNVERIFIED"|"VERIFIED_HOST_SOURCE";
}
export interface AMAInstructionPackageVNext {
 readonly schema:"ama.instruction-package/v0.2-candidate";readonly packageId:string;
 readonly version:AMASemver;readonly status:AMABindingState;readonly moduleId:string;
 readonly layers:readonly AMAInstructionLayerVNext[];
}
export interface AMAPlanNodeVNext {
 readonly nodeId:string;readonly dependsOn:readonly string[];readonly capabilityRef?:AMAPinnedRef;
}
export interface AMAPlanningProfileVNext {
 readonly schema:"ama.planning-profile/v0.2-candidate";readonly profileId:string;
 readonly version:AMASemver;readonly status:AMABindingState;readonly moduleId:string;
 readonly strategy:"DIRECT"|"REACTIVE"|"PLAN_EXECUTE"|"REFLECTIVE"|"OTHER";
 readonly maxTaskHorizonSteps:number;readonly maxExecutionSeconds:number;
 readonly budgets:Readonly<{maxIterations:number;maxToolCalls:number;maxModelTokens:number;
  maxCostMinor:number;currency:string}>;
 readonly stopConditions:readonly ("GOAL_REACHED"|"BUDGET_EXHAUSTED"|"TIME_LIMIT"|
  "POLICY_DENIAL"|"HUMAN_ESCALATION"|"CANCELLED"|"UNCERTAINTY")[];
 readonly nodes:readonly AMAPlanNodeVNext[];
}
export interface AMAContextPolicyVNext {
 readonly schema:"ama.context-policy/v0.2-candidate";readonly policyId:string;
 readonly version:AMASemver;readonly status:AMABindingState;readonly moduleId:string;
 readonly maxAssembledTokens:number;readonly reservedOutputTokens:number;
 readonly compaction:Readonly<{enabled:boolean;maxSummaryTokens:number;
  requireSourceProvenance:true;requireCriticalFactChecks:true;dropUnverifiedInstructions:true}>;
 readonly contextSources:readonly ("RUN_CONTEXT"|"USER_INPUT"|"RETRIEVED_CONTENT"|
  "DOMAIN_DATA"|"MEMORY")[];
}
export type AMAMemoryStoreKind="EPISODIC"|"SEMANTIC"|"RETRIEVAL_INDEX"|"RUN_STATE"|"DOMAIN_DATA";
export type AMAMemoryTrustLabel="VERIFIED"|"UNVERIFIED"|"SUSPECT"|"REVOKED";
export interface AMAMemoryProfileVNext {
 readonly schema:"ama.memory-profile/v0.2-candidate";readonly profileId:string;
 readonly version:AMASemver;readonly status:AMABindingState;readonly moduleId:string;
 readonly storeTypes:readonly AMAMemoryStoreKind[];readonly allowedScopes:readonly string[];
 readonly retentionMaxSeconds:number;readonly writeAdmission:"TRUSTED_GATE_REQUIRED";
 readonly retrievalAdmission:"TRUSTED_GATE_REQUIRED";readonly provenanceRequired:true;
 readonly quarantineUntrusted:true;readonly allowMemoryAuthority:false;
 readonly deletionPolicy:"ERASE_OR_TOMBSTONE_WITH_AUDIT"|"RETENTION_HOLD_REQUIRES_REVIEW";
}
export interface AMAMemoryEntryVNext {
 readonly schema:"ama.memory-entry/v0.2-candidate";readonly entryId:string;
 readonly version:AMASemver;readonly profileRef:AMAPinnedRef;
 readonly storeType:AMAMemoryStoreKind;readonly contentDigest:AMASha256Digest;
 readonly sourceRef:string;readonly originTrustDomain:string;readonly originActorRef:string;
 readonly originKind:"USER"|"TOOL"|"DOCUMENT"|"SYSTEM_RECORD"|"AGENT_SYNTHESIS";
 readonly trustLabel:AMAMemoryTrustLabel;readonly writeDecisionRef:string;
 readonly scope:string;readonly createdAt:string;readonly expiresAt:string;
 readonly quarantined:boolean;readonly instructionAuthority:false;
 readonly correctionOfEntryRef?:string;readonly deletionState:"ACTIVE"|"TOMBSTONED"|"ERASED";
}
export interface AMARetrievalPolicyVNext {
 readonly schema:"ama.retrieval-policy/v0.2-candidate";readonly policyId:string;
 readonly version:AMASemver;readonly status:AMABindingState;readonly moduleId:string;
 readonly allowedScopes:readonly string[];readonly allowedTrustLabels:readonly ("VERIFIED"|"UNVERIFIED")[];
 readonly crossTrustDomain:"DENY"|"INDEPENDENT_APPROVAL_REQUIRED";
 readonly maxRetrievedItems:number;readonly allowInstructionPromotion:false;
 readonly requireSourceProvenance:true;readonly poisonedEntryAction:"QUARANTINE"|"REJECT";
}
export interface AMACognitiveBindingVNext {
 readonly schema:"ama.cognitive-binding/v0.2-candidate";readonly bindingId:string;
 readonly version:AMASemver;readonly agentRef:AMAPinnedRef;readonly reasoningModuleId:string;
 readonly modelRef:AMAPinnedRef;readonly instructionRef:AMAPinnedRef;
 readonly planningRef:AMAPinnedRef;readonly contextRef:AMAPinnedRef;
 readonly memoryRef?:AMAPinnedRef;readonly retrievalRef?:AMAPinnedRef;
}
export interface AMACognitiveBundleVNext {
 readonly modelProfiles?:readonly AMAModelProfileVNext[];
 readonly instructionPackages?:readonly AMAInstructionPackageVNext[];
 readonly planningProfiles?:readonly AMAPlanningProfileVNext[];
 readonly contextPolicies?:readonly AMAContextPolicyVNext[];
 readonly memoryProfiles?:readonly AMAMemoryProfileVNext[];
 readonly memoryEntries?:readonly AMAMemoryEntryVNext[];
 readonly retrievalPolicies?:readonly AMARetrievalPolicyVNext[];
 readonly cognitiveBindings?:readonly AMACognitiveBindingVNext[];
}
export type AMACognitivePreflightResult=Readonly<{
 status:"REJECTED"|"STATIC_COGNITIVE_ELIGIBLE";errors:readonly string[];
 runtime_authorized:false;evidence_verified:false;external_verification_required:true;
 unverified:readonly string[];
}>;
