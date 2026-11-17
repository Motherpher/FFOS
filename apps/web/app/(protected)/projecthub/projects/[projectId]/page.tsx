import {notFound} from "next/navigation";
import {projectForUi,projectHubRuntimeStatus} from "../../../../../lib/projecthub/server";

const order=["UNKNOWN","SEED","DRAFT","DESIGNED","NORTH_STAR"] as const;
export default async function ProjectHubProjectPage({params}:{params:Promise<{projectId:string}>}){
  const runtime=projectHubRuntimeStatus();if(runtime.state!=="BOUND_CANDIDATE")return <section className="phNotice"><strong>ProjectHub runtime not bound.</strong><p>Project detail is unavailable until the configured canonical runtime is admitted.</p></section>;
  const {projectId}=await params;const data=await projectForUi(projectId);if(!data)notFound();
  const {project:p,events,steward}=data;const dims=Object.values(p.field);
  return <>
    <header className="topbar"><div><p className="eyebrow">{p.id} // {p.profile.methodologyProfile}</p><h1>{p.title}</h1></div>
      <div className="runtime">{p.status} · v{p.version}</div></header>
    <section className="phPulse">
      <div><span>Purpose</span><strong>{p.core.purpose}</strong></div>
      <div><span>Method profile</span><strong>{p.profile.methodologyProfile}</strong></div>
      <div><span>Data ceiling</span><strong>{p.profile.dataClassCeiling}</strong></div>
      <div><span>Unknown field</span><strong>{dims.filter(x=>x.maturity==="UNKNOWN").length}</strong></div>
    </section>
    <section className="panel"><div className="panelHead"><div><p className="eyebrow">PROJECT FIELD</p><h2>North Star field</h2></div><span className="badge">STATE, NOT SCORE</span></div>
      <div className="phFieldGrid">{dims.map(x=><article key={x.name} className="phFieldCell">
        <span>{x.name}</span><strong>{x.maturity}</strong><div className="phMaturity"><i style={{width:((order.indexOf(x.maturity)+1)/order.length*100)+"%"}} /></div>
        <small>{x.evidenceRefs.length} evidence refs</small>
      </article>)}</div></section>
    <section className="grid2">
      <article className="panel"><p className="eyebrow">STEWARD QUEUE</p><h2>{steward.length} proposals</h2>
        {steward.length?steward.slice(0,8).map(x=><div className="phTrace" key={x.proposalId}><b>{x.actionClass}</b><span>{x.title}</span><small>{x.requiredAuthority}</small></div>):<p>No current Steward proposals.</p>}</article>
      <article className="panel"><p className="eyebrow">TRACE</p><h2>{events.length} audit events</h2>
        {events.slice(-8).reverse().map(e=><div className="phTrace" key={e.eventId}><b>{e.eventType}</b><span>{new Date(e.occurredAt).toLocaleString()}</span><small>{e.principalRef}</small></div>)}</article>
    </section>
  </>;
}
