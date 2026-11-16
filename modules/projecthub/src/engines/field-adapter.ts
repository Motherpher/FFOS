export type FieldActorCard={id:string;role?:string;interest?:string;resource?:string;knowledge?:string;influence?:string;access?:string;trustLegitimacy?:string;dependency?:string;constraintConflict?:string;missionRelevance?:string};
const actorFields=["role","interest","resource","knowledge","influence","access","trustLegitimacy","dependency","constraintConflict","missionRelevance"] as const;
export function assessActorCards(cards:FieldActorCard[]){
 return {sourceProtocol:"FIELD_HELIX_ADAPTER",status:cards.length?(cards.some(c=>actorFields.some(f=>!c[f]))?"ATTENTION":"OK"):"UNKNOWN",
   cards:cards.map(c=>({id:c.id,missing:actorFields.filter(f=>!c[f])})),
   rule:"ProjectHub validates actor-system outputs; it does not infer a complete FIELD run from actor-card presence."};
}
export type StrategyKernelSnapshot={
 diagnosis?:{why?:string;where?:string;forWhom?:string;mechanism?:string;importanceNow?:string;competingExplanation?:string};
 guidingPolicy?:{diagnosisLinked?:boolean;choice?:string;concentration?:string;feasible?:boolean;exclusions?:string[];operationallyGenerative?:boolean};
 coherentActions?:Array<{owner?:string;targetRelationship?:string;mechanism?:string;dependencyRefs?:string[];measurementHook?:string;stopChangeCondition?:string}>;
};
export function assessStrategyKernel(s:StrategyKernelSnapshot){
 const missing:string[]=[];
 const d=s.diagnosis;if(!d)missing.push("DIAGNOSIS");else for(const k of ["why","where","forWhom","mechanism","importanceNow","competingExplanation"] as const)if(!d[k])missing.push("DIAGNOSIS."+k);
 const g=s.guidingPolicy;if(!g)missing.push("GUIDING_POLICY");else{
   if(g.diagnosisLinked!==true)missing.push("GUIDING_POLICY.diagnosisLinked");
   if(!g.choice)missing.push("GUIDING_POLICY.choice");if(!g.concentration)missing.push("GUIDING_POLICY.concentration");
   if(g.feasible!==true)missing.push("GUIDING_POLICY.feasible");if(!g.exclusions?.length)missing.push("GUIDING_POLICY.exclusions");
   if(g.operationallyGenerative!==true)missing.push("GUIDING_POLICY.operationallyGenerative");
 }
 if(!s.coherentActions?.length)missing.push("COHERENT_ACTIONS");
 else s.coherentActions.forEach((a,i)=>{for(const k of ["owner","targetRelationship","mechanism","measurementHook","stopChangeCondition"] as const)if(!a[k])missing.push(`ACTION[${i}].${k}`);});
 return {sourceProtocol:"FIELD_STRATEGY_KERNEL_ADAPTER",status:missing.length?"ATTENTION":"OK",missing,
   rule:"Diagnosis → Guiding Policy → Coherent Actions is validated as supplied FIELD output; ProjectHub does not generate or certify the full FIELD protocol run."};
}
