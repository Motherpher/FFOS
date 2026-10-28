import test from "node:test";
import assert from "node:assert/strict";
import {AgentStablePgRegistry,StableRegistryError,contentDigest} from "../src/stable-registry.ts";
import {PgEffectEvidenceWriter} from "../src/pg-evidence.ts";
const m={schema:"ffos.ama.agent-manifest/v1",agentId:"CI.REG",agentVersion:"1.0.0",
  amaVersion:"0.1.0",lifecycleState:"REGISTERED"};
const b={schema:"ffos.ama.bindings/v1",workflows:[],commands:[],capabilities:[]};
const stamp="2026-10-29T01:00:00Z";
const p={sourceCommit:"CI",registeredBy:"HUMAN",eventId:"REG-1",occurredAt:stamp};
const d={eventId:"D1",agentId:"CI.REG",agentVersion:"1.0.0",fromState:"REGISTERED",
  toState:"VALIDATED",actorRef:"HUMAN",authorityRef:"DIRECTOR",mandateRef:"M",
  decisionRef:"D",reason:"CI",evidenceRefs:["CI"],occurredAt:stamp};
function pool(handler=async()=>({rows:[]})){
  const calls=[],state={releases:0,calls};
  return {state,pool:{async connect(){return {
    async query(sql,args){calls.push({sql,args});return handler(sql,args);},
    release(){state.releases++;}};}}};
}
const denied=(f,text)=>assert.rejects(f,e=>e instanceof StableRegistryError&&e.message.includes(text));
test("SHA256 stable over key order",()=>assert.equal(contentDigest({b:2,a:1}),contentDigest({a:1,b:2})));
test("registration commits candidate and REGISTERED only",async()=>{
  const s=pool();await new AgentStablePgRegistry(s.pool).registerCandidate(m,b,p);
  assert.ok(s.state.calls.some(x=>x.sql.includes("INSERT INTO ama_agent_versions")));
  assert.ok(s.state.calls.some(x=>x.sql.includes("'REGISTERED'")));
  assert.equal(s.state.calls.at(-1).sql,"COMMIT");
});
test("active manifest cannot bootstrap",async()=>{
  const s=pool();await denied(()=>new AgentStablePgRegistry(s.pool)
    .registerCandidate({...m,lifecycleState:"ACTIVE"},b,p),"Invalid candidate");
  assert.equal(s.state.calls.length,0);
});
test("transaction failure rolls back",async()=>{
  const s=pool(async sql=>{if(sql.includes("binding_versions"))throw Error("DB");return {rows:[]};});
  await assert.rejects(()=>new AgentStablePgRegistry(s.pool).registerCandidate(m,b,p),/DB/);
  assert.ok(s.state.calls.some(x=>x.sql==="ROLLBACK"));assert.equal(s.state.releases,1);
});
test("unknown current ACTIVE version resolves to null",async()=>{
  assert.equal(await new AgentStablePgRegistry(pool().pool).getCurrent("CI.REG"),null);
});
test("duplicate ACTIVE state fails closed",async()=>{
  await denied(()=>new AgentStablePgRegistry(pool(async()=>({rows:[{},{}]})).pool)
    .getCurrent("CI.REG"),"Multiple ACTIVE");
});
test("content digest mismatch fails closed",async()=>{
  const s=pool(async()=>({rows:[{definition:m,bindings:b,lifecycle_state:"ACTIVE",
    definition_sha256:"wrong",bindings_sha256:contentDigest(b)}]}));
  await denied(()=>new AgentStablePgRegistry(s.pool).getCurrent("CI.REG"),"digest mismatch");
});
test("valid current ACTIVE state retrieved",async()=>{
  const s=pool(async()=>({rows:[{definition:m,bindings:b,lifecycle_state:"ACTIVE",
    definition_sha256:contentDigest(m),bindings_sha256:contentDigest(b)}]}));
  assert.equal((await new AgentStablePgRegistry(s.pool).getCurrent("CI.REG")).lifecycleState,"ACTIVE");
});
test("missing Director verifier prevents lifecycle mutation",async()=>{
  const s=pool();await denied(()=>new AgentStablePgRegistry(s.pool).transition(d),"Director verifier");
  assert.equal(s.state.calls.length,0);
});
test("self approval prohibited",async()=>{
  const s=pool();await denied(()=>new AgentStablePgRegistry(s.pool,
    {async assertAuthorized(){}}).transition({...d,actorRef:"CI.REG"}),"self-approve");
});
test("no readiness gate prevents activation",async()=>{
  const s=pool();await denied(()=>new AgentStablePgRegistry(s.pool,
    {async assertAuthorized(){}}).transition({...d,fromState:"DEPLOYABLE",
      toState:"ACTIVE"}),"Runtime readiness");
});
test("no trusted CI provenance verifier denies report registration",async()=>{
  const s=pool();await denied(()=>new AgentStablePgRegistry(s.pool)
    .recordConformance("CI.REG","1.0.0",{eventId:"C1",suiteVersion:"CI",
      evidenceRef:"CI",checkedAt:stamp,report:{contract:"ffos.ama.conformance-report/v1",
        status:"STATIC_PASS",agent_id:"CI.REG",agent_version:"1.0.0",findings:[]}}),
    "Trusted conformance");
});
test("stale lifecycle transition rolls back without Director approval",async()=>{
  const s=pool();let called=0;await denied(()=>new AgentStablePgRegistry(s.pool,
    {async assertAuthorized(){called++;}}).transition(d),"Stale");
  assert.equal(called,0);assert.ok(s.state.calls.some(x=>x.sql==="ROLLBACK"));
});
test("SQL evidence writer uses append-only table",async()=>{
  const s=pool();const e={eventId:"E1",runId:"R",agentId:"CI.REG",agentVersion:"1.0.0",
    workflowId:"W",workflowVersion:"1.0.0",principalRef:"H",authorityRef:"D",mandateRef:"M",
    capabilityId:"C",target:"fixture",effect:"E1_INTERNAL_STATE",policyPin:"P",
    policyDecisionRef:"DEC",spetlReceiptRef:"RECEIPT",outcome:"ALLOW",stage:"PRE_EFFECT",detail:"test"};
  await new PgEffectEvidenceWriter(s.pool).append(e);
  assert.ok(s.state.calls[0].sql.includes("INSERT INTO ama_effect_evidence_events"));
  assert.equal(s.state.releases,1);
});
