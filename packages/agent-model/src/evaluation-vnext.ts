/** AMA M5 candidate evaluation & evidence contracts -- NEVER release authority. */
import type {AMAPinnedRef,AMASemver,AMASha256Digest} from "./vnext.ts";
export type AMAEvaluationAxis="STRUCTURAL"|"AUTHORITY"|"TOOL_TARGET"|"FINAL_STATE"|"RELIABILITY"|
 "ADVERSARIAL"|"PRIVACY"|"DURABILITY"|"COST"|"EVIDENCE";
export type AMAEvaluationScope="STATIC_CANDIDATE"|"DISPOSABLE_INTEGRATION"|"LIVE_INDEPENDENT";
export type AMADecisionExpectation="ALLOW"|"DENY"|"HOLD"|"STOP"|"NOT_APPLICABLE";
export type AMAFinalStateExpectation="SUCCESS"|"FAIL"|"HOLD"|"UNKNOWN"|"NOT_APPLICABLE";
export interface AMAEvaluationProfileVNext {
 readonly schema:"ama.evaluation-profile/v0.2-candidate";readonly profileId:string;readonly version:AMASemver;
 readonly agentRef:AMAPinnedRef;readonly suiteVersion:string;readonly scope:AMAEvaluationScope;
 readonly requiredAxes:readonly AMAEvaluationAxis[];readonly minCases:number;readonly minRepetitions:number;
 readonly thresholds:Readonly<{maxFalseAllowRate:number;maxFalseDenyRate:number;
  minVerifiedFinalStateRate:number;minEvidenceCoverage:number;maxLatencyP95Ms:number;
  maxCostMinor:number;currency:string}>;
 readonly baselineRef?:AMAPinnedRef;readonly holdoutRequired:true;readonly independentApprovalRequired:true;
}
export interface AMAEvaluationCaseVNext {
 readonly schema:"ama.evaluation-case/v0.2-candidate";readonly caseId:string;readonly version:AMASemver;
 readonly profileRef:AMAPinnedRef;readonly axis:AMAEvaluationAxis;
 readonly scenarioClass:"HAPPY_PATH"|"DENIAL"|"INJECTION"|"OUTAGE"|"RECOVERY"|"BOUNDARY"|"CONTROL";
 readonly repeatGroup:string;readonly perturbationId:string;readonly holdout:boolean;
 readonly expectedDecision:AMADecisionExpectation;readonly expectedFinalState:AMAFinalStateExpectation;
 readonly expectedTargetRef:string;readonly dataClassification:"PUBLIC"|"INTERNAL"|"CONFIDENTIAL"|"RESTRICTED";
 readonly inputDigest:AMASha256Digest;readonly oracleRef:string;
}
export interface AMAEvaluationObservationVNext {
 readonly schema:"ama.evaluation-observation/v0.2-candidate";readonly observationId:string;
 readonly version:AMASemver;readonly caseRef:AMAPinnedRef;readonly repeatIndex:number;
 readonly actualDecision:AMADecisionExpectation;readonly actualFinalState:AMAFinalStateExpectation;
 readonly targetRef:string;readonly finalStateEvidenceRef?:string;readonly policyEvidenceRef?:string;
 readonly runCorrelationId:string;readonly latencyMs:number;readonly costMinor:number;readonly redacted:boolean;
 readonly evidenceRefs:readonly string[];readonly observedAt:string;
 readonly sourceKind:"MOCK"|"DISPOSABLE_INTEGRATION"|"LIVE_HOST";
}
export interface AMAEvaluationProvenanceVNext {
 readonly schema:"ama.evaluation-provenance/v0.2-candidate";readonly provenanceId:string;
 readonly version:AMASemver;readonly observationRef:AMAPinnedRef;readonly sourceRef:string;
 readonly contentDigest:AMASha256Digest;readonly collectorRef:string;
 readonly collectorKind:"TEST_HARNESS"|"INDEPENDENT_SERVICE"|"HUMAN_REVIEWER";
 readonly trustStatus:"DECLARED"|"ATTESTED_BY_EXTERNAL_VERIFIER"|"REVOKED";
 readonly attestationRef?:string;readonly recordedAt:string;readonly redacted:boolean;
}
export interface AMAEvaluationReportVNext {
 readonly schema:"ama.evaluation-report/v0.2-candidate";readonly reportId:string;
 readonly version:AMASemver;readonly profileRef:AMAPinnedRef;readonly candidateDigest:AMASha256Digest;
 readonly result:"CANDIDATE_METRICS_PASS"|"FAIL"|"INSUFFICIENT_EVIDENCE";
 readonly assurance:"STATIC_SYNTHETIC"|"DISPOSABLE_INTEGRATION"|"LIVE_UNVERIFIED";
 readonly metrics:Readonly<{cases:number;repetitions:number;falseAllows:number;falseDenies:number;
  policyDenyCases:number;policyAllowCases:number;verifiedFinalStates:number;finalStateCases:number;
  evidenceCovered:number;totalObservations:number;latencyP95Ms:number;totalCostMinor:number}>;
 readonly findings:readonly string[];readonly provenanceRefs:readonly AMAPinnedRef[];
 readonly baselineComparison:"NO_BASELINE"|"NO_REGRESSION"|"REGRESSION"|"NOT_VERIFIED";
 readonly generatedAt:string;readonly independentAccepted:false;
}
export interface AMAAcceptanceAssessmentVNext {
 readonly schema:"ama.acceptance-assessment/v0.2-candidate";readonly assessmentId:string;
 readonly version:AMASemver;readonly reportRef:AMAPinnedRef;readonly requestedScope:AMAEvaluationScope;
 readonly independentReviewerRef:string;readonly authorizationRef:string;readonly attestationRef?:string;
 readonly decision:"REJECT"|"HOLD"|"REFER_TO_AUTHORIZED_AUTHORITY";
 readonly reason:string;readonly observedAt:string;readonly activationAuthorized:false;
}
export interface AMAEvaluationBundleVNext {
 readonly evaluationProfiles?:readonly AMAEvaluationProfileVNext[];
 readonly evaluationCases?:readonly AMAEvaluationCaseVNext[];
 readonly evaluationObservations?:readonly AMAEvaluationObservationVNext[];
 readonly evaluationProvenance?:readonly AMAEvaluationProvenanceVNext[];
 readonly evaluationReports?:readonly AMAEvaluationReportVNext[];
 readonly acceptanceAssessments?:readonly AMAAcceptanceAssessmentVNext[];
}
export type AMAIndependentAssuranceCandidateResult=Readonly<{
 status:"FAIL"|"CANDIDATE_METRICS_PASS";findings:readonly string[];
 independent_accepted:false;runtime_authorized:false;live_c4_c5_verified:false;
}>;
