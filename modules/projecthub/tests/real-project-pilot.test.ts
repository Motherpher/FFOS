import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {PgProjectHubStore} from "../src/pg-store.ts";
import {GovernedProjectHubService} from "../src/governed-service.ts";
import {ProjectHubEffectGate,MemoryEffectEvidence} from "../src/effect-gate.ts";
import {FFOSCdxProjectHubPort} from "../../../integrations/cdx/projecthub-runtime.ts";
import {evaluateTimeline} from "../src/engines/timeline.ts";
import {evaluateFinance} from "../src/engines/finance.ts";
import {assessNorthStar} from "../src/engines/evidence.ts";
import {ProjectSteward} from "../src/project-steward.ts";

const url=process.env.PROJECTHUB_TEST_DATABASE_URL;
const root=resolve(dirname(fileURLToPath(import.meta.url)),"../../..");
let seq=0;
const ctx=(project:string)=>{const n=++seq;return {principalRef:"FFOS:DIRECTOR",principalClass:"DIRECTOR" as const,
 authorityRef:"FFOS-AUTH-PHASE0-DIRECTOR",mandateRef:"FFOS-DEVOPS-PH-RECON-001",
 idempotencyKey:`PILOT-${project}-${n}`,correlationId:`PILOT-C-${n}`,causationId:`PILOT-K-${n}`};};

test("PH-WP12: real RFSU FULL_FF and live ProjectHub PROJECT_NATIVE pilots",{skip:!url},async()=>{
 const {Pool}=await import("pg");const pool=new Pool({connectionString:url});
 try{
  await pool.query(await readFile(resolve(root,"packages/registry/migrations/0008_projecthub.sql"),"utf8"));
  const store=new PgProjectHubStore(pool);
  const gate=new ProjectHubEffectGate(new FFOSCdxProjectHubPort(),new MemoryEffectEvidence());
  const svc=new GovernedProjectHubService(store,gate);

  const rfsu=(await svc.createProject(ctx("RFSU"),{
    id:"PILOT-RFSU-2026",title:"RFSU — equitable adult SRHR care assignment",
    ownerRef:"FORM-FLODE",mandateRef:"Hybrismannen/RFSU-godex-FF:01-assignment/synopsis-v1.1.md",
    methodologyProfile:"FULL_FF",purpose:"Understand how three adult sexual-health services realise equitable care in practice and what can transfer.",
    scope:["three organisational cases","structural material","practice material","cross-case synthesis","recommendations"],
    nonScope:["national prevalence study","causal effect evaluation","representative national study"],
    dataClassCeiling:"PH-D2",optionalAssignmentDossierRef:"Hybrismannen/RFSU-godex-FF:01-assignment/synopsis-v1.1.md",
    optionalFfcRefs:["Hybrismannen/RFSU-godex-FF:01-assignment/DNA-box/FF-DNA-PRJ-RFSU-001-v0.3.md"],
    createdBy:"FFOS:DIRECTOR",provenance:[{kind:"DOCUMENT",ref:"Hybrismannen/RFSU-godex-FF:01-assignment/synopsis-v1.1.md",sourceSystem:"GITHUB",version:"1.1"}]
  })).result;
  assert.equal(rfsu.profile.methodologyProfile,"FULL_FF");
  assert.deepEqual(rfsu.profile.optionalPiusRefs,[]);

  for(let i=0;i<8;i++)await svc.addNode(ctx("RFSU"),"PILOT-RFSU-2026",{id:`RFSU-WP${i}`,kind:"WORK_PACKAGE",title:`WP${i}`});
  for(let i=0;i<7;i++)await svc.addRelation(ctx("RFSU"),"PILOT-RFSU-2026",{id:`RFSU-REL-${i}`,subjectId:`RFSU-WP${i}`,predicate:"PRECEDES",objectId:`RFSU-WP${i+1}`,scope:"OWNED"});

  const timeline=evaluateTimeline([
    {id:"WP0",title:"Mobilisation",state:"READY",durationDays:1},
    {id:"WP1",title:"Selection",state:"BLOCKED",durationDays:3,baselineEnd:"2026-10-04",forecastEnd:"2026-10-04"},
    {id:"WP2",title:"Structural material",state:"DRAFT",durationDays:4}
  ],[{before:"WP0",after:"WP1",kind:"PRECEDES"},{before:"WP1",after:"WP2",kind:"PRECEDES"}],"2026-11-16");
  assert.equal(timeline.status,"ATTENTION");
  assert.ok(timeline.signals.some(x=>x.code==="OVERDUE"));

  const finance=evaluateFinance([
    {kind:"BUDGET",amount:{currency:"SEK",minorUnits:12000000n}},
    {kind:"FORECAST",amount:{currency:"SEK",minorUnits:12000000n}}
  ]);
  assert.equal(finance.fundingGap,12000000n);
  assert.equal(finance.status,"ATTENTION");

  const field=rfsu.field;for(const k of Object.keys(field))field[k].maturity="DESIGNED";
  for(const k of ["Need","Evidence","Mechanism","Outcomes"])field[k].evidenceRefs=["RFSU-E1"];
  const broken=assessNorthStar("PILOT-RFSU-2026",field,[]);
  assert.equal(broken.state,"NOT_READY");
  const ready=assessNorthStar("PILOT-RFSU-2026",field,[{id:"RFSU-E1",projectId:"PILOT-RFSU-2026",state:"FACT",
    updatedAt:"2026-11-16T00:00:00Z",provenanceRefs:["RFSU-SYNOPSIS-1.1"]}],{now:new Date("2026-11-16T00:00:00Z")});
  assert.equal(ready.state,"NORTH_STAR_READY");

  const steward=new ProjectSteward();
  assert.throws(()=>steward.assertGenericExecutable({proposalId:"A5",projectId:"PILOT-RFSU-2026",actionClass:"A5",
    code:"REDESIGN",title:"Redesign core",reason:"pressure",targetRefs:["CORE"],state:"PROPOSED",requiredAuthority:"DIRECTOR"}),/A5_HUMAN/);

  const closed=(await svc.setStatus(ctx("RFSU"),"PILOT-RFSU-2026","COMPLETE")).result;
  assert.equal(closed.status,"COMPLETE");

  const native=(await svc.createProject(ctx("PH"),{
    id:"PILOT-PH-RECON-2026",title:"FFOS ProjectHub Reconstitution",
    ownerRef:"FFOS:DIRECTOR",mandateRef:"https://github.com/Motherpher/FFOS/issues/77",
    methodologyProfile:"PROJECT_NATIVE",purpose:"Reconstitute ProjectHub natively under FFOS DevOps Operating Model 1.1.",
    scope:["PLAN","DESIGN","BUILD","TEST","RELEASE","LEARN"],nonScope:["compulsory FFC","compulsory Pius"],
    dataClassCeiling:"PH-D2",externalMethodRefs:["FFOS-DEVOPS-OM-001@1.1"],createdBy:"FFOS:DIRECTOR",
    provenance:[{kind:"DOCUMENT",ref:"https://github.com/Motherpher/FFOS/issues/77",sourceSystem:"GITHUB"}]
  })).result;
  assert.equal(native.profile.methodologyProfile,"PROJECT_NATIVE");
  assert.deepEqual(native.profile.optionalFfcRefs,[]);
  assert.deepEqual(native.profile.optionalPiusRefs,[]);
  assert.equal(native.profile.optionalAssignmentDossierRef,undefined);
 } finally {await pool.end();}
});
