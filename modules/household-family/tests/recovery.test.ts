import { test, expect } from "vitest";
import { sandbox, principal, until } from "../scripts/sandbox.js";
test("Expired in-flight cancellation recovers to STOPPED without a new effect", async () => {
  const l = await sandbox();
  try {
    const r = await l.service.enqueue(
      principal,
      "test-project",
      "WP01",
      l.project.policy_ref,
      "stop-crash",
    );
    await l.store.claim();
    expect(
      (await l.service.stop(principal, r.run_id, "crash cancellation", "stop"))
        .state,
    ).toBe("CANCEL_REQUESTED");
    await l.db.tx(async (s) => {
      const run = await l.store.readRun(s, r.run_id);
      run.lease_expires_at = Date.now() - 1;
      await s.query("UPDATE hf_runs SET payload=? WHERE run_id=?", [
        JSON.stringify(run),
        r.run_id,
      ]);
      await s.query("UPDATE hf_jobs SET lease_expires_at=0 WHERE run_id=?", [
        r.run_id,
      ]);
    });
    await l.service.tick();
    expect((await l.store.run(r.run_id)).state).toBe("STOPPED");
    expect(l.github.mutations).toEqual([]);
  } finally {
    await l.db.close();
  }
});
test("Three repeat-safe disconnections produce an inspectable dead letter", async () => {
  const l = await sandbox();
  try {
    const r = await l.service.enqueue(
      principal,
      "test-project",
      "WP01",
      l.project.policy_ref,
      "dead-letter",
    );
    l.director.available = false;
    await until(l.service, l.store, r.run_id, "BLOCKED");
    const status = await l.service.status(principal);
    expect(status.projects[0]!.metrics.dead_letters).toBe(1);
    expect(
      (await l.store.audit("test-project")).filter(
        (e) => e.event_type === "RETRY_OR_DEAD_LETTER",
      ),
    ).toHaveLength(3);
  } finally {
    await l.db.close();
  }
});
test("Queued and pending-Director states remain distinct from IDLE", async () => {
  const l = await sandbox();
  try {
    const r = await l.service.enqueue(
      principal,
      "test-project",
      "WP01",
      l.project.policy_ref,
      "status-queue",
    );
    expect((await l.service.status(principal)).status).toBe("QUEUED");
    await until(l.service, l.store, r.run_id, "READY_FOR_DIRECTOR");
    expect((await l.service.status(principal)).status).toBe("HOLD");
  } finally {
    await l.db.close();
  }
});
