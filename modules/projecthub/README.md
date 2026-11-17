# FFOS ProjectHub module

Native FFOS ProjectHub implementation established through `FFOS-DEVOPS-PH-RECON-001`.

**Release state:** RELEASED_INTERNAL_BASELINE  
**Deployment state:** NOT_DEPLOYED  
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
- live production database migration;
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
