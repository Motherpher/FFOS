-- FFOS Data Asset Registry: isolated schema migration v0007.
-- Never applies the historical 0006 public-schema candidate.
-- Run only after target ownership, privileges and backup are verified.
-- Does not modify public or other application schemas.
CREATE SCHEMA IF NOT EXISTS ffos;

CREATE OR REPLACE FUNCTION ffos.reject_asset_mutation()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'FFOS registry is append-only: % is not permitted on %', TG_OP, TG_TABLE_NAME;
END;
$$;

CREATE TABLE IF NOT EXISTS ffos.data_work_orders (
  work_order_id text PRIMARY KEY,
  request_id text NOT NULL,
  owner_repo text NOT NULL,
  purpose text NOT NULL,
  authority_ref text NOT NULL,
  requirements jsonb NOT NULL,
  created_at timestamptz NOT NULL,
  created_by text NOT NULL
);

CREATE TABLE IF NOT EXISTS ffos.data_asset_versions (
  asset_version_id text PRIMARY KEY,
  asset_id text NOT NULL,
  owner_repo text NOT NULL,
  asset_kind text NOT NULL CHECK(asset_kind IN ('RAW','TABULAR_BASE','SPATIAL_BASE','DERIVED_ANALYSIS','PRESENTATION')),
  schema_ref text NOT NULL,
  location_ref text NOT NULL,
  content_sha256 text NOT NULL CHECK(content_sha256 ~ '^[a-f0-9]{64}$'),
  source_as_of timestamptz NOT NULL,
  validity jsonb NOT NULL,
  compatibility jsonb NOT NULL,
  license_ref text NOT NULL,
  qa_receipt_ref text NOT NULL,
  source_refs jsonb NOT NULL,
  supersedes_version_id text REFERENCES ffos.data_asset_versions(asset_version_id),
  registered_at timestamptz NOT NULL DEFAULT now(),
  registered_by text NOT NULL,
  UNIQUE(asset_id,content_sha256)
);
CREATE INDEX IF NOT EXISTS data_asset_search_idx ON ffos.data_asset_versions(asset_kind,owner_repo);
CREATE INDEX IF NOT EXISTS data_asset_logical_id_idx ON ffos.data_asset_versions(asset_id,registered_at DESC);

CREATE TABLE IF NOT EXISTS ffos.data_reuse_decisions (
  decision_id text PRIMARY KEY,
  work_order_id text NOT NULL REFERENCES ffos.data_work_orders(work_order_id),
  decision text NOT NULL CHECK(decision IN ('REUSE_EXACT','REUSE_WITH_TRANSFORMATION','REFRESH_REQUIRED','NEW_SOURCE_REQUIRED','BLOCKED')),
  candidates jsonb NOT NULL,
  selected_asset_version_ids jsonb NOT NULL,
  rationale text NOT NULL CHECK(length(rationale)>0),
  evidence_refs jsonb NOT NULL,
  decided_by text NOT NULL,
  decided_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS data_reuse_workorder_idx ON ffos.data_reuse_decisions(work_order_id,decided_at);

CREATE TABLE IF NOT EXISTS ffos.data_work_order_asset_links (
  link_id text PRIMARY KEY,
  work_order_id text NOT NULL REFERENCES ffos.data_work_orders(work_order_id),
  asset_version_id text NOT NULL REFERENCES ffos.data_asset_versions(asset_version_id),
  role text NOT NULL CHECK(role IN ('INPUT','OUTPUT','REUSED')),
  run_id text NOT NULL,
  receipt_ref text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(work_order_id,asset_version_id,role,run_id)
);

-- Triggers are schema-qualified and use the dedicated FFOS function, not the
-- public baseline function. No triggers in public or Twin schemas are modified.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['data_work_orders','data_asset_versions',
                           'data_reuse_decisions','data_work_order_asset_links'] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON ffos.%I', t || '_immutable', t);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE OR DELETE ON ffos.%I FOR EACH ROW EXECUTE FUNCTION ffos.reject_asset_mutation()', t || '_immutable', t);
  END LOOP;
END;
$$;
