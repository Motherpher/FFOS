# AMA M2 — Execution and Verification Report

**Milestone:** M2 / F2 — universal, provider-neutral scoped authorization.
**Date:** 2026-10-29
**Development branch:** `feat/ama-foundation-20261028`, draft PR #19.
**State:** Candidate implementation; normative human acceptance pending; no production effect authorization.

## Delivered

1. Six new Draft 2020-12 schemas in `packages/agent-model/schemas/v0.2/`: principal, mandate, delegation, authorization-request, authorization-decision and approval. Existing v0.2 bundle accepts their typed arrays; old v1 manifest remains unchanged.
2. `packages/agent-model/src/authorization-vnext.ts`: portable TypeScript interfaces, isolated from historic runtime types.
3. `packages/agent-model/conformance/ama_authorization.py`: offline, deterministic, fail-closed eligibility checks over identity/principal references, tenant boundaries, root issuer, delegated grants and permission attenuation, validity, capability/effect/resource scope, sensitivity and recipients, policy freshness, human-review declarations and policy-restrictive outcomes.
4. Multidimensional request risk context: data classification, aggregation, purpose, recipient, external exposure, reversibility, impact and financial amount. Abstract resource scope identifiers must be canonical; traversal, encoded separators and ambiguous slashes are rejected.
5. `packages/agent-model/conformance/tests/test_m2_authorization.py`: positive/negative synthetic tests of E0 data disclosure, unknown principals, expired/revoked claims, cross-tenant confusion, forged/self approvals, over-broad delegations, missing/invalid policy declarations, high-risk reviews and ambiguous scopes.
6. CI also parses the TypeScript authority declarations; template purity checks prevent named implementation contamination.

## Critical assurance boundary

The static result vocabulary is `REJECTED` or `STATIC_ELIGIBLE_FOR_EXTERNAL_VERIFICATION`. In every outcome, `authority_granted` is **false**. A successful claim-matching test does not prove principal authentication, mandate signature, approval signature, live revocation freshness, policy issuer, actual resource sensitivity or effect enforcement. It never emits `ALLOW` and never mutates external state.

Identity, mandate, policy and approval evidence digests are versioned identifiers; they are not automatically verified signatures. Real control obligations and denial evidence need a separately trusted host adapter and independent custody (F8), not a self-reported model statement.

## Verification scope

GitHub Actions [run 40808540498](https://github.com/Motherpher/FFOS/actions/runs/40808540498) **completed SUCCESS**, exercising 99 Python, nine shared-model and 38 runtime/PostgreSQL tests (146 combined tests, including prior milestone regressions). The M2 case suite also covers malformed canonical resource scopes, grant-scope escalation and policy-denial paths. Passing CI proves only development/static and disposable-integration behavior, not live C4/C5 or independent activation.

## Remaining and next

- M2 contract design is a technically testable candidate; pending independent approval to adopt v0.2 normative requirements.
- F8 is independent: real trust-source resolution, revocation/decisions and obligations, lossless provider decisions, enforced E0 reads, complete SPETL evidence, and host runtime binding.
- M3 adds typed planning, model and memory-policy profiles.
- M4 strengthens durable external-effect reconciliation; M5 provides live independent evaluation.
- No repository PR merge, CDX constitutional law modification, production database migration or active agent occurred.
