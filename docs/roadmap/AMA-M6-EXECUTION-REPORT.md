# AMA M6 — Operational Engineering Execution and Verification Report

**Date:** 2026-10-29  
**Milestone:** M6 / F7 — Host-neutral operational interfaces and compatibility  
**Repository:** `Motherpher/FFOS`, branch `feat/ama-foundation-20261028`, draft PR #19  
**Disposition:** **M6-OPERATIONAL-CONTRACT-PASS: ENGINEERING CANDIDATE VERIFIED**  
**Not achieved:** Live F8.7 security binding, independently verified M7-O operational readiness, human normative adoption or production deployment.

## Implemented deliverables

1. **Six agent-neutral Draft 2020-12 operational schemas:** `operational-profile`, `compatibility-assessment`, `health-snapshot`, `incident-record`, `release-plan`, `rollback-plan`. Candidate schema count **39 → 45**; historical v1 and universal `docs/architecture/AMA.md` unchanged.
2. **Typed interface:** `packages/agent-model/src/operations-vnext.ts`, independent of host agents, policy providers and protocol implementations.
3. **Operational conformance:** `packages/agent-model/conformance/ama_operations.py`. Validates version/change impact, pinned model/tool/protocol compatibility, signal completeness, health thresholds, independent observation-verifier port, incident severity/closure evidence, canary limits, complete safety checks, rollback consistency and no-self-acceptance. Positive/negative synthetic regressions in `tests/test_m6_operations.py`.
4. **Durable host coordination:** `packages/agent-runtime/src/operational-steward.ts` supplies independent-approval-bound `recordHealth`, `prepareRelease` and `emergencySuspend`; `M6GuardedAdmission` composes the existing M4 admission port with a version-level persistent emergency suspension.
5. **Disposable PostgreSQL migration:** `packages/registry/migrations/0005_ama_m6_operations.sql` creates append-only health, incident, incident-action, release-proposal and suspension records; an M4 run-insert trigger locks on agent identity to prevent run-creation races after suspension.
6. **Real PostgreSQL integration regressions:** `packages/agent-runtime/tests/m6-operations-pg.test.mjs` verifies independently authorized containment, atomic lease fencing, HOLD/UNKNOWN preservation, immutable audit, denial after revocation, forged/unavailable review rejection, healthy observation requirement, blocked high-severity incidents and impossibility of release mutation.
7. **Machine-readable CI evidence:** `packages/agent-model/conformance/m6_emit_ci_candidate.py` labels outcomes `SYNTHETIC_TEST_ENVIRONMENT`, never operational certification, and enumerates remaining live acceptance blockers.
8. **Roadmap and package documentation:** [M6 specification](AMA-M6-OPERATIONAL-LIFECYCLE-CONTRACTS.md), readme integration and draft PR tracking.

## Verification evidence

**[GitHub Actions run 40846425828](https://github.com/Motherpher/FFOS/actions/runs/40846425828) — SUCCESS.**

| Verification | Passed |
| --- | ---: |
| Python M0–M6 conformance, adversarial and audit regression suite | 190 |
| Shared model Node tests | 9 |
| Runtime and actual disposable PostgreSQL tests | 99 |
| **Combined total** | **298** |

All F8 frozen-source mapping checks and the intentionally blocked F8.7 preflight succeeded. Candidate M5 and M6 machine reports and the ordinary static conformance artifact were generated and uploaded. [Workflow evidence artifact 12884408775](https://github.com/Motherpher/FFOS/actions/runs/40846425828/artifacts/12884408775). These numbers include prior milestone tests and are **not 298 M6-exclusive cases**.

The full runtime suite has real PostgreSQL isolation and transactions. Independent authority, telemetry attestation and release-review services are **test doubles**. Passing tests establishes deterministic engineering behavior, not authentic production identities or security enforcement.

## Critical safety findings

- **Compatibility cannot grant promotion.** Model/tool/protocol major changes or insufficiently assessed impact are rejected or flagged for human review. The optional protocol adapters do not become universal AMA requirements.
- **Health and cost are genuine preflight concerns.** Absent source signals, threshold failures, policy drift, revoked tooling, unknown external effects or unverified health observations block static release eligibility.
- **Incident authority is external.** The technical steward cannot simply order itself to stop or reactivate production. Emergency suspension requires independently verified authorization and is checked again inside the transaction.
- **Emergency work is fenced.** Suspended M4 run leases become invalid; active/queued runs are cancelled, while possibly committed external effects are retained as HOLD/UNKNOWN for external reconciliation. A persistent suspension tombstone and DB insert trigger block fresh runs for the same agent version.
- **Release and rollback are proposals only.** A verified, persisted health observation and clean incident/effect evidence are required for preparing a release proposal. It remains `APPROVAL_PENDING`; no deployment, traffic allocation, version promotion or actual rollback API is introduced.
- **Evidence survives containment.** Append-only records cannot be updated or deleted, including incident, suspension, per-run action, health and proposal history.

## Precisely bounded residual risks

1. **F8.7 remains external and blocked:** CDX `PRE_RELEASE`, FFOS `PINNED_COMMIT` / `BOUND_PENDING_RUNTIME_INTEGRATION`; real identity/policy/revocation and independent SPETL custody are not connected.
2. **Host wiring required:** `M6GuardedAdmission` must be installed in M4. The schema migration itself blocks new run insertion after suspension, but revocation/claim checks and live policy/effect gate still require their host integrations. No guarantee of atomic remote effects across network providers is claimed.
3. **Independent monitoring not present:** the actual collector, alert delivery, OpenTelemetry exporter, incident rota and cost/billing data sources are not deployed.
4. **Release controls not live:** release proposal ingestion does not operate a canary traffic router, signed version attestation, or actual rollback. Those are later authorized integration gates.
5. **Data-governance work remains:** production SQL roles, encryption and retention for operational JSONB, incident minimization and backups require an independent implementation review.
6. **Canonical normative adoption and M7-O pending:** the v0.2 candidate is not automatically adopted through CI. Independent M5 live evidence, F8.7 authorization and governing human acceptance are required.

## Handoff

Proceed with **M7-E — end-to-end engineering integration and readiness audit**, using the F8.1–F8.6 consumer contracts and the disposable M0–M6 runtime. Complete **F8.7** afterwards, then execute **M7-O — independent live operational verification**, before any production deployment or first-class agent activation.

**No production migration, CDX constitutional change, merge of draft PR #19 or live effect was authorized or performed.**
