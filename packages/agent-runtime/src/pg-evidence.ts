import type {SqlPool} from "./stable-registry.ts";
import type {EffectEvidence,EvidenceWriter} from "./effect-gate.ts";
/** Append-only local FFOS audit record. SPETL is an external receipt reference. */
export class PgEffectEvidenceWriter implements EvidenceWriter {
  private readonly pool:SqlPool;
  constructor(pool:SqlPool){this.pool=pool;}
  async append(e:EffectEvidence):Promise<void>{
    const db=await this.pool.connect();
    try {
      await db.query("INSERT INTO ama_effect_evidence_events (event_id,run_id,agent_id,agent_version,workflow_id,workflow_version,principal_ref,authority_ref,mandate_ref,capability_id,target_ref,effect_class,policy_pin,policy_decision_ref,spetl_receipt_ref,outcome,stage,detail) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)",
        [e.eventId,e.runId,e.agentId,e.agentVersion,e.workflowId,e.workflowVersion,
          e.principalRef,e.authorityRef,e.mandateRef,e.capabilityId,e.target,e.effect,
          e.policyPin,e.policyDecisionRef,e.spetlReceiptRef,e.outcome,e.stage,e.detail]);
    } finally {db.release();}
  }
}
