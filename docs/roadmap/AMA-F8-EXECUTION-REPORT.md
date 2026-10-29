# F8 — Conductellence Security Integration: Execution and Verification Report

**Date:** 2026-10-29  
**Repository:** `Motherpher/FFOS`  
**Branch:** `feat/ama-foundation-20261028` · draft PR #19  
**Milestone:** F8 (separate host-specific security governance and risk enforcement, not normative AMA core)
**Disposition:** **F8.1–F8.6 ENGINEERING CANDIDATE IMPLEMENTED** · **F8.7 LIVE RUNTIME BINDING BLOCKED** · **NO PRODUCTION EFFECTS**

## A. Canonical source reconciliation

The authoritative CDX repository `Hybrismannen/Conductellence-` is unchanged by this work. Inputs verified against it:

1. `LAW/CONDUCTELLENCE-ACT.md`: CDX-LAW-001, law 1.0.0, internally ADOPTED.
2. `GOVERNANCE/release-boundary-v1.json`: 131 frozen sections, no core topology changes without human boundary exception; 69 fully automatable and 62 review-governed sections.
3. `POLICY/control-registry.json`: 69 executable reference control mappings, 18 enforcement surfaces, source Git blob `55dbcdac2f822b59a5a5f0f19eeadfa61d2c7ed0`.
4. `RUNTIME-INTEGRATION/CDX-RUNTIME-001.json`: seven decisions, mandatory control evidence, SPETL v1.1 and consumer-local enforcement.
5. `GOVERNANCE/CDX-ESTATE-ANCHOR-STANDARD.md`: production effects require `PINNED_RELEASE` and independently verified enforcement.
6. `SPETL/schemas/event.schema.json`, `SPETL/custody/github-actions-reference-profile.json`: SPETL v1.1, separate provenance and reference custody (`CDX-CUSTODY-GHA-001` verified **for the CDX reference pipeline**, not for FFOS).
7. `GOVERNANCE/system-state.json`: source-observed `PRE_RELEASE`, `BOOTSTRAP`, `PENDING_RUNTIME_BINDINGS`; WP07 core release blocked by `CDX-BLOCK-REPO-PROTECTION-001`; FFOS consumer runtime not bound.

All source facts are a **dated snapshot**, not a signed live policy or release authorization.

## B. Delivered implementation

| F8 item | Committed engineering artifact | Behavior demonstrated by synthetic tests |
| --- | --- | --- |
| 8.1 Control/law/evidence coverage | `integrations/cdx/f8/control-coverage.json` and `audit_coverage.py` | 131 unique law sections, 69 original control IDs, original law/control/audit/evidence mapping, 62 review-governed sections |
| 8.2 Trusted facts and mandatory control selection | `packages/agent-runtime/src/cdx-f8-policy.ts` | Requires external release attestation, independently collected identity/mandate/target facts and independently verified policy signature; no model-supplied subset of mandatory controls |
| 8.3 Exact seven-way decisions and obligations | `src/effect-gate.ts` + F8 adapter | Distinguishes all seven CDX decisions; restrictive outcomes cannot dispatch; `ALLOW_WITH_CONTROLS` requires verified obligations; no covert downgrade |
| 8.4 Path/history and authority-graph risk | F8 adapter fact snapshot + `assertStillCurrent` and post-PRE effect gate check | Source history and authority-graph digests required; late mutation or release drift triggers denial before callback |
| 8.5 Independent SPETL custody | F8 custody verification interface, `src/cdx-f8-read.ts` evidence port, existing append-only M4 coordinator | Signed decision/custody interface, SPETL v1.1 hash-chain and exact decision-reference correlation, explicit denial on missing/invalid custody. **No live custody service connected.** |
| 8.6 Adversarial security regressions | `tests/cdx-f8-policy.test.mjs`, `tests/cdx-f8-read.test.mjs`, amended `effect-gate.test.mjs` and anchor tests | Missing control, selected-control subset, forged identities, wrong surface, missing classified read grant, policy/attestation outage, late revocation, graph drift, custody mismatch, non-approved controls all fail closed |
| 8.7 Governed release and binding | `src/cdx-anchor.ts`, `governance-source-state.json`, `preflight.py` | Historical `PINNED_COMMIT` cannot authorize production effects. Machine preflight truthfully outputs `BLOCKED_EXTERNAL_GATES`, without changing anchor state. |

No CDX constitutional changes, policy changes or release-state mutations were made.

## C. Important separations

- **Reference control catalogue vs signed policy service:** The local 69-control mapping is a static contract and test source, not a new decision engine. The external policy service must independently enforce controls; the consumer independently checks that results are complete, source-pinned and signed.
- **Read vs consequential effect:** E0 is routed through an independently verified grant/recipient/purpose/classification gate. The existing `AgentEffectGate` still rejects E0 and E4 rather than treating them as ordinary consequential effects.
- **Approval vs permission:** `ALLOW_WITH_CONTROLS` is not ALLOW until controls have been externally attested. `REQUIRE_HUMAN`, `QUARANTINE`, `DENY`, `SECURITY_STOP` and `CONSTITUTIONAL_STOP` remain distinct restrictive outcomes.
- **Signature/receipt fields vs actual authenticity:** Test doubles can return realistic-looking references. Nothing here establishes real signature verification or independent operational SPETL custody until the corresponding external ports are configured.
- **M4 recovery:** Existing durable coordinator treats unknown remote effects as `HOLD/UNKNOWN` and does not auto-replay. F8 adds policy and evidence checks; it cannot magically provide atomic exactly-once remote transactions.

## D. CI evidence

The F8 changes are covered by the existing `ama-conformance.yml` test matrix, plus the F8 source matrix audit and fail-closed release preflight. The CDX anchor audit remains independently triggered. The upload-artifact path was repaired so both M5 and F8 machine-readable reports can be retained.

[Final code GitHub Actions run 40840109289](https://github.com/Motherpher/FFOS/actions/runs/40840109289) **completed SUCCESS**, covering **169 Python + 9 shared-model + 88 runtime/PostgreSQL tests = 266 combined** (existing M0–M5 regressions included), including the two late sensitive-read policy freshness regressions. The F8 source mapping audit, machine preflight, M5 synthetic evidence output and multi-file artifact upload all passed. The archived artifact is [ama-static-conformance.zip, ID 12882676380](https://github.com/Motherpher/FFOS/actions/runs/40840109289/artifacts/12882676380). The artifact is a CI/synthetic assurance report, **not** live independent CDX custody. No real CDX policy credentials, live security graph, production data or independently signed consumer receipts were present.

## E. Release-blocking facts, not engineering defects

The source-observed CDX governance state is still `PRE_RELEASE`; the CDX WP07 repository-protection blocker is open. The FFOS anchor is `PINNED_COMMIT`, `CDX_CI_MONITORED`, with `BOUND_PENDING_RUNTIME_INTEGRATION`.

Consequently, **`M2-CDX-VERIFIED-RUNTIME-BOUND` is NOT ACHIEVED**, and must not be manually marked achieved merely because the adapter or mock tests pass.

Closure requires: (1) human-approved CDX 1.0 release with requisite repository protection, (2) immutable release-pinned CDX policy/decision attestation and live current revocation, (3) independently authenticated FFOS principal/mandate/resource graph facts, (4) SPETL v1.1 independent consumer custody and reconciliation verified in a real effect/run, (5) independent security and false-denial calibration, (6) governing human acceptance and an authorized FFOS anchor/runtime state transition.

## F. Operational handoff

F8 engineering may be used to inform M6 operational contracts and F7 incident/rollback integration **as a candidate**. Production consequential effects remain denied. M7 and any first-class agent activation are blocked on the independent F8 release-binding gate and M5 live C4/C5 assurance. PR #19 remains draft and unmerged.
