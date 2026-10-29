# AMA M3 — Execution and Conformance Report

**Date:** 2026-10-29  
**Milestone:** M3 — F3 model/planning + F4 context/memory  
**Repository:** `Motherpher/FFOS`  
**Branch / PR:** `feat/ama-foundation-20261028`, draft PR #19  
**State:** ENGINEERING CANDIDATE TECHNICALLY VERIFIED; normative human adoption and live runtime acceptance remain pending.

## 1. Delivered

- Eight new agent-neutral Draft 2020-12 schemas under `packages/agent-model/schemas/v0.2/`: model-profile, instruction-package, planning-profile, context-policy, memory-profile, memory-entry, retrieval-policy and cognitive-binding. The bundle schema references them as conditional/optional arrays.
- `packages/agent-model/src/cognitive-vnext.ts`: independent portable TypeScript contracts and preflight result types, with no change to v1 runtime.
- `packages/agent-model/conformance/ama_cognitive.py`: offline compositional and semantic checks plus synthetic policy-budget, memory retrieval and compaction assessments.
- `packages/agent-model/conformance/tests/test_m3_cognitive.py`: synthetic positive and adversarial cases, including disabled-feature agents, fallback pins, instruction version substitution, planning loops/budget stops, memory poisoning, trust-domain isolation, retention, correction, expiry and source-marker conservation.
- Expanded universal schema-purity suite to 26 candidate schemas and the cognitive TypeScript module. Existing M0–M2/v1 tests remain in CI.
- [M3 specification](AMA-M3-COGNITIVE-MEMORY-CONTRACTS.md) and package conformance/readme integration.

## 2. Security and correctness semantics

1. **Model choice is replaceable:** provider and revision are identified; model fallback references are version/content-digest pinned and do not authorize substitution.
2. **Planning is bounded:** graph acyclicity, declared capability references, iteration/tool/token/time/cost ceilings and mandatory policy denial, cancellation and exhaustion stops.
3. **Contexts are not memories:** token windows, output reserve and compaction have separate contracts from task horizon and memory persistence.
4. **Memory is optional:** an otherwise valid agent may have no reasoning, no memory, or independently enabled memory. Persistent memory must be scoped, source-provenanced, time-limited and subject to write/retrieval trust gates.
5. **Content is never authority:** schema forbids `instructionAuthority=true`, suspicious/unverified memory is quarantined, cross-domain retrieval is blocked without externally governed review.
6. **Retention and correction:** bounds, expiry, tombstone/erasure state and correction target references have negative checks.
7. **Compaction test is structural only:** surviving critical claim IDs and source digests are verified; no actual semantic summary or truth evaluation is claimed.

## 3. Verified CI

[GitHub Actions run 40809807317](https://github.com/Motherpher/FFOS/actions/runs/40809807317) completed successfully after the M3 code, semantic revisions, fallback tests and schema/type-purity updates. The job reported:

- **134 Python tests** (including M0–M3 suites);
- **9 shared-model Node tests**;
- **38 existing runtime/PostgreSQL integration tests**;
- Existing positive v1 fixture validation and TypeScript parsing in the conformance workflow.

**181 total counted tests**, across existing and new suites. This is **not** 181 M3-only tests. A documentation-only follow-up CI run is independent evidence of final branch conformance when complete.

## 4. Assurance and acceptance boundaries

- The preflight can return `STATIC_COGNITIVE_ELIGIBLE`, not `ALLOW`; `runtime_authorized=false`, `evidence_verified=false`.
- Retrieval preflight returns either `BLOCKED` or `STATIC_RETRIEVAL_ELIGIBLE`, with `authority_granted=false` and no source attestation.
- A model response, claimed memory trust label, content digest, plan or passing synthetic benchmark cannot authorize data access, memory writes, tool effects, releases, or independent acceptance.
- No provider/API, prompts, live memory store, vector index, actual compaction model, memory deletion, credential, agent activation or production effect was executed or deployed.
- The canonical AMA master `docs/architecture/AMA.md`, historical v1 contract, CDX Act 1.0 and current release policy state remain unchanged. PR #19 is draft and unmerged.

## 5. M3 verification matrix

| Requirement | Engineering proof | Open production proof |
|---|---|---|
| Optional memory/model | Synthetic default-off/no-model cases pass | Live configuration gating |
| Versioned model and instructions | Digest-pinned refs, substitution negative cases | Signed trusted issuer/model build provenance |
| Planning budgets and stops | DAG and declared budget/stop tests | Runtime interrupts, actual token and cost metering |
| Context integrity | Critical fact ID/source digest preservation | Empirical semantic compaction fidelity |
| Memory poisoning resistance | Untrusted entry quarantine and retrieval negative tests | Delayed multi-session injection tests against a real memory store |
| Retrieval domain and scope | Static deny on mismatched trust domain and resource scope | Verified source trust and live policy gates |
| Retention, correction and deletion | Invalid TTL, expiry and correction-state tests | Live erasure/retention enforcement and privacy review |
| Independent evaluation and acceptance | Static non-authority results | M5 evaluation and authorized human acceptance |

## 6. Handoff

**Next implementation:** M4 durable Task/Run/Step/Attempt/Effect/Receipt/Reconciliation contract and failure injection. In parallel, F8 must bind independently verifiable identity/policy/evidence to real read/write and memory gates. M5 will measure long-horizon reliability, model/harness variance, compaction semantic fidelity, security and outcomes.

**Verdict:** M3 candidate contract engineering completed and tested; independent normative adoption and operational assurance are **not** established.
