export type Stratum="strategic"|"governance"|"design"|"delivery"|"economy_funding"|"learning_evidence";
export type Signal={stratum:Stratum;code:string;severity:"INFO"|"ATTENTION"|"BLOCKED";sourceRefs:string[]};
const rank={OK:0,UNKNOWN:1,ATTENTION:2,BLOCKED:3} as const;
export function aggregateMonitoring(input:{
 strategic?:Signal[];governance?:Signal[];design?:Signal[];delivery?:Signal[];economy_funding?:Signal[];learning_evidence?:Signal[];
}){
 const strata={} as Record<Stratum,{status:"OK"|"UNKNOWN"|"ATTENTION"|"BLOCKED";signals:Signal[]}>;
 for(const k of ["strategic","governance","design","delivery","economy_funding","learning_evidence"] as Stratum[]){
   const signals=input[k]??[];let status:"OK"|"UNKNOWN"|"ATTENTION"|"BLOCKED"=signals.length?"OK":"UNKNOWN";
   if(signals.some(x=>x.severity==="BLOCKED"))status="BLOCKED";else if(signals.some(x=>x.severity==="ATTENTION"))status="ATTENTION";
   strata[k]={status,signals};
 }
 const overall=(Object.values(strata).map(x=>x.status) as (keyof typeof rank)[]).reduce((a,b)=>rank[b]>rank[a]?b:a,"OK");
 return {status:overall,strata};
}
