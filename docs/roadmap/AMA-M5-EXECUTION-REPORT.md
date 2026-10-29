# AMA M5 — Execution, Evaluation and Assurance Report

**Date:** 2026-10-29  
**Milestone:** M5 / F6 — independent evaluation and source-backed outcome assurance  
**Repository:** `Motherpher/FFOS`; branch `feat/ama-foundation-20261028`; draft PR #19  
**Disposition:** ENGINEERING CANDIDATE VERIFIED / HUMAN NORMATIVE APPROVAL PENDING / LIVE INDEPENDENT ASSURANCE BLOCKED

## Delivered engineering artifacts

1. Six agent-neutral JSON Schema Draft 2020-12 contracts: `evaluation-profile`, `evaluation-case`, `evaluation-observation`, `evaluation-provenance`, `evaluation-report`, and `acceptance-assessment`. The optional v0.2 bundle composes them; schema count increases from 33 to 39. Historical v1 files remain unchanged.
2. `packages/agent-model/src/evaluation-vnext.ts`: portable, provider-neutral TypeScript contracts explicitly prohibiting self-issued release acceptance.
3. `packages/agent-model/conformance/ama_evaluation.py`: deterministic evaluation preflight for complete bundles with exact pinned test and evidence provenance; a trusted oracle-aware external attestor is an injected input, not a field agents may set.
4. `packages/agent-model/conformance/tests/test_m5_evaluation.py`: 25 new synthetic positive and negative test cases for all ten axes, repeated outcomes, false ALLOW/DENY, unexpected targets, missing external evidence, trust spoofing, privacy, latency/cost, invalid holdout, wrong oracle pins, model-run scope, injection/outage/recovery scenario coverage and no-self-acceptance.
5. `packages/agent-model/conformance/m5_emit_ci_candidate.py`: produces machine-readable development-only assurance evidence, with `STATIC_CANDIDATE`, `SYNTHETIC_TEST_DOUBLE`, and a concrete unverified-release-blocker inventory.
6. GitHub Actions integration: parses M5 TypeScript, runs the M5 evaluator and earlier regression suites, publishes M5 JSON alongside the historical static report. No external credentials or live services used.
7. Normative/host separation and implementation limitations are documented in [M5 assurance specification](AMA-M5-INDEPENDENT-EVALUATION-ASSURANCE.md).

## Evaluation rules demonstrated in CI

| Category | Implemented check | What is *not* proven |
| --- | --- | --- |
| Structural and authority | Complete bundle, pinned references, expected allow and deny denominators | Real authorized runtime identity |
| Tool and final state | Decision, target and externally evidenced outcome must match the independent oracle | Actual production target/state observed |
| Repeat reliability | Variance across runs blocks candidate metrics pass | Long-horizon real stochastic models |
| Adversarial | Injection, outage, and recovery cases mandatory | Real attacker campaigns / delayed agent poisoning |
| Data privacy | Sensitive unredacted observations fail | Production privacy compliance or retention |
| Evidence provenance | Observation-to-source content digest and externally injected attestor | Authentic signatures/real immutable custody |
| Resource/cost | p95 latency and total minor-unit cost thresholds | Actual metering/provider billing |
| Upgrade regression | Explicit compare function requiring verified baseline reference | Equivalent live baseline/adoption |
| Acceptance | `independent_accepted=false` and `runtime_authorized=false` | Human authority delegation or approval |

## Verification evidence

[GitHub Actions run 40835331056](https://github.com/Motherpher/FFOS/actions/runs/40835331056) completed successfully for the updated evaluation/negative-test implementation: **168 Python + 9 shared-model + 54 runtime/PostgreSQL tests** (231 combined, M0–M5 inclusive).

The CI JSON artifact generation and a further provenance-redaction regression were added after this successful run. Their execution in a later full workflow has not yet been confirmed; do not declare that final CI checkpoint green without a matching completed run. The combined 231 count is not 231 exclusively M5 tests.

The PostgreSQL suite continues to validate actual disposable database transactions, worker fencing, evidence and recovery. External policy decisions, independent proof sources and model behavior are represented only by test doubles.

## Precise completion classification

**M5-ENGINEERING-CANDIDATE-PASS:** can be recorded after the final CI suite and machine-readable artifact generation pass.

**M5-INDEPENDENT-ASSURANCE-PASS:** **NOT ACHIEVED.** The code has no real independent verification/acceptance authority, no live output oracle, no production C4/C5, no third-party attestation, no valid release decision, and no production policy-authorization or durable deployment.

No candidate, model, human impersonation, source digest or test fixture can bypass F8 security policy, the separate governing authority, live evidence verification, or an authorized normative AMA adoption process.

## Forward handoff

Finish F8 authenticated policy/attestation and secure read/effect enforcement; use M5 evaluation contracts and runbook in a live integration environment for independent calibration, genuine outcome and reliability measurement. Then follow the governed release/deployment safety milestones. Production DB migration, activation, canonical AMA amendment and draft PR merge require separate approval.
