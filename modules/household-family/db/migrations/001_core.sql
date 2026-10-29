CREATE TABLE IF NOT EXISTS hf_projects (project_id TEXT PRIMARY KEY, config TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS hf_runs (
 run_id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES hf_projects(project_id),
 wp_id TEXT NOT NULL, wp_version INTEGER NOT NULL, state TEXT NOT NULL,
 revision INTEGER NOT NULL, idempotency_key TEXT NOT NULL, payload TEXT NOT NULL,
 UNIQUE(project_id,wp_id,wp_version), UNIQUE(project_id,idempotency_key)
);
CREATE TABLE IF NOT EXISTS hf_jobs (
 job_id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES hf_projects(project_id),
 run_id TEXT NOT NULL UNIQUE REFERENCES hf_runs(run_id), state TEXT NOT NULL,
 available_at BIGINT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, failure_count INTEGER NOT NULL DEFAULT 0,
 lease_owner TEXT, lease_expires_at BIGINT, last_error TEXT
);
CREATE INDEX IF NOT EXISTS hf_jobs_ready ON hf_jobs(state,available_at);
CREATE TABLE IF NOT EXISTS hf_evidence (
 evidence_id TEXT PRIMARY KEY, run_id TEXT NOT NULL REFERENCES hf_runs(run_id), payload TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS hf_decisions (
 decision_id TEXT PRIMARY KEY, run_id TEXT NOT NULL REFERENCES hf_runs(run_id), signed_provenance TEXT NOT NULL, payload TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS hf_operations (
 operation_key TEXT PRIMARY KEY, run_id TEXT NOT NULL REFERENCES hf_runs(run_id),
 request_hash TEXT NOT NULL, state TEXT NOT NULL, result TEXT
);
CREATE TABLE IF NOT EXISTS hf_webhooks (delivery_id TEXT PRIMARY KEY, body_hash TEXT NOT NULL, received_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS hf_progression_outbox (
 decision_id TEXT PRIMARY KEY REFERENCES hf_decisions(decision_id), project_id TEXT NOT NULL,
 state TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0, available_at BIGINT NOT NULL, last_error TEXT
);
