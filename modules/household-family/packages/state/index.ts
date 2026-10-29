import { DatabaseSync } from "node:sqlite";
import { Pool, type PoolClient } from "pg";
import { readFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  Project,
  Evidence,
  Decision,
  Gate,
  hash,
  now,
  uid,
  type Run,
  type State,
  type AuditEvent,
} from "../contracts/index.js";

type Row = Record<string, unknown>;
export interface SQL {
  query(sql: string, params?: unknown[]): Promise<Row[]>;
}
const serial = <T>(
  fn: () => Promise<T>,
  previous: Promise<unknown>,
): Promise<T> => previous.then(fn, fn);
export class Database {
  private sqlite?: DatabaseSync;
  private pool?: Pool;
  private queue: Promise<unknown> = Promise.resolve();
  constructor(public url: string) {
    if (url.startsWith("postgres"))
      this.pool = new Pool({ connectionString: url, max: 4 });
    else {
      if (url !== ":memory:") mkdirSync(dirname(url), { recursive: true });
      this.sqlite = new DatabaseSync(url);
      this.sqlite.exec(
        "PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;",
      );
    }
  }
  private sql(client?: PoolClient): SQL {
    return {
      query: async (sql, params = []) => {
        if (this.sqlite)
          return this.sqlite
            .prepare(sql)
            .all(
              ...(params.map((x) => (x === undefined ? null : x)) as (
                string | number | null
              )[]),
            ) as Row[];
        let n = 0;
        return (
          await client!.query(
            sql.replace(/\?/g, () => `$${++n}`),
            params,
          )
        ).rows;
      },
    };
  }
  async tx<T>(fn: (sql: SQL) => Promise<T>): Promise<T> {
    const task = serial(async () => {
      const client = this.pool ? await this.pool.connect() : undefined;
      try {
        if (client) {
          await client.query("BEGIN");
          await client.query(
            "SELECT pg_advisory_xact_lock(hashtext('ffos-household-family-v2'))",
          );
        } else this.sqlite!.exec("BEGIN IMMEDIATE");
        const value = await fn(this.sql(client));
        if (client) await client.query("COMMIT");
        else this.sqlite!.exec("COMMIT");
        return value;
      } catch (e) {
        if (client) await client.query("ROLLBACK");
        else this.sqlite!.exec("ROLLBACK");
        throw e;
      } finally {
        client?.release();
      }
    }, this.queue);
    this.queue = task.catch(() => {});
    return task;
  }
  async migrate() {
    const built = fileURLToPath(
      new URL("../../../db/migrations/001_core.sql", import.meta.url),
    );
    const core = readFileSync(
      existsSync(built)
        ? built
        : fileURLToPath(
            new URL("../../db/migrations/001_core.sql", import.meta.url),
          ),
      "utf8",
    );
    // SQL is loaded from the source tree, also copied into the image alongside dist/.
    if (this.sqlite) {
      this.sqlite.exec(core);
      this.sqlite.exec(
        "CREATE TABLE IF NOT EXISTS hf_events (seq INTEGER PRIMARY KEY AUTOINCREMENT,event_id TEXT UNIQUE NOT NULL,project_id TEXT NOT NULL,run_id TEXT,payload TEXT NOT NULL)",
      );
      for (const table of ["hf_events", "hf_evidence", "hf_decisions"])
        for (const op of ["UPDATE", "DELETE"])
          this.sqlite.exec(
            `CREATE TRIGGER IF NOT EXISTS ${table}_no_${op} BEFORE ${op} ON ${table} BEGIN SELECT RAISE(ABORT,'Household evidence is append-only'); END;`,
          );
    } else {
      const migrationClient = await this.pool!.connect();
      await migrationClient.query(
        "SELECT pg_advisory_lock(hashtext('ffos-household-migration-v1'))",
      );
      try {
        await migrationClient.query(core);
        await migrationClient.query(
          "CREATE TABLE IF NOT EXISTS hf_events (seq BIGSERIAL PRIMARY KEY,event_id TEXT UNIQUE NOT NULL,project_id TEXT NOT NULL,run_id TEXT,payload TEXT NOT NULL)",
        );
        await migrationClient.query(
          "CREATE OR REPLACE FUNCTION hf_no_mutation() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'Household evidence is append-only'; END; $$;",
        );
        for (const table of ["hf_events", "hf_evidence", "hf_decisions"])
          await migrationClient.query(
            `DROP TRIGGER IF EXISTS ${table}_immutable ON ${table}; CREATE TRIGGER ${table}_immutable BEFORE UPDATE OR DELETE ON ${table} FOR EACH ROW EXECUTE FUNCTION hf_no_mutation();`,
          );
      } finally {
        await migrationClient.query(
          "SELECT pg_advisory_unlock(hashtext('ffos-household-migration-v1'))",
        );
        migrationClient.release();
      }
    }
  }
  async close() {
    await this.queue;
    if (this.pool) await this.pool.end();
    this.sqlite?.close();
  }
}
const decode = <T>(row: Row | undefined, column = "payload"): T | undefined =>
  row ? JSON.parse(String(row[column])) : undefined;
export const terminal = new Set<State>(["RECORDED", "STOPPED", "FAILED"]);
export const transitions: Partial<Record<State, State[]>> = {
  DISCOVERED: ["ELIGIBLE"],
  ELIGIBLE: ["LEASED"],
  LEASED: ["INSPECTING", "RECOVERY_CHECK"],
  INSPECTING: ["EXECUTING", "VERIFYING"],
  EXECUTING: ["VERIFYING"],
  VERIFYING: ["REPAIRING", "READY_FOR_DIRECTOR"],
  REPAIRING: ["VERIFYING"],
  READY_FOR_DIRECTOR: ["ACCEPTED"],
  ACCEPTED: ["RECORDED"],
  RECOVERY_CHECK: [
    "INSPECTING",
    "EXECUTING",
    "REPAIRING",
    "VERIFYING",
    "READY_FOR_DIRECTOR",
  ],
  BLOCKED: ["RECOVERY_CHECK"],
  HOLD_HUMAN: ["RECOVERY_CHECK"],
  CANCEL_REQUESTED: ["STOPPED"],
};
export class Store {
  constructor(public db: Database) {}
  async project(project_id: string) {
    return this.db.tx(async (s) => {
      const p = decode<Project>(
        (
          await s.query("SELECT config FROM hf_projects WHERE project_id=?", [
            project_id,
          ])
        )[0],
        "config",
      );
      if (!p) throw new Gate("PROJECT_NOT_FOUND");
      return Project.parse(p);
    });
  }
  async projects() {
    return this.db.tx(async (s) =>
      (await s.query("SELECT config FROM hf_projects ORDER BY project_id")).map(
        (r) => Project.parse(decode(r, "config")),
      ),
    );
  }
  async register(config: Project) {
    const p = Project.parse(config);
    await this.db.tx(async (s) => {
      await s.query(
        "INSERT INTO hf_projects(project_id,config) VALUES(?,?) ON CONFLICT(project_id) DO UPDATE SET config=excluded.config",
        [p.project_id, JSON.stringify(p)],
      );
      await this.event(s, {
        project_id: p.project_id,
        actor: "OPERATOR",
        event_type: "PROJECT_CONFIGURED",
        source_ref: p.policy_ref,
        detail: { config_hash: hash(p), permission: p.permission },
      });
    });
  }
  async run(run_id: string) {
    return this.db.tx((s) => this.readRun(s, run_id));
  }
  async readRun(s: SQL, run_id: string): Promise<Run> {
    const r = decode<Run>(
      (
        await s.query("SELECT payload FROM hf_runs WHERE run_id=?", [run_id])
      )[0],
    );
    if (!r) throw new Gate("RUN_NOT_FOUND");
    return r;
  }
  async runs(project_id?: string) {
    return this.db.tx(async (s) =>
      (
        await s.query(
          `SELECT payload FROM hf_runs${project_id ? " WHERE project_id=?" : ""}`,
          project_id ? [project_id] : [],
        )
      ).map((r) => decode<Run>(r)!),
    );
  }
  async save(s: SQL, run: Run, expected: number) {
    const rows = await s.query(
      "UPDATE hf_runs SET state=?,revision=?,payload=? WHERE run_id=? AND revision=? RETURNING run_id",
      [run.state, run.revision, JSON.stringify(run), run.run_id, expected],
    );
    if (!rows.length) throw new Gate("RUN_REVISION_CONFLICT");
  }
  async event(
    s: SQL,
    input: Partial<AuditEvent> &
      Pick<AuditEvent, "project_id" | "actor" | "event_type" | "source_ref">,
  ) {
    const last = decode<AuditEvent>(
      (
        await s.query(
          "SELECT payload FROM hf_events WHERE project_id=? ORDER BY seq DESC LIMIT 1",
          [input.project_id],
        )
      )[0],
    );
    const event: AuditEvent = {
      event_id: uid("event"),
      run_id: null,
      previous_state: null,
      new_state: null,
      policy_hash: null,
      evidence_refs: [],
      timestamp: now(),
      correlation_id: uid("corr"),
      external_write_id: null,
      readback_verified: false,
      detail: {},
      ...input,
      previous_hash: last?.event_hash ?? "0".repeat(64),
      event_hash: "",
    };
    const { event_hash: _, ...body } = event;
    event.event_hash = hash(body);
    await s.query(
      "INSERT INTO hf_events(event_id,project_id,run_id,payload) VALUES(?,?,?,?)",
      [event.event_id, event.project_id, event.run_id, JSON.stringify(event)],
    );
    return event;
  }
  async transition(
    run_id: string,
    to: State,
    actor: string,
    detail: Record<string, unknown> = {},
    lease?: string,
  ) {
    return this.db.tx(async (s) => {
      const r = await this.readRun(s, run_id);
      if (lease) this.assertLease(r, lease);
      if (r.state === to) return r;
      const exceptional =
        ["HOLD_HUMAN", "BLOCKED", "FAILED", "CANCEL_REQUESTED"].includes(to) &&
        !terminal.has(r.state) &&
        r.state !== "ACCEPTED";
      if (!exceptional && !transitions[r.state]?.includes(to))
        throw new Gate(`INVALID_TRANSITION_${r.state}_${to}`);
      const from = r.state,
        rev = r.revision;
      r.state = to;
      r.revision++;
      r.updated_at = now();
      if (terminal.has(to)) r.completed_at = now();
      if (detail.error) r.last_error = String(detail.error);
      await this.save(s, r, rev);
      await this.event(s, {
        project_id: r.project_id,
        run_id,
        actor,
        event_type: "STATE_TRANSITION",
        previous_state: from,
        new_state: to,
        policy_hash: r.policy_hash,
        source_ref: r.wp.director_policy_ref,
        correlation_id: r.correlation_id,
        detail,
      });
      return r;
    });
  }
  assertLease(r: Run, lease: string) {
    if (
      r.lease_owner !== lease ||
      !r.lease_expires_at ||
      r.lease_expires_at <= Date.now()
    )
      throw new Gate("LEASE_LOST");
  }
  async mutateRun(
    run_id: string,
    lease: string,
    patch: Partial<
      Pick<
        Run,
        | "commit_sha"
        | "pr_ref"
        | "current_attempt"
        | "evidence_bundle_hash"
        | "recipe_bases"
        | "recovery_state"
      >
    >,
  ) {
    return this.db.tx(async (s) => {
      const r = await this.readRun(s, run_id);
      this.assertLease(r, lease);
      const rev = r.revision;
      Object.assign(r, patch);
      r.revision++;
      r.updated_at = now();
      await this.save(s, r, rev);
      return r;
    });
  }
  async enqueue(r: Run) {
    return this.db.tx(async (s) => {
      const byKey = decode<Run>(
        (
          await s.query(
            "SELECT payload FROM hf_runs WHERE project_id=? AND idempotency_key=?",
            [r.project_id, r.idempotency_key],
          )
        )[0],
      );
      if (byKey) {
        if (
          byKey.wp_id !== r.wp_id ||
          byKey.wp_version !== r.wp_version ||
          byKey.wp.scope_hash !== r.wp.scope_hash ||
          byKey.origin_subject !== r.origin_subject
        )
          throw new Gate("IDEMPOTENCY_CONFLICT");
        return byKey;
      }
      const existing = decode<Run>(
        (
          await s.query(
            "SELECT payload FROM hf_runs WHERE project_id=? AND wp_id=? AND wp_version=?",
            [r.project_id, r.wp_id, r.wp_version],
          )
        )[0],
      );
      if (existing) return existing;
      await s.query(
        "INSERT INTO hf_runs(run_id,project_id,wp_id,wp_version,state,revision,idempotency_key,payload) VALUES(?,?,?,?,?,?,?,?)",
        [
          r.run_id,
          r.project_id,
          r.wp_id,
          r.wp_version,
          r.state,
          r.revision,
          r.idempotency_key,
          JSON.stringify(r),
        ],
      );
      await s.query(
        "INSERT INTO hf_jobs(job_id,project_id,run_id,state,available_at) VALUES(?,?,?,?,?)",
        [uid("job"), r.project_id, r.run_id, "WAITING", Date.now()],
      );
      await this.event(s, {
        project_id: r.project_id,
        run_id: r.run_id,
        actor: r.origin_subject,
        event_type: "RUN_QUEUED",
        new_state: r.state,
        policy_hash: r.policy_hash,
        source_ref: r.wp.director_policy_ref,
        correlation_id: r.correlation_id,
        detail: { wp_version: r.wp_version, scope_hash: r.wp.scope_hash },
      });
      return r;
    });
  }
  async claim(leaseMs = 120000): Promise<{ run: Run; lease: string } | null> {
    return this.db.tx(async (s) => {
      const time = Date.now();
      await s.query(
        "UPDATE hf_jobs SET state='WAITING',lease_owner=NULL,lease_expires_at=NULL WHERE state='RUNNING' AND lease_expires_at<=?",
        [time],
      );
      const jobs = await s.query(
        "SELECT * FROM hf_jobs WHERE state='WAITING' AND available_at<=? ORDER BY available_at LIMIT 50",
        [time],
      );
      for (const job of jobs) {
        const r = await this.readRun(s, String(job.run_id));
        if (
          r.state === "CANCEL_REQUESTED" &&
          (!r.lease_expires_at || r.lease_expires_at <= time)
        ) {
          const rev = r.revision;
          r.state = "STOPPED";
          r.lease_owner = null;
          r.lease_expires_at = null;
          r.revision++;
          r.completed_at = now();
          await this.save(s, r, rev);
          await this.event(s, {
            project_id: r.project_id,
            run_id: r.run_id,
            actor: "ORCHESTRATOR",
            event_type: "CANCELLATION_BOUNDARY_RECOVERED",
            previous_state: "CANCEL_REQUESTED",
            new_state: "STOPPED",
            source_ref: r.wp.director_policy_ref,
            correlation_id: r.correlation_id,
          });
        }
        if (terminal.has(r.state) || r.state === "CANCEL_REQUESTED") {
          await s.query("UPDATE hf_jobs SET state='DONE' WHERE job_id=?", [
            job.job_id,
          ]);
          continue;
        }
        if (r.lease_owner && r.lease_expires_at! > time) continue;
        const p = decode<Project>(
          (
            await s.query("SELECT config FROM hf_projects WHERE project_id=?", [
              r.project_id,
            ])
          )[0],
          "config",
        )!;
        const active = (
          await s.query(
            "SELECT run_id FROM hf_jobs WHERE project_id=? AND state='RUNNING' AND lease_expires_at>?",
            [r.project_id, time],
          )
        ).length;
        if (active >= p.max_concurrent_runs) continue;
        const lease = uid("lease"),
          rev = r.revision;
        const stale =
          r.lease_owner !== null &&
          (!r.lease_expires_at || r.lease_expires_at <= time);
        const prev = r.state;
        r.lease_owner = lease;
        r.lease_expires_at = time + leaseMs;
        r.revision++;
        r.updated_at = now();
        if (
          stale &&
          !["ACCEPTED", "READY_FOR_DIRECTOR", "BLOCKED", "HOLD_HUMAN"].includes(
            r.state,
          )
        ) {
          if (r.state !== "RECOVERY_CHECK") r.recovery_state = r.state;
          r.state = "RECOVERY_CHECK";
        }
        await this.save(s, r, rev);
        await s.query(
          "UPDATE hf_jobs SET state='RUNNING',lease_owner=?,lease_expires_at=?,attempts=attempts+1 WHERE job_id=?",
          [lease, time + leaseMs, job.job_id],
        );
        await this.event(s, {
          project_id: r.project_id,
          run_id: r.run_id,
          actor: "ORCHESTRATOR",
          event_type: stale ? "LEASE_RECOVERED" : "LEASE_ACQUIRED",
          previous_state: prev,
          new_state: r.state,
          policy_hash: r.policy_hash,
          source_ref: r.wp.director_policy_ref,
          correlation_id: r.correlation_id,
        });
        return { run: r, lease };
      }
      return null;
    });
  }
  async release(
    run_id: string,
    lease: string,
    delayMs = 0,
    dead = false,
    clearFailures = true,
  ) {
    await this.db.tx(async (s) => {
      const r = await this.readRun(s, run_id);
      this.assertLease(r, lease);
      const rev = r.revision;
      r.lease_owner = null;
      r.lease_expires_at = null;
      r.revision++;
      if (r.stop_requested && r.state !== "STOPPED") {
        const from = r.state;
        r.state = "STOPPED";
        r.completed_at = now();
        await this.event(s, {
          project_id: r.project_id,
          run_id,
          actor: "ORCHESTRATOR",
          event_type: "CANCELLATION_BOUNDARY_CONFIRMED",
          previous_state: from,
          new_state: "STOPPED",
          source_ref: r.wp.director_policy_ref,
          correlation_id: r.correlation_id,
        });
      }
      await this.save(s, r, rev);
      const done =
        terminal.has(r.state) || ["BLOCKED", "HOLD_HUMAN"].includes(r.state);
      await s.query(
        "UPDATE hf_jobs SET state=?,available_at=?,lease_owner=NULL,lease_expires_at=NULL WHERE run_id=? AND lease_owner=?",
        [
          dead ? "DEAD" : done ? "DONE" : "WAITING",
          Date.now() + delayMs,
          run_id,
          lease,
        ],
      );
      if (clearFailures)
        await s.query(
          "UPDATE hf_jobs SET failure_count=0,last_error=NULL WHERE run_id=?",
          [run_id],
        );
    });
  }
  async retryFailure(run_id: string, code: string) {
    return this.db.tx(async (s) => {
      const r = await this.readRun(s, run_id);
      const job = (
        await s.query(
          "UPDATE hf_jobs SET failure_count=failure_count+1,last_error=? WHERE run_id=? RETURNING failure_count",
          [code, run_id],
        )
      )[0]!;
      await this.event(s, {
        project_id: r.project_id,
        run_id,
        actor: "ORCHESTRATOR",
        event_type: "RETRY_OR_DEAD_LETTER",
        source_ref: r.wp.director_policy_ref,
        policy_hash: r.policy_hash,
        correlation_id: r.correlation_id,
        detail: { code, failure_count: Number(job.failure_count) },
      });
      return Number(job.failure_count);
    });
  }
  async stop(run_id: string, reason: string, key: string, actor: string) {
    return this.db.tx(async (s) => {
      const r = await this.readRun(s, run_id);
      if (terminal.has(r.state)) return r;
      if (r.state === "ACCEPTED")
        throw new Gate("ACCEPTANCE_ALREADY_COMMITTED");
      const rev = r.revision,
        from = r.state;
      r.stop_requested = true;
      r.state =
        r.lease_owner && r.lease_expires_at! > Date.now()
          ? "CANCEL_REQUESTED"
          : "STOPPED";
      r.last_error = reason;
      r.revision++;
      if (r.state === "STOPPED") {
        r.completed_at = now();
        await s.query("UPDATE hf_jobs SET state='DONE' WHERE run_id=?", [
          run_id,
        ]);
      }
      await this.save(s, r, rev);
      await this.event(s, {
        project_id: r.project_id,
        run_id,
        actor,
        event_type: "CANCELLATION_REQUESTED",
        previous_state: from,
        new_state: r.state,
        source_ref: r.wp.director_policy_ref,
        correlation_id: r.correlation_id,
        detail: { reason, idempotency_key: key },
      });
      return r;
    });
  }
  async requeue(run_id: string) {
    await this.db.tx(async (s) => {
      await s.query(
        "UPDATE hf_jobs SET state='WAITING',available_at=?,lease_owner=NULL,lease_expires_at=NULL,last_error=NULL WHERE run_id=? AND (state<>'RUNNING' OR lease_expires_at<=?)",
        [Date.now(), run_id, Date.now()],
      );
    });
  }
  async appendEvidence(rows: Evidence[]) {
    await this.db.tx(async (s) => {
      for (const raw of rows) {
        const e = Evidence.parse(raw);
        await s.query(
          "INSERT INTO hf_evidence(evidence_id,run_id,payload) VALUES(?,?,?)",
          [e.evidence_id, e.run_id, JSON.stringify(e)],
        );
      }
      if (rows[0]) {
        const r = await this.readRun(s, rows[0].run_id);
        await this.event(s, {
          project_id: r.project_id,
          run_id: r.run_id,
          actor: rows[0].role,
          event_type: "EVIDENCE_RECORDED",
          source_ref: r.wp.director_policy_ref,
          evidence_refs: rows.map((x) => x.evidence_id),
          correlation_id: r.correlation_id,
        });
      }
    });
  }
  async evidence(run_id: string) {
    return this.db.tx(async (s) =>
      (
        await s.query("SELECT payload FROM hf_evidence WHERE run_id=?", [
          run_id,
        ])
      ).map((r) => Evidence.parse(decode(r))),
    );
  }
  async audit(project_id: string, run_id?: string) {
    return this.db.tx(async (s) =>
      (
        await s.query(
          `SELECT payload FROM hf_events WHERE project_id=?${run_id ? " AND run_id=?" : ""} ORDER BY seq`,
          run_id ? [project_id, run_id] : [project_id],
        )
      ).map((r) => decode<AuditEvent>(r)!),
    );
  }
  async operation(run_id: string, key: string, request: unknown) {
    return this.db.tx(async (s) => {
      const r = await this.readRun(s, run_id);
      const opKey = `${run_id}:${key}`,
        rh = hash(request);
      const old = (
        await s.query("SELECT * FROM hf_operations WHERE operation_key=?", [
          opKey,
        ])
      )[0];
      if (old) {
        if (old.request_hash !== rh)
          throw new Gate("OPERATION_IDEMPOTENCY_CONFLICT");
        return {
          state: String(old.state),
          result: old.result ? JSON.parse(String(old.result)) : null,
        };
      }
      await s.query(
        "INSERT INTO hf_operations(operation_key,run_id,request_hash,state) VALUES(?,?,?,'PENDING')",
        [opKey, run_id, rh],
      );
      await this.event(s, {
        project_id: r.project_id,
        run_id,
        actor: "HANDYMAN",
        event_type: "EXTERNAL_WRITE_INTENT",
        source_ref: r.wp.director_policy_ref,
        external_write_id: opKey,
        policy_hash: r.policy_hash,
        correlation_id: r.correlation_id,
        detail: { request_hash: rh, key },
      });
      return { state: "PENDING", result: null };
    });
  }
  async operationDone(run_id: string, key: string, result: unknown) {
    await this.db.tx(async (s) => {
      const r = await this.readRun(s, run_id),
        opKey = `${run_id}:${key}`;
      await s.query(
        "UPDATE hf_operations SET state='CONFIRMED',result=? WHERE operation_key=?",
        [JSON.stringify(result), opKey],
      );
      await this.event(s, {
        project_id: r.project_id,
        run_id,
        actor: "HANDYMAN",
        event_type: "EXTERNAL_WRITE_CONFIRMED",
        source_ref: r.wp.director_policy_ref,
        external_write_id: opKey,
        readback_verified: true,
        policy_hash: r.policy_hash,
        correlation_id: r.correlation_id,
        detail: { result_hash: hash(result) },
      });
    });
  }
  async decide(decision: Decision, signed: string) {
    return this.db.tx(async (s) => {
      const old = (
        await s.query("SELECT payload FROM hf_decisions WHERE decision_id=?", [
          decision.decision_id,
        ])
      )[0];
      if (old) {
        if (hash(decode(old)) !== hash(decision))
          throw new Gate("DECISION_REPLAY_CONFLICT");
        return this.readRun(s, decision.run_id);
      }
      const r = await this.readRun(s, decision.run_id);
      if (r.state !== "READY_FOR_DIRECTOR" || r.stop_requested)
        throw new Gate("NOT_READY_FOR_DIRECTOR");
      if (
        decision.project_id !== r.project_id ||
        decision.wp_id !== r.wp_id ||
        decision.wp_version !== r.wp_version ||
        decision.scope_hash !== r.wp.scope_hash ||
        decision.commit_sha !== r.commit_sha ||
        decision.evidence_bundle_hash !== r.evidence_bundle_hash ||
        decision.director_policy_version !== r.policy_version ||
        decision.eligibility_revision !== r.eligibility_revision
      )
        throw new Gate("DECISION_BINDING_MISMATCH");
      if (decision.decision === "WAIVE")
        throw new Gate("WAIVER_NOT_DELEGATED", "HOLD_HUMAN");
      await s.query(
        "INSERT INTO hf_decisions(decision_id,run_id,signed_provenance,payload) VALUES(?,?,?,?)",
        [decision.decision_id, r.run_id, signed, JSON.stringify(decision)],
      );
      const rev = r.revision,
        from = r.state;
      r.state =
        decision.decision === "ACCEPT"
          ? "ACCEPTED"
          : decision.decision === "HOLD"
            ? "HOLD_HUMAN"
            : "BLOCKED";
      r.revision++;
      r.updated_at = now();
      await this.save(s, r, rev);
      await this.event(s, {
        project_id: r.project_id,
        run_id: r.run_id,
        actor: "DIRECTOR",
        event_type: `DIRECTOR_${decision.decision}`,
        previous_state: from,
        new_state: r.state,
        source_ref: decision.authority_ref,
        policy_hash: r.policy_hash,
        correlation_id: r.correlation_id,
        readback_verified: true,
        detail: {
          decision_id: decision.decision_id,
          signature_hash: hash(signed),
        },
      });
      if (r.state === "ACCEPTED")
        await s.query(
          "INSERT INTO hf_progression_outbox(decision_id,project_id,state,available_at) VALUES(?,?,'WAITING',?)",
          [decision.decision_id, r.project_id, Date.now()],
        );
      return r;
    });
  }
  async decisionRecords(run_id: string) {
    return this.db.tx(async (s) =>
      (
        await s.query("SELECT payload FROM hf_decisions WHERE run_id=?", [
          run_id,
        ])
      ).map((x) => Decision.parse(decode(x))),
    );
  }
  async operations(run_id: string) {
    return this.db.tx(async (s) =>
      (
        await s.query(
          "SELECT operation_key,request_hash,state,result FROM hf_operations WHERE run_id=?",
          [run_id],
        )
      ).map((x) => ({
        ...x,
        result: x.result ? JSON.parse(String(x.result)) : null,
      })),
    );
  }
  async delivery(id: string, bodyHash: string) {
    return this.db.tx(async (s) => {
      const existing = (
        await s.query("SELECT body_hash FROM hf_webhooks WHERE delivery_id=?", [
          id,
        ])
      )[0];
      if (existing) {
        if (existing.body_hash !== bodyHash)
          throw new Gate("WEBHOOK_REPLAY_CONFLICT");
        return false;
      }
      await s.query(
        "INSERT INTO hf_webhooks(delivery_id,body_hash,received_at) VALUES(?,?,?)",
        [id, bodyHash, now()],
      );
      return true;
    });
  }
}
