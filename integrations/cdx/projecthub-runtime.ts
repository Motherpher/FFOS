import {
  CDX_POLICY_GIT_BLOB,CDX_RELEASE_REF,createSpetlEvent,emitSpetlEvent,evaluateCdxDecision
} from "../../apps/web/lib/cdx/runtime.ts";
import type {CdxEffectReceipt,ProjectHubCdxPort} from "../../modules/projecthub/src/effect-gate.ts";

export class FFOSCdxProjectHubPort implements ProjectHubCdxPort {
  constructor(private readonly policyMode:"PINNED"|"UNAVAILABLE"="PINNED"){}
  private async decide(context:any):Promise<CdxEffectReceipt>{
    const result=await evaluateCdxDecision(context,this.policyMode==="UNAVAILABLE"?{policy:null}:undefined);
    const spetl=await createSpetlEvent(context,result,"NOT_ATTEMPTED");
    emitSpetlEvent(spetl);
    return {decision:result.decision,decisionRef:spetl.event_id,spetlReceiptRef:spetl.event_id,
      policyVersion:result.policyVersion,policyDigest:result.policyDigest,controlResults:result.controlResults};
  }
  async evaluateA3(input:Parameters<ProjectHubCdxPort["evaluateA3"]>[0]){
    const c=input.context;
    return this.decide({
      surface:"RUNTIME_AUTH",actor_id:c.principalRef,action:"PROJECTHUB_CANONICAL_MUTATION",
      authority_ref:c.authorityRef,mandate_ref:c.mandateRef,correlation_id:c.correlationId,causation_id:c.causationId,
      run_id:c.idempotencyKey,trace_ref:"PROJECTHUB:A3:"+c.idempotencyKey,
      attempted_effect:{surface:"PROJECTHUB",operation:input.operation,target_ref:input.resourceRef},
      data_minimization:{personal_data_present:input.dataMinimization.personalDataPresent,
        redacted_fields:input.dataMinimization.redactedFields,rationale:input.dataMinimization.rationale},
      subject_ref:input.projectId,resource_id:input.resourceRef,evidence_refs:["FFOS-DEVOPS-PH-RECON-001","PROJECTHUB-CONTRACT-v0.4"],
      authorization_current:true,authorization_decision_id:input.localAuthorizationDecisionId,mandatory_gates_passed:true,
      decision:"ALLOW",policy_evaluated:true,policy_version:CDX_RELEASE_REF,policy_hash:CDX_POLICY_GIT_BLOB,
      evaluation_error:false,emergency_overlay:false,overlay_expands_authority:false,
      execution_completed:false,reconciliation_completed:false,scenario_mode:false,production_state_mutation:true,external_effect:false
    });
  }
  async evaluateA4(input:Parameters<ProjectHubCdxPort["evaluateA4"]>[0]){
    const c=input.context;
    return this.decide({
      surface:"EXTERNAL_EFFECT",actor_id:c.principalRef,action:input.operation,
      authority_ref:c.authorityRef,mandate_ref:c.mandateRef,correlation_id:c.correlationId,causation_id:c.causationId,
      run_id:c.idempotencyKey,trace_ref:"PROJECTHUB:A4:"+c.idempotencyKey,
      attempted_effect:{surface:"PROJECTHUB_EXTERNAL",operation:input.operation,target_ref:input.targetRef},
      data_minimization:{personal_data_present:input.dataMinimization.personalDataPresent,
        redacted_fields:input.dataMinimization.redactedFields,rationale:input.dataMinimization.rationale},
      subject_ref:input.projectId,resource_id:input.targetRef,evidence_refs:["FFOS-DEVOPS-PH-RECON-001","PROJECTHUB-CONTRACT-v0.4"],
      external_effect:true,external_effect_gate_passed:true,release_decision_id:input.releaseDecisionId,
      reversibility_class:input.reversibilityClass,revocation_check_passed:input.revocationCheckPassed
    });
  }
}
