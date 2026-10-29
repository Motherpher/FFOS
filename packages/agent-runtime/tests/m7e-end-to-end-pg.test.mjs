/** M7-E: full synthetic, explicitly UNRELEASED E0 and E2 integration.
 * Real disposable PostgreSQL, test-double authority and custody.
 * This does NOT prove a real CDX release, signature or physical side effect.
 */
import test,{before,after} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {randomUUID} from "node:crypto";
import pg from "pg";
import {AgentEffectGate,EffectDenied} from "../src/effect-gate.ts";
import {CDXF8ReadGuard} from "../src/cdx-f8-read.ts";
import {DurablePgCoordinator,DurableRunError} from "../src/durable-run.ts";
import {PgOperationalSteward,M6GuardedAdmission} from "../src/operational-steward.ts";
const dsn=process.env.AMA_TEST_DATABASE_URL;
const schema="m7e_"+randomUUID().replaceAll("-","").slice(0,18);
const PIN="sha256:"+"7".repeat(64);
let root,pool;
const state={revoked:false,policyDown:false,custodyDown:false,performed:0,
  receiptAccepts:true,readCalls:0,signatureValid:true};
const version="1.0.0",AGENT="CI.M7E.AGENT",WF="CI.M7E.FLOW";
const manifest={schema:"ffos.ama.agent-manifest/v1",agentId:AGENT,
 agentVersion:version,amaVersion:"0.1.0",lifecycleState:"ACTIVE",
 mandate:{scope:["synthetic/item"]},effectCeiling:"E2_REPOSITORY_CHANGE",
 authority:{authorityRefRequired:true,mandateRefRequired:true},
 workflows:[WF],capabilities:["CI.M7E.WRITE"]};
const bindings={workflows:[{workflowId:WF,version,agentId:AGENT,
  status:"ACTIVE",requiredCapabilities:["CI.M7E.WRITE"],
  effectCeiling:"E2_REPOSITORY_CHANGE"}],
 capabilities:[{capabilityId:"CI.M7E.WRITE",agentId:AGENT,status:"ACTIVE",
  effectClass:"E2_REPOSITORY_CHANGE"}]};
const hostRegistry={async getCurrent(agentId){
 return agentId===AGENT?{manifest,bindings,lifecycleState:"ACTIVE"}:null;
}};
const anchor={async assertPinned(pin){assert.equal(pin,PIN);}};
const revoked={async assertNotRevoked(){if(state.revoked)throw Error("external revocation");}};
const policy={async evaluate(r){
 if(state.policyDown)throw Error("unavailable synthetic policy");
 return {outcome:"ALLOW",policyPin:PIN,
  decisionRef:"SYNTHETIC.POLICY.DECISION",spetlReceiptRef:"SYNTHETIC.CUSTODY",
  decisionAuthenticated:state.signatureValid,spetlReceiptVerified:!state.custodyDown,
  evaluatedTarget:r.target,evaluatedEffect:r.context.requestedEffect};
},async assertStillCurrent(){if(state.revoked)throw Error("policy freshness changed");}};
const audit={async append(e){
 if(state.custodyDown)throw Error("synthetic custody offline");
 // Independent sink is simulated by a separate SQL insert, not trusted production custody.
 await pool.query("INSERT INTO ama_effect_evidence_events(event_id,run_id,agent_id,agent_version,workflow_id,workflow_version,principal_ref,authority_ref,mandate_ref,capability_id,target_ref,effect_class,policy_pin,policy_decision_ref,spetl_receipt_ref,outcome,stage,detail) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)",
  [e.eventId,e.runId,e.agentId,e.agentVersion,e.workflowId,
  e.workflowVersion,e.principalRef,e.authorityRef,e.mandateRef,
  e.capabilityId,e.target,e.effect,e.policyPin,e.policyDecisionRef,
  e.spetlReceiptRef,e.outcome,e.stage,e.detail]);
}};
const gate=new AgentEffectGate(hostRegistry,policy,revoked,audit,PIN,anchor);
const admission={async assertAdmitted(i){
 if(i.agentId!==AGENT||i.agentVersion!==version||state.revoked)
  throw Error("synthetic host admission denied");
}};
const reconciliation={async assertReceipt(r){
 if(!state.receiptAccepts||r.verifierRef!=="SYNTHETIC.EXTERNAL.VERIFIER"||
    r.evidenceRef!=="SYNTHETIC.INDEPENDENT.STATE")
   throw Error("synthetic verifier rejects outcome");
}};
const resume={async assertResumeAuthorized(id,ref){
 if(ref!=="SYNTHETIC.HUMAN.REVIEW")throw Error("not a verified test-review decision");
}};
const coordinator=()=>new DurablePgCoordinator(pool,
 new M6GuardedAdmission(pool,admission),gate,reconciliation,resume);
const context=(runId,effect="E2_REPOSITORY_CHANGE")=>({
 runId,agentId:AGENT,agentVersion:version,amaVersion:"0.1.0",
 workflowId:WF,workflowVersion:version,principalRef:"SYNTHETIC.HUMAN",
 authorityRef:"SYNTHETIC.GOVERNOR",mandateRef:"SYNTHETIC.MANDATE",
 requestedEffect:effect,targetScope:["synthetic/item"],policyVersion:PIN,
 inputRefs:[]
});
const runInput=()=>({runId:"CI.M7E.RUN."+randomUUID(),taskId:"CI.M7E.TASK."+randomUUID(),
 agentId:AGENT,agentVersion:version,workflowId:WF,workflowVersion:version});
before(async()=>{
 if(!dsn)return;
 root=new pg.Pool({connectionString:dsn,max:3});
 await root.query('CREATE SCHEMA "'+schema+'"');
 pool=new pg.Pool({connectionString:dsn,options:"-c search_path="+schema+",public",max:6});
 for(const file of ["packages/registry/schema.sql",
 "packages/registry/migrations/0002_agent_stable.sql",
 "packages/registry/migrations/0003_agent_stable_hardening.sql",
 "packages/registry/migrations/0004_ama_m4_durable_runs.sql",
 "packages/registry/migrations/0005_ama_m6_operations.sql"])
  await pool.query(await readFile(file,"utf8"));
 await pool.query("INSERT INTO ama_agent_versions(agent_id,agent_version,ama_version,definition,definition_sha256,source_commit,registered_by) VALUES($1,$2,$3,$4::jsonb,$5,$6,$7)",
  [AGENT,version,"0.1.0","{}","a".repeat(64),"SYNTHETIC","SYNTHETIC"]);
 await pool.query("CREATE TABLE m7e_synthetic_target(id TEXT PRIMARY KEY, content TEXT NOT NULL)");
 await pool.query("CREATE TABLE m7e_read_evidence(event_id TEXT PRIMARY KEY,stage TEXT NOT NULL,run_id TEXT NOT NULL,resource TEXT NOT NULL)");
});
after(async()=>{
 if(pool)await pool.end();
 if(root){await root.query('DROP SCHEMA IF EXISTS "'+schema+'" CASCADE');await root.end();}
});
test("M7-E: E0 classified read, independently checked recipient/purpose/grant and evidence",{skip:!dsn},async()=>{
 const c=context("CI.M7E.READ", "E0_OBSERVE");
 const grant={recipientRef:"SYNTHETIC.RECIPIENT",purposeRef:"SYNTHETIC_RESEARCH",
  grantRef:"SYNTHETIC.READ.GRANT",resource:"synthetic/item",classification:"RESTRICTED"};
 const independent={
  async assertReadAdmitted(ctx,r){assert.deepEqual(r,grant);if(state.revoked)throw Error("revoked");},
  async assertStillAdmitted(){if(state.revoked)throw Error("revoked before read");}
 };
 const evidence={async append(event){await pool.query(
  "INSERT INTO m7e_read_evidence(event_id,stage,run_id,resource) VALUES($1,$2,$3,$4)",
  [event.eventId,event.stage,event.runId,event.resource]);}};
 const guard=new CDXF8ReadGuard(policy,independent,evidence);
 const result=await guard.read(c,"CI.M7E.READ",grant,async()=>{
  state.readCalls++;return {syntheticField:"fake"};});
 assert.equal(result.syntheticField,"fake");
 assert.equal(state.readCalls,1);
 const rows=(await pool.query("SELECT stage FROM m7e_read_evidence WHERE run_id=$1 ORDER BY CASE stage WHEN 'PRE_READ' THEN 1 ELSE 2 END",[c.runId])).rows;
 assert.deepEqual(rows.map(r=>r.stage),["PRE_READ","POST_READ"]);
});
test("M7-E: E2 lifecycle uses actual PostgreSQL durable M4, F8 effect gate and independent reconciliation",{skip:!dsn},async()=>{
 const i=runInput(),c=coordinator();
 await c.create(i);
 const lease=await c.claim(i.runId,"CI.M7E.WORKER",120);
 const attempt="CI.M7E.ATTEMPT."+randomUUID();
 await c.attempt(lease,attempt,"SYNTHETIC.START");
 await c.checkpoint(lease,"CI.M7E.CHECKPOINT."+randomUUID(),{phase:"prepared"});
 const e={effectId:"CI.M7E.EFFECT."+randomUUID(),runId:i.runId,
  operationKey:"m7e-synthetic-once",attemptId:attempt,
  target:"synthetic/item",effectClass:"E2_REPOSITORY_CHANGE"};
 const value=await c.executeEffect(lease,e,context(i.runId),"CI.M7E.WRITE",async()=>{
  state.performed++;await pool.query("INSERT INTO m7e_synthetic_target(id,content) VALUES($1,$2)",
   [i.runId,"non-production"]);return "synthetic-write-ack";
 });
 assert.equal(value,"synthetic-write-ack");assert.equal(state.performed,1);
 assert.equal((await pool.query("SELECT state FROM ama_m4_effects WHERE effect_id=$1",[e.effectId])).rows[0].state,"UNKNOWN");
 assert.equal((await pool.query("SELECT state FROM ama_m4_runs WHERE run_id=$1",[i.runId])).rows[0].state,"HOLD");
 await assert.rejects(()=>c.claim(i.runId,"REPLAY",120),/RUN_NOT_CLAIMABLE/);
 await assert.rejects(()=>c.reconcile({receiptId:"CI.M7E.RECEIPT."+randomUUID(),effectId:e.effectId,
 outcome:"COMMITTED",verifierRef:"SYNTHETIC.AGENT",evidenceRef:"SELF_REPORTED",
 evidenceSha256:"c".repeat(64)}),/synthetic verifier rejects/);
 await c.reconcile({receiptId:"CI.M7E.RECEIPT."+randomUUID(),effectId:e.effectId,
  outcome:"COMMITTED",verifierRef:"SYNTHETIC.EXTERNAL.VERIFIER",
  evidenceRef:"SYNTHETIC.INDEPENDENT.STATE",evidenceSha256:"c".repeat(64)});
 assert.equal((await pool.query("SELECT state FROM ama_m4_effects WHERE effect_id=$1",[e.effectId])).rows[0].state,"COMMITTED");
 await c.resumeRun(i.runId,"SYNTHETIC.HUMAN.REVIEW");
 const newLease=await c.claim(i.runId,"CI.M7E.RESUMED",120);
 await c.complete(newLease);
 assert.equal((await pool.query("SELECT state FROM ama_m4_runs WHERE run_id=$1",[i.runId])).rows[0].state,"PASS");
 const records=(await pool.query("SELECT stage FROM ama_effect_evidence_events WHERE run_id=$1 ORDER BY recorded_at",[i.runId])).rows;
 assert.deepEqual(records.map(r=>r.stage),["PRE_EFFECT","POST_EFFECT"]);
 const evidence=(await pool.query("SELECT count(*)::int AS n FROM ama_m4_events WHERE run_id=$1",[i.runId])).rows[0].n;
 assert(evidence>=7);
});
test("M7-E: pre-release or unavailable F8 policy cannot produce a synthetic effect",{skip:!dsn},async()=>{
 const i=runInput(),ctx=context(i.runId);
 let called=0;
 const unsafePolicy=new AgentEffectGate(hostRegistry,null,revoked,audit,PIN,anchor);
 await assert.rejects(()=>unsafePolicy.execute(ctx,"CI.M7E.WRITE","synthetic/item",
  async()=>{called++;}),e=>e instanceof EffectDenied&&e.code==="ENFORCEMENT_NOT_BOUND");
 state.policyDown=true;
 await assert.rejects(()=>gate.execute(ctx,"CI.M7E.WRITE","synthetic/item",
  async()=>{called++;}),e=>e instanceof EffectDenied&&e.code==="CDX_UNAVAILABLE");
 state.policyDown=false;assert.equal(called,0);
});
test("M7-E: emergency suspension stops fresh work and preserves prior evidence",{skip:!dsn},async()=>{
 const i=runInput(),coord=coordinator();
 await coord.create(i);
 const lease=await coord.claim(i.runId,"CI.M7E.WORKER",120);
 const ops=new PgOperationalSteward(pool,{async assertEmergencySuspension(){},
  async assertHealthObservation(){}},null);
 const result=await ops.emergencySuspend({
  incidentId:"CI.M7E.INCIDENT."+randomUUID(),agentId:AGENT,agentVersion:version,
  kind:"REVOKED_TOOL",severity:"CRITICAL",evidenceRef:"SYNTHETIC.REVOCATION",
  authorityRef:"SYNTHETIC.INDEPENDENT.OPERATOR"});
 assert(result.fencedRuns>=1);assert.equal(result.activated,false);
 await assert.rejects(()=>coord.assertLease(lease));
 await assert.rejects(()=>coord.create(runInput()),/AGENT_EMERGENCY_SUSPENDED/);
 const saved=(await pool.query("SELECT count(*)::int AS n FROM ama_m4_events WHERE run_id=$1",[i.runId])).rows[0].n;
 assert(saved>=2);
});
