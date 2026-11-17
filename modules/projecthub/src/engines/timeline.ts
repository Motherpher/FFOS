export type WorkState="DRAFT"|"READY"|"ACTIVE"|"HOLD"|"BLOCKED"|"COMPLETE"|"CANCELLED"|"ARCHIVED";
export type TimelineItem={id:string;title:string;state:WorkState;durationDays?:number;baselineEnd?:string;forecastEnd?:string};
export type TimelineDependency={before:string;after:string;kind:"DEPENDS_ON"|"BLOCKED_BY"|"PRECEDES"|"REQUIRES"};

const DONE=new Set<WorkState>(["COMPLETE","CANCELLED","ARCHIVED"]);
const d=(v?:string)=>v?new Date(v+"T00:00:00Z"):null;
const days=(a:Date,b:Date)=>Math.round((a.getTime()-b.getTime())/86400000);

export function evaluateTimeline(items:TimelineItem[],deps:TimelineDependency[],todayIso:string){
  const by=new Map(items.map(x=>[x.id,x]));const pred=new Map<string,Set<string>>();const succ=new Map<string,Set<string>>();
  for(const x of items){pred.set(x.id,new Set());succ.set(x.id,new Set());}
  for(const e of deps){
    if(!by.has(e.before)||!by.has(e.after))continue;
    pred.get(e.after)!.add(e.before);succ.get(e.before)!.add(e.after);
  }
  const indeg=new Map([...pred].map(([k,v])=>[k,v.size]));const q=[...indeg].filter(x=>x[1]===0).map(x=>x[0]).sort();const order:string[]=[];
  while(q.length){const n=q.shift()!;order.push(n);for(const m of [...succ.get(n)!].sort()){indeg.set(m,indeg.get(m)!-1);if(indeg.get(m)===0)q.push(m);}}
  const cycleNodes=items.map(x=>x.id).filter(x=>!order.includes(x));
  const longest=new Map(items.map(x=>[x.id,0]));const parent=new Map<string,string>();
  for(const n of order){const base=longest.get(n)!+(by.get(n)!.durationDays??0);for(const m of succ.get(n)!){if(base>longest.get(m)!){longest.set(m,base);parent.set(m,n);}}}
  let criticalPath:string[]=[];
  if(order.length){let end=order.reduce((a,b)=>(longest.get(a)!+(by.get(a)!.durationDays??0))>=(longest.get(b)!+(by.get(b)!.durationDays??0))?a:b);while(end){criticalPath.unshift(end);end=parent.get(end)!;}}
  const today=d(todayIso)!;const signals:any[]=[];
  const rows=items.map(x=>{
    const forecast=d(x.forecastEnd),baseline=d(x.baselineEnd);const overdue=!!forecast&&forecast<today&&!DONE.has(x.state);
    const slippageDays=forecast&&baseline?days(forecast,baseline):null;
    const blockers=[...pred.get(x.id)!].filter(p=>!DONE.has(by.get(p)!.state));
    if(overdue)signals.push({code:"OVERDUE",itemId:x.id,days:days(today,forecast!)});
    if(slippageDays!==null&&slippageDays>0)signals.push({code:"SCHEDULE_SLIPPAGE",itemId:x.id,days:slippageDays});
    if(blockers.length)signals.push({code:"DEPENDENCY_BLOCKED",itemId:x.id,blockers});
    return {...x,overdue,slippageDays,blockedBy:blockers};
  });
  return {status:cycleNodes.length?"BLOCKED":signals.length?"ATTENTION":items.length?"OK":"UNKNOWN",rows,cycleNodes,criticalPath,signals};
}
