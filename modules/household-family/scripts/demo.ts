/** A local acceptance demonstration with explicit fixture authority, never a production deployment. */
import { writeFileSync, mkdirSync } from "node:fs";
import { sandbox, remoteLab, principal, until } from "./sandbox.js";
import { verifyAudit } from "../packages/audit/index.js";
const l = await sandbox({ repair: true, two: true }),
  remote = await remoteLab(l);
try {
  const run = await remote.service.enqueue(
    principal,
    "test-project",
    "WP01",
    l.project.policy_ref,
    "demo-1",
  );
  const first = await until(
    remote.service,
    l.store,
    run.run_id,
    "READY_FOR_DIRECTOR",
  );
  await remote.service.acceptDecision(await l.director.decision(first));
  l.director.snapshot.accepted_versions.WP01 = 1;
  l.director.snapshot.eligible_ids = ["WP02"];
  await until(remote.service, l.store, run.run_id, "RECORDED");
  await remote.service.tick();
  const next = (await l.store.runs()).find((r) => r.wp_id === "WP02")!;
  const second = await until(
    remote.service,
    l.store,
    next.run_id,
    "READY_FOR_DIRECTOR",
  );
  await remote.service.acceptDecision(await l.director.decision(second));
  l.director.snapshot.accepted_versions.WP02 = 1;
  l.director.snapshot.eligible_ids = [];
  await until(remote.service, l.store, next.run_id, "RECORDED");
  await remote.service.tick();
  const events = await l.store.audit("test-project");
  const report = {
    fixture_public_keys: {
      director_ed25519_spki: l.director.publicKey,
      issuer: l.director.issuer,
      audience: l.director.audience,
    },
    mode: "TEST_FIXTURE_ONLY",
    deployed: false,
    genuine_director_acceptance: false,
    description:
      "Production MCP components and GitHub/Director HTTP adapters tested against isolated contract services. Initial failure repaired with independent re-verification; external signed fixture decisions advance a two-WP DAG.",
    status: await remote.service.status(principal),
    runs: await l.store.runs(),
    evidence: await Promise.all(
      (await l.store.runs()).map((r) => l.store.evidence(r.run_id)),
    ),
    decisions: await Promise.all(
      (await l.store.runs()).map((r) => l.store.decisionRecords(r.run_id)),
    ),
    events,
    audit_chain_valid: verifyAudit(events),
    observed_mutations: l.github.mutations,
  };
  mkdirSync("docs/evidence", { recursive: true });
  writeFileSync(
    "docs/evidence/sandbox-demo.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    JSON.stringify({
      mode: report.mode,
      runs: report.runs.map((r) => ({
        wp: r.wp_id,
        state: r.state,
        repairs: r.current_attempt,
      })),
      audit_chain_valid: report.audit_chain_valid,
      events: events.length,
    }),
  );
} finally {
  await remote.close();
  await l.db.close();
}
