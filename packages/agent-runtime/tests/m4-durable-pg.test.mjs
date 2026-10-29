import test,{before,after} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {randomUUID} from "node:crypto";
import pg from "pg";
import {DurablePgCoordinator,DurableRunError} from "../src/durable-run.ts";

const dsn=process.env.AMA_TEST_DATABASE_URL;
const schema="m4_"+randomUUID().replaceAll("-","").slice(0,18);
let pool,root;
const admission={async assertAdmitted(i){if(i.agentVersion!=="1.0.0")throw Error("unverified version");}};
const resume={async assertResumeAuthorized(run,ref){if(ref!=="INDEPENDENT-REVIEW")throw Error("review not verified");}};
const receipts={async assertReceipt(r){if(r.verifierRef!=="INDEPENDENT-RECONCILER"||r.evidenceRef!=="VERIFIED-EXTERNAL")
  throw Error("untrusted receipt");}};
const gate={
 async execute(ctx,cap,target,callback){return callback();}
};
const coordinator=()=>new DurablePgCoordinator(pool,admission,gate,receipts,resume);
const make=()=>({runId:"CI-M4-"+randomUUID(),taskId:"CI-TASK-"+randomUUID(),
  agentId:"CI.M4.AGENT",agentVersion:"1.0.0",workflowId:"CI.M4.WORKFLOW",workflowVersion:"1.0.0"});
const effect=(run,attempt)=>({effectId:"CI-EFFECT-"+randomUUID(),runId:run,operationKey:"idempotent-call",
  attemptId:attempt,target:"fixture",effectClass:"E2_REPOSITORY_CHANGE"});
const context=run=>({runId:run,requestedEffect:"E2_REPOSITORY_CHANGE",targetScope:["fixture"]});
const deny=(fn,code)=>assert.rejects(fn,e=>e instanceof DurableRunError&&e.code===code);
const current=async id=>(await pool.query("SELECT * FROM ama_m4_runs WHERE run_id=$1",[id])).rows[0];
const state=async id=>(await pool.query("SELECT * FROM ama_m4_effects WHERE effect_id=$1",[id])).rows[0];

before(async()=>{
 if(!dsn)return;
 root=new pg.Pool({connectionString:dsn,max:3});
 await root.query('CREATE SCHEMA "'+schema+'"');
 pool=new pg.Pool({connectionString:dsn,options:"-c search_path="+schema+",public",max:6});
 const files=["packages/registry/schema.sql","packages/registry/migrations/0002_agent_stable.sql",
              "packages/registry/migrations/0003_agent_stable_hardening.sql",
              "packages/registry/migrations/0004_ama_m4_durable_runs.sql"];
 for(const file of files)await pool.query(await readFile(file,"utf8"));
 await pool.query("INSERT INTO ama_agent_versions(agent_id,agent_version,ama_version,definition,definition_sha256,source_commit,registered_by) VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7)",
  ["CI.M4.AGENT","1.0.0","0.1.0","{}", "f".repeat(64),"CI","CI"]);
});
after(async()=>{
 if(pool)await pool.end();
 if(root){await root.query('DROP SCHEMA IF EXISTS "'+schema+'" CASCADE');await root.end();}
});

test("M4: independent run admission is mandatory",{skip:!dsn},async()=>{
 const c=new DurablePgCoordinator(pool,null,gate,receipts,resume);
 await deny(()=>c.create(make()),"RUN_ADMISSION_NOT_BOUND");
});

test("M4: create, fence, checkpoint, resume after harmless lease expiry",{skip:!dsn},async()=>{
 const c=coordinator(),i=make();await c.create(i);
 let lease=await c.claim(i.runId,"worker-A",120);
 await c.attempt(lease,"CI-ATTEMPT-"+randomUUID(),"STEP.A");
 assert.equal(await c.checkpoint(lease,"CI-CHECKPOINT-"+randomUUID(),{phase:"one"}),1);
 await deny(()=>c.claim(i.runId,"worker-B",120),"LEASE_BUSY");
 await pool.query("UPDATE ama_m4_runs SET lease_until=now()-interval '1 second' WHERE run_id=$1",[i.runId]);
 const recovered=await c.claim(i.runId,"worker-B",120);
 assert.equal(recovered.epoch,lease.epoch+1);
 await deny(()=>c.checkpoint(lease,"CI-CHECKPOINT-"+randomUUID(),{}),"STALE_OR_EXPIRED_LEASE");
 await c.complete(recovered);
 assert.equal((await current(i.runId)).state,"PASS");
 const journals=await pool.query("SELECT event_type FROM ama_m4_events WHERE run_id=$1 ORDER BY event_sequence",[i.runId]);
 assert.deepEqual(journals.rows.map(x=>x.event_type),["CREATE","LEASE_ACQUIRED","ATTEMPT_STARTED","CHECKPOINT","LEASE_ACQUIRED","EXECUTION_FINISHED_NOT_ACCEPTED"]);
});

test("M4: callback return yields HOLD/UNKNOWN until independently verified receipt",{skip:!dsn},async()=>{
 const c=coordinator(),i=make();await c.create(i);
 const lease=await c.claim(i.runId,"worker-A",120);
 const attempt="CI-ATTEMPT-"+randomUUID();await c.attempt(lease,attempt,"STEP.A");
 const e=effect(i.runId,attempt);let calls=0;
 assert.equal(await c.executeEffect(lease,e,context(i.runId),"C",async()=>{calls++;return "remote-response";}),"remote-response");
 assert.equal(calls,1);
 assert.equal((await current(i.runId)).state,"HOLD");
 assert.equal((await state(e.effectId)).state,"UNKNOWN");
 await deny(()=>c.claim(i.runId,"worker-B",120),"RUN_NOT_CLAIMABLE");
 await deny(()=>c.resumeRun(i.runId,"INDEPENDENT-REVIEW"),"EFFECT_REQUIRES_RECONCILIATION");
 await c.reconcile({receiptId:"CI-RECEIPT-"+randomUUID(),effectId:e.effectId,outcome:"COMMITTED",
   verifierRef:"INDEPENDENT-RECONCILER",evidenceRef:"VERIFIED-EXTERNAL",evidenceSha256:"d".repeat(64)});
 assert.equal((await state(e.effectId)).state,"COMMITTED");
 await c.resumeRun(i.runId,"INDEPENDENT-REVIEW");
 const next=await c.claim(i.runId,"worker-B",120);
 await c.attempt(next,"CI-ATTEMPT-"+randomUUID(),"STEP.B");
 await deny(()=>c.executeEffect(next,{...e,effectId:"CI-EFFECT-"+randomUUID(),
   attemptId:"CI-ATTEMPT-"+randomUUID()},context(i.runId),"C",async()=>{calls++;return "duplicate";}),
   "ATTEMPT_LEASE_MISMATCH");
 const laterAttempt="CI-ATTEMPT-"+randomUUID();await c.attempt(next,laterAttempt,"STEP.C");
 await deny(()=>c.executeEffect(next,{...e,effectId:"CI-EFFECT-"+randomUUID(),attemptId:laterAttempt},
   context(i.runId),"C",async()=>{calls++;return "duplicate";}),"DUPLICATE_OPERATION_KEY");
 assert.equal(calls,1);
 await c.complete(next);
});

test("M4: failed callback is UNKNOWN and no automatic retry",{skip:!dsn},async()=>{
 const c=coordinator(),i=make();await c.create(i);
 const lease=await c.claim(i.runId,"worker",120),attempt="CI-ATTEMPT-"+randomUUID();
 await c.attempt(lease,attempt,"STEP.A");
 const e=effect(i.runId,attempt);let invoked=0;
 await assert.rejects(()=>c.executeEffect(lease,e,context(i.runId),"C",async()=>{
   invoked++;throw Error("network response lost after remote side effect");
 }),/network response lost/);
 assert.equal(invoked,1);assert.equal((await state(e.effectId)).state,"UNKNOWN");
 await deny(()=>c.claim(i.runId,"worker",120),"RUN_NOT_CLAIMABLE");
});

test("M4: policy denies before callback, no side effect occurs",{skip:!dsn},async()=>{
 const c=new DurablePgCoordinator(pool,admission,{async execute(){throw Error("policy unavailable");}},receipts,resume);
 const i=make();await c.create(i);
 const lease=await c.claim(i.runId,"worker",120),attempt="CI-ATTEMPT-"+randomUUID();
 await c.attempt(lease,attempt,"STEP.A");
 const e=effect(i.runId,attempt);let calls=0;
 await assert.rejects(()=>c.executeEffect(lease,e,context(i.runId),"C",async()=>{calls++;}),/policy unavailable/);
 assert.equal(calls,0);assert.equal((await state(e.effectId)).state,"BLOCKED");
 assert.equal((await current(i.runId)).state,"HOLD");
});

test("M4: expired lease with unfinished dispatch becomes HOLD and UNKNOWN",{skip:!dsn},async()=>{
 const c=coordinator(),i=make();await c.create(i);
 const lease=await c.claim(i.runId,"worker-A",120),attempt="CI-ATTEMPT-"+randomUUID();
 await c.attempt(lease,attempt,"STEP.A");
 const e=effect(i.runId,attempt);
 // Simulated process crash after irreversible dispatch intent: no callback invoked by test.
 await pool.query("INSERT INTO ama_m4_effects(effect_id,run_id,operation_key,attempt_id,target_scope,effect_class,state) VALUES($1,$2,$3,$4,$5,$6,'DISPATCHED')",
   [e.effectId,e.runId,e.operationKey,e.attemptId,e.target,e.effectClass]);
 await pool.query("UPDATE ama_m4_runs SET lease_until=now()-interval '1 second' WHERE run_id=$1",[i.runId]);
 await deny(()=>c.claim(i.runId,"worker-B",120),"UNCERTAIN_EFFECT_RECONCILE");
 assert.equal((await current(i.runId)).state,"HOLD");
 assert.equal((await state(e.effectId)).state,"UNKNOWN");
});

test("M4: forged receipt cannot resolve uncertain effect",{skip:!dsn},async()=>{
 const c=coordinator(),i=make();await c.create(i);
 const lease=await c.claim(i.runId,"worker",120),attempt="CI-ATTEMPT-"+randomUUID();
 await c.attempt(lease,attempt,"STEP.A");const e=effect(i.runId,attempt);
 await c.executeEffect(lease,e,context(i.runId),"C",async()=>"ok");
 await assert.rejects(()=>c.reconcile({receiptId:"CI-RECEIPT-"+randomUUID(),
  effectId:e.effectId,outcome:"COMMITTED",verifierRef:"AGENT",
  evidenceRef:"SELF-REPORTED",evidenceSha256:"a".repeat(64)}),/untrusted receipt/);
 assert.equal((await state(e.effectId)).state,"UNKNOWN");
});

test("M4: cancellation fences worker and retains uncertain side effects",{skip:!dsn},async()=>{
 const c=coordinator(),i=make();await c.create(i);
 const lease=await c.claim(i.runId,"worker",120),attempt="CI-ATTEMPT-"+randomUUID();
 await c.attempt(lease,attempt,"STEP.A");const e=effect(i.runId,attempt);
 await pool.query("INSERT INTO ama_m4_effects(effect_id,run_id,operation_key,attempt_id,target_scope,effect_class,state) VALUES($1,$2,$3,$4,$5,$6,'DISPATCHED')",
   [e.effectId,e.runId,e.operationKey,e.attemptId,e.target,e.effectClass]);
 await c.cancel(i.runId,"INDEPENDENT-REVIEW");
 assert.equal((await current(i.runId)).state,"HOLD");
 await deny(()=>c.assertLease(lease),"STALE_OR_EXPIRED_LEASE");
 await deny(()=>c.resumeRun(i.runId,"INDEPENDENT-REVIEW"),"RUN_NOT_RESUMABLE");
});

test("M4: cancelled harmless run never dispatches or resumes",{skip:!dsn},async()=>{
 const c=coordinator(),i=make();await c.create(i);
 await c.cancel(i.runId,"INDEPENDENT-REVIEW");
 assert.equal((await current(i.runId)).state,"CANCELLED");
 await deny(()=>c.claim(i.runId,"worker",120),"RUN_NOT_CLAIMABLE");
});

test("M4: immutable journal/checkpoint/receipt cannot be silently rewritten",{skip:!dsn},async()=>{
 const c=coordinator(),i=make();await c.create(i);
 const lease=await c.claim(i.runId,"worker",120);
 await c.checkpoint(lease,"CI-CHECKPOINT-"+randomUUID(),{x:1});
 await assert.rejects(pool.query("UPDATE ama_m4_events SET event_type='TAMPERED' WHERE run_id=$1",[i.runId]));
 await assert.rejects(pool.query("DELETE FROM ama_m4_checkpoints WHERE run_id=$1",[i.runId]));
});

test("M4: competing workers cannot claim same lease",{skip:!dsn},async()=>{
 const c=coordinator(),i=make();await c.create(i);
 const settled=await Promise.allSettled([
   c.claim(i.runId,"worker-A",120),c.claim(i.runId,"worker-B",120)]);
 assert.equal(settled.filter(x=>x.status==="fulfilled").length,1);
 assert.equal(settled.filter(x=>x.status==="rejected"&&
   x.reason instanceof DurableRunError&&x.reason.code==="LEASE_BUSY").length,1);
});

test("M4: revoked admission prevents existing worker from dispatching",{skip:!dsn},async()=>{
 let revoked=false;
 const independent={async assertAdmitted(){if(revoked)throw Error("mandate revoked");}};
 const c=new DurablePgCoordinator(pool,independent,gate,receipts,resume);
 const i=make();await c.create(i);
 const lease=await c.claim(i.runId,"worker",120);revoked=true;
 await assert.rejects(()=>c.assertLease(lease),/mandate revoked/);
});

test("M4: post-callback evidence failure retains uncertain outcome",{skip:!dsn},async()=>{
 const broken={async execute(ctx,cap,target,callback){
   await callback();throw Error("post-effect evidence unavailable");
 }};
 const c=new DurablePgCoordinator(pool,admission,broken,receipts,resume);
 const i=make();await c.create(i);
 const lease=await c.claim(i.runId,"worker",120),attempt="CI-ATTEMPT-"+randomUUID();
 await c.attempt(lease,attempt,"STEP.A");
 const e=effect(i.runId,attempt);let calls=0;
 await assert.rejects(()=>c.executeEffect(lease,e,context(i.runId),"C",async()=>{
   calls++;return {ok:true};}),/post-effect evidence unavailable/);
 assert.equal(calls,1);assert.equal((await state(e.effectId)).state,"UNKNOWN");
 await deny(()=>c.resumeRun(i.runId,"INDEPENDENT-REVIEW"),"EFFECT_REQUIRES_RECONCILIATION");
});

test("M4: independently confirmed NOT_APPLIED cannot count as completed effect",{skip:!dsn},async()=>{
 const c=coordinator(),i=make();await c.create(i);
 const lease=await c.claim(i.runId,"worker",120),attempt="CI-ATTEMPT-"+randomUUID();
 await c.attempt(lease,attempt,"STEP.A");const e=effect(i.runId,attempt);
 await c.executeEffect(lease,e,context(i.runId),"C",async()=>"unverified");
 await c.reconcile({receiptId:"CI-RECEIPT-"+randomUUID(),effectId:e.effectId,
   outcome:"NOT_APPLIED",verifierRef:"INDEPENDENT-RECONCILER",
   evidenceRef:"VERIFIED-EXTERNAL",evidenceSha256:"e".repeat(64)});
 await c.resumeRun(i.runId,"INDEPENDENT-REVIEW");
 const next=await c.claim(i.runId,"worker-2",120);
 await deny(()=>c.complete(next),"EFFECT_REQUIRES_RECONCILIATION");
});
