-- Agent Stable / AMA-07: append-only PostgreSQL migration proposal.
-- SCHEMA ONLY: not applied to a live FFOS database and NOT an activation mechanism.
-- Run under a controlled migration role; application role should have INSERT/SELECT only.

create table if not exists ama_agent_versions (
  agent_id text not null,
  agent_version text not null,
  ama_version text not null,
  definition jsonb not null,
  definition_sha256 text not null check (definition_sha256 ~ '^[0-9a-f]{64}$'),
  source_commit text not null,
  registered_by text not null,
  registered_at timestamptz not null default now(),
  primary key (agent_id, agent_version)
);

create table if not exists ama_agent_binding_versions (
  agent_id text not null,
  agent_version text not null,
  bindings jsonb not null,
  bindings_sha256 text not null check (bindings_sha256 ~ '^[0-9a-f]{64}$'),
  source_commit text not null,
  registered_at timestamptz not null default now(),
  primary key (agent_id, agent_version),
  foreign key (agent_id, agent_version)
    references ama_agent_versions (agent_id, agent_version)
);

create table if not exists ama_agent_conformance_events (
  event_id text primary key,
  agent_id text not null,
  agent_version text not null,
  report_contract text not null,
  report_status text not null check (report_status in ('STATIC_PASS', 'FAIL')),
  report jsonb not null,
  suite_version text not null,
  evidence_ref text not null,
  checked_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  foreign key (agent_id, agent_version)
    references ama_agent_versions (agent_id, agent_version)
);

create index if not exists ama_agent_conformance_ref_idx
  on ama_agent_conformance_events (agent_id, agent_version, checked_at desc);

-- Only authenticated FFOS Director/authorized decision code may append
-- approval events. SQL fields alone do NOT prove authentication.
create table if not exists ama_agent_lifecycle_events (
  event_id text primary key,
  agent_id text not null,
  agent_version text not null,
  from_state text,
  to_state text not null check (to_state in (
    'DRAFT', 'REGISTERED', 'VALIDATED', 'DEPLOYABLE', 'ACTIVE',
    'SUSPENDED', 'DEPRECATED', 'RETIRED'
  )),
  actor_ref text not null,
  authority_ref text not null,
  mandate_ref text not null,
  decision_ref text not null,
  policy_ref text,
  reason text not null,
  evidence_refs jsonb not null default '[]'::jsonb,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  foreign key (agent_id, agent_version)
    references ama_agent_versions (agent_id, agent_version)
);

create index if not exists ama_agent_lifecycle_current_idx
  on ama_agent_lifecycle_events (agent_id, occurred_at desc, recorded_at desc);

create or replace view ama_agent_current_lifecycle as
select distinct on (agent_id)
  agent_id, agent_version, to_state as lifecycle_state, event_id, actor_ref,
  authority_ref, mandate_ref, decision_ref, policy_ref, occurred_at
from ama_agent_lifecycle_events
order by agent_id, occurred_at desc, recorded_at desc;

-- Immutable evidence: existing FFOS append-only trigger function
-- is established by packages/registry/schema.sql.
drop trigger if exists ama_agent_versions_no_update on ama_agent_versions;
create trigger ama_agent_versions_no_update before update or delete
on ama_agent_versions for each row execute function ffos_reject_mutation();

drop trigger if exists ama_agent_bindings_no_update on ama_agent_binding_versions;
create trigger ama_agent_bindings_no_update before update or delete
on ama_agent_binding_versions for each row execute function ffos_reject_mutation();

drop trigger if exists ama_agent_conformance_no_update on ama_agent_conformance_events;
create trigger ama_agent_conformance_no_update before update or delete
on ama_agent_conformance_events for each row execute function ffos_reject_mutation();

drop trigger if exists ama_agent_lifecycle_no_update on ama_agent_lifecycle_events;
create trigger ama_agent_lifecycle_no_update before update or delete
on ama_agent_lifecycle_events for each row execute function ffos_reject_mutation();

-- Still required for production: authenticated service RBAC/RLS, transactional
-- from_state continuity, concurrency/idempotency handling, CDX policy guard,
-- Director acceptance, migration backfill and production database validation.
