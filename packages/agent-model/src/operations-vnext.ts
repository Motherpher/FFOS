/** AMA M6 operational contracts: candidate-only, provider neutral, not release authority. */
import type {AMAPinnedRef,AMASemver,AMASha256Digest,AMABindingState} from "./vnext.ts";
export type AMAOperationalSignal="HEALTH"|"ERROR_RATE"|"LATENCY"|"COST"|
 "POLICY_DRIFT"|"EFFECT_UNCERTAINTY"|"REVOCATION";
export type AMAIncidentKind="POLICY_DRIFT"|"REVOKED_TOOL"|"MODEL_SUBSTITUTION"|
 "PROTOCOL_BREAK"|"UNSETTLED_EFFECT"|"HEALTH_DEGRADATION"|"PRIVACY_BREACH"|"UNKNOWN";
export interface AMAOperationalProfileVNext {
 readonly schema:"ama.operational-profile/v0.2-candidate";
 readonly profileId:string;readonly version:AMASemver;readonly agentRef:AMAPinnedRef;
 readonly status:AMABindingState;
 readonly monitoring:Readonly<{
  maxHeartbeatAgeSeconds:number;maxFailureRate:number;maxP95LatencyMs:number;
  maxCostMinor:number;currency:string;requiredSignals:readonly AMAOperationalSignal[]}>;
 readonly releasePolicy:Readonly<{
  canaryMaxPercent:number;minCanaryObservations:number;requireIndependentDecision:true;
  requireCompatibilityCheck:true;failClosedOnMissingTelemetry:true}>;
 readonly protocolBindings:readonly Readonly<{
  protocol:"MCP"|"A2A"|"OTEL"|"OTHER";bindingRef:AMAPinnedRef;required:boolean}>[];
}
export interface AMACompatibilityAssessmentVNext {
 readonly schema:"ama.compatibility-assessment/v0.2-candidate";
 readonly assessmentId:string;readonly version:AMASemver;readonly agentRef:AMAPinnedRef;
 readonly fromVersion:AMASemver;readonly toVersion:AMASemver;
 readonly changeClass:"PATCH"|"MINOR"|"MAJOR"|"PROTOCOL"|"MODEL"|"TOOL"|"POLICY";
 readonly affectedCapabilities:readonly string[];readonly breakingChange:boolean;
 readonly contractTestsPassed:boolean;readonly migrationReversible:boolean;
 readonly baselineEvidenceRef:string;readonly sourceDigest:AMASha256Digest;
 readonly result:"COMPATIBLE_CANDIDATE"|"REQUIRES_REVIEW"|"INCOMPATIBLE";
}
export interface AMAHealthSnapshotVNext {
 readonly schema:"ama.health-snapshot/v0.2-candidate";
 readonly snapshotId:string;readonly version:AMASemver;readonly profileRef:AMAPinnedRef;
 readonly agentRef:AMAPinnedRef;readonly observedAt:string;readonly sourceRef:string;
 readonly sourceTrust:"DECLARED"|"INDEPENDENTLY_ATTESTED";readonly heartbeatAgeSeconds:number;
 readonly failureRate:number;readonly p95LatencyMs:number;readonly costMinor:number;
 readonly policyDrift:boolean;readonly revocationDetected:boolean;readonly unsettledEffects:number;
 readonly signalsPresent:readonly AMAOperationalSignal[];readonly evidenceRefs:readonly string[];
 readonly redacted:true;
}
export interface AMAIncidentRecordVNext {
 readonly schema:"ama.incident-record/v0.2-candidate";readonly incidentId:string;
 readonly version:AMASemver;readonly agentRef:AMAPinnedRef;
 readonly runId?:string;readonly kind:AMAIncidentKind;
 readonly severity:"LOW"|"MODERATE"|"HIGH"|"CRITICAL";
 readonly state:"OPEN"|"CONTAINED"|"INVESTIGATING"|"RESOLVED"|"CLOSED";
 readonly detectedAt:string;readonly sourceEvidenceRef:string;readonly containmentRef?:string;
 readonly independentReviewerRef?:string;readonly humanAcceptanceRef?:string;
 readonly releaseAllowed:false;
}
export interface AMARollbackPlanVNext {
 readonly schema:"ama.rollback-plan/v0.2-candidate";readonly rollbackId:string;
 readonly version:AMASemver;readonly agentRef:AMAPinnedRef;
 readonly fromVersion:AMASemver;readonly targetVersion:AMASemver;
 readonly targetDigest:AMASha256Digest;readonly triggerKinds:readonly AMAIncidentKind[];
 readonly requiresIndependentApproval:true;
 readonly uncertainEffectsDisposition:"HOLD_FOR_INDEPENDENT_RECONCILIATION";
 readonly evidenceRetention:"APPEND_ONLY";
 readonly state:"PROPOSED"|"APPROVAL_PENDING"|"BLOCKED";readonly activationAuthorized:false;
}
export interface AMAReleasePlanVNext {
 readonly schema:"ama.release-plan/v0.2-candidate";readonly planId:string;
 readonly version:AMASemver;readonly agentRef:AMAPinnedRef;
 readonly candidateVersion:AMASemver;readonly candidateDigest:AMASha256Digest;
 readonly compatibilityRef:AMAPinnedRef;readonly operationalProfileRef:AMAPinnedRef;
 readonly baselineEvidenceRef:string;readonly canaryPercent:number;readonly requiredObservations:number;
 readonly safetyChecks:readonly ("IDENTITY"|"POLICY"|"REVOCATION"|"HEALTH"|
 "EFFECTS"|"EVIDENCE"|"COST"|"COMPATIBILITY")[];
 readonly rollbackRef:AMAPinnedRef;readonly state:"PROPOSED"|"PREPARED"|"BLOCKED"|"APPROVAL_PENDING";
 readonly approvalRef?:string;readonly activationAuthorized:false;
}
/** M6: optional localization/accessibility declarations, no language engine attached. */
export interface AMALocalizationProfileVNext {
 readonly schema:"ama.localization-profile/v0.2-candidate";readonly profileId:string;
 readonly version:AMASemver;readonly status:AMABindingState;
 readonly agentRef:AMAPinnedRef;readonly defaultLocale:string;
 readonly supportedLocales:readonly string[];readonly fallbackLocales:readonly string[];
 readonly timezonePolicy:"HOST_LOCAL_TIMEZONE_REQUIRED"|"UTC_WITH_EXPLICIT_LOCAL_CONVERSION";
 readonly accessibility:Readonly<{structuredTextRequired:true;
  keyboardAccessibleHostRequired:true;semanticLabelsRequired:true}>;
 readonly translation:Readonly<{sourceLanguageAttributionRequired:true;
  dataClassificationPreserved:true;translationGrantsAuthority:false;
  consequentialOutputReviewRequired:true}>;
}
export interface AMAOperationalBundleVNext {
 readonly localizationProfiles?:readonly AMALocalizationProfileVNext[];
 readonly operationalProfiles?:readonly AMAOperationalProfileVNext[];
 readonly compatibilityAssessments?:readonly AMACompatibilityAssessmentVNext[];
 readonly healthSnapshots?:readonly AMAHealthSnapshotVNext[];
 readonly incidentRecords?:readonly AMAIncidentRecordVNext[];
 readonly releasePlans?:readonly AMAReleasePlanVNext[];
 readonly rollbackPlans?:readonly AMARollbackPlanVNext[];
}
export interface AMAOperationalPreflightVNext {
 readonly status:"REJECTED"|"STATIC_OPERATIONAL_ELIGIBLE";
 readonly findings:readonly string[];readonly deployment_authorized:false;
 readonly rollback_authorized:false;readonly runtime_authorized:false;
 readonly independent_accepted:false;readonly operational_ready:false;
}
