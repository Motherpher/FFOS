import test,{before,after} from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {randomUUID} from "node:crypto";
import pg from "pg";
import {PgOperationalSteward,M6OperationalDenied,M6GuardedAdmission} from "../src/operational-steward.ts";
import {DurablePgCoordinator} from "../src/durable-run.ts";

const dsn=process.env.AMA_TEST_DATABASE_URL;
const schema="m6_"+randomUUID().replaceAll("-","").slice(0,18);
let pool,root;
let revoke=false,attestationDown=false,reviewDown=false;
const authority={
 async assertEmergencySuspension(i){if(revoke)throw Error("external authority revoked");},
 async assertHealthObservation(i){if(attestationDown)throw Error("telemetry attestation unavailable");}
};
const review={async assertProposalEligible(i){if(reviewDown)throw Error("independent release review unavailable");}};
const steward=()=>new PgOperationalSteward(pool,authority,review);
const denied=(fn,code)=>assert.rejects(fn,e=>e instanceof M6OperationalDenied&&e.code===code);
const run=()=>({runId:"CI-M6-RUN-"+randomUUID(),taskId:"TASK-"+randomUUID(),
 agentId:"CI.M6.AGENT",agentVersion:"1.0.0",workflowId:"CI.WORKFLOW",
 workflowVersion:"1.0.0"});
const registerVersion=async version=>pool.query(
 "INSERT INTO ama_agent_versions(agent_id,agent_version,ama_version,definition,definition_sha256,source_commit,registered_by) VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7)",
 ["CI.M6.AGENT",version,"0.1.0","{}","f".repeat(64),"CI","CI"]);
const incident=()=>({incidentId:"CI-M6-INC-"+randomUUID(),agentId:"CI.M6.AGENT",
 agentVersion:"1.0.0",kind:"REVOKED_TOOL",severity:"CRITICAL",
 evidenceRef:"independent/test/proof",authorityRef:"verified/human"});
const health=()=>({observationId:"CI-M6-HEALTH-"+randomUUID(),
 agentId:"CI.M6.AGENT",agentVersion:"1.0.0",
 observedAt:"2026-10-29T10:00:00+00:00",evidenceRef:"CI/ATT",
 independentVerifierRef:"CI/INDEPENDENT",
 signals:{heartbeatAgeSeconds:1,failureRate:0,p95LatencyMs:10,costMinor:2,
 policyDrift:false,revocationDetected:false,unsettledEffects:0}});
const proposal=()=>({proposalId:"CI-M6-RELEASE-"+randomUUID(),agentId:"CI.M6.AGENT",
 agentVersion:"1.0.0",targetVersion:"1.1.0",candidateDigest:"a".repeat(64),
 compatibilityEvidenceRef:"CI/COMPAT",healthEvidenceRef:"CI/HEALTH",
 rollbackRef:"CI/ROLLBACK",proposerRef:"CI/STEWARD",canaryPercent:5});
before(async()=>{
 if(!dsn)return;
 root=new pg.Pool({connectionString:dsn,max:3});
 await root.query('CREATE SCHEMA "'+schema+'"');
 pool=new pg.Pool({connectionString:dsn,
  options:"-c search_path="+schema+",public",max:7});
 for(const file of ["packages/registry/schema.sql",
   "packages/registry/migrations/0002_agent_stable.sql",
   "packages/registry/migrations/0003_agent_stable_hardening.sql",
   "packages/registry/migrations/0004_ama_m4_durable_runs.sql",
   "packages/registry/migrations/0005_ama_m6_operations.sql"])
  await pool.query(await readFile(file,"utf8"));
 await pool.query("INSERT INTO ama_agent_versions(agent_id,agent_version,ama_version,definition,definition_sha256,source_commit,registered_by) VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7)",
  ["CI.M6.AGENT","1.0.0","0.1.0","{}","f".repeat(64),"CI","CI"]);
});
after(async()=>{
 if(pool)await pool.end();
 if(root){await root.query('DROP SCHEMA IF EXISTS "'+schema+'" CASCADE');await root.end();}
});
test("M6: missing external authority blocks emergency action",{skip:!dsn},async()=>{
 const s=new PgOperationalSteward(pool,null,review);
 await denied(()=>s.emergencySuspend(incident()),"SUSPENSION_AUTHORITY_NOT_BOUND");
});
test("M6: independent emergency containment fences worker, journals and preserves committed evidence",{skip:!dsn},async()=>{
 const i=run(),coord=new DurablePgCoordinator(pool,
  {async assertAdmitted(){}},null,null,null);
 await coord.create(i);
 const lease=await coord.claim(i.runId,"worker",120);
 const record=incident(),result=await steward().emergencySuspend(record);
 assert.equal(result.fencedRuns,1);
 assert.equal(result.uncertainEffects,0);
 assert.equal(result.activated,false);
 const r=(await pool.query("SELECT state,cancel_requested,lease_epoch,lease_owner FROM ama_m4_runs WHERE run_id=$1",[i.runId])).rows[0];
 assert.equal(r.state,"CANCELLED");assert.equal(r.cancel_requested,true);
 assert.equal(Number(r.lease_epoch),lease.epoch+1);assert.equal(r.lease_owner,null);
 await assert.rejects(()=>coord.assertLease(lease),/STALE_OR_EXPIRED_LEASE/);
 const events=(await pool.query("SELECT event_type FROM ama_m4_events WHERE run_id=$1 ORDER BY event_sequence",[i.runId])).rows;
 assert.equal(events.at(-1).event_type,"M6_INDEPENDENT_EMERGENCY_SUSPENSION");
 const actions=(await pool.query("SELECT * FROM ama_m6_incident_actions WHERE incident_id=$1",[record.incidentId])).rows;
 assert.equal(actions.length,1);
});
test("M6: uncertain dispatched effect transitions to HOLD UNKNOWN, never blindly replayed",{skip:!dsn},async()=>{
 await registerVersion("5.0.0");
 const i={...run(),agentVersion:"5.0.0"},coord=new DurablePgCoordinator(pool,
  {async assertAdmitted(){}},null,null,null);
 await coord.create(i);const lease=await coord.claim(i.runId,"worker",120);
 const attempt="CI-M6-ATT-"+randomUUID();
 await coord.attempt(lease,attempt,"STEP.A");
 const effectId="CI-M6-EFFECT-"+randomUUID();
 await pool.query("INSERT INTO ama_m4_effects(effect_id,run_id,operation_key,attempt_id,target_scope,effect_class,state) VALUES($1,$2,$3,$4,$5,$6,'DISPATCHED')",
  [effectId,i.runId,"CI-KEY",attempt,"synthetic","E2_REPOSITORY_CHANGE"]);
 const result=await steward().emergencySuspend({...incident(),agentVersion:"5.0.0"});
 assert.equal(result.uncertainEffects,1);
 const state=(await pool.query("SELECT state FROM ama_m4_runs WHERE run_id=$1",[i.runId])).rows[0];
 assert.equal(state.state,"HOLD");
 const effect=(await pool.query("SELECT state FROM ama_m4_effects WHERE effect_id=$1",[effectId])).rows[0];
 assert.equal(effect.state,"UNKNOWN");
 await assert.rejects(()=>coord.claim(i.runId,"new-worker",120),/RUN_NOT_CLAIMABLE/);
});
test("M6: independent suspension authority outage causes no mutation",{skip:!dsn},async()=>{
 await registerVersion("6.0.0");
 const i={...run(),agentVersion:"6.0.0"},coord=new DurablePgCoordinator(pool,
  {async assertAdmitted(){}},null,null,null);await coord.create(i);
 revoke=true;
 await assert.rejects(()=>steward().emergencySuspend(incident()),/authority revoked/);
 revoke=false;
 const r=(await pool.query("SELECT state FROM ama_m4_runs WHERE run_id=$1",[i.runId])).rows[0];
 assert.equal(r.state,"QUEUED");
});
test("M6: immutable health proof survives and never authorizes release",{skip:!dsn},async()=>{
 const s=steward(),obs=health();
 await s.recordHealth(obs);
 const q=(await pool.query("SELECT signal_digest,signal_data FROM ama_m6_health_observations WHERE observation_id=$1",[obs.observationId])).rows;
 assert.equal(q.length,1);assert.equal(q[0].signal_digest.length,64);
 await assert.rejects(()=>pool.query("DELETE FROM ama_m6_health_observations WHERE observation_id=$1",[obs.observationId]));
 attestationDown=true;
 await assert.rejects(()=>s.recordHealth(health()),/attestation unavailable/);
 attestationDown=false;
});
test("M6: release remains an immutable proposal, never traffic shift",{skip:!dsn},async()=>{
 // Other tests may have CRITICAL incidents. Use separate registered synthetic version.
 await pool.query("INSERT INTO ama_agent_versions(agent_id,agent_version,ama_version,definition,definition_sha256,source_commit,registered_by) VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7)",
  ["CI.M6.AGENT","2.0.0","0.1.0","{}","f".repeat(64),"CI","CI"]);
 const observation={...health(),agentVersion:"2.0.0"};
 await steward().recordHealth(observation);
 const p={...proposal(),agentVersion:"2.0.0",targetVersion:"2.1.0",
   healthEvidenceRef:observation.observationId};
 const r=await steward().prepareRelease(p);
 assert.deepEqual(r,{state:"APPROVAL_PENDING",activated:false});
 const row=(await pool.query("SELECT state FROM ama_m6_release_proposals WHERE proposal_id=$1",[p.proposalId])).rows[0];
 assert.equal(row.state,"APPROVAL_PENDING");
 await assert.rejects(()=>pool.query("UPDATE ama_m6_release_proposals SET target_version='9.0.0' WHERE proposal_id=$1",[p.proposalId]));
 reviewDown=true;
 await assert.rejects(()=>steward().prepareRelease({...p,proposalId:"CI-ALT-"+randomUUID()}),/review unavailable/);
 reviewDown=false;
});
test("M6: new M4 runs fail at database boundary even with unguarded admission",{skip:!dsn},async()=>{
 const c=new DurablePgCoordinator(pool,{async assertAdmitted(){}},null,null,null);
 await assert.rejects(()=>c.create(run()),/AMA_M6_AGENT_EMERGENCY_SUSPENDED/);
});
test("M6: proposal without independently stored matching health is denied",{skip:!dsn},async()=>{
 await denied(()=>steward().prepareRelease({...proposal(),
   agentVersion:"2.0.0",targetVersion:"2.1.0",
   healthEvidenceRef:"UNKNOWN.HEALTH"}),"RELEASE_HEALTH_EVIDENCE_MISSING_OR_CORRUPT");
});
test("M6: high-severity incident blocks even preparation of upgrades",{skip:!dsn},async()=>{
 await pool.query("INSERT INTO ama_agent_versions(agent_id,agent_version,ama_version,definition,definition_sha256,source_commit,registered_by) VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7)",
  ["CI.M6.AGENT","4.0.0","0.1.0","{}","f".repeat(64),"CI","CI"]);
 await steward().emergencySuspend({...incident(),agentVersion:"4.0.0"});
 await denied(()=>steward().prepareRelease({...proposal(),agentVersion:"4.0.0",targetVersion:"4.1.0"}),
  "HIGH_SEVERITY_INCIDENT_PREVENTS_PROPOSAL");
});
test("M6: suspended agent cannot admit new runs or reclaim M4 leases",{skip:!dsn},async()=>{
 await pool.query("INSERT INTO ama_agent_versions(agent_id,agent_version,ama_version,definition,definition_sha256,source_commit,registered_by) VALUES ($1,$2,$3,$4::jsonb,$5,$6,$7)",
  ["CI.M6.AGENT","3.0.0","0.1.0","{}","f".repeat(64),"CI","CI"]);
 const i={...run(),agentVersion:"3.0.0"},independent={async assertAdmitted(){}};
 const guarded=new M6GuardedAdmission(pool,independent);
 const coord=new DurablePgCoordinator(pool,guarded,null,null,null);
 await coord.create(i);
 await steward().emergencySuspend({...incident(),agentVersion:"3.0.0"});
 await denied(()=>coord.create({...run(),agentVersion:"3.0.0"}),"AGENT_EMERGENCY_SUSPENDED");
 await denied(()=>coord.claim(i.runId,"worker",120),"AGENT_EMERGENCY_SUSPENDED");
 await denied(()=>new M6GuardedAdmission(pool,null).assertAdmitted(i),"INDEPENDENT_ADMISSION_NOT_BOUND");
 const n=(await pool.query("SELECT count(*)::int AS n FROM ama_m6_suspensions WHERE agent_id='CI.M6.AGENT' AND agent_version='3.0.0'")).rows[0].n;
 assert.equal(n,1);
 await assert.rejects(()=>pool.query("DELETE FROM ama_m6_suspensions WHERE agent_id='CI.M6.AGENT'"));
});
test("M6: duplicate emergency incident key cannot rewrite audit",{skip:!dsn},async()=>{
 const x=incident();
 await steward().emergencySuspend(x);
 await assert.rejects(()=>steward().emergencySuspend(x),/duplicate key/);
 await assert.rejects(()=>pool.query("DELETE FROM ama_m6_incidents WHERE incident_id=$1",[x.incidentId]));
});
