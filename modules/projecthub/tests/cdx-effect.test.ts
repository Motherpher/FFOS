import test from "node:test";
import assert from "node:assert/strict";
import {FFOSCdxProjectHubPort} from "../../../integrations/cdx/projecthub-runtime.ts";
import {MemoryEffectEvidence,ProjectHubEffectGate} from "../src/effect-gate.ts";
import {ProjectHubInvariantError} from "../../../packages/projecthub-model/src/index.ts";

const ctx={principalRef:"FFOS:DIRECTOR",principalClass:"DIRECTOR" as const,authorityRef:"AUTH:D",
 mandateRef:"MANDATE:PH",idempotencyKey:"RUN1",correlationId:"C1",causationId:"K1"};

test("actual pinned CDX runtime allows a complete A3 authorization context",async()=>{
 const port=new FFOSCdxProjectHubPort();const receipt=await port.evaluateA3({context:ctx,projectId:"P1",
  operation:"PROJECT_MUTATE",resourceRef:"P1",localAuthorizationDecisionId:"LOCAL-1",
  dataMinimization:{personalDataPresent:false,redactedFields:[],rationale:"test"}});
 assert.ok(["ALLOW","ALLOW_WITH_CONTROLS"].includes(receipt.decision));
 assert.equal(receipt.policyVersion,"1.0.0");assert.ok(receipt.spetlReceiptRef);
});

test("CDX policy unavailable fails closed for A3",async()=>{
 const gate=new ProjectHubEffectGate(new FFOSCdxProjectHubPort("UNAVAILABLE"),new MemoryEffectEvidence());
 await assert.rejects(()=>gate.executeA3(ctx,{projectId:"P1",operation:"PROJECT_MUTATE",resourceRef:"P1",localAuthorizationDecisionId:"L"},async()=>true),
  (e:any)=>e instanceof ProjectHubInvariantError&&e.code==="PROJECTHUB_CDX_SECURITY_STOP");
});

test("unbound gate fails closed",async()=>{
 const gate=new ProjectHubEffectGate(null,null);
 await assert.rejects(()=>gate.executeA3(ctx,{projectId:"P1",operation:"PROJECT_MUTATE",resourceRef:"P1",localAuthorizationDecisionId:"L"},async()=>true),
  (e:any)=>e instanceof ProjectHubInvariantError&&e.code==="PROJECTHUB_CDX_EFFECT_GATE_NOT_BOUND");
});

test("A4 requires an explicit release decision and A5 cannot use generic execution",async()=>{
 const gate=new ProjectHubEffectGate(new FFOSCdxProjectHubPort(),new MemoryEffectEvidence());
 await assert.rejects(()=>gate.executeA4(ctx,{projectId:"P1",operation:"SEND",targetRef:"EXT",reversibilityClass:"IRREVERSIBLE",revocationCheckPassed:true},async()=>true),
  (e:any)=>e instanceof ProjectHubInvariantError&&e.code==="A4_REQUIRES_RELEASE_DECISION");
 assert.throws(()=>gate.executeA5(),(e:any)=>e instanceof ProjectHubInvariantError&&e.code==="A5_HUMAN_GOVERNANCE_REQUIRED");
});
