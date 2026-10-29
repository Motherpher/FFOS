import { test, expect } from "vitest";
import { Database, Store } from "../packages/state/index.js";
import { Household } from "../apps/orchestrator-api/service.js";
import {
  sandbox,
  principal,
  until,
  fixtureGovernance,
} from "../scripts/sandbox.js";
import { verifyAudit } from "../packages/audit/index.js";
test.skipIf(!process.env.HF_TEST_DATABASE_URL)(
  "PostgreSQL production driver: migrations, transaction locks, restart and audit immutability",
  async () => {
    const l = await sandbox(),
      db = new Database(process.env.HF_TEST_DATABASE_URL!),
      other = new Database(process.env.HF_TEST_DATABASE_URL!);
    try {
      await db.migrate();
      await other.migrate();
      const store = new Store(db),
        store2 = new Store(other);
      await store.register(l.project);
      const service = new Household(
          store,
          l.director,
          l.github,
          fixtureGovernance,
        ),
        second = new Household(store2, l.director, l.github, fixtureGovernance);
      const [a, b] = await Promise.all([
        service.enqueue(
          principal,
          "test-project",
          "WP01",
          l.project.policy_ref,
          "pg-1",
        ),
        second.enqueue(
          principal,
          "test-project",
          "WP01",
          l.project.policy_ref,
          "pg-1",
        ),
      ]);
      expect(a.run_id).toBe(b.run_id);
      const claims = await Promise.all([store.claim(), store2.claim()]);
      expect(claims.filter(Boolean)).toHaveLength(1);
      const lease = claims.find(Boolean)!;
      await store.release(a.run_id, lease.lease);
      await until(service, store, a.run_id, "READY_FOR_DIRECTOR");
      expect((await store2.run(a.run_id)).state).toBe("READY_FOR_DIRECTOR");
      expect(verifyAudit(await store.audit("test-project"))).toBe(true);
      await expect(
        db.tx((s) => s.query("UPDATE hf_events SET payload='{}'")),
      ).rejects.toThrow("append-only");
    } finally {
      await other.close();
      await db.close();
      await l.db.close();
    }
  },
  30000,
);
