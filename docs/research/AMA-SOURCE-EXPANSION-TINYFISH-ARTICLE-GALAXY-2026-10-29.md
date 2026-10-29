# AMA source expansion — TinyFish + Article Galaxy

**Date:** 2026-10-29  
**Status:** Research supplement, not adopted normative contract; no claim of complete systematic or full-text review.  
**Scope:** Universal, agent-independent architecture. This supplement preserves the original 51-source dossier.

## Method and access disclosures

1. **TinyFish** research-paper discovery and live primary-source retrieval; source dates and abstracts checked from arXiv.
2. **Article Galaxy / scite literature index** searched for agent reliability, stateful tool execution, long-horizon planning, prompt injection and persistent-memory attacks. Article records supplied matching full-text excerpts and citation-context snippets for selected papers. No retraction or editorial notice was listed in the targeted metadata retrieved; this is **not** evidence that notices cannot exist elsewhere.
3. **Article Galaxy entitlement check:** the four arXiv-style DOI requests tested were returned **NOT FOUND** by the access/ordering resolver. This does not refute existence of the papers: their arXiv landing pages and open-access links were separately found. Do not purchase or claim licensed PDF entitlement.
4. **TinyFish multi-source deep research run:** 01a18517-da9b-7a93-89cd-def1bbeabdb4. Its later result is separate from this verified initial supplement. Report link: https://agent.tinyfish.ai/playground/research/share/01a18517-da9b-7a93-89cd-def1bbeabdb4.

## New primary sources (outside the original 51)

### E52 — Long-horizon architecture survey
Chen, M., Wang, L., & Qu, B. (2026). *The Horizon Gap: Planning, Memory, Execution, Training, and Evaluation for Long-Horizon LLM Agents* (arXiv:2608.06663). https://arxiv.org/abs/2608.06663

- **Source status:** 2026 arXiv survey / preprint; abstract checked on arXiv; Article Galaxy provided source-indexed excerpts.
- **Scope reported by authors:** 1,547 arXiv papers, a disclosed query-bleed filter, and a six-area taxonomy.
- **Critical distinction:** long horizon (task property), long context (model context capacity) and long-term memory (persistence) are *not synonymous*.
- **Proposed AMA effect:** independently defined task horizon, context policy, persistent memory, checkpointing, step-level diagnosis and evaluation profile. Neither extended context alone nor a generic `durableState` boolean satisfies these contracts.
- **Candidate requirements:** E52-R1 `taskHorizonProfileRef`; E52-R2 `contextManagementPolicyRef`; E52-R3 `persistentMemoryProfileRef`; E52-R4 `stepEvidencePolicyRef`; E52-R5 `recoveryAndGoalDriftEvaluationRef`.
- **Confidence:** high for paper's own abstract and taxonomy, moderate for architectural inference, not independent empirical confirmation of all surveyed findings.

### E53 — Persistent-memory injection
Tian, H., Zhang, G., & Sha, Z. (2026). *InjecMEM: Memory Injection Attack on LLM Agent Memory Systems* (arXiv:2608.23471). https://arxiv.org/abs/2608.23471

- **Source status:** arXiv preprint; Article Galaxy indexed full-text excerpts and citation context; open-access PDF link surfaced.
- **Finding reported:** adversarial interaction can leave retrievable poisoned long-term memory, so later outputs may be redirected without the attacker directly modifying the memory database.
- **Proposed AMA effect:** every memory write is a separate admission decision; memory is never authority; memory provenance, trust, expiry, source-role distinction and poisoning regression cases are mandatory when persistent memory is enabled.
- **Candidate requirements:** E53-R1 `memoryWritePolicyRef`; E53-R2 `memoryProvenance`; E53-R3 `memoryTrustLabel`; E53-R4 `memoryQuarantineAndRevalidation`; E53-R5 `crossSessionPoisoningEval`.
- **Confidence:** moderate: one preprint and excerpt-level inspection; generalization to production stacks not established.

### E54 — Cross-site/environmental memory poisoning
Zou, W., Dong, M., & Romero Calvo, M. (2026). *Poison Once, Exploit Forever: Environment-Injected Memory Poisoning Attacks on Web Agents* (arXiv:2604.02623). https://arxiv.org/abs/2604.02623

- **Source status:** arXiv preprint and Article Galaxy excerpts.
- **Finding reported:** malicious information encountered in one environment can enter retained agent memory and influence action in another environment/session.
- **Proposed AMA effect:** bind memory entries to source and permission domain, distinguish external instructions from evidence, prohibit cross-target authority transfer and test delayed retrieval-based injection.
- **Candidate requirements:** E54-R1 `memoryOriginScope`; E54-R2 `crossDomainRetrievalPolicy`; E54-R3 `untrustedContentBoundary`; E54-R4 `delayedInjectionEval`.
- **Confidence:** moderate; preprint case study, not population-level risk estimate.

### E55 — Policy compilation and static validation
Yu, M.-Y., Kim, T., & Choi, J. W. (2026). *NOMOS: Compiling Written Policies into Statically Verified Tool-Call Gates for LLM Agents* (arXiv:2610.11030, v2, 14 Oct 2026). https://arxiv.org/abs/2610.11030

- **Source status:** newly released 2026 arXiv preprint (submitted 8 October; revised 14 October); TinyFish verified title, dates and abstract directly.
- **Claim made by the paper:** a multi-pass translation and static verification approach can compile written rules into deterministic tool-call gates. It reports substantial reductions in reference-encoded tool policy violations in its benchmark settings, but also shows that inaccurate compilation can block legitimate actions.
- **Proposed AMA effect:** policy compilation is an **optional, separately verified adapter**. Natural language alone is not policy authority. Validate rule/tool-schema compatibility, run harmless-utility tests, review policy-semantic fidelity and version the compiled artifact before local enforcement.
- **Candidate requirements:** E55-R1 `compiledPolicyArtifactRef`; E55-R2 `ruleToolSchemaCompatibilityTest`; E55-R3 `falseDenialBenchmark`; E55-R4 `policySemanticReview`; E55-R5 `policyBundleSignatureAndPin`.
- **Confidence:** high for abstract metadata, lower for generalizing unreplicated preprint benchmark results.

### E56 — Agent harness contribution
Zhang, Y., Xu, K., & Chen, Y. (2026). *How Do Agent Harnesses Create Value? Planning Information and Release Control in Stateful LLM Agents* (arXiv:2609.20474). https://arxiv.org/abs/2609.20474

- **Source status:** TinyFish research discovery metadata/snippet; full text not yet verified.
- **Proposed investigation:** separate model strength from scaffolding/harness contribution; run ablation tests for planning, release gates and tool orchestration. Do not treat it as established empirical proof until full-text verification.
- **Candidate requirement:** E56-R1 `harnessAblationEvaluationProfile`.
- **Confidence:** provisional.

### E57 — Task-state adherence
Zhang, C., Kweon, W., & Han, J. (2026). *How Strongly Should Task State Influence an LLM Agent?* (arXiv:2609.25686). https://arxiv.org/abs/2609.25686

- **Source status:** TinyFish discovery snippet only; full text not reviewed.
- **Proposed investigation:** explicit task-state authority versus probabilistic interpretation, and failure-channel classification.
- **Candidate requirement:** E57-R1 `taskStateIntegrityEvaluation`.
- **Confidence:** provisional.

### E58 — Failure-driven tool-use training
Wang, Z., Lu, Y., & Zhang, Y. (2026). *SENTINEL: Failure-Driven Reinforcement Learning for Training Tool-Using Language Model Agents* (arXiv:2606.12908). https://arxiv.org/abs/2606.12908

- **Source status:** Article Galaxy search metadata, excerpt and citation context.
- **Finding reported:** tool selection, argument selection, domain policy adherence and target correctness remain separate sources of failure in agent trajectories.
- **Proposed AMA effect:** structure evaluation and trajectory logs around failure type and permitted action, not only binary text quality. Training methodology is model-provider/implementation detail, not mandatory AMA behavior.
- **Candidate requirements:** E58-R1 `toolSelectionMetrics`; E58-R2 `argumentValidityMetrics`; E58-R3 `targetStateCorrectness`; E58-R4 `policyAdherenceMetric`.
- **Confidence:** moderate; preprint and index excerpts.

## Cross-source conclusions and change requests

| Concern | Evidence | Proposed disposition |
|---|---|---|
| Long horizon ≠ long context ≠ persistent memory | E52 | Clarify distinct concepts in core ontology; optional typed profiles |
| Memory becomes a persistent attack surface | E53, E54 | Conditional mandatory memory write/retrieval provenance and cross-session adversarial tests |
| Policy engines must validate rule-to-tool semantics | E55 | Add policy-compiler verification interface; no automatic trust in model-generated policy |
| Safety gates can harm legitimate utility | E55 | Require benign-task false-denial and false-allow evaluation |
| Model capability vs agent harness contribution | E52, E56 | Require evaluation provenance and optional ablations; no vendor preference |
| Tool use correctness decomposes into failures | E58 | Record correct tool, arguments, resource, policy and final state separately |

## Implementation priority

- **P0:** independent memory trust boundary, policy authorization and read-side sensitivity, evidence of blocked effects.
- **P1:** task horizon vs context vs memory profiles; long-running step-level evidence; plan-drift and recovery evaluation.
- **P2:** policy compiler compatibility and benign utility evaluation; harness ablations; failure taxonomies.
- **P3:** optional model-training integration and specialized planner extensions.

## Source qualification / limitations

This supplement does not claim completed full-PDF reading, exhaustive bibliographic screening, replication, formal peer review of arXiv preprints or Article Galaxy licensed access. The broad TinyFish deep research is being run separately and can be reconciled into a next supplement only after the cited report is returned. The canonical AMA master architecture and machine-readable schema have **not** been changed by this research.
