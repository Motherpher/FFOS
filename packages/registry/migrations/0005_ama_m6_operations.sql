-- M6 development candidate: append-only incident, health and release proposals.
-- Apply to disposable CI only pending independent migration and database-role approval.
-- Source-of-truth authority remains the registered agent and external governing services.
CREATE TABLE IF NOT EXISTS ama_m6_health_observations (
 observation_id TEXT PRIMARY KEY,
 agent_id TEXT NOT NULL,agent_version TEXT NOT NULL,
 observed_at TIMESTAMPTZ NOT NULL,
 signal_digest TEXT NOT NULL CHECK(signal_digest ~ '^[0-9a-f]{64}$'),
 signal_data JSONB NOT NULL, evidence_ref TEXT NOT NULL,
 independent_verifier_ref TEXT NOT NULL,
 recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 FOREIGN KEY(agent_id,agent_version) REFERENCES ama_agent_versions(agent_id,agent_version)
);
CREATE INDEX IF NOT EXISTS ama_m6_health_agent_time ON ama_m6_health_observations(agent_id,agent_version,recorded_at);
CREATE TABLE IF NOT EXISTS ama_m6_incidents (
 incident_id TEXT PRIMARY KEY,agent_id TEXT NOT NULL,agent_version TEXT NOT NULL,
 kind TEXT NOT NULL CHECK(kind IN ('POLICY_DRIFT','REVOKED_TOOL','MODEL_SUBSTITUTION','PROTOCOL_BREAK',
             'UNSETTLED_EFFECT','HEALTH_DEGRADATION','PRIVACY_BREACH','UNKNOWN')),
 severity TEXT NOT NULL CHECK(severity IN ('LOW','MODERATE','HIGH','CRITICAL')),
 event_type TEXT NOT NULL CHECK(event_type IN ('RECORDED','INDEPENDENT_EMERGENCY_SUSPENSION','CONTAINMENT_REVIEW')),
 evidence_ref TEXT NOT NULL,authority_ref TEXT NOT NULL,
 recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 FOREIGN KEY(agent_id,agent_version) REFERENCES ama_agent_versions(agent_id,agent_version)
);
CREATE TABLE IF NOT EXISTS ama_m6_incident_actions (
 action_id TEXT PRIMARY KEY,
 incident_id TEXT NOT NULL REFERENCES ama_m6_incidents(incident_id),
 run_id TEXT NOT NULL REFERENCES ama_m4_runs(run_id),
 before_state TEXT NOT NULL, after_state TEXT NOT NULL,
 lease_epoch BIGINT NOT NULL, uncertain_effects BIGINT NOT NULL DEFAULT 0,
 recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(incident_id,run_id)
);
CREATE TABLE IF NOT EXISTS ama_m6_release_proposals (
 proposal_id TEXT PRIMARY KEY,
 agent_id TEXT NOT NULL,agent_version TEXT NOT NULL,
 target_version TEXT NOT NULL,
 candidate_digest TEXT NOT NULL CHECK(candidate_digest ~ '^[0-9a-f]{64}$'),
 compatibility_evidence_ref TEXT NOT NULL,
 health_evidence_ref TEXT NOT NULL,
 rollback_ref TEXT NOT NULL,
 proposer_ref TEXT NOT NULL,
 canary_percent INT NOT NULL CHECK(canary_percent BETWEEN 1 AND 100),
 state TEXT NOT NULL DEFAULT 'APPROVAL_PENDING' CHECK(state='APPROVAL_PENDING'),
 recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 FOREIGN KEY(agent_id,agent_version) REFERENCES ama_agent_versions(agent_id,agent_version)
);
-- No mutable release-state, no production deployment API and no self-acceptance.
DO $$ BEGIN
 IF to_regprocedure('ffos_reject_mutation()') IS NULL THEN
  RAISE EXCEPTION 'ffos_reject_mutation() missing';
 END IF;
END $$;
DROP TRIGGER IF EXISTS ama_m6_health_immutable ON ama_m6_health_observations;
CREATE TRIGGER ama_m6_health_immutable BEFORE UPDATE OR DELETE ON ama_m6_health_observations
FOR EACH ROW EXECUTE FUNCTION ffos_reject_mutation();
DROP TRIGGER IF EXISTS ama_m6_incidents_immutable ON ama_m6_incidents;
CREATE TRIGGER ama_m6_incidents_immutable BEFORE UPDATE OR DELETE ON ama_m6_incidents
FOR EACH ROW EXECUTE FUNCTION ffos_reject_mutation();
DROP TRIGGER IF EXISTS ama_m6_actions_immutable ON ama_m6_incident_actions;
CREATE TRIGGER ama_m6_actions_immutable BEFORE UPDATE OR DELETE ON ama_m6_incident_actions
FOR EACH ROW EXECUTE FUNCTION ffos_reject_mutation();
DROP TRIGGER IF EXISTS ama_m6_proposals_immutable ON ama_m6_release_proposals;
CREATE TRIGGER ama_m6_proposals_immutable BEFORE UPDATE OR DELETE ON ama_m6_release_proposals
FOR EACH ROW EXECUTE FUNCTION ffos_reject_mutation();
