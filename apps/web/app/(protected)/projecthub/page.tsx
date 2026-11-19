import Link from "next/link";
import {listProjectsForUi,projectHubRuntimeStatus} from "../../../lib/projecthub/server";

export default async function ProjectHubPage(){
  const runtime=projectHubRuntimeStatus();
  const projects=runtime.state==="READ_CANDIDATE"?await listProjectsForUi().catch(()=>[]):[];
  return <>
    <header className="topbar"><div><p className="eyebrow">FFOS // PROJECT OPERATING SYSTEM</p><h1>ProjectHub</h1></div>
      <div className="runtime">{runtime.state} · {runtime.release}</div></header>
    {runtime.state!=="READ_CANDIDATE"&&<section className="phNotice"><strong>ProjectHub runtime is not bound.</strong>
      <p>ProjectHub requires a separately verified scoped database identity, a Director session, and explicit read enablement. Portfolio enumeration and mutations remain disabled. No mock project state is substituted.</p>
      <div className="phRuntimeGrid"><span>Database: {runtime.database?"configured":"not configured"}</span>
        <span>Authority: {runtime.authority?"configured":"not configured"}</span><span>Writes: {runtime.writes?"enabled":"disabled"}</span></div>
    </section>}
    <section className="phHeroGrid">
      <article className="phHero"><p className="eyebrow">PORTFOLIO</p><strong>{projects.length}</strong><span>governed projects visible</span></article>
      <article className="phHero"><p className="eyebrow">METHOD</p><strong>3</strong><span>FULL_FF · CONFIGURED · PROJECT_NATIVE</span></article>
      <article className="phHero"><p className="eyebrow">EFFECT BOUNDARY</p><strong>A0–A5</strong><span>bounded Steward / CDX mediation</span></article>
    </section>
    <section className="panel">
      <div className="panelHead"><div><p className="eyebrow">PROJECT BANK</p><h2>Projects</h2></div><span className="badge">SOURCE-BACKED ONLY</span></div>
      {projects.length?<div className="phProjectGrid">{projects.map(p=><Link className="phProjectCard" href={"/projecthub/projects/"+encodeURIComponent(p.id)} key={p.id}>
        <div><span className="phCode">{p.id}</span><h3>{p.title}</h3></div>
        <div className="phProjectMeta"><span>{p.profile.methodologyProfile}</span><span>{p.status}</span><span>v{p.version}</span></div>
      </Link>)}</div>:<p className="phEmpty">No governed ProjectHub projects are currently readable from the configured runtime.</p>}
    </section>
    <section className="panel compact">
      <div className="panelHead">
        <div><p className="eyebrow">CONTENT & WRITING</p><h2>Micro-box and project templates</h2></div>
        <span className="badge">DEVELOPMENTAL TEXT</span>
      </div>
      <p>Optional external writing formats and proportional project plans. The originals are maintained by FFC. They are not published public downloads or automatic ProjectHub ingress.</p>
      <p><Link href="/projecthub/templates">View the internal content library</Link></p>
    </section>
    <section className="grid2">
      <article className="panel compact"><p className="eyebrow">CONTROL LAW</p><h2>One project. One canonical state. Many work surfaces.</h2>
        <p>Miro, Figma, GitHub, documents and funding providers remain specialized surfaces. Their changes do not silently rewrite ProjectHub state.</p></article>
      <article className="panel compact"><p className="eyebrow">AUTONOMY</p><h2>ProjectHub does not require Pius.</h2>
        <p>PROJECT_NATIVE operates without FFC/Pius. FULL_FF and CONFIGURED activate only explicitly selected methodology sources.</p></article>
    </section>
  </>;
}
