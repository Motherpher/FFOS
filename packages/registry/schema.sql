-- FFOS Registry v0.1
-- PostgreSQL baseline. Historical rows are append-only by contract.

create table if not exists ffos_objects (
  row_id bigserial primary key,
  object_id text not null,
  object_type text not null,
  object_version integer not null check (object_version > 0),
  title text not null,
  status text not null,
  parent_id text,
  source_system text not null,
  source_ref text,
  created_by text not null,
  created_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  payload jsonb not null,
  provenance jsonb not null default '[]'::jsonb,
  unique (object_id, object_version)
);

create index if not exists ffos_objects_object_id_idx on ffos_objects(object_id);
create index if not exists ffos_objects_parent_id_idx on ffos_objects(parent_id);
create index if not exists ffos_objects_type_idx on ffos_objects(object_type);

create table if not exists ffos_events (
  event_id text primary key,
  object_id text not null,
  object_type text not null,
  from_state text,
  to_state text not null,
  actor_class text not null,
  actor_id text not null,
  cause_ref text,
  event_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  provenance jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists ffos_events_object_id_idx on ffos_events(object_id, event_at desc);
create index if not exists ffos_events_state_idx on ffos_events(to_state);
create index if not exists ffos_events_actor_idx on ffos_events(actor_class, actor_id);

create table if not exists ffos_external_receipts (
  receipt_id text primary key,
  dispatch_id text not null,
  destination_type text not null,
  external_ref text not null,
  external_version text,
  receipt_status text not null,
  received_at timestamptz not null,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists ffos_receipts_dispatch_idx on ffos_external_receipts(dispatch_id);

-- Current object version is derived from immutable version rows.
create or replace view ffos_current_objects as
select distinct on (object_id)
  object_id,
  object_type,
  object_version,
  title,
  status,
  parent_id,
  source_system,
  source_ref,
  created_by,
  created_at,
  recorded_at,
  payload,
  provenance
from ffos_objects
order by object_id, object_version desc, recorded_at desc;

-- Current transition state is derived from the latest append-only event.
create or replace view ffos_current_state as
select distinct on (object_id)
  object_id,
  object_type,
  to_state as current_state,
  actor_class,
  actor_id,
  event_id,
  event_at,
  cause_ref,
  provenance,
  metadata
from ffos_events
order by object_id, event_at desc, recorded_at desc;

-- Append-only enforcement at the table level.
create or replace function ffos_reject_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'FFOS registry is append-only: % is not permitted on %', TG_OP, TG_TABLE_NAME;
end;
$$;

drop trigger if exists ffos_objects_no_update on ffos_objects;
create trigger ffos_objects_no_update
before update or delete on ffos_objects
for each row execute function ffos_reject_mutation();

drop trigger if exists ffos_events_no_update on ffos_events;
create trigger ffos_events_no_update
before update or delete on ffos_events
for each row execute function ffos_reject_mutation();

drop trigger if exists ffos_receipts_no_update on ffos_external_receipts;
create trigger ffos_receipts_no_update
before update or delete on ffos_external_receipts
for each row execute function ffos_reject_mutation();
