import test from "node:test";
import assert from "node:assert/strict";
import {approveInbound,reviewInbound,stageOutbound} from "../src/linked-artifacts.ts";
const working={artifactId:"A1",projectId:"P1",system:"MIRO" as const,artifactType:"PROJECT_FIELD_MAP",externalRef:"miro:1",
 canonicality:"WORKING" as const,syncPolicy:"BIDIRECTIONAL_REVIEW" as const,sourceObjectRefs:["P1"],internalVersion:"1",provenance:[]};
test("working-surface inbound requires review, never direct mutation",async()=>{
 const r=await reviewInbound(working,{change:"actor added"});assert.equal(r.status,"REVIEW_REQUIRED");
 if(r.status==="REVIEW_REQUIRED"){const a=approveInbound(r.proposal,"DEC-1");assert.equal(a.externalWrite,false);assert.equal(a.providerCallExecuted,false);}
});
test("derived outbound only stages provider payload",async()=>{
 const a={...working,system:"FIGMA" as const,canonicality:"DERIVED" as const,syncPolicy:"PUSH_DERIVED" as const};
 const r=await stageOutbound(a,{project:"P1"});assert.equal(r.status,"STAGED_OUTBOUND");assert.equal(r.providerCallExecuted,false);
 const inbound=await reviewInbound(a,{edited:true});assert.equal(inbound.status,"REJECTED_INBOUND");
});
