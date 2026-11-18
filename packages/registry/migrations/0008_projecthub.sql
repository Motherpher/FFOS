-- FFOS ProjectHub native persistence v0008.
-- L3 design: explicit isolated FFOS schema, append-oriented history, no live migration claim.
CREATE SCHEMA IF NOT EXISTS ffos;

CREATE OR REPLACE FUNCTION ffos.reject_projecthub_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $
BEGIN
  RAISE EXCEPTION 'FFOS ProjectHub history is append-only: % is not permitted on %', TG_OP, TG_TABLE_NAME;
END;
$$;

CREATE TABLE IF NOT EXISTS ffos.projecthub_projects (
  row_id bigserial PRIMARY KEY,
  project_id text NOT NULL,
  version integer NOT NULL CHECK(version > 0),
  title text NOT NULL,
  status text NOT NULL,
  data_class text NOT NULL CHECK(data_class IN ('PH-D0','PH-D1','PH-D2','PH-D3')),
  methodology_profile text NOT NULL CHECK(methodology_profile IN ('FULL_FF','CONFIGURED','PROJECT_NATIVE')),
  payload jsonb NOT NULL,
  provenance jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id,version)
);
CREATE INDEX IF NOT EXISTS projecthub_projects_current_idx ON ffos.projecthub_projects(project_id,version DESC);

CREATE TABLE IF NOT EXISTS ffos.projecthub_nodes (
  row_id bigserial PRIMARY KEY,
  node_id text NOT NULL,
  project_id text NOT NULL,
  version integer NOT NULL CHECK(version > 0),
  kind text NOT NULL,
  title text NOT NULL,
  payload jsonb NOT NULL,
  provenance jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(node_id,version)
);
CREATE INDEX IF NOT EXISTS projecthub_nodes_project_idx ON ffos.projecthub_nodes(project_id,node_id,version DESC);

CREATE TABLE IF NOT EXISTS ffos.projecthub_relations (
  row_id bigserial PRIMARY KEY,
  relation_id text NOT NULL,
  project_id text NOT NULL,
  version integer NOT NULL CHECK(version > 0),
  subject_id text NOT NULL,
  predicate text NOT NULL,
  object_id text NOT NULL,
  scope text NOT NULL CHECK(scope IN ('OWNED','SHARED_REFERENCE','EXTERNAL_REFERENCE')),
  payload jsonb NOT NULL,
  provenance jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(relation_id,version)
);
CREATE INDEX IF NOT EXISTS projecthub_relations_project_idx ON ffos.projecthub_relations(project_id,relation_id,version DESC);

CREATE TABLE IF NOT EXISTS ffos.projecthub_events (
  event_id text PRIMARY KEY,
  project_id text NOT NULL,
  object_id text NOT NULL,
  event_type text NOT NULL,
  from_state text,
  to_state text,
  principal_ref text NOT NULL,
  authority_ref text NOT NULL,
  mandate_ref text NOT NULL,
  command_id text NOT NULL,
  correlation_id text NOT NULL,
  causation_id text NOT NULL,
  data_class text NOT NULL CHECK(data_class IN ('PH-D0','PH-D1','PH-D2','PH-D3')),
  occurred_at timestamptz NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  provenance jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS projecthub_events_project_idx ON ffos.projecthub_events(project_id,occurred_at DESC);

CREATE TABLE IF NOT EXISTS ffos.projecthub_idempotency (
  idempotency_key text PRIMARY KEY,
  project_id text NOT NULL,
  operation text NOT NULL,
  command_digest text NOT NULL CHECK(command_digest ~ '^[a-f0-9]{64}$'),
  result jsonb NOT NULL,
  recorded_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS ffos.projecthub_role_grants (
  row_id bigserial PRIMARY KEY,
  grant_id text NOT NULL,
  project_id text NOT NULL,
  version integer NOT NULL CHECK(version > 0),
  principal_ref text NOT NULL,
  role text NOT NULL CHECK(role IN ('PROJECT_OWNER','PROJECT_OPERATOR','REVIEWER','SERVICE','PARTICIPANT_DATA_STEWARD')),
  allowed_operations jsonb NOT NULL,
  data_class_ceiling text NOT NULL CHECK(data_class_ceiling IN ('PH-D0','PH-D1','PH-D2','PH-D3')),
  valid_from timestamptz NOT NULL,
  valid_until timestamptz,
  status text NOT NULL CHECK(status IN ('ACTIVE','REVOKED','EXPIRED')),
  grant_authority_ref text NOT NULL,
  payload jsonb NOT NULL,
  provenance jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(grant_id,version)
);
CREATE INDEX IF NOT EXISTS projecthub_grants_lookup_idx ON ffos.projecthub_role_grants(project_id,principal_ref,grant_id,version DESC);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['projecthub_projects','projecthub_nodes','projecthub_relations','projecthub_events',
                           'projecthub_idempotency','projecthub_role_grants'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON ffos.%I', t || '_immutable', t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE OR DELETE ON ffos.%I FOR EACH ROW EXECUTE FUNCTION ffos.reject_projecthub_mutation()', t || '_immutable', t);
  END LOOP;
END;
$$;

-- Supabase admission hardening. This schema remains private and is NOT an
-- automatically exposed Data API surface. Public/frontend and service_role
-- keys receive no access to ProjectHub tables by default.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'projecthub_projects','projecthub_nodes','projecthub_relations',
    'projecthub_events','projecthub_idempotency','projecthub_role_grants'
  ] LOOP
    EXECUTE format('ALTER TABLE ffos.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE ffos.%I FROM PUBLIC, anon, authenticated, service_role', t);
  END LOOP;
END;
$$;
REVOKE ALL ON SEQUENCE ffos.projecthub_projects_row_id_seq FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON SEQUENCE ffos.projecthub_nodes_row_id_seq FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON SEQUENCE ffos.projecthub_relations_row_id_seq FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON SEQUENCE ffos.projecthub_role_grants_row_id_seq FROM PUBLIC, anon, authenticated, service_role;
REVOKE EXECUTE ON FUNCTION ffos.reject_projecthub_mutation() FROM PUBLIC, anon, authenticated, service_role;

-- Admission boundary: no RLS read/write policies here. A later governed
-- service principal and tested project-scoped auth must be approved before
-- any ProjectHub runtime writes or frontend query access.
