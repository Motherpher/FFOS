# ProjectHub Reconstitution — PH-WP13 Release Candidate

**Process:** FFOS-DEVOPS-PH-RECON-001  
**Level:** L3 Controlled  
**State:** DIRECTOR_ACCEPTED / MERGED  
**Date:** 2026-11-16  
**Implementation PR:** #79 — MERGED  
**Accepted candidate head:** `3196e3e8abc48bb18dd7698f78b4965403eec413`  
**Merge commit:** `d139bcda3d467fb2e6e9c6729c2ae26fc2ec7f1e`

## Candidate proposition

Release the reconstituted FFOS ProjectHub as the **native internal FFOS ProjectHub baseline**, replacing the missing current-estate ProjectHub implementation while preserving the frozen legacy implementation as history/migration evidence.

This release candidate is:
- native to `Motherpher/FFOS`;
- independent of Barnombudet runtime/data;
- operational under PROJECT_NATIVE / CONFIGURED / FULL_FF;
- PostgreSQL-backed by an additive isolated schema contract;
- transactional/idempotent/versioned;
- rights/data-class aware for PH-D0–PH-D3;
- fail-closed for PH-D4/PH-D5;
- CDX-mediated for A3 and contract-ready for A4;
- A5 non-executable through generic runtime;
- equipped with source-backed protected ProjectHub UI/API candidate;
- explicit that live DB/provider deployment is not yet claimed.

## Candidate release scope

### Included
- ProjectHub Contract v0.4;
- native ProjectHub model/module;
- ProjectHub PostgreSQL migration 0008;
- atomic Unit-of-Work;
- role grants and data-class ceilings;
- audit/idempotency/versioning;
- Project Field and evidence-aware North Star;
- timeline, finance, funding and monitoring engines;
- bounded UDL/FIELD adapters;
- Project Steward;
- CDX A3/A4 effect adapter;
- protected ProjectHub web routes/API;
- linked-artifact review semantics;
- real-project pilot evidence.

### Not included / not claimed
- live production database admission;
- PH-D4 sensitive-data operation;
- broad multi-user identity provider/RBAC rollout;
- autonomous external A4 execution;
- grant submission/payment/contract signing;
- live Miro/Figma/Drive/funding provider writes;
- automatic Pius routing;
- Barnombudet synchronization;
- complete UDL or FIELD canonical runtimes.

## L3 verification requirement

Before Director disposition the exact candidate must satisfy:

1. ProjectHub core/PostgreSQL workflow;
2. Next/FFOS web build;
3. current CDX Runtime Binding;
4. current CDX Runtime Diagnostics;
5. AMA conformance;
6. FFOS cloud contract;
7. DevOps model watch;
8. ProjectHub L3 static release assurance;
9. PR mergeability/exact-source identity.

No success on one check substitutes for another.

## Director disposition grammar

The Human Director must explicitly select one:

- **ACCEPT** — candidate may be made ready for merge; deployment remains separately governed.
- **ACCEPT_WITH_CONDITIONS** — merge/release may proceed only with named conditions.
- **HOLD** — retain candidate, no merge/release.
- **REJECT** — return to BUILD/TEST with reasons.

A previous generic `Proceed` is not interpreted as one of these dispositions.

## Current disposition

**ACCEPT — Human Director, 2026-11-18.**

The disposition accepts the native internal ProjectHub baseline for merge/release integration. It does not authorize live production DB admission, PH-D4 handling, broad multi-user deployment, live provider writes, payment/contract/grant effects, automatic Pius routing or Barnombudet synchronization.

PR #79 was merged at `d139bcda3d467fb2e6e9c6729c2ae26fc2ec7f1e`.

Post-merge:
- CDX Runtime Binding 44203675679 — PASS;
- FFOS DevOps model release watch 44203675652 — PASS;
- Household Family CI 44203675680 — PASS;
- Household Family Security 44203675697 — unrelated npm advisory drift, tracked separately in Issue #84. ProjectHub changed no Household files.
