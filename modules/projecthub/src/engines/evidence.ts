import type {ProjectFieldDimension,ProjectFieldDimensionName} from "../../../../packages/projecthub-model/src/index.ts";

export type EvidenceState="FACT"|"SUPPORTED_PREMISE"|"PLAUSIBLE_PREMISE"|"UNTESTED_PREMISE"|"CONTESTED_PREMISE"|"INVALIDATED_PREMISE"|"UNKNOWN";
export type EvidenceRecord={id:string;projectId:string;state:EvidenceState;updatedAt:string;provenanceRefs:string[];shareableWithProjects?:string[]};
const order={UNKNOWN:0,SEED:1,DRAFT:2,DESIGNED:3,NORTH_STAR:4} as const;
const critical=new Set<ProjectFieldDimensionName>(["Need","Evidence","Mechanism","Outcomes"]);

function evidenceUsable(projectId:string,id:string,all:Map<string,EvidenceRecord>,now:Date,maxAgeDays:number){
 const e=all.get(id);if(!e)return {ok:false,reason:"MISSING_EVIDENCE"};
 if(e.projectId!==projectId&&!e.shareableWithProjects?.includes(projectId))return {ok:false,reason:"EVIDENCE_OUTSIDE_PROJECT"};
 if(["INVALIDATED_PREMISE","UNKNOWN"].includes(e.state))return {ok:false,reason:"EVIDENCE_STATE_NOT_USABLE"};
 if(!e.provenanceRefs.length)return {ok:false,reason:"EVIDENCE_PROVENANCE_MISSING"};
 const age=(now.getTime()-new Date(e.updatedAt).getTime())/86400000;
 if(Number.isFinite(age)&&age>maxAgeDays)return {ok:false,reason:"EVIDENCE_STALE"};
 return {ok:true,reason:null};
}
export function assessNorthStar(projectId:string,field:Record<ProjectFieldDimensionName,ProjectFieldDimension>,evidence:EvidenceRecord[],
 opts?:{now?:Date;maxEvidenceAgeDays?:number;monitoringBlockers?:string[]}){
 const blockers:any[]=[];const conditions:any[]=[];const map=new Map(evidence.map(e=>[e.id,e]));
 for(const [name,row] of Object.entries(field) as [ProjectFieldDimensionName,ProjectFieldDimension][]){
   if((order as any)[row.maturity]<3)blockers.push({code:"DIMENSION_NOT_DESIGNED",dimension:name,maturity:row.maturity});
   if(critical.has(name)&&["DESIGNED","NORTH_STAR"].includes(row.maturity)){
     if(!row.evidenceRefs.length)blockers.push({code:"EVIDENCE_REQUIRED",dimension:name});
     for(const ref of row.evidenceRefs){const r=evidenceUsable(projectId,ref,map,opts?.now??new Date(),opts?.maxEvidenceAgeDays??180);if(!r.ok)blockers.push({code:r.reason,dimension:name,evidenceRef:ref});}
   }
 }
 for(const b of opts?.monitoringBlockers??[])conditions.push({code:"MONITORING_CONDITION",ref:b});
 const allNorth=Object.values(field).every(x=>x.maturity==="NORTH_STAR");
 return {state:blockers.length?"NOT_READY":allNorth&&!conditions.length?"NORTH_STAR":conditions.length?"NORTH_STAR_READY_WITH_CONDITIONS":"NORTH_STAR_READY",
   blockers,conditions,score:null};
}
