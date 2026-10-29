/** AMA M4 -- PostgreSQL-backed bounded durable coordination (candidate).
 * NOT a deployed orchestrator and NOT an authorization service.
 * Consequential effects must still cross the existing AgentEffectGate.
 * A callback return is not proof of an external outcome or human acceptance.
 */
import {randomUUID,createHash} from "node:crypto";
import type {SqlPool,SqlClient,RuntimeReadinessVerifier} from "./stable-registry.ts";
import type {AMAExecutionContext} from "../../agent-model/src/index.ts";
import type {AgentEffectGate} from "./effect-gate.ts";

export type RunState="QUEUED"|"RUNNING"|"HOLD"|"PASS"|"FAIL"|"CANCELLED";
export type EffectState="PREPARED"|"DISPATCHED"|"UNKNOWN"|"COMMITTED"|"NOT_APPLIED"|"BLOCKED";
export interface RunAdmissionPort {
  /** Trusted external host admission: active immutable version, scope and mandate. */
  assertAdmitted(input:CreateRunRequest):Promise<void>;
}
export interface ResumeApprovalPort {
  /** Independently authenticated operator authorization to resume after review. */
  assertResumeAuthorized(runId:string,decisionRef:string):Promise<void>;
}
export interface ReconciliationPort {
  /** Verify actual downstream evidence and independently authenticated reviewer. */
  assertReceipt(input:ReconciliationInput):Promise<void>;
}
export interface CreateRunRequest {
  runId:string;taskId:string;agentId:string;agentVersion:string;
  workflowId:string;workflowVersion:string;
}
export interface Lease {runId:string;owner:string;epoch:number;expiresAt:string}
export interface EffectAttempt {
  effectId:string;runId:string;operationKey:string;attemptId:string;
  target:string;effectClass:"E1_INTERNAL_STATE"|"E2_REPOSITORY_CHANGE"|"E3_EXTERNAL_EFFECT";
}
export interface ReconciliationInput {
  receiptId:string;effectId:string;outcome:"COMMITTED"|"NOT_APPLIED"|"INDETERMINATE";
  verifierRef:string;evidenceRef:string;evidenceSha256:string;
}
export class DurableRunError extends Error {
  readonly code:string;
  constructor(code:string){super("AMA M4 denied: "+code);this.code=code;this.name="DurableRunError";}
}
const required=(s:string)=>typeof s==="string"&&s.trim().length>0;
const sha=(data:unknown)=>createHash("sha256").update(JSON.stringify(data)).digest("hex");
const ensure=(value:boolean,code:string):void=>{if(!value)throw new DurableRunError(code);};
type RunRow={run_id:string;state:RunState;lease_owner:string|null;lease_epoch:string|number;
  lease_until:Date|null;cancel_requested:boolean;generation:string|number;agent_id:string;agent_version:string};
type EffectRow={effect_id:string;state:EffectState;run_id:string;operation_key:string};
export class DurablePgCoordinator {
  private readonly pool:SqlPool;
  private readonly admission:RunAdmissionPort|null;
  private readonly gate:Pick<AgentEffectGate,"execute">|null;
  private readonly reconciliation:ReconciliationPort|null;
  private readonly resume:ResumeApprovalPort|null;
  constructor(pool:SqlPool,admission:RunAdmissionPort|null,
    gate:Pick<AgentEffectGate,"execute">|null,
    reconciliation:ReconciliationPort|null,resume:ResumeApprovalPort|null){
    this.pool=pool;this.admission=admission;this.gate=gate;
    this.reconciliation=reconciliation;this.resume=resume;
  }
  private async tx<T>(task:(db:SqlClient)=>Promise<T>):Promise<T>{
    const db=await this.pool.connect();let active=false;
    try{await db.query("BEGIN");active=true;const result=await task(db);
      await db.query("COMMIT");active=false;return result;
    }catch(e){if(active)try{await db.query("ROLLBACK");}catch{}throw e;}
    finally{db.release();}
  }
  private async row(db:SqlClient,runId:string):Promise<RunRow>{
    const q=await db.query<RunRow>("SELECT * FROM ama_m4_runs WHERE run_id=$1 FOR UPDATE",[runId]);
    ensure(q.rows.length===1,"RUN_NOT_FOUND");return q.rows[0]!;
  }
  private async event(db:SqlClient,runId:string,type:string,state:RunState,epoch:number,
    detail:Record<string,unknown>={}):Promise<void>{
    await db.query("INSERT INTO ama_m4_events(event_id,run_id,event_type,state,lease_epoch,detail) VALUES($1,$2,$3,$4,$5,$6::jsonb)",
      [randomUUID(),runId,type,state,epoch,JSON.stringify(detail)]);
  }
  private live(row:RunRow,lease:Lease):void{
    ensure(row.run_id===lease.runId&&row.state==="RUNNING"&&
      row.lease_owner===lease.owner&&Number(row.lease_epoch)===lease.epoch&&
      !row.cancel_requested&&row.lease_until!==null&&
      row.lease_until.getTime()>Date.now(),"STALE_OR_EXPIRED_LEASE");
  }
  async create(input:CreateRunRequest):Promise<void>{
    ensure(Object.values(input).every(required),"INVALID_RUN_IDENTITY");
    ensure(!!this.admission,"RUN_ADMISSION_NOT_BOUND");
    await this.admission!.assertAdmitted(input);
    await this.tx(async db=>{
      await db.query("INSERT INTO ama_m4_runs(run_id,task_id,agent_id,agent_version,workflow_id,workflow_version) VALUES($1,$2,$3,$4,$5,$6)",
        [input.runId,input.taskId,input.agentId,input.agentVersion,input.workflowId,input.workflowVersion]);
      await this.event(db,input.runId,"CREATE","QUEUED",0,{taskId:input.taskId});
    });
  }
  /** Acquire or recover expired worker lease. A prepared/started effect forbids automatic recovery. */
  async claim(runId:string,owner:string,ttlSeconds:number):Promise<Lease>{
    ensure(required(runId)&&required(owner)&&Number.isInteger(ttlSeconds)&&ttlSeconds>0&&ttlSeconds<=3600,
      "INVALID_LEASE");
    return this.tx(async db=>{
      const row=await this.row(db,runId);
      ensure(["QUEUED","RUNNING"].includes(row.state)&&!row.cancel_requested,"RUN_NOT_CLAIMABLE");
      if(row.state==="RUNNING"&&row.lease_until&&row.lease_until.getTime()>Date.now())
        throw new DurableRunError("LEASE_BUSY");
      const unresolved=await db.query<{effect_id:string}>(
        "SELECT effect_id FROM ama_m4_effects WHERE run_id=$1 AND state IN ('PREPARED','DISPATCHED','UNKNOWN') FOR UPDATE",[runId]);
      if(unresolved.rows.length){
        await db.query("UPDATE ama_m4_effects SET state='UNKNOWN',updated_at=now() WHERE run_id=$1 AND state IN ('PREPARED','DISPATCHED')",[runId]);
        await db.query("UPDATE ama_m4_runs SET state='HOLD',lease_epoch=lease_epoch+1,lease_owner=NULL,lease_until=NULL,updated_at=now() WHERE run_id=$1",[runId]);
        await this.event(db,runId,"LEASE_EXPIRED_WITH_UNCERTAIN_EFFECT","HOLD",Number(row.lease_epoch)+1,
          {effects:unresolved.rows.map(x=>x.effect_id)});
        return null;
      }
      const next=Number(row.lease_epoch)+1;
      const q=await db.query<{lease_until:Date}>(
        "UPDATE ama_m4_runs SET state='RUNNING',lease_epoch=$2,lease_owner=$3,lease_until=now()+($4 * interval '1 second'),updated_at=now() WHERE run_id=$1 RETURNING lease_until",
        [runId,next,owner,ttlSeconds]);
      await this.event(db,runId,"LEASE_ACQUIRED","RUNNING",next,{owner,recovered:row.state==="RUNNING"});
      return {runId,owner,epoch:next,expiresAt:q.rows[0]!.lease_until.toISOString()};
    }).then(lease=>{if(!lease)throw new DurableRunError("UNCERTAIN_EFFECT_RECONCILE");return lease;});
  }
  async assertLease(lease:Lease):Promise<void>{
    await this.tx(async db=>{this.live(await this.row(db,lease.runId),lease);});
  }
  async attempt(lease:Lease,attemptId:string,stepId:string):Promise<void>{
    ensure(required(attemptId)&&required(stepId),"INVALID_ATTEMPT");
    await this.tx(async db=>{
      this.live(await this.row(db,lease.runId),lease);
      await db.query("INSERT INTO ama_m4_attempts(attempt_id,run_id,step_id,worker_ref,lease_epoch) VALUES($1,$2,$3,$4,$5)",
        [attemptId,lease.runId,stepId,lease.owner,lease.epoch]);
      await this.event(db,lease.runId,"ATTEMPT_STARTED","RUNNING",lease.epoch,{attemptId,stepId});
    });
  }
  async checkpoint(lease:Lease,checkpointId:string,state:Record<string,unknown>):Promise<number>{
    ensure(required(checkpointId)&&state!==null&&typeof state==="object"&&!Array.isArray(state),
      "INVALID_CHECKPOINT");
    return this.tx(async db=>{
      const row=await this.row(db,lease.runId);this.live(row,lease);
      const unresolved=await db.query("SELECT effect_id FROM ama_m4_effects WHERE run_id=$1 AND state IN ('PREPARED','DISPATCHED','UNKNOWN')",[lease.runId]);
      ensure(!unresolved.rows.length,"EFFECT_REQUIRES_RECONCILIATION");
      const generation=Number(row.generation)+1;
      await db.query("INSERT INTO ama_m4_checkpoints(checkpoint_id,run_id,generation,lease_epoch,state_data,state_sha256) VALUES($1,$2,$3,$4,$5::jsonb,$6)",
        [checkpointId,lease.runId,generation,lease.epoch,JSON.stringify(state),sha(state)]);
      await db.query("UPDATE ama_m4_runs SET generation=$2,updated_at=now() WHERE run_id=$1",
        [lease.runId,generation]);
      await this.event(db,lease.runId,"CHECKPOINT","RUNNING",lease.epoch,{checkpointId,generation});
      return generation;
    });
  }
  private async prepare(lease:Lease,e:EffectAttempt):Promise<void>{
    ensure([e.effectId,e.operationKey,e.attemptId,e.target].every(required)&&
      e.runId===lease.runId&&["E1_INTERNAL_STATE","E2_REPOSITORY_CHANGE","E3_EXTERNAL_EFFECT"].includes(e.effectClass),
      "INVALID_EFFECT_INTENT");
    await this.tx(async db=>{
      this.live(await this.row(db,lease.runId),lease);
      const attempt=await db.query<{lease_epoch:string|number;worker_ref:string}>(
        "SELECT lease_epoch,worker_ref FROM ama_m4_attempts WHERE attempt_id=$1 AND run_id=$2",
        [e.attemptId,lease.runId]);
      ensure(attempt.rows.length===1&&Number(attempt.rows[0]!.lease_epoch)===lease.epoch&&
        attempt.rows[0]!.worker_ref===lease.owner,"ATTEMPT_LEASE_MISMATCH");
      const unsettled=await db.query("SELECT effect_id FROM ama_m4_effects WHERE run_id=$1 AND state IN ('PREPARED','DISPATCHED','UNKNOWN')",[lease.runId]);
      ensure(!unsettled.rows.length,"EFFECT_REQUIRES_RECONCILIATION");
      const duplicate=await db.query("SELECT effect_id FROM ama_m4_effects WHERE run_id=$1 AND operation_key=$2",
        [lease.runId,e.operationKey]);
      ensure(!duplicate.rows.length,"DUPLICATE_OPERATION_KEY");
      await db.query("INSERT INTO ama_m4_effects(effect_id,run_id,operation_key,attempt_id,target_scope,effect_class) VALUES($1,$2,$3,$4,$5,$6)",
        [e.effectId,lease.runId,e.operationKey,e.attemptId,e.target,e.effectClass]);
      await this.event(db,lease.runId,"EFFECT_PREPARED","RUNNING",lease.epoch,{effectId:e.effectId});
    });
  }
  private async dispatch(lease:Lease,effectId:string):Promise<void>{
    await this.tx(async db=>{
      this.live(await this.row(db,lease.runId),lease);
      const q=await db.query<EffectRow>(
        "UPDATE ama_m4_effects SET state='DISPATCHED',updated_at=now() WHERE effect_id=$1 AND run_id=$2 AND state='PREPARED' RETURNING *",
        [effectId,lease.runId]);
      ensure(q.rows.length===1,"EFFECT_NOT_PREPARED");
      await this.event(db,lease.runId,"EFFECT_DISPATCHED","RUNNING",lease.epoch,{effectId});
    });
  }
  private async afterDispatch(runId:string,effectId:string,callbackCalled:boolean,
    callbackResult?:unknown):Promise<void>{
    await this.tx(async db=>{
      const row=await this.row(db,runId);
      const q=await db.query<EffectRow>("SELECT * FROM ama_m4_effects WHERE effect_id=$1 AND run_id=$2 FOR UPDATE",
        [effectId,runId]);
      ensure(q.rows.length===1,"EFFECT_NOT_FOUND");
      // If an operator has cancelled or quarantined the run, do not clear HOLD.
      ensure(q.rows[0]!.state==="DISPATCHED"||q.rows[0]!.state==="UNKNOWN","EFFECT_ALREADY_SETTLED");
      const code=callbackCalled?"UNKNOWN":"BLOCKED";
      await db.query("UPDATE ama_m4_effects SET state=$2,callback_result_sha256=$3,updated_at=now() WHERE effect_id=$1",
        [effectId,code,callbackCalled&&callbackResult!==undefined?sha(callbackResult):null]);
      await db.query("UPDATE ama_m4_runs SET state='HOLD',lease_owner=NULL,lease_until=NULL,lease_epoch=lease_epoch+1,updated_at=now() WHERE run_id=$1 AND state<>'CANCELLED'",
        [runId]);
      await this.event(db,runId,callbackCalled?"EFFECT_OUTCOME_UNVERIFIED":"EFFECT_BLOCKED",
        "HOLD",Number(row.lease_epoch)+1,{effectId});
    });
  }
  /**
   * No blind retry of effect callbacks. Receipt verification is a separate process.
   * A callback may commit then throw, and even a resolved callback is not proof of
   * durable downstream state. Both remain HOLD pending independent reconciliation.
   */
  async executeEffect<T>(lease:Lease,e:EffectAttempt,context:AMAExecutionContext,
    capabilityId:string,perform:()=>Promise<T>):Promise<T>{
    ensure(!!this.gate,"EFFECT_GATE_NOT_BOUND");
    ensure(context.runId===lease.runId&&context.requestedEffect===e.effectClass&&
      context.targetScope.includes(e.target),"EFFECT_CONTEXT_MISMATCH");
    await this.prepare(lease,e);
    await this.dispatch(lease,e.effectId);
    let called=false;let result:T|undefined;let failure:unknown;
    try{
      result=await this.gate!.execute(context,capabilityId,e.target,async()=>{
        await this.assertLease(lease);
        called=true;
        return perform();
      });
    }catch(err){failure=err;}
    // If this transaction fails, DISPATCHED remains and will be recovered as
    // UNKNOWN; a later worker is never permitted to replay the operation.
    await this.afterDispatch(lease.runId,e.effectId,called,result);
    if(failure)throw failure;
    return result as T;
  }
  /** This method cannot trust receipt JSON. An independent port must attest it. */
  async reconcile(input:ReconciliationInput):Promise<void>{
    ensure(!!this.reconciliation,"RECONCILIATION_VERIFIER_NOT_BOUND");
    ensure([input.receiptId,input.effectId,input.verifierRef,input.evidenceRef].every(required)&&
      /^[0-9a-f]{64}$/.test(input.evidenceSha256),"INVALID_RECEIPT");
    await this.reconciliation!.assertReceipt(input);
    await this.tx(async db=>{
      const e=await db.query<EffectRow>("SELECT * FROM ama_m4_effects WHERE effect_id=$1 FOR UPDATE",
        [input.effectId]);
      ensure(e.rows.length===1,"EFFECT_NOT_FOUND");
      const effect=e.rows[0]!;
      const row=await this.row(db,effect.run_id);
      ensure(row.state==="HOLD"&&["UNKNOWN","BLOCKED"].includes(effect.state),
        "RECONCILIATION_NOT_REQUIRED");
      const state=input.outcome==="COMMITTED"?"COMMITTED":
        input.outcome==="NOT_APPLIED"?"NOT_APPLIED":"UNKNOWN";
      await db.query("INSERT INTO ama_m4_receipts(receipt_id,effect_id,outcome,verifier_ref,evidence_ref,evidence_sha256) VALUES($1,$2,$3,$4,$5,$6)",
        [input.receiptId,input.effectId,input.outcome,input.verifierRef,input.evidenceRef,input.evidenceSha256]);
      await db.query("UPDATE ama_m4_effects SET state=$2,updated_at=now() WHERE effect_id=$1",
        [input.effectId,state]);
      await this.event(db,effect.run_id,"RECONCILIATION_RECEIPT","HOLD",Number(row.lease_epoch),
        {effectId:effect.effect_id,receiptId:input.receiptId,outcome:input.outcome});
    });
  }
  async resumeRun(runId:string,decisionRef:string):Promise<void>{
    ensure(!!this.resume&&required(decisionRef),"RESUME_AUTHORITY_NOT_BOUND");
    await this.resume!.assertResumeAuthorized(runId,decisionRef);
    await this.tx(async db=>{
      const row=await this.row(db,runId);
      ensure(row.state==="HOLD"&&!row.cancel_requested,"RUN_NOT_RESUMABLE");
      const pending=await db.query("SELECT effect_id FROM ama_m4_effects WHERE run_id=$1 AND state IN ('PREPARED','DISPATCHED','UNKNOWN')",[runId]);
      ensure(!pending.rows.length,"EFFECT_REQUIRES_RECONCILIATION");
      await db.query("UPDATE ama_m4_runs SET state='QUEUED',lease_owner=NULL,lease_until=NULL,updated_at=now() WHERE run_id=$1",[runId]);
      await this.event(db,runId,"INDEPENDENT_RESUME","QUEUED",Number(row.lease_epoch),{decisionRef});
    });
  }
  async cancel(runId:string,decisionRef:string):Promise<void>{
    ensure(!!this.resume&&required(decisionRef),"CANCELLATION_AUTHORITY_NOT_BOUND");
    await this.resume!.assertResumeAuthorized(runId,decisionRef);
    await this.tx(async db=>{
      const row=await this.row(db,runId);
      ensure(!["PASS","FAIL","CANCELLED"].includes(row.state),"RUN_TERMINAL");
      const effects=await db.query("SELECT effect_id FROM ama_m4_effects WHERE run_id=$1 AND state IN ('PREPARED','DISPATCHED','UNKNOWN') FOR UPDATE",[runId]);
      if(effects.rows.length)
        await db.query("UPDATE ama_m4_effects SET state='UNKNOWN',updated_at=now() WHERE run_id=$1 AND state IN ('PREPARED','DISPATCHED')",[runId]);
      const state=effects.rows.length?"HOLD":"CANCELLED";
      await db.query("UPDATE ama_m4_runs SET state=$2,cancel_requested=true,lease_epoch=lease_epoch+1,lease_owner=NULL,lease_until=NULL,updated_at=now() WHERE run_id=$1",[runId,state]);
      await this.event(db,runId,effects.rows.length?"CANCEL_WITH_UNCERTAIN_EFFECT":"CANCELLED",
        state,Number(row.lease_epoch)+1,{decisionRef});
    });
  }
  async complete(lease:Lease):Promise<void>{
    await this.tx(async db=>{
      this.live(await this.row(db,lease.runId),lease);
      const pending=await db.query("SELECT effect_id FROM ama_m4_effects WHERE run_id=$1 AND state IN ('PREPARED','DISPATCHED','UNKNOWN','BLOCKED')",[lease.runId]);
      ensure(!pending.rows.length,"EFFECT_REQUIRES_RECONCILIATION");
      await db.query("UPDATE ama_m4_runs SET state='PASS',lease_owner=NULL,lease_until=NULL,updated_at=now() WHERE run_id=$1",[lease.runId]);
      await this.event(db,lease.runId,"EXECUTION_FINISHED_NOT_ACCEPTED","PASS",lease.epoch);
    });
  }
}
