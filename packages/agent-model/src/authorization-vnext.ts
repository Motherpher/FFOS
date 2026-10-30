/** Universal M2 authority-data types, not a runtime policy evaluator.
 * All declarations are UNTRUSTED until an independent host authenticates proofs,
 * resolves revocation, validates policy obligations and mediates the action.
 */
import type { AMAPinnedRef, AMASemver, AMASha256Digest, AMAEffectClass } from "./vnext.ts";
export type AMAActionKind="OBSERVE"|"STATE_MUTATION"|"REPOSITORY_MUTATION"|"EXTERNAL_ACTION"|"AUTHORITY_CHANGE";
export type AMADataClassification="PUBLIC"|"INTERNAL"|"CONFIDENTIAL"|"RESTRICTED";
export interface AMAPrincipalContract {
 readonly schema:"ama.principal/v0.2-candidate";readonly principalId:string;readonly version:AMASemver;
 readonly principalKind:"HUMAN"|"WORKLOAD"|"SERVICE";readonly tenantId:string;readonly trustDomain:string;
 readonly identityIssuerRef:string;readonly identityEvidenceDigest:AMASha256Digest;
}
export interface AMAScopedGrant {
 readonly actionKind:AMAActionKind;readonly effectClass:AMAEffectClass;readonly resourceScope:string;
 readonly maxDataClassification:AMADataClassification;readonly allowedRecipients:readonly string[];
 readonly purpose:string;readonly requiresHumanReview:boolean;readonly allowAggregation:boolean;
}
export interface AMAMandateContract {
 readonly schema:"ama.mandate/v0.2-candidate";readonly mandateId:string;readonly version:AMASemver;
 readonly issuerRef:AMAPinnedRef;readonly subjectRef:AMAPinnedRef;readonly agentRef:AMAPinnedRef;
 readonly issuedAt:string;readonly expiresAt:string;readonly status:"ISSUED"|"REVOKED"|"EXPIRED";
 readonly delegationDepth:number;readonly grants:readonly AMAScopedGrant[];
 readonly revocationRef:string;readonly issuanceEvidenceDigest:AMASha256Digest;
}
export interface AMADelegationContract {
 readonly schema:"ama.delegation/v0.2-candidate";readonly delegationId:string;readonly version:AMASemver;
 readonly parentMandateRef:AMAPinnedRef;readonly childMandateRef:AMAPinnedRef;
 readonly issuedByRef:AMAPinnedRef;readonly evidenceDigest:AMASha256Digest;
}
export interface AMAAuthorizationRequestContract {
 readonly schema:"ama.authorization-request/v0.2-candidate";readonly requestId:string;
 readonly version:AMASemver;readonly runId:string;readonly agentRef:AMAPinnedRef;
 readonly actorRef:AMAPinnedRef;readonly workloadRef:AMAPinnedRef;readonly mandateRef:AMAPinnedRef;
 readonly capabilityRef:AMAPinnedRef;readonly policyRef:AMAPinnedRef;readonly effectRef?:AMAPinnedRef;
 readonly actionKind:AMAActionKind;readonly effectClass:AMAEffectClass;
 readonly resourceScope:string;readonly dataClassification:AMADataClassification;
 readonly recipientId:string;readonly purpose:string;readonly requestedAt:string;
 readonly riskContext:Readonly<{reversibility:"REVERSIBLE"|"COMPENSATABLE"|"IRREVERSIBLE"|"UNKNOWN";
  impact:"LOW"|"MODERATE"|"HIGH"|"CRITICAL"|"UNKNOWN";externalExposure:boolean;
  aggregateRead:boolean;financialAmountMinor:number;currency?:string}>;
 readonly sourceTrust:"TRUSTED_BOUNDARY"|"UNTRUSTED_CONTENT";
}
export interface AMAPolicyObligation {
 readonly obligationId:string;readonly kind:"INDEPENDENT_APPROVAL"|"REDACTION"|"AUDIT"|"LIMIT_RESOURCE"|"QUARANTINE"|"OTHER";
 readonly requiredEvidenceRef:string;
}
export interface AMAAuthorizationDecisionContract {
 readonly schema:"ama.authorization-decision/v0.2-candidate";readonly decisionId:string;
 readonly version:AMASemver;readonly requestRef:AMAPinnedRef;readonly policyRef:AMAPinnedRef;
 readonly decisionIssuerRef:AMAPinnedRef;
 readonly outcome:"PERMIT"|"PERMIT_WITH_OBLIGATIONS"|"REQUIRE_HUMAN"|"DENY"|"HOLD"|"STOP";
 readonly obligations:readonly AMAPolicyObligation[];readonly validFrom:string;readonly validUntil:string;
 readonly revocationEpoch:number;readonly decisionEvidenceDigest:AMASha256Digest;
}
export interface AMAApprovalContract {
 readonly schema:"ama.approval/v0.2-candidate";readonly approvalId:string;readonly version:AMASemver;
 readonly requestRef:AMAPinnedRef;readonly approvedByRef:AMAPinnedRef;
 readonly outcome:"APPROVE"|"REJECT";readonly issuedAt:string;readonly expiresAt:string;
 readonly approvalEvidenceDigest:AMASha256Digest;
}
/** M2: metadata-only secret binding; never embeds credential material. */
export interface AMASecretBindingVNext {
 readonly schema:"ama.secret-binding/v0.2-candidate";readonly bindingId:string;
 readonly version:AMASemver;readonly status:"DRAFT"|"VALIDATED"|"ACTIVE"|"SUSPENDED"|"DEPRECATED";
 readonly agentRef:AMAPinnedRef;readonly capabilityRef:AMAPinnedRef;
 readonly providerRef:string;readonly secretRef:string;readonly resourceScope:string;
 readonly maxRotationAgeSeconds:number;readonly revocationCheckRequired:true;
 readonly accessAuditRequired:true;readonly runtimeInjectionRequired:true;
 readonly redactionRequired:true;readonly rawSecretMaterialAllowed:false;
}
export interface AMAAuthorityBundleContract {
 readonly secretBindings?:readonly AMASecretBindingVNext[];
 readonly principals?:readonly AMAPrincipalContract[];
 readonly mandates?:readonly AMAMandateContract[];
 readonly delegations?:readonly AMADelegationContract[];
 readonly authorizationRequests?:readonly AMAAuthorizationRequestContract[];
 readonly authorizationDecisions?:readonly AMAAuthorizationDecisionContract[];
 readonly approvals?:readonly AMAApprovalContract[];
}
export type AMAPreflightResult = Readonly<{
 status:"REJECTED"|"STATIC_ELIGIBLE_FOR_EXTERNAL_VERIFICATION";
 errors:readonly string[];authority_granted:false;external_verification_required:true;
 unverified?:readonly string[];
}>;
