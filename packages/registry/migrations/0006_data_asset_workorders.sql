-- FFOS append-only work order / data asset index extension (candidate migration).
-- Deliberately not applied to any running database by this repository commit.
-- Asset bytes and spatial geometry remain at their authoritative owners.
create table if not exists ffos_data_work_orders (
  work_order_id text primary key,
  request_id text not null,
  owner_repo text not null,
  purpose text not null,
  authority_ref text not null,
  requirements jsonb not null,
  created_at timestamptz not null,
  created_by text not null
);
create table if not exists ffos_data_asset_versions (
  asset_version_id text primary key,
  asset_id text not null,
  owner_repo text not null,
  asset_kind text not null check(asset_kind in ('RAW','TABULAR_BASE','SPATIAL_BASE','DERIVED_ANALYSIS','PRESENTATION')),
  schema_ref text not null,
  location_ref text not null,
  content_sha256 text not null check(content_sha256 ~ '^[a-f0-9]{64}$'),
  source_as_of timestamptz not null,
  validity jsonb not null,
  compatibility jsonb not null,
  license_ref text not null,
  qa_receipt_ref text not null,
  source_refs jsonb not null,
  supersedes_version_id text references ffos_data_asset_versions(asset_version_id),
  registered_at timestamptz not null default now(),
  registered_by text not null,
  unique(asset_id,content_sha256)
);
create index if not exists ffos_data_asset_search_idx on ffos_data_asset_versions(asset_kind, owner_repo);
create index if not exists ffos_data_asset_logical_id_idx on ffos_data_asset_versions(asset_id,registered_at desc);
create table if not exists ffos_data_reuse_decisions (
  decision_id text primary key,
  work_order_id text not null references ffos_data_work_orders(work_order_id),
  decision text not null check(decision in ('REUSE_EXACT','REUSE_WITH_TRANSFORMATION','REFRESH_REQUIRED','NEW_SOURCE_REQUIRED','BLOCKED')),
  candidates jsonb not null,
  selected_asset_version_ids jsonb not null,
  rationale text not null check(length(rationale)>0),
  evidence_refs jsonb not null,
  decided_by text not null,
  decided_at timestamptz not null
);
create index if not exists ffos_reuse_decisions_workorder_idx on ffos_data_reuse_decisions(work_order_id,decided_at);
create table if not exists ffos_data_work_order_asset_links (
  link_id text primary key,
  work_order_id text not null references ffos_data_work_orders(work_order_id),
  asset_version_id text not null references ffos_data_asset_versions(asset_version_id),
  role text not null check(role in ('INPUT','OUTPUT','REUSED')),
  run_id text not null,
  receipt_ref text not null,
  recorded_at timestamptz not null default now(),
  unique(work_order_id,asset_version_id,role,run_id)
);
-- No duplicate independent status tables; append transitions to existing ffos_events.
-- Immutable rows; corrections/supersessions are new records.
do $$
declare name text;
begin
  foreach name in array array[
    'ffos_data_work_orders','ffos_data_asset_versions',
    'ffos_data_reuse_decisions','ffos_data_work_order_asset_links'
  ] loop
    execute format('drop trigger if exists %I on %I', name || '_no_mutation', name);
    execute format(
      'create trigger %I before update or delete on %I for each row execute function ffos_reject_mutation()',
      name || '_no_mutation', name
    );
  end loop;
end $$;
