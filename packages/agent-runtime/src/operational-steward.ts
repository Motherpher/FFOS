/** M6: bounded operational stewardship. Prepared changes only; never grants release.
 * Emergency containment requires a separately authenticated external authority.
 * Uses the existing durable M4 run state and append-only evidence.
 */
import {randomUUID} from "node:crypto";
import {contentDigest} from "./stable-registry.ts";
import type {SqlPool,SqlClient} from "./stable-registry.ts";
import type {RunAdmissionPort,CreateRunRequest} from "./durable-run.ts";
type Severity="LOW"|"MODERATE"|"HIGH"|"CRITICAL";
export type OperationalIncidentKind="POLICY_DRIFT"|"REVOKED_TOOL"|"MODEL_SUBSTITUTION"|
 "PROTOCOL_BREAK"|"UNSETTLED_EFFECT"|"HEALTH_DEGRADATION"|"PRIVACY_BREACH"|"UNKNOWN";
export interface IncidentInput {
 incidentId:string;agentId:string;agentVersion:string;kind:OperationalIncidentKind;
 severity:Severity;evidenceRef:string;authorityRef:string;
}
export interface HealthObservationInput {
 observationId:string;agentId:string;agentVersion:string;observedAt:string;
 evidenceRef:string;independentVerifierRef:string;
 signals:Readonly<{heartbeatAgeSeconds:number;failureRate:number;p95LatencyMs:number;
   costMinor:number;policyDrift:boolean;revocationDetected:boolean;
   unsettledEffects:number}>;
}
export interface ProposalInput {
 proposalId:string;agentId:string;agentVersion:string;targetVersion:string;
 candidateDigest:string;compatibilityEvidenceRef:string;healthEvidenceRef:string;
 rollbackRef:string;proposerRef:string;canaryPercent:number;
}
export interface IndependentOperationsAuthority {
 assertEmergencySuspension(input:IncidentInput):Promise<void>;
 /** Separate authorization for observability inputs; not agent self-report. */
 assertHealthObservation(input:HealthObservationInput):Promise<void>;
}
export interface IndependentReleaseReview {
 /** Preflight only: checks source and approvals are valid to propose, NOT deploy. */
 assertProposalEligible(input:ProposalInput):Promise<void>;
}
export class M6OperationalDenied extends Error {
 readonly code:string;
 constructor(code:string){super("AMA M6 denied: "+code);this.name="M6OperationalDenied";this.code=code;}
}
function guard(ok:unknown,code:string):asserts ok{
 if(!ok)throw new M6OperationalDenied(code);
}
const nonempty=(x:unknown)=>typeof x==="string"&&x.trim().length>0;
const sha=(v:unknown)=>contentDigest(v);
/** Optional host-wired M4 admission wrapper. No production binding implied. */
export class M6GuardedAdmission implements RunAdmissionPort {
 private readonly pool:SqlPool;
 private readonly upstream:RunAdmissionPort|null;
 constructor(pool:SqlPool,upstream:RunAdmissionPort|null){
  this.pool=pool;this.upstream=upstream;
 }
 async assertAdmitted(input:CreateRunRequest):Promise<void>{
  guard(!!this.upstream,"INDEPENDENT_ADMISSION_NOT_BOUND");
  await this.upstream!.assertAdmitted(input);
  const q=await this.pool.query<{agent_id:string}>(
    "SELECT agent_id FROM ama_m6_suspensions WHERE agent_id=$1 AND agent_version=$2",
    [input.agentId,input.agentVersion]);
  guard(q.rows.length===0,"AGENT_EMERGENCY_SUSPENDED");
 }
}
export class PgOperationalSteward {
 private readonly pool:SqlPool;
 private readonly authority:IndependentOperationsAuthority|null;
 private readonly review:IndependentReleaseReview|null;
 constructor(pool:SqlPool,authority:IndependentOperationsAuthority|null,
  review:IndependentReleaseReview|null){
  this.pool=pool;this.authority=authority;this.review=review;
 }
 private async tx<T>(fn:(db:SqlClient)=>Promise<T>):Promise<T>{
  const db=await this.pool.connect();let open=false;
  try{
   await db.query("BEGIN");open=true;
   const result=await fn(db);await db.query("COMMIT");open=false;return result;
  }catch(e){if(open)try{await db.query("ROLLBACK");}catch{}throw e;}
  finally{db.release();}
 }
 /** Observability: authenticated record but no release action or active mutation. */
 async recordHealth(input:HealthObservationInput):Promise<void>{
  guard(!!this.authority,"HEALTH_ATTESTOR_NOT_BOUND");
  guard([input.observationId,input.agentId,input.agentVersion,input.evidenceRef,
   input.independentVerifierRef].every(nonempty)&&
   Number.isFinite(Date.parse(input.observedAt))&&
   Number.isFinite(input.signals.failureRate)&&input.signals.failureRate>=0&&
   input.signals.failureRate<=1&&
   [input.signals.heartbeatAgeSeconds,input.signals.p95LatencyMs,
    input.signals.costMinor,input.signals.unsettledEffects].every(
      x=>Number.isInteger(x)&&x>=0),"INVALID_HEALTH_OBSERVATION");
  await this.authority!.assertHealthObservation(input);
  await this.tx(async db=>{
   await this.authority!.assertHealthObservation(input);
   await db.query("INSERT INTO ama_m6_health_observations(observation_id,agent_id,agent_version,observed_at,signal_digest,signal_data,evidence_ref,independent_verifier_ref) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8)",
    [input.observationId,input.agentId,input.agentVersion,input.observedAt,
     sha(input.signals),JSON.stringify(input.signals),input.evidenceRef,input.independentVerifierRef]);
  });
 }
 /** Immutable release PROPOSAL. Never changes active version or traffic allocation. */
 async prepareRelease(input:ProposalInput):Promise<{state:"APPROVAL_PENDING";activated:false}>{
  guard(!!this.review,"RELEASE_REVIEW_NOT_BOUND");
  guard([input.proposalId,input.agentId,input.agentVersion,input.targetVersion,
    input.compatibilityEvidenceRef,input.healthEvidenceRef,input.rollbackRef,
    input.proposerRef].every(nonempty)&&
    /^[0-9a-f]{64}$/.test(input.candidateDigest)&&
    input.agentVersion!==input.targetVersion&&
    Number.isInteger(input.canaryPercent)&&input.canaryPercent>=1&&
    input.canaryPercent<=100,"INVALID_RELEASE_PROPOSAL");
  await this.review!.assertProposalEligible(input);
  await this.tx(async db=>{
   await this.review!.assertProposalEligible(input);
   const unresolved=await db.query<{n:string}>(
    "SELECT count(*)::text AS n FROM ama_m4_effects e JOIN ama_m4_runs r ON r.run_id=e.run_id WHERE r.agent_id=$1 AND r.agent_version=$2 AND e.state NOT IN ('COMMITTED')",
    [input.agentId,input.agentVersion]);
   guard(Number(unresolved.rows[0]?.n??0)===0,"UNSETTLED_EFFECT_PREVENTS_RELEASE_PROPOSAL");
   const open=await db.query<{n:string}>(
    "SELECT count(*)::text AS n FROM ama_m6_incidents WHERE agent_id=$1 AND agent_version=$2 AND severity IN ('HIGH','CRITICAL')",
    [input.agentId,input.agentVersion]);
   // Incident ledger has no self-closed state; external human closure is separate.
   guard(Number(open.rows[0]?.n??0)===0,"HIGH_SEVERITY_INCIDENT_PREVENTS_PROPOSAL");
   await db.query("INSERT INTO ama_m6_release_proposals(proposal_id,agent_id,agent_version,target_version,candidate_digest,compatibility_evidence_ref,health_evidence_ref,rollback_ref,proposer_ref,canary_percent) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
    [input.proposalId,input.agentId,input.agentVersion,input.targetVersion,
     input.candidateDigest,input.compatibilityEvidenceRef,input.healthEvidenceRef,
     input.rollbackRef,input.proposerRef,input.canaryPercent]);
  });
  return {state:"APPROVAL_PENDING",activated:false};
 }
 /** Atomic emergency containment. Unknown effects are retained for reconciliation.
  * Verifies authority twice; fences leases and never auto-accepts rollback.
  */
 async emergencySuspend(input:IncidentInput):
  Promise<{incidentId:string;fencedRuns:number;uncertainEffects:number;activated:false}>{
  guard(!!this.authority,"SUSPENSION_AUTHORITY_NOT_BOUND");
  guard([input.incidentId,input.agentId,input.agentVersion,input.evidenceRef,
   input.authorityRef].every(nonempty)&&
   ["POLICY_DRIFT","REVOKED_TOOL","MODEL_SUBSTITUTION","PROTOCOL_BREAK",
    "UNSETTLED_EFFECT","HEALTH_DEGRADATION","PRIVACY_BREACH","UNKNOWN"].includes(input.kind)&&
   ["LOW","MODERATE","HIGH","CRITICAL"].includes(input.severity),
   "INVALID_INCIDENT");
  await this.authority!.assertEmergencySuspension(input);
  return this.tx(async db=>{
   await db.query("SELECT pg_advisory_xact_lock(hashtext($1))",[input.agentId]);
   await this.authority!.assertEmergencySuspension(input);
   await db.query("INSERT INTO ama_m6_incidents(incident_id,agent_id,agent_version,kind,severity,event_type,evidence_ref,authority_ref) VALUES($1,$2,$3,$4,$5,'INDEPENDENT_EMERGENCY_SUSPENSION',$6,$7)",
    [input.incidentId,input.agentId,input.agentVersion,input.kind,input.severity,
     input.evidenceRef,input.authorityRef]);
   await db.query("INSERT INTO ama_m6_suspensions(agent_id,agent_version,incident_id,authority_ref,proof_ref) VALUES($1,$2,$3,$4,$5) ON CONFLICT(agent_id,agent_version) DO NOTHING",
    [input.agentId,input.agentVersion,input.incidentId,input.authorityRef,input.evidenceRef]);
   const runs=await db.query<{run_id:string;state:string;lease_epoch:string|number}>(
    "SELECT run_id,state,lease_epoch FROM ama_m4_runs WHERE agent_id=$1 AND agent_version=$2 AND state IN ('QUEUED','RUNNING','HOLD') ORDER BY run_id FOR UPDATE",
    [input.agentId,input.agentVersion]);
   let effects=0;
   for(const run of runs.rows){
    const unsettled=await db.query<{effect_id:string}>(
      "SELECT effect_id FROM ama_m4_effects WHERE run_id=$1 AND state IN ('PREPARED','DISPATCHED','UNKNOWN') FOR UPDATE",
      [run.run_id]);
    const count=unsettled.rows.length;effects+=count;
    if(count)await db.query("UPDATE ama_m4_effects SET state='UNKNOWN',updated_at=now() WHERE run_id=$1 AND state IN ('PREPARED','DISPATCHED')",[run.run_id]);
    const state=count||run.state==="HOLD"?"HOLD":"CANCELLED",epoch=Number(run.lease_epoch)+1;
    await db.query("UPDATE ama_m4_runs SET state=$2,cancel_requested=true,lease_epoch=$3,lease_owner=NULL,lease_until=NULL,updated_at=now() WHERE run_id=$1",
      [run.run_id,state,epoch]);
    await db.query("INSERT INTO ama_m4_events(event_id,run_id,event_type,state,lease_epoch,detail) VALUES($1,$2,$3,$4,$5,$6::jsonb)",
      [randomUUID(),run.run_id,"M6_INDEPENDENT_EMERGENCY_SUSPENSION",state,epoch,
       JSON.stringify({incidentId:input.incidentId,uncertainEffects:count})]);
    await db.query("INSERT INTO ama_m6_incident_actions(action_id,incident_id,run_id,before_state,after_state,lease_epoch,uncertain_effects) VALUES($1,$2,$3,$4,$5,$6,$7)",
      [randomUUID(),input.incidentId,run.run_id,run.state,state,epoch,count]);
   }
   return {incidentId:input.incidentId,fencedRuns:runs.rows.length,
    uncertainEffects:effects,activated:false};
  });
 }
}
