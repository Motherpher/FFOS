-- AMA-07/08. Apply after packages/registry/schema.sql and 0002_agent_stable.sql.
-- Proposed only; not applied to production.
ALTER TABLE ama_agent_lifecycle_events ADD COLUMN IF NOT EXISTS event_sequence BIGSERIAL;
CREATE UNIQUE INDEX IF NOT EXISTS ama_lifecycle_sequence_idx ON ama_agent_lifecycle_events(event_sequence);
-- Each candidate version has an independent state: registration cannot displace ACTIVE.
CREATE OR REPLACE VIEW ama_agent_current_lifecycle AS
SELECT DISTINCT ON (agent_id,agent_version)
  agent_id,agent_version,to_state AS lifecycle_state,event_id,actor_ref,
  authority_ref,mandate_ref,decision_ref,policy_ref,occurred_at
FROM ama_agent_lifecycle_events
ORDER BY agent_id,agent_version,event_sequence DESC;
ALTER TABLE ama_agent_conformance_events ADD COLUMN IF NOT EXISTS definition_sha256 TEXT;
ALTER TABLE ama_agent_conformance_events ADD COLUMN IF NOT EXISTS bindings_sha256 TEXT;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ama_conformance_definition_digest_shape') THEN
    ALTER TABLE ama_agent_conformance_events ADD CONSTRAINT ama_conformance_definition_digest_shape
      CHECK (definition_sha256 IS NULL OR definition_sha256 ~ '^[0-9a-f]{64}$');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='ama_conformance_bindings_digest_shape') THEN
    ALTER TABLE ama_agent_conformance_events ADD CONSTRAINT ama_conformance_bindings_digest_shape
      CHECK (bindings_sha256 IS NULL OR bindings_sha256 ~ '^[0-9a-f]{64}$');
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS ama_effect_evidence_events (
  event_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  agent_id TEXT NOT NULL,
  agent_version TEXT NOT NULL,
  workflow_id TEXT NOT NULL,
  workflow_version TEXT NOT NULL,
  principal_ref TEXT NOT NULL,
  authority_ref TEXT NOT NULL,
  mandate_ref TEXT NOT NULL,
  capability_id TEXT NOT NULL,
  target_ref TEXT NOT NULL,
  effect_class TEXT NOT NULL,
  policy_pin TEXT NOT NULL,
  policy_decision_ref TEXT NOT NULL,
  spetl_receipt_ref TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('ALLOW','DENY','HOLD')),
  stage TEXT NOT NULL CHECK (stage IN ('PRE_EFFECT','POST_EFFECT','BLOCKED')),
  detail TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (agent_id,agent_version) REFERENCES ama_agent_versions(agent_id,agent_version)
);
CREATE INDEX IF NOT EXISTS ama_effect_run_idx ON ama_effect_evidence_events(run_id,recorded_at);
CREATE INDEX IF NOT EXISTS ama_effect_agent_idx ON ama_effect_evidence_events(agent_id,agent_version,recorded_at);
DROP TRIGGER IF EXISTS ama_effect_no_update ON ama_effect_evidence_events;
CREATE TRIGGER ama_effect_no_update BEFORE UPDATE OR DELETE
ON ama_effect_evidence_events FOR EACH ROW EXECUTE FUNCTION ffos_reject_mutation();
-- Still required: production DB RBAC, independent Director authentication, verified CDX
-- policy adapter/SPETL, transactional effect leases, deployment and live C4/C5 testing.
