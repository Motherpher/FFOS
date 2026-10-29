import { test, expect } from "vitest";
import {
  sandbox,
  principal,
  until,
  fixtureGovernance,
} from "../scripts/sandbox.js";
import { Household } from "../apps/orchestrator-api/service.js";
import { Gate } from "../packages/contracts/index.js";
import { inspectCanonicalManifest } from "../packages/director-adapter/canonical.js";
test("CDX unconfigured default denies all mutations; no environment bypass", async () => {
  const l = await sandbox();
  try {
    const service = new Household(l.store, l.director, l.github);
    const run = await service.enqueue(
      principal,
      "test-project",
      "WP01",
      l.project.policy_ref,
      "cdx-missing",
    );
    await until(service, l.store, run.run_id, "HOLD_HUMAN");
    expect((await l.store.run(run.run_id)).last_error).toBe(
      "CDX_RUNTIME_ENFORCEMENT_UNCONFIGURED",
    );
    expect(l.github.mutations).toEqual([]);
  } finally {
    await l.db.close();
  }
});
test("CDX restrictive and unavailable decisions cannot become ALLOW", async () => {
  for (const code of ["CDX_DENY", "CDX_POLICY_UNAVAILABLE_OR_INVALID"]) {
    const l = await sandbox();
    try {
      const service = new Household(l.store, l.director, l.github, {
        evaluate: async () => {
          throw new Gate(code, "HOLD_HUMAN");
        },
      });
      const run = await service.enqueue(
        principal,
        "test-project",
        "WP01",
        l.project.policy_ref,
        "cdx-deny",
      );
      await until(service, l.store, run.run_id, "HOLD_HUMAN");
      expect(l.github.mutations).toEqual([]);
    } finally {
      await l.db.close();
    }
  }
});
test("CDX evidence is recorded before every confirmed external operation", async () => {
  const l = await sandbox();
  try {
    const run = await l.service.enqueue(
      principal,
      "test-project",
      "WP01",
      l.project.policy_ref,
      "cdx-allow",
    );
    await until(l.service, l.store, run.run_id, "READY_FOR_DIRECTOR");
    const events = await l.store.audit("test-project", run.run_id);
    for (const [index, e] of events.entries())
      if (e.event_type === "EXTERNAL_WRITE_INTENT")
        expect(
          events
            .slice(0, index)
            .some((p) => p.event_type === "CDX_EFFECT_ALLOWED"),
        ).toBe(true);
    expect(
      events
        .filter((e) => e.event_type === "CDX_EFFECT_ALLOWED")
        .every((e) => !!e.detail.signed_provenance),
    ).toBe(true);
  } finally {
    await l.db.close();
  }
});
test("Canonical Director observation import preserves closed/undispatched states and never grants authority", () => {
  const result = inspectCanonicalManifest({
    sequence: ["WP01", "WP02"],
    policy: {
      auto_dispatch: true,
      phase_iii_execution_authority: "FULFILLED_CLOSED",
    },
    work_packages: {
      WP01: {
        state: "CLOSED_DIRECTOR_PASS",
        checks: [{ type: "command", command: ["untrusted"] }],
      },
      WP02: { state: "NOT_DISPATCHED", depends_on: ["WP01"], human_gate: true },
    },
  });
  expect(result.authority_granted).toBe(false);
  expect(result.work_packages[0]!.source_state).toBe("CLOSED_DIRECTOR_PASS");
  expect(result.work_packages[1]!.source_state).toBe("NOT_DISPATCHED");
  expect(result.work_packages[0]!.supported_without_semantic_translation).toBe(
    false,
  );
});
