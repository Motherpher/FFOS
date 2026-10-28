import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {dirname,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {AgentStablePgRegistry} from "../src/stable-registry.ts";
import {AgentEffectGate} from "../src/effect-gate.ts";
import {PgEffectEvidenceWriter} from "../src/pg-evidence.ts";

const url=process.env.AMA_TEST_DATABASE_URL;
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../../..");
const now=()=>new Date().toISOString();
const agentId="FFOS.TEST.SQL";
const manifest={schema:"ffos.ama.agent-manifest/v1",agentId,name:"CI integration fixture",
  agentVersion:"1.0.0",amaVersion:"0.1.0",purpose:"Test PostgreSQL",
  runtimeClass:"REQUEST_RESPONSE",lifecycleState:"REGISTERED",
  mandate:{scope:["fixture"],nonGoals:["external production operations"]},
  authority:{governingAuthority:"DIRECTOR",authorityRefRequired:true,
    mandateRefRequired:true,selfApprovalProhibited:true},
  effectCeiling:"E1_INTERNAL_STATE",workflows:["INSPECT"],commands:[],capabilities:["OBSERVE"],
  statePolicy:{durableState:false,memoryMode:"NONE"},
  evidence:{runRecordRequired:true,failedRunRecordRequired:true},
  conformance:{profile:"CI",regressionRequired:true,authorityDenialTestsRequired:true}};
const bindings={schema:"ffos.ama.bindings/v1",commands:[],
  workflows:[{workflowId:"INSPECT",version:"1.0.0",agentId,
    purpose:"Inspect fixture",status:"ACTIVE",requiredCapabilities:["OBSERVE"],
    effectCeiling:"E1_INTERNAL_STATE",authorityRequirements:["DIRECTOR"],
    verification:["TEST"],evidenceRequirements:["AUDIT"],terminalStates:["PASS","HOLD"]}],
  capabilities:[{capabilityId:"OBSERVE",agentId,status:"ACTIVE",effectClass:"E1_INTERNAL_STATE"}]};
function director(version,fromState,toState,ref){
  return {eventId:"D-"+ref,agentId,agentVersion:version,fromState,toState,
    actorRef:"TEST.HUMAN.DIRECTOR",authorityRef:"TEST-DIRECTOR",mandateRef:"TEST-MANDATE",
    decisionRef:"TEST-DECISION-"+ref,reason:"Disposable CI test",policyRef:"CDX-TEST",
    evidenceRefs:["CI-ATTESTATION"],occurredAt:now()};
}
function report(version,ref){
  return {eventId:"R-"+ref,suiteVersion:"CI",evidenceRef:"CI-VERIFIED",checkedAt:now(),
    report:{contract:"ffos.ama.conformance-report/v1",status:"STATIC_PASS",
      agent_id:agentId,agent_version:version,findings:[]}};
}
test("PostgreSQL: versioned registry, Director transitions, audit, revocation",{skip:!url},async()=>{
  const {Pool}=await import("pg");
  const pool=new Pool({connectionString:url});
  try {
    for(const p of ["packages/registry/schema.sql",
      "packages/registry/migrations/0002_agent_stable.sql",
      "packages/registry/migrations/0003_agent_stable_hardening.sql"])
      await pool.query(await readFile(resolve(root,p),"utf8"));
    const reg=new AgentStablePgRegistry(pool,
      {async assertAuthorized(d){if(d.actorRef!=="TEST.HUMAN.DIRECTOR")throw Error("not Director");}},
      {async assertReady(d){if(!d.evidenceRefs.includes("CI-ATTESTATION"))throw Error("no readiness evidence");}},
      {async assertVerified(r){if(r.evidenceRef!=="CI-VERIFIED")throw Error("untrusted CI");}});
    await reg.registerCandidate(manifest,bindings,{sourceCommit:"CI-001",registeredBy:"CI",
      eventId:"REG-1",occurredAt:now()});
    assert.equal(await reg.getCurrent(agentId),null);
    await assert.rejects(()=>reg.registerCandidate(manifest,bindings,{sourceCommit:"CI-001",
      registeredBy:"CI",eventId:"REG-DUP",occurredAt:now()}));
    await reg.recordConformance(agentId,"1.0.0",report("1.0.0","v1"));
    for(const [from,to,ref] of [
      ["REGISTERED","VALIDATED","v1-valid"],
      ["VALIDATED","DEPLOYABLE","v1-deploy"],
      ["DEPLOYABLE","ACTIVE","v1-active"]])
      await reg.transition(director("1.0.0",from,to,ref));
    assert.equal((await reg.getCurrent(agentId)).manifest.agentVersion,"1.0.0");
    await reg.registerCandidate({...manifest,agentVersion:"1.0.1"},bindings,
      {sourceCommit:"CI-002",registeredBy:"CI",eventId:"REG-2",occurredAt:now()});
    assert.equal((await reg.getCurrent(agentId)).manifest.agentVersion,"1.0.0");
    await reg.recordConformance(agentId,"1.0.1",report("1.0.1","v2"));
    await reg.transition(director("1.0.1","REGISTERED","VALIDATED","v2-valid"));
    await reg.transition(director("1.0.1","VALIDATED","DEPLOYABLE","v2-deploy"));
    await assert.rejects(()=>reg.transition(director("1.0.1","DEPLOYABLE","ACTIVE","v2-block")),/Another agent version/);

    // Test doubles are not real CDX policy or human approval.
    const pin="7edbc47899af23b415114628469aca2970779ea1";
    const gate=new AgentEffectGate(reg,{async evaluate(req){return {
      outcome:"ALLOW",decisionRef:"MOCK-DECISION",policyPin:pin,
      spetlReceiptRef:"MOCK-SPETL",evaluatedTarget:req.target,
      evaluatedEffect:req.context.requestedEffect};}},
      {async assertNotRevoked(){}},new PgEffectEvidenceWriter(pool),pin,
      {async assertPinned(){}});
    const context={runId:"SQL-RUN",agentId,agentVersion:"1.0.0",amaVersion:"0.1.0",
      workflowId:"INSPECT",workflowVersion:"1.0.0",principalRef:"CI-HUMAN",
      authorityRef:"TEST-DIRECTOR",mandateRef:"TEST-MANDATE",
      requestedEffect:"E1_INTERNAL_STATE",targetScope:["fixture"],
      policyVersion:pin,inputRefs:[]};
    let calls=0;
    assert.equal(await gate.execute(context,"OBSERVE","fixture",async()=>{calls++;return "OK";}),"OK");
    assert.equal(calls,1);
    assert.equal((await pool.query("SELECT event_id FROM ama_effect_evidence_events WHERE run_id=$1",
      ["SQL-RUN"])).rows.length,2);
    await assert.rejects(()=>pool.query("DELETE FROM ama_effect_evidence_events WHERE run_id=$1",
      ["SQL-RUN"]),/append-only/);
    await reg.transition(director("1.0.0","ACTIVE","SUSPENDED","v1-suspend"));
    assert.equal(await reg.getCurrent(agentId),null);
    await reg.transition(director("1.0.1","DEPLOYABLE","ACTIVE","v2-active"));
    assert.equal((await reg.getCurrent(agentId)).manifest.agentVersion,"1.0.1");
    await assert.rejects(()=>reg.transition(director("1.0.1","DEPLOYABLE","ACTIVE","stale")),/Stale/);
  } finally {await pool.end();}
});
