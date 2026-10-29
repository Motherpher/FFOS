# AMA M5 — Evaluation and Independent Assurance Candidate

**Milestone:** M5 / F6 — evaluation, oracle and evidence quality, adversarial reliability, independent acceptance
**Date:** 2026-10-29
**Governance:** Universal agent-neutral AMA contract, isolated from any instance or provider.
**Candidate state:** Engineering implemented; normative adoption, authenticated independent assessor and live C4/C5 certification **not** established.

## 1. Purpose

M5 changes assurance from an agent's claims or a mock test's success into an externally reviewable evidence and evaluation process. A structural schema pass, a tool callback returning, and a response sounding correct are three different observations. None alone proves correct final world state, authorized effect, appropriate data disclosure, reliable repeated behavior or release permission.

The M5 **contract** is universal. An agent may omit optional reasoning/memory (M3), but it cannot self-evaluate consequential outcomes or grant independent acceptance.

## 2. Six modular candidate schemas

Six Draft-2020-12 JSON Schemas under `packages/agent-model/schemas/v0.2/` are composed into the optional candidate bundle (39 schemas total):

| Contract | What it expresses | Assurance limitation |
| --- | --- | --- |
| `evaluation-profile` | Suite/version, agent pin, axes, minimum cases/repeats, coverage, thresholds, holdout and external acceptance | A declared threshold is not certified |
| `evaluation-case` | Source-digested input, oracle, expected decision, final state, resource target, sensitivity, perturbation class | Original oracle correctness needs external review |
| `evaluation-observation` | Actual decisions, targets, outcome, repeat index, evidence refs, latency, cost, source kind | A recorded result may be synthetic/self-reported |
| `evaluation-provenance` | Collector, source digest, declared trust, attestation reference and redaction | Trust labels and digest strings are not signatures |
| `evaluation-report` | Candidate metrics, findings, provenance references and regression classification | `independentAccepted=false` is invariant |
| `acceptance-assessment` | External review request, assessment reasons, reviewer and authority references | `activationAuthorized=false`; referral is not release |

TypeScript declarations in `packages/agent-model/src/evaluation-vnext.ts` mirror these documents. Historic v1 manifests and earlier AMA candidate schemas remain unchanged.

## 3. Evaluation dimensions and baseline methodology

The ten M5 axes are:

| Axis | Principal observable |
| --- | --- |
| STRUCTURAL | All model/flow/command/schema bindings and denial invariants |
| AUTHORITY | Policy false ALLOW, false DENY, scoped mandate and independence |
| TOOL_TARGET | Correct capability and target, no cross-resource effects |
| FINAL_STATE | Independently observed requested outcome, not callback text |
| RELIABILITY | Repeat consistency, variation across perturbations, task horizon |
| ADVERSARIAL | Injection and deceptive inputs, security-control failures |
| PRIVACY | Classification, sensitive E0 disclosure, evidence redaction |
| DURABILITY | Worker failure, lease races, dispatch crash, recovery, receipt |
| COST | Tool/model spend budget and p95 latency |
| EVIDENCE | Correct correlation, source lineage, receipt and verification completeness |

An admitted case carries a *pinned oracle* and explicitly identifies held-out inputs and scenario class. M5 requires an **INJECTION**, **OUTAGE**, and **RECOVERY** example, a holdout/development split, both allow and deny denominators, and the configured minimum repeated evaluations per case.

Metrics are calculated from verified observation collections:
- False-allow rate = unexpected ALLOW on expected DENY/HOLD/STOP / all expected-denial observations;
- False-deny rate = unexpected DENY/HOLD/STOP on expected ALLOW / all expected-allow observations;
- Verified final-state rate = externally verified correct final states / all applicable final-state observations;
- Evidence coverage = externally validated and sufficiently linked records / all observations;
- Repeat variance: a case with differing decision/final-state/target results across runs is a fail;
- Latency p95 uses the sorted nearest-rank estimator; cost uses total minor currency units.

Zero denominators are a coverage failure, not a zero error rate. Mismatched oracle decisions, targets or final states always fail even when aggregate limits would otherwise permit a result. Sensitive, unredacted evidence fails. Missing external verification cannot be repaired by a claim marked "verified".

## 4. Implementation and evidence chain

`packages/agent-model/conformance/ama_evaluation.py` validates complete M1–M4 bundles before evaluating M5 cases. Each observation must have an exact version+digest-pinned case. Provenance is bound by an exact observation digest. An **injected trusted external attestor** receives the provenance, observation and oracle case; without it, no observation is verified.

The deterministic evaluator returns either `FAIL` or `CANDIDATE_METRICS_PASS`; in both cases `independent_accepted=false`, `runtime_authorized=false`, and `live_c4_c5_verified=false`. Supplying a CI test-double attestor proves only the evaluation harness, not true independent assurance.

`m5_emit_ci_candidate.py` creates an inspectable JSON artifact after the combined GitHub Actions regression suite has succeeded. It explicitly labels the sample suite `STATIC_CANDIDATE`, the adapter `SYNTHETIC_TEST_DOUBLE`, and lists unverified live-production blockers. The artifact does not counterfeit a human signature, operational C4/C5 proof or a policy-service decision.

## 5. Existing real integration evidence, distinct from live certification

The M4 disposable PostgreSQL integration exercises actual transactional coordinator code: concurrent leases, corruption rejection, crash/dispatch uncertainty, revocation rechecks, receipt interface and replay resistance. These are meaningful integration tests but their admission, independent review, policy and receipt services are CI doubles.

M2 and M3 negative cases cover sensitive reads, delegation, poisoned memory, persistence, model/planner boundaries and scope. M5 adds separate adversarial evaluation and score correctness checks. Passing CI demonstrates engineering behavior within these test settings; it does not certify a working production agent.

## 6. Human calibration and actual independent proof still required

A genuinely independent M5 decision would require an authorized evaluator who:
1. Verifies original oracle provenance and held-out selection;
2. Retrieves *real* event/receipt/final-state evidence from a separately controlled source, with no agent-written "acceptance";
3. Authenticates reviewers, policy-decision identity, revocation validity, and original source artifacts;
4. Compares performance and false-allow/deny rates to an independently verified and case-equivalent baseline;
5. Reviews repeated runs, prompt-injection trajectories, tool misdirection, data exposure and outage recovery on a connected runtime;
6. Conducts calibration and human review of disputed outcomes and error severity;
7. Issues an external signed decision through the governing release authority if permitted.

The candidate schema expressly **cannot** produce an activation authorization. This protects the M0 governance separation and avoids letting M5 accept its own M5 results.

## 7. Disposition

**M5-ENGINEERING-CANDIDATE-PASS** may be recorded after all Python and actual disposable PostgreSQL CI tests pass, including the JSON artifact generation.

**M5-INDEPENDENT-ASSURANCE-PASS remains BLOCKED** until the external evaluation, real C4/C5 evidence, authorized review, live F8 enforcement and normative AMA acceptance occur. CI cannot replace those steps.

No production mutation, registered-agent activation, normative AMA promotion or draft PR merge is part of M5 candidate implementation.
