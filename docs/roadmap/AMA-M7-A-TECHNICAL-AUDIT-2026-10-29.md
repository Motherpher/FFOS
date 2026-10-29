# AMA M7-A — Architecture Technical Audit and Release Blockers

**Scope:** AMA v0.2 portable architecture baseline (M0–M7), not any agent instance  
**Audit status:** TECHNICAL REVIEW IN PROGRESS — **NOT AN ACCEPTANCE CERTIFICATE**  
**Base examined:** `Motherpher/FFOS` / `feat/ama-foundation-20261028`, originally observed at `37a21e83e04f697724e67e2403217910f8d16182`; later commits add this audit/report code  
**Date:** 2026-10-29  
**Owner disposition:** PENDING; no automatic merge, stable version, agent activation or production authorization

## A. Audit boundary

AMA's authoritative construction stages are **M0–M7**. The supplementary 32-module inventory is not another milestone taxonomy. CDX F8 is a **host-specific, realm-conditional adapter** and a separate deployment concern; architecture-baseline M7-A **does not require live F8.7 or any deployed agent**. No CDX source, estate registry, production anchor or live effect permissions are changed by this audit.

Evaluation distinguishes:
(1) versioned source proposal; (2) present schema/contract; (3) traced test name;
(4) executed exact-head CI; (5) independent technical review; and (6) owner adoption.
These are not interchangeable.

## B. Evidence checked

- `packages/agent-model/ama-milestones.json`: ordered M0–M7 map; F8 outside the universal core.
- `docs/roadmap/AMA-REQUIREMENTS-DECISION-REGISTER.json`: **96** source-derived requirements; **96 proposed decisions pending human acceptance**, and **96 original `NOT_IMPLEMENTED`/plan-only historical test records**. These historical fields are not proof that no contemporary tests exist.
- `packages/agent-model/ama-m0-test-evidence-bridge.json`: **65 distinct partial evidence mappings**, referencing nine Python test files. The **65 mapped method names were checked against those source test files** and found present, but method existence is not proof of successful execution or sufficiency.
- `packages/agent-model/ama-template-coverage.json`: **32 modules** (13 CORE; 19 OPTIONAL), **32 `PARTIAL_EXISTING_CONTRACTS`**, **0 `COMPLETE`**. Consequently the *comprehensive complete template* claim is unsupported.
- `packages/agent-model/ama-distribution-manifest.json`: candidate version `0.2.0-candidate`, `architecture_accepted=false`, `template_complete=false`, `agent_deployment_authorized=false`.
- `packages/agent-model/ama-release-gates.json`: M7-A owner-approved *direction* but technical audit pending; F8.7 external to architecture; M7-O operational instance criteria not host admission.
- Prior full AMA conformance CI run `40866808678` succeeded at commit `5a0333712a8c13201ee13e45972b5bab7c8d182b`. Earlier M7-E CI run `40848470365` passed 316 combined synthetic/PostgreSQL checks. **These do not attest the current PR head.**
- Current PR-head commits following `37a21e83e04f697724e67e2403217910f8d16182` have a failing AMA conformance job. The connector returns empty job steps and a `BlobNotFound` log-download error. The cause is **UNDETERMINED**, not assumed to be a specific test. CDX binding audit failure is treated only as an FFOS branch integration/check concern, not an instruction to work on CDX here.
- The AMA branch was seven commits behind `main` at the start of this audit. Branch re-synchronization and exact-final-head conformance remain open.

## C. Explicit unlinked requirement register

The 31 original requirements with **no direct partial test reference** in the bridge (not necessarily unimplemented) are:

| M-stage | IDs | Count |
| --- | --- | ---: |
| M1 | A04, A06, A07 | 3 |
| M2 | G01, G02, G04, G05, G06, G09 | 6 |
| M3 | — | 0 |
| M4 | F02, F05 | 2 |
| M5 | H02, H05, I01, I02, I05, I06, I07 | 7 |
| M6 | J03, J04, J07, K01, K02, K03, K05, K06, L01, L02, L03, L06, L07 | 13 |
| **Total** | | **31** |

Do not bulk-change the M0 register to `PASS`: locate existing exact evidence and link it, or identify a genuine missing contract/test and implement it. A test bridge means `PARTIAL_TEST_EVIDENCE`, not full fulfillment.

## D. Audit findings and disposition

| ID | Finding | Release impact |
| --- | --- | --- |
| AMA-AUD-001 | Latest PR-head AMA CI failed; failure step/log unavailable via connector | **BLOCKS M7-A** until authentic successful exact-head CI |
| AMA-AUD-002 | 31/96 requirements lack direct test-evidence links; 96 original adoption decisions proposed | Blocks any claim of fully accepted source requirements; review coverage and documented bounded scope |
| AMA-AUD-003 | All 32 supplementary modules classified partial, 0 complete | **Blocks comprehensive template completeness**, but does not automatically bar a narrowly scoped v0.2 architecture baseline |
| AMA-AUD-004 | Portability and legacy v1/v0.2 checks present, but present-head pass not verified | Blocks stable architecture compatibility attestation until exact-head tests and review |
| AMA-AUD-005 | FFOS feature branch diverged from main, with historical host-integration anchor state | Requires governed branch reconciliation; **not** CDX source development |
| AMA-AUD-006 | No documented final-head independent technical acceptance or explicit stable-version owner adoption | **Blocks stable release** |
| AMA-AUD-007 | Some historical roadmap reports contain time-bound external-integration claims now superseded | Preserve them as historical snapshots; rely on current architecture release gates for acceptance |

## E. Engineering measures added

The candidate branch includes `packages/agent-model/conformance/ama_m7a_release_audit.py` and `tests/test_ama_m7a_release_audit.py`. These produce a machine-readable M7-A coverage report, check source cardinality, stage and F8 boundaries, and reject fabricated full-evidence, host-coupling or deployment claims. CI is configured to upload `ama-m7a-readiness.json` in the existing `ama-static-conformance` artifact. **The report deliberately sets `exact_head_ci_verified=false` and `independent_technical_audit_accepted=false`: no build may self-certify its own outcome.**

This is a technical audit **candidate** until the exact commit passes the full CI and the owner reviews the resulting findings.

## F. Release closure sequence (AMA only)

1. Reconcile the AMA feature branch with current `main` through GitHub's established review/branch rules, without changing external governance sources or production anchors in this AMA audit.
2. Diagnose current AMA workflow failure using authentic job output and repair specific defects. Run full exact-head CI and retain M7-A/compatibility/coverage/M7-E machine artifacts.
3. Triage the 31 unlinked requirements; add only verified direct evidence links or specific negative/semantic tests. Close or explicitly defer coverage gaps in the v0.2 baseline scope.
4. Independently review architecture portability, disabled optional modules, v1/v0.2 isolation, schema IDs, digests, authority/mandate non-amplification, and non-authorizing reference outputs.
5. Update release registers with actual evidence and obtain **explicit owner decision** on a versioned stable architecture baseline. Only then merge PR #19 under normal branch rules; publish architecture separately from any deployed agent.

**Current disposition:** M7-A remains **BLOCKED_PENDING_CI_AUDIT_AND_OWNER_ADOPTION**. A useful candidate architecture exists, but no `STABLE`, `COMPLETE`, `DEPLOYABLE` or `ACTIVE` state has been granted.
