/** AMA 0.2 M4 candidate durability types -- declarations only.
 * Runtime mutation, policy enforcement and independent receipts remain external.
 */
import type {AMAPinnedRef,AMASemver,AMASha256Digest,AMAEffectClass} from "./vnext.ts";
export type AMARunState="QUEUED"|"RUNNING"|"HOLD"|"PASS"|"FAIL"|"CANCELLED";
export interface AMARunVNext {
 readonly schema:"ama.run/v0.2-candidate";readonly runId:string;
 readonly taskRef:AMAPinnedRef;readonly agentRef:AMAPinnedRef;readonly workflowRef:AMAPinnedRef;
 readonly state:AMARunState;readonly generation:number;readonly leaseEpoch:number;
 readonly leaseOwner?:string;readonly leaseExpiresAt?:string;
 readonly checkpointRef?:AMAPinnedRef;readonly correlationId:string;readonly policyRef:AMAPinnedRef;
}
export interface AMAStepVNextRecord {
 readonly schema:"ama.step/v0.2-candidate";readonly stepId:string;readonly runId:string;
 readonly workflowStepId:string;readonly state:AMARunState;readonly attemptRefs:readonly AMAPinnedRef[];
}
export interface AMAAttemptVNext {
 readonly schema:"ama.attempt/v0.2-candidate";readonly attemptId:string;
 readonly runId:string;readonly stepId:string;readonly workerRef:string;
 readonly leaseEpoch:number;readonly startedAt:string;
 readonly outcome:"STARTED"|"SUCCEEDED"|"FAILED"|"UNKNOWN"|"ABORTED";readonly endAt?:string;
}
export interface AMACheckpointVNext {
 readonly schema:"ama.checkpoint/v0.2-candidate";readonly checkpointId:string;
 readonly version:AMASemver;readonly runId:string;readonly leaseEpoch:number;
 readonly generation:number;readonly stateDigest:AMASha256Digest;
 readonly stateRef:string;readonly recordedAt:string;
}
export interface AMAEffectReceiptVNext {
 readonly schema:"ama.effect-receipt/v0.2-candidate";readonly receiptId:string;
 readonly effectRef:AMAPinnedRef;readonly runId:string;
 readonly outcome:"COMMITTED"|"NOT_APPLIED"|"INDETERMINATE";
 readonly externalRef?:string;readonly observedAt:string;
 readonly evidenceDigest:AMASha256Digest;readonly verifiedByRef:string;
 readonly independentVerification:boolean;
}
export interface AMAReconciliationVNext {
 readonly schema:"ama.reconciliation/v0.2-candidate";readonly reconciliationId:string;
 readonly runId:string;readonly effectRef:AMAPinnedRef;readonly receiptRef?:AMAPinnedRef;
 readonly outcome:"CONFIRMED_COMMITTED"|"CONFIRMED_NOT_APPLIED"|"STILL_UNKNOWN";
 readonly verificationEvidenceRef:string;readonly reviewerRef:string;readonly reviewedAt:string;
}
export interface AMAApprovalEventVNext {
 readonly schema:"ama.approval-event/v0.2-candidate";readonly eventId:string;
 readonly runId:string;readonly requestRef:AMAPinnedRef;readonly approvalRef?:AMAPinnedRef;
 readonly state:"REQUESTED"|"APPROVED"|"REJECTED"|"EXPIRED";
 readonly evidenceRef:string;readonly occurredAt:string;
}
export interface AMADurabilityBundleVNext {
 readonly runs?:readonly AMARunVNext[];
 readonly steps?:readonly AMAStepVNextRecord[];
 readonly attempts?:readonly AMAAttemptVNext[];
 readonly checkpoints?:readonly AMACheckpointVNext[];
 readonly effectReceipts?:readonly AMAEffectReceiptVNext[];
 readonly reconciliations?:readonly AMAReconciliationVNext[];
 readonly approvalEvents?:readonly AMAApprovalEventVNext[];
}
export type AMAM4ExecutionOutcome="CALLBACK_RETURNED_UNVERIFIED"|"BLOCKED"|
  "UNKNOWN_REQUIRES_RECONCILIATION";
export type AMAM4Lease=Readonly<{runId:string;owner:string;epoch:number;expiresAt:string}>;
export type AMAM4EffectClass=Exclude<AMAEffectClass,"E0_OBSERVE"|"E4_AUTHORITY_CHANGE">;
