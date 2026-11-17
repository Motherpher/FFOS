# FFOS ProjectHub Native Architecture v0.1

**Process:** FFOS-DEVOPS-PH-RECON-001  
**WP:** PH-WP04  
**State:** DESIGN COMPLETE  
**Date:** 2026-11-16

## 1. Placement

ProjectHub follows the canonical FFOS repository layout.

```text
Motherpher/FFOS
├── modules/
│   └── projecthub/               # FFOS-owned executable ProjectHub domain runtime
├── packages/
│   ├── core-model/               # shared minimal FFOS orchestration types
│   ├── registry/                 # shared append-only event/object infrastructure
│   └── projecthub-model/         # reusable ProjectHub-owned contracts/types
├── apps/
│   └── web/
│       └── app/(protected)/projecthub/
│                                   # native human UI
└── integrations/
    └── ...                         # actual provider/domain adapters only when implemented
```

A `modules/projecthub/` directory is created only when executable code begins in PH-WP06.

## 2. Responsibility split

### `packages/core-model`
Remains deliberately small and domain-neutral:
- PROJECT identity;
- generic work/run/dispatch/output/decision;
- shared provenance/authority vocabulary.

It does not absorb detailed UDL, FIELD, funding or ProjectHub ontologies.

### `packages/registry`
Owns generic durable append-only storage contracts and state-transition continuity.

ProjectHub may extend registry ports where necessary for domain objects, transactions and project-scoped queries, but must not create an ungoverned parallel event ledger.

### `packages/projecthub-model`
Will own ProjectHub-specific:
- types;
- validation schemas;
- method profile;
- data classes/rights vocabulary;
- Project Field;
- ProjectHub object/envelope types;
- monitoring signals;
- linked-artifact contracts;
- Steward proposal/effect contracts.

### `modules/projecthub`
Owns executable domain behavior:
- ingress;
- project graph/scope;
- governance/change;
- work/timeline;
- finance/funding;
- evidence/premise;
- monitoring/North Star;
- Steward orchestration;
- read models;
- persistence adapter;
- domain adapter coordinator.

### `apps/web`
Owns authenticated human-facing ProjectHub UI/API routes. It consumes module/service interfaces; it does not embed domain rules in React components.

## 3. ProjectHub service boundaries

```text
UI/API
  │
  ▼
ProjectHub Application Service
  ├─► Authorization/Rights Gate
  ├─► ProjectHub Domain Engine
  ├─► Project Steward
  ├─► Domain Adapter Ports
  ├─► LinkedArtifact Review
  └─► Unit of Work
         ├─► ProjectHub Store
         ├─► FFOS Registry/Event Store
         └─► Audit/CDX Evidence
```

Read models are derived from canonical state and never become competing stores of truth.

## 4. Transaction law

A canonical internal mutation is one Unit of Work.

At minimum the transaction coordinates:
1. version precondition;
2. authorization result;
3. canonical object/version append;
4. relationship append/change record;
5. state-transition event;
6. ProjectHub audit record;
7. applicable CDX pre-effect evidence for A3;
8. commit.

If any required component fails before commit, no canonical mutation is visible.

External A4 effects are intentionally not placed inside the same DB transaction. They use:
- approved intent;
- CDX pre-effect decision/evidence;
- external call;
- external receipt;
- post-effect reconciliation event.

## 5. Persistence strategy

The first native implementation targets the current FFOS PostgreSQL architecture.

Rules:
- no SQLite production writer;
- no hidden local state file as canonical store;
- no blind migration into an unverified Supabase target;
- schema/application must be testable in temporary PostgreSQL;
- live database admission remains a separate release/deployment step.

The legacy ProjectHub data model is imported only through explicit migration fixtures.

## 6. Project boundary

Every ProjectHub domain object carries immutable project ownership/scope.

A relation can be:
- project-internal;
- shared reference;
- external reference.

Traversal rules are explicit per relation class. Generic “follow every HAS_* edge” behavior is prohibited.

Shared actors/evidence may be referenced by multiple projects without making one project's private graph traversable from another.

## 7. Rights architecture

Read/write evaluation inputs:
- principal;
- principal role/grants;
- project id;
- object/resource id;
- data class;
- requested operation;
- mandate/authority refs;
- purpose;
- applicable project policy;
- applicable CDX effect rule.

Current FFOS `DIRECTOR` remains the only active principal until PH-WP07 introduces tested ProjectHub role grants.

## 8. Domain adapter architecture

Adapters are explicit ports with:
- canonical source id;
- source version;
- accepted input/output schema;
- direction;
- rights/consent prerequisites;
- freshness/provenance;
- failure state;
- no-authority rule.

Initial adapter categories:
- Pius/PIVE — optional source input; RESERVED until current source contract pinned;
- UDL — ProjectHub may hold project-linked outcome/evaluation state; canonical UDL remains external;
- FIELD — ProjectHub may hold actor-system/diagnostic outputs; full FIELD runtime remains external unless separately implemented;
- FFC/DNA — optional methods/artifacts;
- Miro/Figma/Docs/GitHub — work surfaces;
- funding providers — source-authoritative opportunity records after admission.

## 9. CDX architecture

The existing FFOS repository CDX runtime is reused.

ProjectHub adds named local effect surfaces rather than creating a second CDX runtime.

Minimum ProjectHub surfaces:
- `PROJECTHUB_CANONICAL_MUTATION` — A3;
- `PROJECTHUB_EXTERNAL_EFFECT` — A4;
- `PROJECTHUB_MISSION_REDESIGN` — A5 referral/deny from generic mutation;
- `PROJECTHUB_LINKED_ARTIFACT_SYNC` — external sync effect where applicable.

A3/A4 tests must prove ALLOW, restrictive decision and POLICY_UNAVAILABLE/fail-closed behavior plus SPETL evidence.

## 10. API boundary

Initial API families:

- `GET /api/projecthub/projects`
- `GET /api/projecthub/projects/:id`
- `GET /api/projecthub/projects/:id/control-room`
- `POST /api/projecthub/projects`
- `POST /api/projecthub/projects/:id/commands`
- `GET /api/projecthub/projects/:id/events`
- `GET /api/projecthub/projects/:id/steward`
- `POST /api/projecthub/projects/:id/steward/:proposalId/decision`

The command endpoint uses typed commands; it is not an arbitrary patch endpoint.

## 11. Failure semantics

- unknown project → 404 / no data disclosure;
- unauthorized project → fail closed without cross-project existence leakage where applicable;
- stale version → conflict; no silent overwrite;
- invalid command → validation failure;
- unavailable DB → no mutation;
- unavailable CDX for required effect → no effect;
- incomplete external receipt → reconciliation-required, not “success”;
- provider unavailable → staged/failed external state, canonical ProjectHub state remains coherent.

## 12. Observability

Every material operation must be traceable by:
- correlation id;
- causation id;
- project id;
- run/command id;
- principal;
- authority/mandate refs;
- object versions;
- decision/effect receipt;
- timestamp.

PH-D3/PH-D4 content is excluded or minimized in logs.

## Exit

**PH-WP04 DESIGN COMPLETE.**
