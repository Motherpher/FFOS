import test from "node:test";
import assert from "node:assert/strict";
import {ProjectSteward} from "../src/project-steward.ts";

test("Steward proposes analysis/recovery but does not silently execute authority",()=>{
 const s=new ProjectSteward();
 const rows=s.propose({projectId:"P1",unknownDimensions:["Evidence"],monitoring:{delivery:{status:"BLOCKED"}},openDecisionRefs:["D1"]});
 assert.ok(rows.some(x=>x.actionClass==="A1"&&x.code==="RESOLVE_FIELD_UNKNOWN"));
 assert.ok(rows.some(x=>x.actionClass==="A2"&&x.code==="PREPARE_STRATUM_RECOVERY"));
 assert.ok(rows.every(x=>!["A4","A5"].includes(x.actionClass)));
});
test("A4/A5 are separate authority paths",()=>{
 const s=new ProjectSteward();
 const a4={proposalId:"X",projectId:"P1",actionClass:"A4" as const,code:"SEND",title:"Send",reason:"x",targetRefs:["EXT"],state:"PROPOSED" as const,requiredAuthority:"EXTERNAL_ACTION" as const};
 assert.throws(()=>s.assertGenericExecutable(a4),/A4_REQUIRES/);
 const a5={...a4,actionClass:"A5" as const};assert.throws(()=>s.assertGenericExecutable(a5),/A5_HUMAN/);
});
