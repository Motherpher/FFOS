# AMA M3 — Model, Planning, Context and Memory Contract Candidate

**Date:** 2026-10-29  
**Status:** ENGINEERING CANDIDATE — NON-NORMATIVE; NO MODEL PROVIDER, LIVE STORE, OR EXECUTION AUTHORITY BOUND  
**Scope:** F3 (reasoning and bounded autonomy) + F4 (context, provenance, durable knowledge and memory trust), grounded in M0 C01–C08 and E01–E07 plus source-round records E52–E54.  
**Compatibility:** AMA v1 schema, M1/M2 universal contracts, historical registry, and independent host risk/effect policy remain unchanged.

## Eight added JSON Schema Draft 2020-12 contracts

| Contract | Core content | Important limitation |
| --- | --- | --- |
| `model-profile.schema.json` | Model/provider/version, context/output ceilings, pinned fallback definitions | Model capability and provider authenticity are not attested |
| `instruction-package.schema.json` | Ordered system/developer/user instruction-package digest and declared source provenance | A declared source trust label does not authenticate prompt origin |
| `planning-profile.schema.json` | Strategy, step horizon, tool/model/cost/time budgets, stop conditions, dependency nodes | A static plan DAG does not establish runtime completion |
| `context-policy.schema.json` | Working context tokens, output reserve, source types, compaction requirements | Source-marker preservation cannot prove semantic summarization fidelity |
| `memory-profile.schema.json` | Optional store type, scope, retention ceiling, admission gates, provenance, quarantine and erasure policy | Store writes/deletes require authenticated host enforcement |
| `memory-entry.schema.json` | Stored-record origin, source, content digest, trust class, scope, expiry, quarantine, tombstone/correction and non-authority invariant | Metadata can be forged if supplied by an untrusted agent |
| `retrieval-policy.schema.json` | Trust-domain boundary, allowed scopes/trust, retrieval budget and no instruction promotion | Cannot authenticate retrieved content or provider claims |
| `cognitive-binding.schema.json` | Exact pinned agent → reasoning module → model/instructions/planner/context and optional memory/retrieval connections | Binding is not admission/approval |

They are optional arrays in `bundle.schema.json`, leaving standalone deterministic or memory-free agents conformant. Module enablement must be explicit; disabled modules cannot admit their profile or retained memory.

## Implementation

`packages/agent-model/conformance/ama_cognitive.py` is a separate offline preflight. It reuses the M1 composite contract validator, then checks:

- Pinned version/content-digest references and module kind/status/enablement; no orphan cognitive profiles.
- Model configuration against context assembly and output reserve; named fallback alternatives are pinned, never automatically selected.
- System/developer/user priority assertions, unique instruction layers and immutable package-content digest linkage.
- Planning DAG acyclicity, allowed capabilities, mandatory stop conditions, model/cost/iteration/tool/time budgets and explicit task horizon.
- Memory types and scopes separate from source-of-truth data, source provenance fields, quarantine of unverified/suspect/revoked entries, retention expiry, correction and deletion status.
- Retrieval trust labels, scope restrictions and cross-domain rejection; untrusted content **never** promotes itself to instruction or authority.
- Structural preservation of critical claim IDs/source reference/content digest during compaction; this **does not** verify semantic correctness or the underlying truth.
- Runtime-independent budget counter checks that return STOP_REQUIRED if limits or sane counter domains are breached.

The main preflight returns only `STATIC_COGNITIVE_ELIGIBLE` or `REJECTED`, always with `runtime_authorized=false`, `evidence_verified=false`, and `external_verification_required=true`.

Retrieval preflight returns either `BLOCKED` or `STATIC_RETRIEVAL_ELIGIBLE`; neither is a permission or content integrity attestation. A quarantined or cross-trust-domain entry cannot become authorized merely through retrieval.

## Architectural safety requirements retained

1. **Task horizon ≠ context window ≠ persistent memory.** They have separate profiles, budgets, validity and test boundaries.
2. **Reasoning and model choice are conditional.** An agent can be valid without LLM planning; model fallback is independently version-pinned and must be separately authorized at runtime.
3. **Working context, run checkpoint, persistent episodic/semantic memory, retrieval index and authoritative domain data have distinct ownership.** Run-state and domain data are not safely promoted to learned long-term memory.
4. **Memory is disabled by default.** Enabling it requires store/write/retrieval scopes and retention/poisoning defenses; a declared 'VERIFIED' trust flag does not independently verify the source.
5. **Untrusted content has no control-plane authority.** Prompt, tool output and memory text cannot change mandate, policy, approved plan limits or granted capabilities.
6. **Policy and final acceptance remain external.** M2 authorization and separate host/F8 risk/evidence integration are still required.

## M3 verification coverage

Synthetic positive/negative cases cover: no-model agents, memory-free reasoning, optional memory-only agent, model/instruction digests, priority and fallback substitution, plan cycle/tool escalation and stop rules, context limits, critical-fact conservation, budget-stop conditions, delayed malicious memory retrieval, quarantined tool/document content, cross-domain and scope-blocked retrieval, expiry/retention and no memory-as-authority.

These are **mocked/static adversarial fixtures**. No real LLM call, persisted memory store, independent source attestation, realistic delayed poisoning trajectory, long-horizon benchmark, model fallback, token metering, compaction semantic assessment, or automated erasure was run. Those require runtime integration, M5 evaluation and independent acceptance.

## Workstream boundary

M3 introduces **optional contracts and validators**, not a generic planner/executor and not the universal adoption of a particular prompt hierarchy, model provider or memory database. M4 handles durable task state and external effect uncertainty; F8 must establish independently authenticated policy, memory-write and retrieval gates; M5 must establish empirical performance, benchmark reliability and independent outcome evidence.

**Decision:** M3 candidate contract engineering may be considered technically validated only after the combined GitHub conformance run passes. Formal normative adoption and production activation remain separate human-governed gates.

## M3 extension — knowledge-source catalog (candidate)

The existing M3 cognition, retrieval and memory model now includes an **optional** `knowledge-catalog.schema.json` under the same `v0.2` schema family. It is registered through `bundle.knowledgeCatalogs[]` and typed by `AMAKnowledgeCatalogVNext`/`AMAKnowledgeSourceVNext` in `src/cognitive-vnext.ts`. This is **M3**, not a new AMA milestone or mandatory host integration.

Knowledge catalogs deliberately differ from remembered content, context summaries and authoritative domain data: each source declares an ID, content digest, revision, issuer reference, trust domain, scope, sensitivity, observation time, freshness ceiling and an explicit `ADMITTED | QUARANTINED | BLOCKED` inventory disposition. A source never grants authority or changes instruction precedence; high-sensitivity declared admission requires a separate host-authorization reference. The schema does not authenticate any such reference.

`conformance/ama_knowledge.py` supplies an independent **non-executing static preflight** over existing M1/M3 contracts and optional retrieval-policy/module bindings. It checks source freshness, scope continuity, policy digests, duplicate identities, quarantine, cross-domain boundaries and instruction laundering. `tests/test_m3_knowledge.py` covers positive and negative synthetic cases.

**Remaining obligations:** verify real source/issuer provenance and content digests, enforce actual data-access decisions and revocation, evaluate retrieval quality and reconcile knowledge updates or deletions in the host. A static result never authorizes a retrieval or a consequential effect. The comprehensive template coverage inventory therefore records this as **PARTIAL_EXISTING_CONTRACTS**.
