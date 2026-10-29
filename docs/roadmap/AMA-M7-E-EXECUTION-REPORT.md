# AMA M7-E — End-to-End Engineering Integration and Readiness Audit

**Date:** 2026-10-29  
**Repository:** `Motherpher/FFOS`  
**Branch:** `feat/ama-foundation-20261028` / draft PR #19  
**Milestone:** M7-E (engineering integration only)  
**Disposition:** **M7-E-ENGINEERING-PASS — full CI verified; synthetic engineering candidate only**  
**Production disposition:** **BLOCKED** — F8.7 and M7-O are separate mandatory gates.

## Engineering scope and review

1. `packages/agent-model/conformance/ama_m7_integration.py` composes six synthetic reference profiles without modifying the universal AMA normative master:
   - `MINIMAL_MEMORY_OFF` (M1)
   - `E0_CLASSIFIED_READ_PRECHECK` (M2)
   - `MEMORY_ON_PROFILE` (M3)
   - `DURABLE_UNKNOWN_AND_RECONCILIATION` (M4)
   - `EVALUATION_TEN_AXIS` (M5)
   - `OPERATIONAL_CANARY_REVIEW` (M6).
2. `packages/agent-model/conformance/tests/test_m7e_integration.py` tests the six-profile gate, deterministic digests, reference export, independent memory profiles, bad pins, unauthorized E0 recipient, false M5 authorization, revoked M6 tooling and forged/empty F8 preflight. Synthetic PASS never changes an authority flag.
3. `packages/agent-runtime/tests/m7e-end-to-end-pg.test.mjs` composes actual disposable PostgreSQL M4/M6 coordinator state with F8 read/effect adapters. All upstream policy, signatures, identity, release and independent custody are **CI test doubles**. It exercises a classified E0 read, simulated E2 write, UNKNOWN/HOLD -> externally modeled reconciliation -> reviewed resume, policy-unavailable fail-closed behavior, and emergency suspension with evidence preservation.
4. `.github/workflows/ama-conformance.yml` includes M7-E unit and PostgreSQL tests plus an explicit M7-E report generation command and artifact upload; CI uses disposable PostgreSQL 17 and pinned Python/Node environments.
5. The F8 preflight must still say `BLOCKED_EXTERNAL_GATES`. A forged verified/released state is rejected. Static positive evidence is not live governance authority.

## Test evidence / independent review gate

**[GitHub Actions 40848470365](https://github.com/Motherpher/FFOS/actions/runs/40848470365) completed SUCCESS** for code baseline `f917e551813c9367f0433605c1e451c3708c91d2`: **202 Python + 9 shared-model + 105 runtime/PostgreSQL tests = 316 combined** (prior M0–M6 tests included). The M7-E six-profile gate emitted `SYNTHETIC_REFERENCE_PASS`, with F8.7 explicitly `BLOCKED` and deployment authorization false. All M5/M6 and M7-E synthetic JSON artifacts were uploaded in [CI artifact 12885529212](https://github.com/Motherpher/FFOS/actions/runs/40848470365/artifacts/12885529212). The artifact establishes CI integration evidence, not independently signed live source attestation.

Required acceptance checklist:
- [x] Generic synthetic reference instances separated from AMA master.
- [x] Integrated M1–M6 contract checks and adversarial unit cases implemented.
- [x] E0 classified-read and simulated E2 durable effect paths implemented in disposable PostgreSQL test suite.
- [x] Memory OFF/ON independently assessed.
- [x] Fail-closed F8 preflight enforced; no implicit release or self-acceptance.
- [x] CI workflow wired to M7-E reference, PostgreSQL suite and inspectable artifact.
- [x] Exact-head GitHub Actions SUCCESS, test totals and CI artifact generation verified against the completed run.
- [ ] Independent human engineering audit acceptance documented (remains outside CI).

## Remaining non-negotiable blockers

- **F8.7:** authentic CDX pinned release, independently attested policy/signature verification, live FFOS host runtime binding, actual revocation checks and independent SPETL custody.
- **M5:** genuine independent oracle and operational C4/C5 evidence, not synthetic attestors.
- **M6:** real telemetry, policy freshness, host-installed admission, incident operations, deployment/canary/rollback implementation, production data governance.
- **M7-O:** independent operational admission, human authorization and acceptance of live estate behavior.

**No production deployment, effect permission, merge, canonical AMA adoption, CDX constitutional mutation, migration to production or first-class agent activation is authorized by M7-E.**

## Decision and sequence

M6 -> M7-E engineering CI verification -> F8.7 governed external CDX binding -> M7-O independent operational readiness -> separately approved production decision.
