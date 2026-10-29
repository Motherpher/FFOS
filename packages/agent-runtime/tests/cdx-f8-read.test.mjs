import test from "node:test";
import assert from "node:assert/strict";
import {CDXF8ReadGuard} from "../src/cdx-f8-read.ts";
import {F8BindingBlocked} from "../src/cdx-f8-policy.ts";
const PIN="sha256:"+"b".repeat(64);
const context={runId:"CI.READ.RUN",agentId:"CI.AGENT",principalRef:"P",
 authorityRef:"AUTH",mandateRef:"MANDATE",requestedEffect:"E0_OBSERVE",
 targetScope:["synthetic/resource"],policyVersion:PIN};
const access={recipientRef:"TRUSTED.RECIPIENT",purposeRef:"READ.DATA",
 grantRef:"EXTERNAL.GRANT",resource:"synthetic/resource",
 classification:"RESTRICTED"};
const denied=(fn,code)=>assert.rejects(fn,e=>e instanceof F8BindingBlocked&&e.code===code);
const fixture=()=>{
 const state={actions:0,stages:[],decision:"ALLOW",revoked:false,evidenceDown:false,
               invalidSignature:false,policyDown:false};
 const auth={
  async assertReadAdmitted(ctx,a){if(state.revoked)throw Error("read revoked");},
  async assertStillAdmitted(ctx,a){if(state.revoked)throw Error("read revoked");}
 };
 const policy={async evaluate(req){
  if(state.policyDown)throw Error("no policy");
  assert.equal(req.readRecipientRef,access.recipientRef);
  assert.equal(req.readPurposeRef,access.purposeRef);
  assert.equal(req.readGrantRef,access.grantRef);
  assert.equal(req.readClassification,access.classification);
  return {outcome:state.decision,policyPin:PIN,decisionRef:"TRUSTED.DECISION",
    spetlReceiptRef:"SPETL.REF",evaluatedTarget:access.resource,
    evaluatedEffect:"E0_OBSERVE",decisionAuthenticated:!state.invalidSignature,
    spetlReceiptVerified:true,obligationsVerified:true};
 }};
 const evidence={async append(r){if(state.evidenceDown)throw Error("ledger down");
   state.stages.push(r.stage);}};
 const read=async()=>{state.actions++;return {value:"sensitive test data"};};
 return {state,auth,policy,evidence,read,guard:()=>new CDXF8ReadGuard(policy,auth,evidence)};
};
test("F8 read: missing trusted providers never access data",async()=>{
 const f=fixture(),g=new CDXF8ReadGuard(null,f.auth,f.evidence);
 await denied(()=>g.read(context,"READ",access,f.read),"CLASSIFIED_READ_NOT_BOUND");
 assert.equal(f.state.actions,0);
});
test("F8 read: verified recipient and policy allow one classified read",async()=>{
 const f=fixture(),result=await f.guard().read(context,"READ",access,f.read);
 assert.equal(result.value,"sensitive test data");assert.equal(f.state.actions,1);
 assert.deepEqual(f.state.stages,["PRE_READ","POST_READ"]);
});
test("F8 read: restrictive decisions never load resource",async()=>{
 for(const outcome of ["DENY","REQUIRE_HUMAN","QUARANTINE","SECURITY_STOP","CONSTITUTIONAL_STOP"]){
  const f=fixture();f.state.decision=outcome;
  await denied(()=>f.guard().read(context,"READ",access,f.read),"CLASSIFIED_READ_POLICY_DENIED");
  assert.equal(f.state.actions,0);
 }
});
test("F8 read: unverified policy response cannot authorize",async()=>{
 const f=fixture();f.state.invalidSignature=true;
 await denied(()=>f.guard().read(context,"READ",access,f.read),"CLASSIFIED_READ_POLICY_DENIED");
 assert.equal(f.state.actions,0);
});
test("F8 read: revoked source denies before loading",async()=>{
 const f=fixture(),auth={
  async assertReadAdmitted(){},
  async assertStillAdmitted(){throw Error("revoke between decision and load");}
 };
 const g=new CDXF8ReadGuard(f.policy,auth,f.evidence);
 await assert.rejects(()=>g.read(context,"READ",access,f.read),/revoke between/);
 assert.equal(f.state.actions,0);
});
test("F8 read: unavailable policy or PRE evidence means no data access",async()=>{
 const f=fixture();f.state.policyDown=true;
 await assert.rejects(()=>f.guard().read(context,"READ",access,f.read),/no policy/);
 f.state.policyDown=false;f.state.evidenceDown=true;
 await assert.rejects(()=>f.guard().read(context,"READ",access,f.read),/ledger down/);
 assert.equal(f.state.actions,0);
});
test("F8 read: out-of-scope resource fails before evaluation",async()=>{
 const f=fixture();const a={...access,resource:"other"};
 await denied(()=>f.guard().read(context,"READ",a,f.read),"READ_OUTSIDE_RESOURCE_SCOPE");
});
test("F8 read: E2 cannot use E0-only read guard",async()=>{
 const f=fixture();
 await denied(()=>f.guard().read({...context,requestedEffect:"E2_REPOSITORY_CHANGE"},
   "READ",access,f.read),"INVALID_CLASSIFIED_READ_CONTEXT");
});
