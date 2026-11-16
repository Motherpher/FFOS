import test from "node:test";
import assert from "node:assert/strict";
import {MemoryProjectHubStore,ProjectHubService} from "../src/index.ts";
import {PROJECT_FIELD_DIMENSIONS,ProjectHubInvariantError} from "../../../packages/projecthub-model/src/index.ts";

const base=(id="P1")=>({
  id,title:"Independent project",ownerRef:"OWNER:1",mandateRef:"MANDATE:1",
  methodologyProfile:"PROJECT_NATIVE" as const,purpose:"Produce the intended project outcome",
  createdBy:"DIRECTOR"
});

test("PROJECT_NATIVE creates with zero FFC or Pius dependency",async()=>{
  const svc=new ProjectHubService(new MemoryProjectHubStore());
  const p=await svc.createProject(base());
  assert.equal(p.profile.methodologyProfile,"PROJECT_NATIVE");
  assert.deepEqual(p.profile.optionalFfcRefs,[]);
  assert.deepEqual(p.profile.optionalPiusRefs,[]);
  assert.equal(Object.keys(p.field).length,8);
  for(const d of PROJECT_FIELD_DIMENSIONS)assert.equal(p.field[d].maturity,"UNKNOWN");
});

test("FULL_FF does not imply compulsory Pius",async()=>{
  const svc=new ProjectHubService(new MemoryProjectHubStore());
  const p=await svc.createProject({...base(),methodologyProfile:"FULL_FF" as const,
    optionalAssignmentDossierRef:"FFC:DOSSIER:1"});
  assert.equal(p.profile.optionalAssignmentDossierRef,"FFC:DOSSIER:1");
  assert.deepEqual(p.profile.optionalPiusRefs,[]);
});

test("CONFIGURED requires explicit method selection",async()=>{
  const svc=new ProjectHubService(new MemoryProjectHubStore());
  await assert.rejects(()=>svc.createProject({...base(),methodologyProfile:"CONFIGURED" as const}),
    (e:any)=>e instanceof ProjectHubInvariantError&&e.code==="CONFIGURED_REQUIRES_SELECTED_METHODS");
});

test("field mutation is versioned and does not invent evidence",async()=>{
  const svc=new ProjectHubService(new MemoryProjectHubStore());
  await svc.createProject(base());
  const p=await svc.setField("P1","Need","DESIGNED",{note:"Need mapped",evidenceRefs:["E1"]});
  assert.equal(p.version,2);
  assert.equal(p.field.Need.version,2);
  assert.equal(p.field.Need.maturity,"DESIGNED");
  assert.deepEqual(p.field.Need.evidenceRefs,["E1"]);
  assert.deepEqual(p.field.Purpose.evidenceRefs,[]);
});

test("OWNED relation cannot cross project boundary",async()=>{
  const store=new MemoryProjectHubStore();const svc=new ProjectHubService(store);
  await svc.createProject(base("P1"));await svc.createProject(base("P2"));
  await svc.addNode("P1",{id:"N1",kind:"WORK_PACKAGE",title:"One"});
  await svc.addNode("P2",{id:"N2",kind:"ACTOR",title:"Shared-looking"});
  await assert.rejects(()=>svc.addRelation("P1",{subjectId:"N1",predicate:"DEPENDS_ON",objectId:"N2",scope:"OWNED"}),
    (e:any)=>e instanceof ProjectHubInvariantError&&e.code==="OWNED_TARGET_OUTSIDE_PROJECT");
});

test("SHARED_REFERENCE can point outward but does not import target graph",async()=>{
  const store=new MemoryProjectHubStore();const svc=new ProjectHubService(store);
  await svc.createProject(base("P1"));await svc.createProject(base("P2"));
  await svc.addNode("P1",{id:"N1",kind:"EVIDENCE_LINK",title:"Reference"});
  await svc.addNode("P2",{id:"N2",kind:"EVIDENCE",title:"Shared source"});
  await svc.addRelation("P1",{subjectId:"N1",predicate:"REFERENCES",objectId:"N2",scope:"SHARED_REFERENCE"});
  const g=await svc.graph("P1");
  assert.deepEqual(g.nodes.map(x=>x.id),["N1"]);
  assert.equal(g.relations[0].objectId,"N2");
});
