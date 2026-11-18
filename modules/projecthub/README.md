# FFOS ProjectHub module

Native FFOS ProjectHub implementation established through `FFOS-DEVOPS-PH-RECON-001`.

**Release state:** RELEASED_INTERNAL_BASELINE  
**Deployment state:** PRIVATE DATABASE AND SCOPED NOLOGIN ROLE DEPLOYED — APPLICATION_RUNTIME NOT DEPLOYED  
**Director disposition:** ACCEPT  
**Implementation PR:** #79  
**Merge commit:** `d139bcda3d467fb2e6e9c6729c2ae26fc2ec7f1e`

## Implemented baseline

- independent project creation and lifecycle state;
- `FULL_FF | CONFIGURED | PROJECT_NATIVE` methodology profiles;
- Project Core and eight-dimensional Project Field;
- explicit `OWNED | SHARED_REFERENCE | EXTERNAL_REFERENCE` relation scoping;
- PostgreSQL-backed append-only history;
- transactional Unit-of-Work;
- idempotency, optimistic/versioned state and audit events;
- project role grants and PH-D0–PH-D3 ceilings;
- PH-D4/PH-D5 fail-closed first-release boundary;
- timeline/dependency, finance/funding, evidence/North Star and monitoring engines;
- bounded UDL and FIELD adapters;
- bounded Project Steward;
- CDX-mediated A3 and contract-ready A4 effect path;
- generic A5 execution denied;
- protected ProjectHub web/API candidate;
- review-first linked-artifact semantics;
- real-project acceptance pilots.

## Not deployed / not claimed

The release does **not** itself create a live production ProjectHub service.

Not admitted by this baseline:
- live application/runtime binding (the private database schema is now deployed);
- PH-D4 sensitive-data operation;
- broad multi-user identity/RBAC rollout;
- autonomous external A4 effects;
- grant submission, payment or contract signing;
- live Miro/Figma/Drive/funding-provider writes;
- automatic Pius routing;
- Barnombudet synchronization;
- replacement of canonical UDL/FIELD/Pius runtimes.

Runtime configuration remains fail-closed when ProjectHub database and authority/mandate bindings are absent.

## Canonical design

- `docs/specifications/PROJECTHUB-CONTRACT-v0.4.md`
- `docs/architecture/PROJECTHUB-NATIVE-ARCHITECTURE-v0.1.md`
- `docs/specifications/PROJECTHUB-DATA-MODEL-v0.1.md`
- `docs/specifications/PROJECTHUB-UX-CONTROL-ROOM-v0.1.md`

## Supabase runtime substrate (2026-11-18)

- Existing `FF Estate` database migrated to v0011 with `ffos_projecthub_runtime` (NOLOGIN, NOINHERIT, NOBYPASSRLS), exact project-scoped RLS (6 SELECT + 6 INSERT policies), no public roles, no production project records. Supabase security advisors: 0 findings.
- [FFOS PR #107](https://github.com/Motherpher/FFOS/pull/107) tested project isolation in PostgreSQL and admitted the restricted database role.
- [FFOS PR #108](https://github.com/Motherpher/FFOS/pull/108) introduced guarded, read-only single-connection transaction scoping in the backend and blocked unscoped portfolio enumeration and write activation. CI: ProjectHub PostgreSQL PASS.
- Restricted backend LOGIN credentials, deployed application server, scoped authenticated canary, live CDX A3 write mediation and full portfolio read model are **not yet admitted**. Do not interpret database role or merged source as a live application runtime.
