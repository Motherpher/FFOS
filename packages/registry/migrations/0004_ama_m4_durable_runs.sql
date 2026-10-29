-- AMA M4 candidate only: durable workflow journal, lease fencing and uncertain effects.
-- Apply only to disposable CI PostgreSQL until separately governed migration approval.
-- Depends on schema.sql, 0002_agent_stable.sql and 0003_agent_stable_hardening.sql.
-- Mutable coordination tables are not authority sources; immutable events preserve history.
CREATE TABLE IF NOT EXISTS ama_m4_runs (
 run_id TEXT PRIMARY KEY, task_id TEXT NOT NULL,
 agent_id TEXT NOT NULL, agent_version TEXT NOT NULL,
 workflow_id TEXT NOT NULL, workflow_version TEXT NOT NULL,
 state TEXT NOT NULL DEFAULT 'QUEUED' CHECK (state IN ('QUEUED','RUNNING','HOLD','PASS','FAIL','CANCELLED')),
 generation BIGINT NOT NULL DEFAULT 0 CHECK (generation>=0),
 lease_epoch BIGINT NOT NULL DEFAULT 0 CHECK (lease_epoch>=0),
 lease_owner TEXT, lease_until TIMESTAMPTZ,
 cancel_requested BOOLEAN NOT NULL DEFAULT false,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 FOREIGN KEY(agent_id,agent_version) REFERENCES ama_agent_versions(agent_id,agent_version),
 CHECK ((lease_owner IS NULL AND lease_until IS NULL) OR (lease_owner IS NOT NULL AND lease_until IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS ama_m4_runs_claim_idx ON ama_m4_runs(state,lease_until);

CREATE TABLE IF NOT EXISTS ama_m4_events (
 event_id TEXT PRIMARY KEY,
 event_sequence BIGSERIAL UNIQUE,
 run_id TEXT NOT NULL REFERENCES ama_m4_runs(run_id),
 event_type TEXT NOT NULL, state TEXT NOT NULL,
 lease_epoch BIGINT NOT NULL,
 detail JSONB NOT NULL DEFAULT '{}'::jsonb,
 recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ama_m4_events_run_idx ON ama_m4_events(run_id,event_sequence);

CREATE TABLE IF NOT EXISTS ama_m4_attempts (
 attempt_id TEXT PRIMARY KEY,
 run_id TEXT NOT NULL REFERENCES ama_m4_runs(run_id),
 step_id TEXT NOT NULL, worker_ref TEXT NOT NULL,
 lease_epoch BIGINT NOT NULL CHECK(lease_epoch>0),
 recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ama_m4_attempts_run_idx ON ama_m4_attempts(run_id,recorded_at);

CREATE TABLE IF NOT EXISTS ama_m4_checkpoints (
 checkpoint_id TEXT PRIMARY KEY,
 run_id TEXT NOT NULL REFERENCES ama_m4_runs(run_id),
 generation BIGINT NOT NULL CHECK(generation>0),
 lease_epoch BIGINT NOT NULL CHECK(lease_epoch>0),
 state_data JSONB NOT NULL,
 state_sha256 TEXT NOT NULL CHECK(state_sha256 ~ '^[0-9a-f]{64}$'),
 recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(run_id,generation)
);

CREATE TABLE IF NOT EXISTS ama_m4_effects (
 effect_id TEXT PRIMARY KEY,
 run_id TEXT NOT NULL REFERENCES ama_m4_runs(run_id),
 operation_key TEXT NOT NULL,
 attempt_id TEXT NOT NULL REFERENCES ama_m4_attempts(attempt_id),
 target_scope TEXT NOT NULL, effect_class TEXT NOT NULL,
 state TEXT NOT NULL DEFAULT 'PREPARED'
   CHECK(state IN ('PREPARED','DISPATCHED','UNKNOWN','COMMITTED','NOT_APPLIED','BLOCKED')),
 callback_result_sha256 TEXT CHECK(callback_result_sha256 ~ '^[0-9a-f]{64}$'),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(run_id,operation_key)
);
CREATE INDEX IF NOT EXISTS ama_m4_effects_unsettled_idx ON ama_m4_effects(run_id,state);

CREATE TABLE IF NOT EXISTS ama_m4_receipts (
 receipt_id TEXT PRIMARY KEY,
 effect_id TEXT NOT NULL REFERENCES ama_m4_effects(effect_id),
 outcome TEXT NOT NULL CHECK(outcome IN ('COMMITTED','NOT_APPLIED','INDETERMINATE')),
 verifier_ref TEXT NOT NULL,
 evidence_ref TEXT NOT NULL,
 evidence_sha256 TEXT NOT NULL CHECK(evidence_sha256 ~ '^[0-9a-f]{64}$'),
 recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ama_m4_receipts_effect_idx ON ama_m4_receipts(effect_id,recorded_at);

-- Append-only proof tables, mutable run/effect state tables require SQL role isolation.
DO $$ BEGIN
 IF to_regprocedure('ffos_reject_mutation()') IS NULL THEN
  RAISE EXCEPTION 'ffos_reject_mutation() required: base registry not migrated';
 END IF;
END $$;
DROP TRIGGER IF EXISTS ama_m4_events_immutable ON ama_m4_events;
CREATE TRIGGER ama_m4_events_immutable BEFORE UPDATE OR DELETE ON ama_m4_events
FOR EACH ROW EXECUTE FUNCTION ffos_reject_mutation();
DROP TRIGGER IF EXISTS ama_m4_attempts_immutable ON ama_m4_attempts;
CREATE TRIGGER ama_m4_attempts_immutable BEFORE UPDATE OR DELETE ON ama_m4_attempts
FOR EACH ROW EXECUTE FUNCTION ffos_reject_mutation();
DROP TRIGGER IF EXISTS ama_m4_checkpoints_immutable ON ama_m4_checkpoints;
CREATE TRIGGER ama_m4_checkpoints_immutable BEFORE UPDATE OR DELETE ON ama_m4_checkpoints
FOR EACH ROW EXECUTE FUNCTION ffos_reject_mutation();
DROP TRIGGER IF EXISTS ama_m4_receipts_immutable ON ama_m4_receipts;
CREATE TRIGGER ama_m4_receipts_immutable BEFORE UPDATE OR DELETE ON ama_m4_receipts
FOR EACH ROW EXECUTE FUNCTION ffos_reject_mutation();
-- Required for production: restricted SQL roles, authenticated CDX policy and receipt
-- verifier, independent operator reconciliation, operational incident checks and approval.
