import { notFound } from "next/navigation";

type Space = {
  title: string;
  status: string;
  description: string;
  notes: string[];
};

const spaces: Record<string, Space> = {
  work: {
    title: "Work",
    status: "ROOM ACTIVE · DATA MODEL PENDING",
    description: "Projects, missions, work packages, runs, outputs and decisions will converge here.",
    notes: ["WP-03 will define canonical objects.", "No live operational state is written yet."],
  },
  ffc: {
    title: "FFC",
    status: "ROOM RESERVED",
    description: "Form & Flöde company and assignment layer: clients, assignments, RAMx, proposals, portfolio and commercial operating context.",
    notes: ["Existing domain material remains outside this shell until explicit integration."],
  },
  conducellence: {
    title: "Conducellence",
    status: "FIRST-CLASS ROOM RESERVED",
    description: "Dedicated operational domain for Conducellence, with its own future objects, dashboard, knowledge and dispatch flows.",
    notes: ["Not subordinated to FFC or Pius.", "Domain ontology intentionally not hard-coded yet."],
  },
  udl: {
    title: "UDL",
    status: "EXTERNAL DESTINATION · CONNECTOR PENDING",
    description: "UDL remains its own product/site. FFOS will move approved UDL_READY dispatches to the UDL destination and record deployment outcome.",
    notes: ["Target flow: READY → UDL_READY → Director approval → publish → confirmation → CLOSED.", "WP-07 will implement the destination contract."],
  },
  pius: {
    title: "Pius",
    status: "RESERVED · NOT CONNECTED",
    description: "This room is deliberately neutral while the lengthy Pius upgrade is underway.",
    notes: ["No current Pius runtime is being frozen into software.", "Future integration must bind to the canonical completed architecture."],
  },
  knowledge: {
    title: "Knowledge",
    status: "ROOM ACTIVE · INDEX PENDING",
    description: "Future access layer for canonical documents, matrices, research, specifications and system artifacts.",
    notes: ["Knowledge sources remain authoritative where they currently reside."],
  },
  system: {
    title: "System",
    status: "AUTHORITY BOUNDARY ACTIVE · REGISTRY PENDING",
    description: "Registry, integrations, versions, deployment state, permissions, health and audit functions.",
    notes: ["WP-02 establishes Director authentication.", "WP-04 introduces the first persistent registry."],
  },
};

export function generateStaticParams() {
  return Object.keys(spaces).map((space) => ({ space }));
}

export default async function SpacePage({ params }: { params: Promise<{ space: string }> }) {
  const { space } = await params;
  const data = spaces[space];
  if (!data) notFound();

  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">FFOS // DOMAIN ROOM</p>
          <h1>{data.title}</h1>
        </div>
        <div className="runtime">{data.status}</div>
      </header>
      <section className="panel roomHero">
        <p className="eyebrow">PURPOSE</p>
        <h2>{data.description}</h2>
        <div className="rule" />
        {data.notes.map((note) => <p key={note}>{note}</p>)}
      </section>
    </>
  );
}
