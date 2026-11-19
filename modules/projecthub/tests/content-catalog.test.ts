import test from "node:test";
import assert from "node:assert/strict";
import {
  listProjectContentFormats,getProjectContentFormat,assessContentRouting,PROJECT_CONTENT_IDS
} from "../src/content-catalog.ts";
import {METHODOLOGY_PROFILES} from "../../../packages/projecthub-model/src/index.ts";

test("seven separate content formats with microproject single-sourced",()=>{
  const items=listProjectContentFormats();
  assert.equal(items.length,7);
  assert.equal(new Set(items.map(x=>x.id)).size,items.length);
  assert.deepEqual(items.map(x=>x.id),[...PROJECT_CONTENT_IDS]);
  assert.equal(items.filter(x=>x.projectSize==="MIKRO").length,1);
  assert.equal(items.find(x=>x.projectSize==="MIKRO")?.id,"MICRO_D_MICROPROJECT");
  assert.ok(items.every(x=>x.sourceRepository==="Motherpher/form-flode"));
});

test("frågeställning, synopsis and idéram are sources only, not mandatory projects",()=>{
  for(const id of ["MICRO_A_QUESTION","MICRO_B_SYNOPSIS","MICRO_C_IDEA_FRAME"]){
    const result=assessContentRouting(id);
    assert.equal(result.state,"SOURCE_ONLY");
    assert.equal(result.createProject,false);
    assert.equal(result.createDna,false);
    assert.equal(result.requiresHumanReview,true);
  }
});

test("actual project content is candidate-only; never auto-admitted",()=>{
  for(const id of ["MICRO_D_MICROPROJECT","PROJECT_SMALL","PROJECT_MEDIUM","PROJECT_LARGE"]){
    const result=assessContentRouting(id);
    assert.equal(result.state,"CANDIDATE_FOR_PROJECT_INGRESS_REVIEW");
    assert.equal(result.createProject,false);
    assert.equal(result.createDna,false);
    assert.equal(result.methodologyImposed,false);
  }
});

test("unknown and unapproved content fails closed",()=>{
  assert.deepEqual(assessContentRouting("NOT_REGISTERED"),{
    state:"UNKNOWN_CONTENT",requiresHumanReview:true,createProject:false,createDna:false
  });
  assert.equal(getProjectContentFormat(""),null);
  assert.ok(listProjectContentFormats().every(x=>x.state==="DRAFT_TEXT"&&!x.publicDownloadAllowed));
});

test("content genres do not create fourth methodology or compulsory FFC",()=>{
  assert.deepEqual(METHODOLOGY_PROFILES,["FULL_FF","CONFIGURED","PROJECT_NATIVE"]);
  assert.ok(!METHODOLOGY_PROFILES.includes("MICRO_A_QUESTION" as any));
  assert.ok(listProjectContentFormats().every(x=>x.sourcePath.startsWith("15-innovation/project-content-kit/")));
});

test("catalog exposure returns defensive copies",()=>{
  const first=listProjectContentFormats()[0];
  (first as any).title="Changed locally";
  assert.equal(getProjectContentFormat("MICRO_A_QUESTION")?.title,"Frågeställning");
});
