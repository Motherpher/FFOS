# ProjectHub production activation — PROD-WP01/02 source, drift and risk freeze

**Process:** FFOS-DEVOPS-PH-PROD-001  
**Canonical issue:** Motherpher/FFOS#102  
**Frozen implementation source:** `Motherpher/FFOS@d1bbf1545dea19f426ad40b973bd69bb126f1c40`  
**Date:** 2026-11-19  
**Level:** L3 CONTROLLED

## 1. Production source hierarchy

1. Human Director production/effect decisions.
2. ProjectHub Contract v0.4 and PH-WP02 rights/data-class law.
3. Current FFOS repository source at the frozen commit above.
4. Current pinned FFOS CDX anchor/runtime contract.
5. Supabase ProjectHub production admission/runtime records.
6. Issue #110 and its independently verified run receipts.
7. Prior ProjectHub reconstitution records as accepted lineage.
8. Barnombudet donor material as genealogy only; never runtime authority.

## 2. Current production target truth

- Database target: existing FF Estate Supabase project, private `ffos` schema.
- ProjectHub persistence: six append-only/RLS tables from migration 0008.
- Scoped append role: `ffos_projecthub_runtime`, NOLOGIN/NOBYPASSRLS, project-scoped SELECT/INSERT.
- Scoped read role: `ffos_projecthub_reader`, NOLOGIN/NOBYPASSRLS, SELECT only.
- Restricted reader login: separately provisioned server-side identity, member of reader only.
- Accepted live DB receipt: GitHub Actions #44419433670 PASS.
- Accepted synthetic authenticated HTTP receipt: GitHub Actions #44422338772 PASS.
- Production-backed authenticated HTTP receipt: #44422571120 is still WAITING on the required protected-environment Director approval at this freeze.
- Durable/public ProjectHub application host: NOT DEPLOYED.
- Production writer LOGIN: NOT ADMITTED.
- CDX-mediated production A3 write path: NOT ACCEPTED.
- PH-D4/PH-D5: NOT ADMITTED.
- Portfolio enumeration: NOT ADMITTED.
- External provider writes: NOT ADMITTED.

## 3. Post-reconstitution drift ledger

The internal baseline closed at PRs #79/#85/#86. Since then ProjectHub production work has added:

- PR #107: private project-scoped NOLOGIN runtime role and RLS.
- PR #108: fail-closed scoped read adapter and guarded API.
- PR #109: live scoped Supabase role acceptance record.
- PR #111: separate SELECT-only reader role and protected canary.
- PR #112: live role/credential-environment reconciliation.
- PR #113: safe canary diagnostics.
- PR #114: fingerprint-pinned Supabase CA/TLS remediation.
- PR #115: Director-approved live DB canary PASS.
- PR #116: authenticated Next.js HTTP acceptance runner and synthetic cross-project E2E.
- PR #117: evidence ledger; live production-backed HTTP run remains gated.

This work is adopted as production-activation evidence, not treated as a new ProjectHub reconstruction.

## 4. Principal and authority model

- Human Director: project creation, production release, A5, and any separately governed A4 decision.
- Project role principals: only explicit project-scoped grants, bounded by data-class ceiling and validity.
- Service identities: backend-only; no browser credential or direct Supabase Data API privilege.
- Database roles: defense-in-depth execution identities. A PostgreSQL custom scope setting is not authority.
- Content, project payloads and linked artifacts cannot grant authority.

## 5. Data-class admission

- PH-D0–PH-D2: admissible subject to normal ProjectHub authorization.
- PH-D3: admissible only inside the existing restricted project model; participant-identifiable records remain restricted and must not be inferred as broadly admitted.
- PH-D4: hard HOLD for this process unless a separate explicit Director/security decision is made.
- PH-D5: never ProjectHub content.

## 6. L3 threat baseline

Primary threats:
- stolen backend credential selecting arbitrary project scope;
- unscoped/portfolio enumeration;
- cross-project leakage through DB or relation traversal;
- write path bypassing ProjectHub rights or CDX;
- direct role inheritance or browser-visible database credentials;
- false success where policy/evidence service is unavailable;
- partial write without idempotency/audit;
- commit failure after an apparently permissive effect decision;
- PH-D4 admission by configuration drift;
- provider/link state falsely shown as live.

Required invariants:
- all project DB access uses one transaction-bound project scope;
- no direct table access for runtime LOGIN identities;
- write role is separate from reader role;
- A3 fails closed unless local rights and pinned CDX decision are permissive;
- canonical writes are atomic, append-only, idempotent and versioned;
- PH-D4/5 reject before persistence;
- A4 and A5 cannot ride the generic A3 path;
- no provider write is enabled by ProjectHub production activation alone.

## 7. Rollback/recovery baseline

- Source rollback: revert exact production PR/commit; never rewrite accepted history.
- Runtime toggle rollback: reads/writes default false and may be disabled independently.
- Database rollback: append-only historical rows are not deleted; failed transactions must roll back before commit.
- Schema rollback: new admission migrations must be additive and have an explicit inverse/revocation plan before live application.
- Credential rollback: revoke/rotate backend LOGIN independently of NOLOGIN capability roles.
- CDX unavailable/restrictive: stop mutation; preserve blocked/failure evidence.
- Production host failure: remove/disable ProjectHub runtime endpoint without changing canonical DB history.

## Exit

PROD-WP01 and PROD-WP02 are complete for design purposes. The unresolved production gates are explicit rather than silently reconciled.
