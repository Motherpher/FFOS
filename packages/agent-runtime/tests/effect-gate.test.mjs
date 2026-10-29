import test from "node:test";
import assert from "node:assert/strict";
import {AgentEffectGate,EffectDenied} from "../src/effect-gate.ts";
const PIN="7edbc47899af23b415114628469aca2970779ea1";
function fixture(){
  const manifest={schema:"ffos.ama.agent-manifest/v1",agentId:"CI.AGENT",
    agentVersion:"1.0.0",amaVersion:"0.1.0",lifecycleState:"ACTIVE",
    mandate:{scope:["fixture"]},effectCeiling:"E2_REPOSITORY_CHANGE",
    authority:{authorityRefRequired:true,mandateRefRequired:true},
    workflows:["W"],capabilities:["C"]};
  const bindings={workflows:[{workflowId:"W",version:"1.0.0",agentId:"CI.AGENT",
    status:"ACTIVE",requiredCapabilities:["C"],effectCeiling:"E2_REPOSITORY_CHANGE"}],
    capabilities:[{capabilityId:"C",agentId:"CI.AGENT",status:"ACTIVE",
      effectClass:"E2_REPOSITORY_CHANGE"}]};
  const ctx={runId:"CI-R",agentId:"CI.AGENT",agentVersion:"1.0.0",
    amaVersion:"0.1.0",workflowId:"W",workflowVersion:"1.0.0",
    principalRef:"CI-HUMAN",authorityRef:"DIR",mandateRef:"M",
    requestedEffect:"E2_REPOSITORY_CHANGE",targetScope:["fixture"],
    policyVersion:PIN,inputRefs:[]};
  const s={performed:0,records:[],revocationCalls:0,revoked:false,
    inactive:false,failEvidence:false,failAfter:false};
  const reader={async getCurrent(){return s.inactive?null:{manifest,bindings,lifecycleState:"ACTIVE"};}};
  const policy={async evaluate(r){return {outcome:"ALLOW",decisionRef:"MOCK-DEC",
    policyPin:PIN,spetlReceiptRef:"MOCK-RECEIPT",
    decisionAuthenticated:true,spetlReceiptVerified:true,
    evaluatedTarget:r.target,evaluatedEffect:r.context.requestedEffect};}};
  const revoked={async assertNotRevoked(){
    s.revocationCalls++;if(s.revoked||(s.failAfter&&s.revocationCalls>1))throw Error("revoked");}};
  const audit={async append(e){if(s.failEvidence)throw Error("db offline");s.records.push(e);}};
  const anchor={async assertPinned(pin){if(pin!==PIN)throw Error("bad pin");}};
  const gate=(p=policy,a=audit,r=revoked,h=anchor)=>new AgentEffectGate(reader,p,r,a,PIN,h);
  const effect=async()=>{s.performed++;return "ok";};
  return {manifest,bindings,ctx,s,policy,gate,revoked,audit,anchor,effect};
}
const denied=(f,code)=>assert.rejects(f,e=>e instanceof EffectDenied&&e.code===code);
test("allowed callback executes once with durable pre/post evidence",async()=>{
  const f=fixture();assert.equal(await f.gate().execute(f.ctx,"C","fixture",f.effect),"ok");
  assert.equal(f.s.performed,1);assert.deepEqual(f.s.records.map(e=>e.stage),["PRE_EFFECT","POST_EFFECT"]);
});
test("without CDX adapter no effect",async()=>{
  const f=fixture();await denied(()=>f.gate(null).execute(f.ctx,"C","fixture",f.effect),"ENFORCEMENT_NOT_BOUND");
  assert.equal(f.s.performed,0);
});
test("without anchor no effect",async()=>{
  const f=fixture();await denied(()=>f.gate(f.policy,f.audit,f.revoked,null).execute(f.ctx,"C","fixture",f.effect),"ENFORCEMENT_NOT_BOUND");
});
test("policy pin mismatch",async()=>{
  const f=fixture();f.ctx.policyVersion="incorrect";
  await denied(()=>f.gate().execute(f.ctx,"C","fixture",f.effect),"POLICY_PIN_MISMATCH");
});
test("inactive agent",async()=>{
  const f=fixture();f.s.inactive=true;
  await denied(()=>f.gate().execute(f.ctx,"C","fixture",f.effect),"INACTIVE_AGENT");
});
test("workflow version must resolve exactly",async()=>{
  const f=fixture();f.ctx.workflowVersion="2.0.0";
  await denied(()=>f.gate().execute(f.ctx,"C","fixture",f.effect),"WORKFLOW_NOT_ADMITTED");
});
test("missing capability",async()=>{
  const f=fixture();await denied(()=>f.gate().execute(f.ctx,"ROOT","fixture",f.effect),"CAPABILITY_NOT_ADMITTED");
});
test("mandate target scope bounded",async()=>{
  const f=fixture();await denied(()=>f.gate().execute(f.ctx,"C","other",f.effect),"OUTSIDE_MANDATE");
});
test("effect ceiling cannot be bypassed",async()=>{
  const f=fixture();f.bindings.workflows[0].effectCeiling="E0_OBSERVE";
  await denied(()=>f.gate().execute(f.ctx,"C","fixture",f.effect),"EFFECT_CEILING");
});
test("E4 authority mutation denied in this gate",async()=>{
  const f=fixture();f.manifest.effectCeiling="E4_AUTHORITY_CHANGE";
  f.bindings.workflows[0].effectCeiling="E4_AUTHORITY_CHANGE";
  f.bindings.capabilities[0].effectClass="E4_AUTHORITY_CHANGE";
  f.ctx.requestedEffect="E4_AUTHORITY_CHANGE";
  await denied(()=>f.gate().execute(f.ctx,"C","fixture",f.effect),"AUTHORITY_CHANGE_REQUIRES_SEPARATE_GATE");
});
test("revoked or unavailable authority denied",async()=>{
  const f=fixture();f.s.revoked=true;
  await denied(()=>f.gate().execute(f.ctx,"C","fixture",f.effect),"REVOKED_OR_UNAVAILABLE");
  assert.equal(f.s.performed,0);
});
test("late revocation before effect denied",async()=>{
  const f=fixture();f.s.failAfter=true;
  await denied(()=>f.gate().execute(f.ctx,"C","fixture",f.effect),"REVOKED_BEFORE_EFFECT");
  assert.equal(f.s.performed,0);
});
test("unavailable policy fails closed",async()=>{
  const f=fixture();await denied(()=>f.gate({async evaluate(){throw Error("offline");}})
    .execute(f.ctx,"C","fixture",f.effect),"CDX_UNAVAILABLE");
});
test("CDX deny audited, effect not invoked",async()=>{
  const f=fixture();const p={async evaluate(r){return {...await f.policy.evaluate(r),outcome:"DENY"};}};
  await denied(()=>f.gate(p).execute(f.ctx,"C","fixture",f.effect),"CDX_DENY");
  assert.equal(f.s.performed,0);assert.equal(f.s.records[0].stage,"BLOCKED");
});
test("invalid SPETL reference denied",async()=>{
  const f=fixture();const p={async evaluate(r){return {...await f.policy.evaluate(r),spetlReceiptRef:""};}};
  await denied(()=>f.gate(p).execute(f.ctx,"C","fixture",f.effect),"INVALID_CDX_DECISION");
});
test("evidence unavailable prevents effect",async()=>{
  const f=fixture();f.s.failEvidence=true;
  await denied(()=>f.gate().execute(f.ctx,"C","fixture",f.effect),"EVIDENCE_UNAVAILABLE");
  assert.equal(f.s.performed,0);
});
test("disabled optional module denied",async()=>{
  const f=fixture();f.bindings.capabilities[0].moduleId="external";
  await denied(()=>f.gate().execute(f.ctx,"C","fixture",f.effect),"DISABLED_MODULE");
});
test("failed effect leaves reconciliation HOLD record",async()=>{
  const f=fixture();await assert.rejects(()=>f.gate().execute(f.ctx,"C","fixture",async()=>{throw Error("unknown result");}),/unknown result/);
  assert.deepEqual(f.s.records.map(e=>e.outcome),["ALLOW","ALLOW"]);
  assert.equal(f.s.records[1].detail,"Effect uncertain; reconcile");
});
test("post-effect journal failure requires reconciliation",async()=>{
  const f=fixture();let n=0;const a={async append(e){if(++n===2)throw Error("offline");f.s.records.push(e);}};
  await denied(()=>f.gate(f.policy,a).execute(f.ctx,"C","fixture",f.effect),
    "POST_EFFECT_EVIDENCE_UNAVAILABLE_RECONCILE");
  assert.equal(f.s.performed,1);
});

test("seven-way CDX restrictive outcomes remain separate and block callback",async()=>{
 for(const outcome of ["REQUIRE_HUMAN","QUARANTINE","DENY","SECURITY_STOP","CONSTITUTIONAL_STOP"]){
   const f=fixture();const p={async evaluate(r){return {...await f.policy.evaluate(r),outcome};}};
   await denied(()=>f.gate(p).execute(f.ctx,"C","fixture",f.effect),"CDX_"+outcome);
   assert.equal(f.s.performed,0);
   assert.equal(f.s.records[0].outcome,outcome);
   assert.equal(f.s.records[0].stage,"BLOCKED");
 }
});
test("ALLOW_WITH_CONTROLS needs separately verified obligations",async()=>{
 const f=fixture();
 const p={async evaluate(r){return {...await f.policy.evaluate(r),outcome:"ALLOW_WITH_CONTROLS"};}};
 await denied(()=>f.gate(p).execute(f.ctx,"C","fixture",f.effect),
   "CDX_DECISION_OR_OBLIGATIONS_NOT_VERIFIED");
 assert.equal(f.s.performed,0);
 const g=fixture();const approved={async evaluate(r){return {...await g.policy.evaluate(r),
   outcome:"ALLOW_WITH_CONTROLS",obligationsVerified:true};}};
 assert.equal(await g.gate(approved).execute(g.ctx,"C","fixture",g.effect),"ok");
 assert.equal(g.s.records[0].outcome,"ALLOW_WITH_CONTROLS");
});
test("unverified permissive decision or SPETL custody cannot dispatch",async()=>{
 for(const missing of ["decisionAuthenticated","spetlReceiptVerified"]){
  const f=fixture(),p={async evaluate(r){const v={...await f.policy.evaluate(r)};
   delete v[missing];return v;}};
  await denied(()=>f.gate(p).execute(f.ctx,"C","fixture",f.effect),
    "CDX_DECISION_OR_OBLIGATIONS_NOT_VERIFIED");
  assert.equal(f.s.performed,0);
 }
});
