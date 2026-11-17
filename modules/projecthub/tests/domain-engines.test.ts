import test from "node:test";
import assert from "node:assert/strict";
import {evaluateTimeline} from "../src/engines/timeline.ts";
import {evaluateFinance} from "../src/engines/finance.ts";
import {assessFunding} from "../src/engines/funding.ts";
import {assessNorthStar} from "../src/engines/evidence.ts";
import {evaluateUdlSlice} from "../src/engines/udl-adapter.ts";
import {assessActorCards,assessStrategyKernel} from "../src/engines/field-adapter.ts";
import {makeEmptyField} from "../../../packages/projecthub-model/src/index.ts";

test("timeline reports dependencies, slippage and critical path",()=>{
 const r=evaluateTimeline([
  {id:"A",title:"A",state:"COMPLETE",durationDays:3},
  {id:"B",title:"B",state:"ACTIVE",durationDays:5,baselineEnd:"2026-11-10",forecastEnd:"2026-11-20"},
  {id:"C",title:"C",state:"ACTIVE",durationDays:1,forecastEnd:"2026-11-15"}
 ],[{before:"A",after:"B",kind:"DEPENDS_ON"},{before:"B",after:"C",kind:"DEPENDS_ON"}],"2026-11-16");
 assert.deepEqual(r.criticalPath,["A","B","C"]);assert.equal(r.status,"ATTENTION");
 assert.ok(r.signals.some(x=>x.code==="SCHEDULE_SLIPPAGE"));
});

test("finance refuses silent multi-currency aggregation",()=>{
 assert.throws(()=>evaluateFinance([{kind:"BUDGET",amount:{currency:"SEK",minorUnits:100n}},{kind:"ACTUAL",amount:{currency:"EUR",minorUnits:10n}}]),/MULTI_CURRENCY/);
 const r=evaluateFinance([{kind:"BUDGET",amount:{currency:"SEK",minorUnits:1000n}},{kind:"FUNDING_SECURED",amount:{currency:"SEK",minorUnits:300n}}]);
 assert.equal(r.fundingGap,700n);
});

test("funding uses hard eligibility and decomposed distortion, no universal score",()=>{
 const r=assessFunding({applicantType:"nonprofit",geographies:["Uppsala"],targetGroups:["youth"],domains:["participation"],requestedMinorUnits:400000n,currency:"SEK"},
  {id:"F",eligibleApplicantTypes:["nonprofit"],geographies:["Uppsala"],targetGroups:["youth"],domains:["participation"],maxMinorUnits:500000n,currency:"SEK",requiresMethodChange:true},"2026-11-16");
 assert.equal(r.eligibility,"PASS");assert.equal(r.fit.purpose,"FIT");assert.equal(r.universalScore,null);assert.ok(r.distortionRisks.includes("METHOD_DISTORTION"));
});

test("North Star validates actual evidence identity, scope, provenance and freshness",()=>{
 const f=makeEmptyField();for(const k of Object.keys(f)){f[k].maturity="DESIGNED";} 
 for(const k of ["Need","Evidence","Mechanism","Outcomes"] as const)f[k].evidenceRefs=["E1"];
 const bad=assessNorthStar("P1",f,[]);assert.equal(bad.state,"NOT_READY");assert.ok(bad.blockers.some(x=>x.code==="MISSING_EVIDENCE"));
 const good=assessNorthStar("P1",f,[{id:"E1",projectId:"P1",state:"FACT",updatedAt:"2026-11-15T00:00:00Z",provenanceRefs:["SRC"]}],{now:new Date("2026-11-16T00:00:00Z")});
 assert.equal(good.state,"NORTH_STAR_READY");assert.equal(good.score,null);
});

test("UDL adapter preserves denominator, small-N and non-causal semantics",()=>{
 const p=Array.from({length:4},(_,i)=>({id:"P"+i,segments:{group:"A"}}));
 const r=evaluateUdlSlice(p,[{participantId:"P0",doseRatio:.8}],[{participantId:"P0",level:"T1",positive:true}],{level:"T1"});
 assert.equal(r.cohortN,4);assert.equal(r.respondents,1);assert.equal(r.missing,3);assert.equal(r.disclosure,"SUPPRESSED");assert.equal(r.causalClaim,false);
});

test("FIELD adapters validate supplied actor/system and strategy-kernel structure without claiming full FIELD",()=>{
 const actors=assessActorCards([{id:"A",role:"partner"}]);assert.equal(actors.status,"ATTENTION");
 const k=assessStrategyKernel({diagnosis:{why:"x"}});assert.equal(k.status,"ATTENTION");assert.ok(k.missing.includes("GUIDING_POLICY"));
 assert.match(k.rule,/does not generate or certify the full FIELD/);
});
