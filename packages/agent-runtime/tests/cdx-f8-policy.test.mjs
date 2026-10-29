import test from "node:test";
import assert from "node:assert/strict";
import {CDXF8VerifiedAdapter,F8BindingBlocked,readF8ControlIndex}
  from "../src/cdx-f8-policy.ts";

const PIN="sha256:"+"b".repeat(64);
const SOURCE_BLOB="55dbcdac2f822b59a5a5f0f19eeadfa61d2c7ed0";
const matrixPath="integrations/cdx/f8/control-coverage.json";
const ctx={runId:"SYNTHETIC.RUN",agentId:"SYNTHETIC.AGENT",
  agentVersion:"1.0.0",workflowId:"SYNTHETIC.WORKFLOW",workflowVersion:"1.0.0",
  amaVersion:"0.1.0",principalRef:"PRINCIPAL",authorityRef:"AUTHORITY",
  mandateRef:"MANDATE",requestedEffect:"E2_REPOSITORY_CHANGE",
  targetScope:["synthetic"],inputRefs:[],policyVersion:PIN};
const request=(effect=ctx.requestedEffect)=>({context:{...ctx,requestedEffect:effect},
  target:"synthetic",capabilityId:"SYNTHETIC.CAPABILITY",expectedPolicyPin:PIN});
const facts=(r)=>({
  runId:r.context.runId,principalRef:r.context.principalRef,
  authorityRef:r.context.authorityRef,mandateRef:r.context.mandateRef,
  agentId:r.context.agentId,effectClass:r.context.requestedEffect,
  target:r.target,policyPin:r.expectedPolicyPin,dataClassification:"INTERNAL",
  sourceIdentityRef:"TRUSTED.SOURCE",sourceAttestationRef:"INDEPENDENT.FACTS",
  pathHistoryDigest:"sha256:"+"a".repeat(64),
  authorityGraphDigest:"sha256:"+"c".repeat(64),
  trustDomain:"HOST",observationRef:"SOURCE.OBSERVATION"
});
const deny=(work,code)=>assert.rejects(work,e=>e instanceof F8BindingBlocked&&e.code===code);
async function fixture(){
 const catalogue=await readF8ControlIndex(matrixPath,SOURCE_BLOB);
 const observed={surfaces:[],controlCounts:[],releaseChecks:0,factChecks:0,
                 signatureChecks:0,obligationChecks:0,custodyChecks:0};
 const state={releaseDown:false,factMismatch:false,trustDown:false,
  omitControl:false,selectControls:false,changedSurface:false,
  decisionContradiction:false,signatureDown:false,custodyDown:false,
  falseCustodyBinding:false,withObligations:false,obligationDown:false,
  outcome:"ALLOW",forceBadOutcome:false,missingPath:false};
 const ports={
  facts:{async collect(r){const f=facts(r);
    if(state.factMismatch)f.principalRef="OTHER";
    if(state.missingPath)f.pathHistoryDigest="";
    return f;
  }},
  trust:{
    async assertFacts(f){observed.factChecks++;if(state.trustDown)throw Error("fact attest unavailable");},
    async assertSignedDecision(r,d){observed.signatureChecks++;
      if(state.signatureDown)throw Error("signature revoked");
    }
  },
  release:{async assertReleasedAndBound(pin){observed.releaseChecks++;
    if(state.releaseDown)throw Error("CDX PRE_RELEASE");
  }},
  service:{async evaluateSurface(r){
    observed.surfaces.push(r.surface);
    observed.controlCounts.push(r.controlIds.length);
    const entries=catalogue.bySurface.get(r.surface);
    const ids=state.selectControls?r.controlIds.slice(0,1):r.controlIds;
    let controls=ids.map(id=>{
      const c=entries.find(c=>c.control_id===id);
      return {control_id:id,section_id:c.section_id,pass:true,decision:"ALLOW"};
    });
    if(state.omitControl)controls.pop();
    if(state.outcome!=="ALLOW"){
      const control=controls[0],idx=entries.findIndex(c=>c.control_id===control.control_id);
      if(state.outcome==="ALLOW_WITH_CONTROLS"){
        // Canonical 1.0 reference controls fail DENY; this synthetic branch is
        // used only with a separately supplied alternative test catalogue.
        control.pass=false;control.decision="ALLOW_WITH_CONTROLS";
      }else{control.pass=false;control.decision=state.outcome;}
    }
    if(state.decisionContradiction)controls[0].pass=false;
    return {
      surface:state.changedSurface?"EXTERNAL_EFFECT":r.surface,
      contextDigest:r.contextDigest,policyDigest:r.policyDigest,
      policyVersion:"1.0.0",decision:state.forceBadOutcome?"ALLOW":state.outcome,
      decisionRef:"POLICY."+r.surface,signatureRef:"VERIFIED.SIGNATURE",
      controlResults:controls,obligationRefs:state.withObligations?["REVIEWED.CONTROL"]:[]
    };
  }},
  obligations:{async assertFulfilled(refs,f){observed.obligationChecks++;
    if(state.obligationDown)throw Error("control not met");
  }},
  custody:{async assertPreserved(f,decisions){observed.custodyChecks++;
    if(state.custodyDown)throw Error("custody offline");
    return {receiptRef:"SPETL.CUSTODY.RECEIPT",custodyRef:"CUSTODIAN",
      runId:state.falseCustodyBinding?"OTHER":f.runId,policyDigest:f.policyPin};
  }}
 };
 const make=(cat=catalogue)=>new CDXF8VerifiedAdapter(cat,ports.facts,
   ports.trust,ports.release,ports.service,ports.obligations,ports.custody);
 return {catalogue,state,observed,ports,make};
}
test("F8.1: full 131/69 source matrix is coherent",async()=>{
 const index=await readF8ControlIndex(matrixPath,SOURCE_BLOB);
 const all=[...index.bySurface.values()].flat();
 assert.equal(all.length,69);
 assert.equal(new Set(all.map(x=>x.control_id)).size,69);
 assert(all.every(x=>x.section_id.startsWith("CDX-LAW-001-")));
 await deny(()=>readF8ControlIndex(matrixPath,"0".repeat(40)),"CONTROL_COVERAGE_SOURCE_INVALID");
});
test("F8.2: no trusted ports means no policy evaluation",async()=>{
 const f=await fixture();
 const adapter=new CDXF8VerifiedAdapter(f.catalogue,null,null,null,null,null,null);
 await deny(()=>adapter.evaluate(request()),"TRUSTED_PORTS_NOT_BOUND");
});
test("F8.7: pinned commit is invalid production policy identity",async()=>{
 const f=await fixture();const r=request();
 r.expectedPolicyPin="7edbc47899af23b415114628469aca2970779ea1";
 await deny(()=>f.make().evaluate(r),"PRODUCTION_POLICY_DIGEST_REQUIRED");
});
test("F8: declared release outage fails closed before policy",async()=>{
 const f=await fixture();f.state.releaseDown=true;
 await assert.rejects(()=>f.make().evaluate(request()),/CDX PRE_RELEASE/);
 assert.equal(f.observed.surfaces.length,0);
});
test("F8.2+F8.4: mismatched identity and missing path history blocked",async()=>{
 const f=await fixture();f.state.factMismatch=true;
 await deny(()=>f.make().evaluate(request()),"TRUSTED_FACT_BINDING_MISMATCH");
 f.state.factMismatch=false;f.state.missingPath=true;
 await deny(()=>f.make().evaluate(request()),"TRUSTED_FACT_BINDING_MISMATCH");
});
test("F8.2: independent fact attestation outage fails closed",async()=>{
 const f=await fixture();f.state.trustDown=true;
 await assert.rejects(()=>f.make().evaluate(request()),/fact attest unavailable/);
});
test("F8.3: all mandated controls per surface, without caller-selected filters",async()=>{
 const f=await fixture(),d=await f.make().evaluate(request());
 assert.equal(d.outcome,"ALLOW");assert.equal(d.decisionAuthenticated,true);
 assert.equal(d.spetlReceiptVerified,true);
 assert.equal(f.observed.surfaces.length,8);
 const expected=f.observed.surfaces.map(s=>f.catalogue.bySurface.get(s).length);
 assert.deepEqual(f.observed.controlCounts,expected);
 assert.equal(f.observed.signatureChecks,8);
 assert.equal(f.observed.custodyChecks,1);
});
test("F8.3: E3 always includes EXTERNAL_EFFECT surface",async()=>{
 const f=await fixture();
 const d=await f.make().evaluate(request("E3_EXTERNAL_EFFECT"));
 assert.equal(d.outcome,"ALLOW");
 assert.equal(f.observed.surfaces.includes("EXTERNAL_EFFECT"),true);
});
test("F8.3: omitted or cherry-picked control fails closed",async()=>{
 const f=await fixture();f.state.omitControl=true;
 await deny(()=>f.make().evaluate(request()),"INCOMPLETE_OR_DOWNGRADED_CONTROL_EVALUATION");
 f.state.omitControl=false;f.state.selectControls=true;
 await deny(()=>f.make().evaluate(request()),"INCOMPLETE_OR_DOWNGRADED_CONTROL_EVALUATION");
});
test("F8.3: surface substitution fails before effect",async()=>{
 const f=await fixture();f.state.changedSurface=true;
 await deny(()=>f.make().evaluate(request()),"POLICY_RESULT_UNBOUND");
});
test("F8.3: inconsistent pass/decision fails closed",async()=>{
 const f=await fixture();f.state.decisionContradiction=true;
 await deny(()=>f.make().evaluate(request()),"CONTROL_DECISION_CONTRADICTION");
});
test("F8.5: policy signature and SPETL custody outages fail closed",async()=>{
 const f=await fixture();f.state.signatureDown=true;
 await assert.rejects(()=>f.make().evaluate(request()),/signature revoked/);
 f.state.signatureDown=false;f.state.custodyDown=true;
 await assert.rejects(()=>f.make().evaluate(request()),/custody offline/);
 f.state.custodyDown=false;f.state.falseCustodyBinding=true;
 await deny(()=>f.make().evaluate(request()),"SPETL_CUSTODY_UNVERIFIED");
});
test("F8.3: DENY outcome cannot downgrade to ALLOW",async()=>{
 const f=await fixture();f.state.outcome="DENY";
 const d=await f.make().evaluate(request());
 assert.equal(d.outcome,"DENY");
 f.state.forceBadOutcome=true;
 await deny(()=>f.make().evaluate(request()),"INCOMPLETE_OR_DOWNGRADED_CONTROL_EVALUATION");
});
test("F8.3: E0 read and E4 authority mutation have independent gates",async()=>{
 const f=await fixture();
 await deny(()=>f.make().evaluate(request("E0_OBSERVE")),"SEPARATE_READ_OR_AUTHORITY_GATE_REQUIRED");
 await deny(()=>f.make().evaluate(request("E4_AUTHORITY_CHANGE")),"SEPARATE_READ_OR_AUTHORITY_GATE_REQUIRED");
});
