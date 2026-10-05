const counters = [
  ["Director action", "04"],
  ["Ready to dispatch", "07"],
  ["In execution", "11"],
  ["Awaiting input", "03"],
  ["QA / HCC", "02"],
  ["Failed", "01"],
  ["Completed today", "08"],
] as const;

const dispatches = [
  ["DSP-0001", "FFOS", "WP-01", "SYSTEM", "BUILDING", "Application shell"],
  ["DSP-0002", "UDL", "Connector", "UDL_READY", "STAGED", "Destination contract"],
  ["DSP-0003", "Conductellence", "Room", "INTERNAL", "RESERVED", "Domain room"],
  ["DSP-0004", "Pius", "Runtime", "NONE", "RESERVED", "Await canonical upgrade"],
] as const;

export default function CounterPage() {
  return (
    <>
      <header className="topbar">
        <div>
          <p className="eyebrow">FORM & FLÖDE // CONTROL PLANE</p>
          <h1>Dispatch Counter</h1>
        </div>
        <div className="runtime">WP-01 · APPLICATION SHELL</div>
      </header>

      <section className="metrics">
        {counters.map(([label, value]) => (
          <article className="metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="panelHead">
          <div>
            <p className="eyebrow">LIVE STRUCTURE / MOCK STATE</p>
            <h2>System traffic</h2>
          </div>
          <span className="badge">REGISTRY NOT CONNECTED</span>
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr><th>ID</th><th>Origin</th><th>Object</th><th>Dispatch</th><th>State</th><th>Next</th></tr>
            </thead>
            <tbody>
              {dispatches.map((row) => (
                <tr key={row[0]}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid2">
        <article className="panel compact">
          <p className="eyebrow">ARCHITECTURAL LAW</p>
          <h2>Repos own domains. FFOS owns orchestration.</h2>
          <p>UDL, Spatial, Pius and other systems remain canonical in their own repositories. FFOS carries state, dispatch, approval and traceability across them.</p>
        </article>
        <article className="panel compact">
          <p className="eyebrow">PIUS</p>
          <h2>Reserved. Not implemented.</h2>
          <p>The room exists, but no current Pius runtime assumptions are active while the canonical upgrade remains underway.</p>
        </article>
      </section>
    </>
  );
}
