import Link from "next/link";
import {listProjectContentFormats} from "../../../../../../modules/projecthub/src/content-catalog.ts";

const microLabels:Record<string,string>={
  MICRO_A_QUESTION:"Formulera vad du vill förstå, utan krav på färdig lösning.",
  MICRO_B_SYNOPSIS:"Skriv en sammanhängande kort beskrivning av ett initiativ.",
  MICRO_C_IDEA_FRAME:"Fånga idé, behov, värde och vad som behöver prövas.",
  MICRO_D_MICROPROJECT:"Beskriv ett litet avgränsat projekt med syfte, aktiviteter och ansvar."
};
const projectLabels:Record<string,string>={
  PROJECT_SMALL:"Kompakt plan för ett tydligt och avgränsat projekt.",
  PROJECT_MEDIUM:"Plan med flera aktiviteter, ansvar, resurser och lärande.",
  PROJECT_LARGE:"Fördjupad projektplan där komplexiteten motiverar fler delar."
};

export default function ProjectHubTemplateLibraryPage(){
  const formats=listProjectContentFormats();
  return <>
    <header className="topbar">
      <div><p className="eyebrow">FFOS // PROJECTHUB // CONTENT</p><h1>Content library</h1></div>
      <div className="runtime">DEVELOPMENTAL · NOT PUBLISHED</div>
    </header>
    <section className="phNotice">
      <strong>Internal content references only.</strong>
      <p>These are text originals in the F&F Corpus, not finished Affinity PDFs or public downloads. Access, project creation, DNA linkage and publication are separate governed decisions. The ProjectHub application runtime is not made live by this page.</p>
      <p><Link href="/projecthub">Back to ProjectHub</Link></p>
    </section>
    <section className="panel">
      <div className="panelHead">
        <div><p className="eyebrow">STARTING FORMATS</p><h2>Micro-box</h2></div>
        <span className="badge">4 CONTENT DRAFTS</span>
      </div>
      <div className="phProjectGrid">
        {formats.filter(x=>x.kind==="MICRO_BOX").map(x=>
          <article className="phProjectCard" key={x.id}>
            <span className="phCode">{x.id}</span>
            <h3>{x.title}</h3>
            <p>{microLabels[x.id]}</p>
            <p className="phProjectMeta"><span>{x.state}</span><span>NO PUBLIC DOWNLOAD</span></p>
          </article>
        )}
      </div>
    </section>
    <section className="panel">
      <div className="panelHead">
        <div><p className="eyebrow">PROJECT WRITING</p><h2>Project templates</h2></div>
        <span className="badge">4 SIZE OPTIONS</span>
      </div>
      <p>Mikroprojekt is shared with Micro-box D. Larger versions are separate full text originals.</p>
      <div className="phProjectGrid">
        {formats.filter(x=>x.kind==="PROJECT_TEMPLATE").map(x=>
          <article className="phProjectCard" key={x.id}>
            <span className="phCode">{x.projectSize}</span>
            <h3>{x.title}</h3>
            <p>{projectLabels[x.id]}</p>
            <p className="phProjectMeta"><span>{x.state}</span><span>NO AUTO-INGRESS</span></p>
          </article>
        )}
      </div>
    </section>
    <section className="panel compact">
      <p className="eyebrow">DOCUMENT RELATIONS</p>
      <h2>Different objects. Different purposes.</h2>
      <p>Micro-box is an external starting format. A project template is an external project-writing surface. DNA-Box is a separately governed FFC object. ProjectHub is the native FFOS project system. Shared information may be referenced and reviewed, never automatically treated as accepted project authority.</p>
      <p>The next release condition is editorial/user validation and FFC publication governance, not an automatic change of methodology profile.</p>
    </section>
  </>;
}
