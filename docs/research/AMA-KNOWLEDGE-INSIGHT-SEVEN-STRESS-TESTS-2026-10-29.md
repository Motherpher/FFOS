# AMA — Knowledge & Insight Synthesis, Seven Architecture Stress Tests, and Residual Gap Analysis

**Date:** 2026-10-29  
**Document status:** RESEARCH / RECOMMENDATION / NON-NORMATIVE. Not a conformance certificate, accepted specification, or production-readiness attestation.  
**Purpose:** Translate the expanded AMA evidence round into architecturally coherent decisions, stress-test the universal AMA purpose, and identify **second-level gaps only after assuming first-level recommendations are implemented correctly**.  
**Source scope:** Original 51-source dossier, seven additional records E52–E58, and independently initiated TinyFish 86-reference source review. These sets **overlap**; do not add their counts as a distinct-source total.  
**Research material:** [original source round](AMA-SOURCE-ROUND-GRANULAR-REQUIREMENTS-2026-10-29.md), [targeted expansion](AMA-SOURCE-EXPANSION-TINYFISH-ARTICLE-GALAXY-2026-10-29.md), [completed TinyFish report](https://agent.tinyfish.ai/playground/research/share/01a18517-da9b-7a93-89cd-def1bbeabdb4).  
**Baseline comparison:** [AMA.md](../architecture/AMA.md), \`packages/agent-model/agent-manifest.schema.json\`, \`docs/specifications/AMA-CONFORMANCE.md\`, current shared types and CI-tested, unconnected runtime adapters.

## 0. Analytical protocol — what is source-derived and what is inferred?

**D0 = documented design:** A requirement explicitly present in current AMA 0.1 or its schema.  
**T0 = tested implementation:** A feature exercised in disposable CI, not a running service.  
**S = sourced finding:** Statement made by a named standard, public technical guide or research publication. Where a source is a preprint, finding is not independently replicated by the fact of its publication.  
**I = interpretation:** Our architecture inference from sources.  
**R1 = first-level proposed recommendation:** A coherent change package covering multiple related requirements. **Not implemented.**  
**R2 = conditional residual gap:** A remaining issue that **would still exist after R1 is fully implemented**. Not an extra duplicate to be counted before R1.  
**V = verification:** What observable evidence would justify closing the gap.

### Evidence quality controls

- The original dossier catalogs **51 references and 96 candidate requirements A01–L07** (12 domains). Those are *proposals*, not 96 accepted requirements.
- The targeted expansion adds **seven records E52–E58**, including initial abstract/excerpt screening for long-horizon, memory injection and policy compilation.
- TinyFish's completed synthesis reports **86 reviewed source references** (self-classified 56 primary/25 secondary/5 low quality). The counts are tool-reported, not independently bibliometrically deduplicated. They overlap earlier material. Its raw claims are **triage evidence**, not 86 individually validated full texts or a completed formal HARP RefA.
- Primary-source verification checked [NIST tenets](https://www.nist.gov/blogs/cybersecurity-insights/design-tenets-agent-identity-management-systems), [MCP 2026-07-28 authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) and [A2A v1.0 signing](https://a2a-protocol.org/v1.0.0/specification/) against earlier summary claims. Keep the conditional words MUST/SHOULD/MAY intact.
- The MCP authorization profile is **OPTIONAL for MCP implementations overall**; HTTP implementations supporting it SHOULD conform to the detailed spec. Do not transform MCP HTTP requirements into universal AMA OAuth mandates.
- A2A Agent Cards **MAY be signed**; the signing procedure has MUST-level canonicalization rules **when signing is used**. Do not report signature support as unconditional A2A MUST.
- Early arXiv agent benchmarks are research results. Unreplicated failure percentages and model leaderboard snapshots **must not** become universal admission thresholds.
- EU AI Act duties depend on system classification, role, deployment and effective regulations; do not embed a particular legal timeline as an AMA law. The official consolidated regulation and Commission guidance govern applicable dates.
- An immutable audit concept does not imply unlimited retention; privacy, erasure, legal hold and access restrictions require policy-level reconciliation.

### Source-derived consensus versus choice

**Strong cross-source themes (S):** distinct agent identity; bounded delegated mandate; policy/reasoning separation; least privilege; untrusted tool and retrieved content; versioned workflows; state-aware validation; action/effect evidence; failure/recovery handling; adversarial testing; actual environment outcomes; no automatic self-acceptance.

**Constrained evidence (S):** whether memory improves performance, long-horizon extrapolation, efficacy of specific prompt-injection defenses, generalization of policy-compilation benchmarks and multi-agent emergent behavior across models. The sources report both successful memory use and memory-induced degradation. AMA should require **evaluation and explicit choice**, not prescribe one memory system.

**Design synthesis (I):** AMA needs layered normative interfaces and conditional profiles; host implementations may select concrete frameworks. This is a recommendation, not a sentence quoted from any individual source.

## 1. Purpose stress criterion — what counts as an adequate AMA?

The **purpose** is to construct and govern *any* admitted first-class agent under a reusable architecture without embedding any particular agent's purpose, workflows or domain semantics. A complete AMA must be simultaneously:

1. **Universal:** no concrete agent, vendor, protocol or host-system assumption in its normative core.
2. **Expressive:** enough typed contracts for reasoning, workflow/tool use, memory, authority, risk and execution.
3. **Bounded:** no authority from content, model intention, inferred credential availability or role decomposition.
4. **Verifiable:** machine-checkable definitions, reproducible tests and independent operational evidence.
5. **Recoverable:** bounded failure, replay, rollback and side-effect uncertainty where used.
6. **Upgradeable:** compatible schemas, registered versions, impact assessment and controlled migration.
7. **Operationally accountable:** cost, safety, data obligations, lifecycle and independent acceptance.

The assessment's target is **contract completeness**, not universal automation of all possible workloads.

## 2. Seven overarching stress tests and structured answers

The seven questions partition the 96 candidate requirements by *primary* domain responsibility, although cross-cutting dependencies remain. Every question tests (a) a source-discovered need, (b) AMA's stated purpose, (c) the current specification, and (d) residual gaps after its first-order remediation.

### Q1 — Can AMA describe and admit any first-class agent without smuggling instance-specific definitions, while preserving formal relationships across all component schemas?

**Stress scenario:** An implementation with no long-term memory and a different runtime class is submitted using only normative AMA schemas. The verifier must accept its valid interface choices without needing an example agent, while rejecting unregistered workflow/tool relations.

**Sources and insight (S):** The original A01–A07 ontology set distinguishes agents, commands, workflows, capabilities, tools, roles, tasks and runs. Vendor guidance favors simple orchestration before agent proliferation. The original D01/D03 schema findings expose the risk of conflating labels, authority and implementation.

**Baseline (D0/T0): PARTIAL.** \`AMA.md\` is agent-agnostic with a first-class admission test; the current manifest has 19 top-level properties, and registry bindings are mostly string IDs. Static C1/C3 tests are available; typed cross-object semantics and complete schema suite are absent.

**Structured answer (I):** AMA is *universal in intent but not yet complete as a machine-verifiable type system*. Existing distinctions are architecturally sound; the inability to define all legal relationships and cardinalities makes a generic implementation difficult to prove.

**First-level recommendation R1 — Contract decomposition and semantic compatibility:**
- Preserve \`AMA-CORE\` as the agent-independent authority for terms, state invariants and applicability.
- Add interoperable JSON Schemas for Agent, Workflow, Command, Capability, Tool Adapter, Task/Run, Authorization Context, Evaluation and Evidence.
- Require all cross-object bindings to resolve a **specific immutable definition version/digest** rather than free-form labels.
- Introduce generic, conditional model, planning, memory and deployment profiles; defaults are OFF unless admitted.
- Supply a compatibility matrix plus executable conformance suites and synthetic, explicitly non-normative fixtures.

**Expected first-order closure:** Resolves the document/schema mismatch, entity ambiguity, incomplete binding validation and unsafe extension defaults **as one work package**. Do not count each as an independent residual gap once the shared contract is implemented.

**Residual R2-01 (conditional):** Cross-schema semantic conflicts, extension namespace collisions and version migration interpretation may still emerge even when each local schema validates. **Proof:** cross-profile compositional tests, migration fixtures and negative dependency tests.

**Assessment:** PARTIAL; promotion block for universal schema completeness, not evidence of a deployed agent.

### Q2 — Can an agent always prove what it is allowed to observe, change, disclose or delegate, even when actions are individually harmless but collectively risky?

**Stress scenario:** A read-only capability joins several sensitive datasets and attempts to disclose the aggregation externally, or a delegated workflow silently widens scope after a tool result.

**Sources and insight (S):** Original B01–B10/G01–G10; NIST 2026 proposes distinct agent identity, attenuation, just-in-time privileges, signed mandates, policy/reasoning separation, deterministic decisions and independent evidence. OWASP agent-specific threat coverage and MCP token audience controls reinforce scope-dependent checks. E55 NOMOS proposes deterministic gates but warns about false denials from faulty policy compilation.

**Baseline (D0/T0): INADEQUATE FOR PRODUCTION.** Schema mandates \`authorityRefRequired\` and \`mandateRefRequired\` booleans, with an E0–E4 ordinal ceiling. The local effect gate is CI-tested using mock authority/policy adapters, and E0-sensitive reads are not covered by a production-attested resource authorization path.

**Structured answer (I):** An ordinal effect ceiling is an upper bound on mutation *kind*, not proof of consent, scope, confidentiality, blast radius or delegation. A nominal E0 read can be higher-risk than an E2 update.

**First-level recommendation R2 — Multidimensional authorization and delegation:**
- Represent principal, workload identity, delegation chain, mandate issuer, valid interval, audience, target resources, tenant/data classification and revocation.
- Separate *action effect kind* from *risk and exposure dimensions*: read sensitivity, aggregation, recipients, reversibility, externality, scale and required approval.
- Require resource-scoped access checks for reads **and** writes; let policy bind to full task/workflow context.
- Make policy binding, approval and credential verification independent of model reasoning; lack of a required service results in DENY/HOLD.
- Enforce attenuation and continuous checks at trust boundaries; log blocked attempts while minimizing sensitive evidence.
- Keep governance-specific authority trees in host adapters, not in AMA normative definitions.

**Expected first-order closure:** Resolves absent resource scoping, false E0 safety, missing delegation semantics and policy-decider separation through one authoritative control model.

**Residual R2-02:** Multi-step *information aggregation and purpose inference* can cross an information barrier even when every single read is permitted. **Proof:** path-sensitive tests across tasks, contexts and target combinations; privacy impact evaluations.

**Residual R2-03:** Cryptographic delegation freshness and revocation are still subject to time-of-check/time-of-use races and broken external enforcement points. **Proof:** tampered token, expired approval, mid-flight revocation, outage and adversarial delegation-chain tests against a real boundary.

**Assessment:** FAIL as production-level universal authority assurance until independent policy is actually bound.

### Q3 — Can AMA govern reactive, deliberative and long-horizon agents through one model-neutral contract without assuming a particular reasoning strategy or overstating capability?

**Stress scenario:** One registered agent handles a single bounded request; another performs a long task that exceeds context, requires replanning, changes models and must explain why it stopped or sought human help.

**Sources and insight (S):** Original C01–C08; E52 Horizon Gap distinguishes task horizon from context length and long-term memory. The completed TinyFish review emphasizes long-horizon failure, model/harness confounds and benchmark validity. ReAct and Reflexion demonstrate alternative reasoning strategies, not universal mandates.

**Baseline (D0/T0): MAJOR GAP.** \`runtimeClass\` declares invocation mode, but the current manifest does not express a reusable model binding, prompt provenance, planning strategy, token/time/cost budgets, stop conditions or supported evaluation profile.

**Structured answer (I):** AMA currently governs an agent's outer lifecycle more clearly than its cognitive decision process. Requiring one planner would violate universality; leaving planning undefined would under-specify safe execution.

**First-level recommendation R3 — Conditional cognitive execution profile:**
- Define \`modelProfileRef\`, \`instructionProfileRef\`, \`reasoningStrategyRef\`, \`taskHorizonPolicyRef\` and \`executionBudgetRef\` as replaceable, versioned contracts.
- Separate model context capacity, task duration/dependencies and cross-session memory as independent variables.
- Specify bounded goal/plan decomposition, allowed capability graph, checkpoint cadence, replanning rules, recursion/delegation ceilings, stop/abstain/escalate and model fallback migration.
- Preserve deterministic control-envelope semantics while permitting probabilistic reasoning inside bounded steps.
- Evaluate model/scaffold contribution separately where feasible.

**Expected first-order closure:** Covers model/provider independence, instruction versioning, planning contract, bounded autonomy and budget/stop omissions in one conditional module family.

**Residual R2-04:** There is no generally transferable predictive formula for long-horizon reliability; a planner that passes short tasks may still drift or fail at longer horizons. **Proof:** stratified horizon benchmarks, held-out tasks, repeated trials and ablation by model/harness.

**Assessment:** FAIL for fully specified model-driven and long-running cognition; optional profile design can address structural incompleteness without claiming performance.

### Q4 — Can AMA maintain useful, accurate and trustworthy information across context windows, tasks and sessions without turning stored content into instructions or authority?

**Stress scenario:** A compromised retrieved document poisons memory once; after many sessions a different workflow retrieves that entry as if it were trusted policy. Meanwhile summarization discards a rare but important fact.

**Sources and insight (S):** Original E01–E07; E52–E54 distinguish persistence and show plausible delayed/cross-domain memory injection. The TinyFish survey reports mixed memory performance: some memory systems help cross-session tasks, while some memory scaffolds worsen certain long-horizon benchmarks. These are setting-specific claims, not universal laws.

**Baseline (D0/T0): MAJOR GAP.** \`statePolicy\` has \`durableState\`, \`memoryMode\` and optional store reference. It cannot describe separate memory write/read approvals, source trust, version, retention, retrieval scoping, contradiction, poisoning or deletion obligations.

**Structured answer (I):** Memory is an optional implementation, but a *memory safety interface* is part of the core: without it, turning on memory silently creates a second control plane.

**First-level recommendation R4 — Typed memory and context governance:**
- Separate working context, run checkpoint, episodic/semantic memory, retrieval index and authoritative domain data.
- Introduce conditional \`memoryProfile\`, \`contextPolicy\`, \`memoryWritePolicy\`, \`retrievalTrustPolicy\`, and \`retentionDeletionPolicy\`.
- Every retained item declares origin, actor, trust, access scope, storage location, expiry, validation status and ability to correct/delete.
- Prevent memory retrieval from granting instruction or authorization precedence; quarantine suspicious writes.
- Require tests for delayed poisoning, cross-domain retrieval, contradiction, compaction fidelity and cost/latency usefulness; memory remains OFF by default.

**Expected first-order closure:** Resolves coarse memory type, missing retention/provenance, retrieval scoping and infection channels through one guarded memory architecture.

**Residual R2-05:** Persistent misinformation, long-term compaction drift and adaptation to changing sources remain unresolved even with trust labels. **Proof:** delayed poisoning, cross-session longitudinal accuracy, contradiction resolution and selective deletion tests.

**Residual R2-06:** Data erasure, evidence immutability and legal retention can conflict. **Proof:** privacy/deletion tests on memory plus append-only audit references, with independent retention-policy approval.

**Assessment:** FAIL for enabled persistent memory; OFF-by-default agents may remain valid without long-term memory.

### Q5 — Can AMA reliably execute consequential, multi-step work across failures, pauses and restarts without repeating external effects or losing authority context?

**Stress scenario:** An external action succeeds, its response times out, a workflow retries, the mandate expires during a pause and a new worker resumes stale state.

**Sources and insight (S):** Original D01–D08/F01–F08; Temporal/LangGraph durability and replay semantics; E52 long-horizon hazards; TinyFish 86-source survey discusses event sourcing and idempotency but its cited studies do **not** make one particular orchestration engine a universal AMA requirement.

**Baseline (D0/T0): PARTIAL, NOT CONNECTED.** Static command/workflow/capability gate, PostgreSQL registry version transitions and a CI-tested pre/post-effect journal exist. No production durable worker, transactional effect lease, verified policy provider or C4/C5 live-execution attestation.

**Structured answer (I):** Durable workflow and side-effect authorization are different guarantees. A logged intent cannot prove the external action executed exactly once. A result returned to an LLM cannot prove acceptance.

**First-level recommendation R5 — Generic durable task/effect protocol:**
- Define Task, Run, Step, Attempt, Approval, Effect, Receipt and Reconciliation as distinct identities and state machines.
- Require explicit idempotency key semantics, checkpoint/resume and bounded retries when durability is enabled.
- Enforce a preview/authorize/execute/observe/reconcile envelope for consequential actions, with safe hold on uncertain completion.
- Support leases/fencing, cancellation, revocation on resume, downstream idempotency or compensating action where available.
- Preserve immutable causal events and independent effect receipts; do not prescribe Temporal, LangGraph or event sourcing as sole implementation.

**Expected first-order closure:** Resolves missing run/task semantics, retries, cancellation, incomplete effect-state vocabulary and framework assumptions together.

**Residual R2-07:** No AMA-local abstraction alone guarantees exactly-once effects against a non-idempotent external service or eliminates the revocation race. **Proof:** crash injection after remote commit, worker failover, duplicate callback and reconciliation tests with real integration surfaces.

**Assessment:** PARTIAL CI prototype only; live execution claims remain unverified.

### Q6 — Can AMA demonstrate actual task reliability, safety and independent evidence rather than only successful schema validation, good-looking outputs or benchmark scores?

**Stress scenario:** A response passes automated evaluation but an independent reviewer rejects its real-world outcome; safety policy blocks nearly all useful actions; a model discovers a shortcut that games the grader.

**Sources and insight (S):** Original H01–H09/I01–I08; τ-bench, AgentDojo, SWE-bench and long-horizon literature emphasize stateful correctness, adversarial pressure, repeated-trial reliability and metric validity. NOMOS E55 reports both lower violations and false-denial hazards. TinyFish review cites benchmark-to-real-maintainer differences, reward hacking and outcome/evidence gaps; precise quantitative transferability is unverified here.

**Baseline (D0/T0): PARTIAL.** C1/C2/C3/C6 static conformance and CI integration tests exist. C4 live execution and C5 independent end-to-end evidence are not certified. Current evidence schema is thin; cost/reliability and negative-execution metrics lack a unified profile.

**Structured answer (I):** Correctness, compliance, utility, observability, evidence and independent acceptance must be separately measured. One PASS should never collapse these.

**First-level recommendation R6 — Multi-axis assurance system:**
- Define evaluation suites for structural validity, authorized actions, final state, real effects, threat cases, recovery and human acceptance.
- Require declared datasets/tasks, environmental state, success criteria, sample counts, repeated-trial reliability, variance and known blind spots.
- Evaluate *false allow* and *false deny*, benign utility, safety, cost, latency, evidence completeness and operator burden independently.
- Require separate evaluator, trace/audit artifact linkage, failed/blocked attempt records and independently authorized promotion.
- Add conformance profile versioning, threshold ownership and domain-specific outcome tests **outside** AMA core.

**Expected first-order closure:** Resolves unsupported PASS semantics, insufficient evidence contracts, missing reliability/cost/adversarial profile and acceptance conflation as one assurance workstream.

**Residual R2-08:** Evaluator gaming, overfitting, judge bias and non-transfer of test results to new environments or longer horizons remain possible even after improved metrics. **Proof:** external challenge sets, independent reviewer calibration, canary/shadow comparison and blinded outcome audits.

**Residual R2-09:** Evidence that is complete may still expose sensitive inputs, while aggressive redaction may harm verification. **Proof:** redaction/verification reconciliation, field-level access and privacy-preserving receipt tests.

**Assessment:** PARTIAL static assurance; not production certified.

### Q7 — Can AMA evolve across models, protocols, security standards, governance obligations and operating environments without breaking existing agents or importing host-specific requirements into the master architecture?

**Stress scenario:** An optional protocol changes, a tool definition is replaced, a model is deprecated and legal risk changes. An already accepted agent must either upgrade compatibly or suspend without secretly gaining permissions.

**Sources and insight (S):** Original J01–J07/K01–K07/L01–L07 plus G05/G09; MCP/A2A protocol versioning, OTel Development conventions, SLSA/SPDX provenance, NIST/ISO voluntary frameworks and conditionally applicable law. TinyFish 86-reference review highlights agent identity and operations standardization as still evolving.

**Baseline (D0/T0): PARTIAL.** AMA version pin, lifecycle, modular classes and migration principles are present; registry migration is CI-tested, but no deployed health/incident/rollback system, live adapters or complete compatibility impact model exists.

**Structured answer (I):** AMA can be universally stable only if *its conceptual contract* is versioned separately from evolving host bindings and agent implementations. Protocol-specific MUSTs should be conditional on enabling that protocol.

**First-level recommendation R7 — Layered evolution and operational conformance:**
- Standardize compatibility/deprecation contracts, profile negotiation, extension namespaces, source/build provenance and safe migration.
- Define host-managed operational interfaces for health, cost/latency SLO, dependency failures, incidents, emergency suspension, rollback and retirement.
- Keep MCP, A2A, telemetry and legal compliance as separately versioned conditional profiles. In particular, MCP authorization is optional at protocol level, and A2A Agent Card signing is optional; do not silently promote either into AMA-wide MUST.
- Require source validation, provider update scanning and an impact/evidence matrix when normative or adopted profile behavior changes.
- Clarify ownership of library, model, tool, workflow, policy and data version drift and post-release monitoring.

**Expected first-order closure:** Resolves extension and integration ambiguities, upgrade/operations gaps, vendor lock-in risk and incorrectly universalized external standards through one change-control framework.

**Residual R2-10:** Protocol/provider/legal drift and incompatible external updates continue after the contract is built. **Proof:** version-compatibility fixtures, source monitoring, semantic diff and migration simulations.

**Residual R2-11:** Production readiness depends on actual host integration, human acceptance, kill switch, incident handling and verifiable operations; an AMA template cannot supply these by itself. **Proof:** authenticated live adapter tests, staged rollout, independent sign-off and monitored rollback rehearsal.

**Assessment:** PARTIAL; universal interface design is feasible, but full runtime and standard-following claims require host evidence.

## 3. Top-level cross-question scorecard (baseline, not projected success)

| Question | Primary evidence domains | Current contract | Executable proof | First-level decision |
|---|---|---|---|---|
| Q1 — Universal expressiveness | A01–A07 | PARTIAL | Schema and static bindings partially tested | R1 |
| Q2 — Authority and scope | B01–B10, G01–G10 | INADEQUATE | Mocked local gate, no live authority service | R2 |
| Q3 — Cognition and horizon | C01–C08 | MAJOR GAP | No generic reasoning profile tests | R3 |
| Q4 — Memory and knowledge | E01–E07 | MAJOR GAP | No governed memory-runtime proof | R4 |
| Q5 — Tool, workflow, durability | D01–D08, F01–F08 | PARTIAL | PostgreSQL/effect CI only | R5 |
| Q6 — Reliability and independent assurance | H01–H09, I01–I08 | PARTIAL | Static C1/C2/C3/C6; live C4/C5 pending | R6 |
| Q7 — Operations, adoption and evolution | J01–J07, K01–K07, L01–L07 | PARTIAL | Versioned design; deployed ops missing | R7 |

All 96 original IDs have **one primary question**; relationships may also appear as secondary dependencies. Source-expansion E52–E58 are research records, **not additional normative requirement IDs**. The 86-source survey is a screening pool, not 86 additional accepted requirements.

## 4. Consolidation: why seven R1 packages are better than applying 96 requirements independently

A naïve gap count treats "model binding missing," "prompt version missing," "planner stop condition missing" and "horizon absent" as four unrelated fixes. R3 adds a typed cognitive execution profile that can address all four through one design, followed by separate measurable tests.

The same consolidation applies to:
- R1: semantic contracts, cross-object version pins and optional profile registration;
- R2: delegated authority, scoped policy evaluation, E0 exposure and risk dimensions;
- R3: reasoning/model/prompt/planning/horizon/budget;
- R4: memory/context write/read trust, provenance, retention and poisoning tests;
- R5: workflow/task/run/effect state, idempotency, reconciliation and durability;
- R6: evaluation, evidence, performance, security and independent acceptance;
- R7: version compatibility, interoperability, operations, lifecycle and governance change.

**Important logical distinction:** "R1 addresses gap X" means **expected coverage if fully implemented and verified**. It does not mean the gap is closed in the current codebase. A second-level gap is not counted as newly closed simply because it was named.

## 5. Second-level residual gap register — only after R1–R7

These are **conditional post-remediation questions**, not a second independent count of the initial 96 candidates.

| Residual | Survives R1–R7 because | Impact | Closure evidence | Priority |
|---|---|---|---|---|
| R2-01 Cross-contract semantic conflicts | Local schema validation cannot prove cross-profile meaning | Ambiguous execution semantics | Compositional and migration conformance | P1 |
| R2-02 Path-dependent information leakage | Individual accesses can aggregate sensitive knowledge | Privacy and scope abuse | Multi-step information-flow/red-team tests | P0 |
| R2-03 Delegation freshness and revocation races | Trust chain may change during execution | Unauthorized continuing effect | Live revocation/authority/target adversarial tests | P0 |
| R2-04 Long-horizon prediction and model/harness confounds | Scaffold + model reliability varies by task length/domain | Unreliable long tasks | Cross-domain horizon evaluations and ablations | P1 |
| R2-05 Memory poisoning, drift and repair | Trust labels do not ensure correctness years or sessions later | Persistent behavioral corruption | Delayed injection, truth repair, compaction tests | P0 when memory enabled |
| R2-06 Privacy deletion versus append-only evidence | Audit and data rights can impose competing obligations | Legal and forensic conflict | Retention/redaction/deletion policy review | P1 |
| R2-07 Distributed effect atomicity | External resources lack common transactional semantics | Duplicate or uncertain external action | Crash/failover/compensation tests against live adapters | P0 |
| R2-08 Evaluation gaming and transfer validity | Tests can be overfit or optimized against graders | False assurance | Blind challenge sets and independent outcomes | P1 |
| R2-09 Sensitive evidence minimization | Verification and privacy require competing data access | Leakage/irreproducible audit | Fine-grained evidence-access and audit tests | P1 |
| R2-10 Protocol and obligation drift | External standards and providers change over time | Breaking changes and compliance gaps | Version tracking + controlled adaptation | P2 |
| R2-11 Operational binding and real-world assurance | A normative architecture is not a functioning deployment | False readiness and uncontrolled effect | Independent end-to-end live C4/C5 + incident rehearsals | P0 for activation |

### Why no second-level residual "missing model profile" or "missing memory schema"?

Those are already explicitly assigned to R3 and R4. They reappear as second-level concerns **only** where the first-level implementation could be structurally complete yet real behavior remains unreliable (e.g., long-horizon generalization or poisoned retrieved memory). This is the intended two-pass deduplication.

## 6. Staged implementation dependencies, not 96 simultaneous work items

\`\`\`text
Source validation and universal contract boundary
                 |
           R1 typed ontology
                 |
    +------------+----------------+
    |                             |
 R2 identity and risk         R3 cognitive profile
    |                             |
    +------------+----------------+
                 |
             R4 memory/context
                 |
             R5 execution effects
                 |
          R6 evaluation/evidence
                 |
        R7 operations/adaptation
                 |
       SECOND-LEVEL residual tests
       (close by live verification,
       new controls, or explicitly
       accepted and documented limits)
\`\`\`

This depicts primary dependencies, **not** a strict one-thread implementation sequence: security controls, memory safety and evaluation design can be developed in parallel once their common interfaces are versioned.

### Proposed work-package decision points

| Stage | Deliverable | Pass condition | Status |
|---|---|---|---|
| 0 | Evidence adjudication | Qualify primary/draft/secondary and identify disputed claims | PROPOSED |
| 1 | R1 universal model | Cross-schema references and template-purity/compatibility tests | PROPOSED |
| 2 | R2 policy control | Scoped reads/writes, human delegation, rejection and revocation | PROPOSED |
| 3 | R3 + R4 conditional profiles | Typed reasoning/planning/memory with disabled-by-default behavior | PROPOSED |
| 4 | R5 execution states | Crash, replay, idempotency, effect uncertainty and bounded resume tests | PROPOSED |
| 5 | R6 independent assurance | Outcome, false-allow/deny, repeated trials and evidence completeness | PROPOSED |
| 6 | R7 lifecycle and extensions | Compatibility, incident, rollback and controlled release | PROPOSED |
| 7 | R2 residual validation | All P0 residual risks addressed or operationally blocked | PROPOSED |

**Release rule:** A structural contract may be accepted as a design while production activation remains blocked by unverified authority and operational gates. No claim is made here that any proposed stage passed.

## 7. Seven acceptance judgments — recommended overall decision

1. **AMA's *purpose and ontology* are largely correct;** make relations machine-checkable rather than broadening its mission.
2. **AMA's authorization model is the highest-severity structural weakness;** separate action class from sensitive information access, delegation and policy.
3. **AMA cannot yet uniformly govern reasoning and task horizon;** add conditional cognitive profiles rather than selecting a canonical planner or model.
4. **Memory is optional but its security semantics are not;** no persistent memory without source trust, write/read control and evaluation.
5. **Durable execution is partially prototyped, not assured;** external effect uncertainty and revocation races require dedicated controls.
6. **AMA lacks operationally meaningful evidence of agent reliability;** static conformance and response correctness are insufficient.
7. **The architecture is maintainable only if contract, profile, host, instance and runtime evidence are separate;** evolving MCP, A2A and governance must remain conditional profiles.

### Overall provisional judgment

**Architecture thesis: defensible.  
Universal completeness: incomplete.  
Risk-bound execution: unverified.  
Research sufficiency for next requirements draft: sufficient with source qualifications.  
Production readiness: not established.**

## 8. Source traceability

**Original catalog:** A01–L07 plus original bibliography 1–51 — \`AMA-SOURCE-ROUND-GRANULAR-REQUIREMENTS-2026-10-29.md\`.

**Targeted additions:** E52–E58 — \`AMA-SOURCE-EXPANSION-TINYFISH-ARTICLE-GALAXY-2026-10-29.md\`.

**Broad screening:** TinyFish completed research, 86 cited references across 15+ topics and 20 sections: https://agent.tinyfish.ai/playground/research/share/01a18517-da9b-7a93-89cd-def1bbeabdb4 . Article-level HARP verification remains incomplete; individual source statements should be used with their own certainty.

**Particularly material primary references:**
- [NIST Design Tenets for Agent Identity Management Systems (2026-10-27)](https://www.nist.gov/blogs/cybersecurity-insights/design-tenets-agent-identity-management-systems) — proposed identity/delegation/policy/evidence tenets.
- [MCP 2026-07-28 authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) — conditional protocol authorization requirements.
- [A2A Protocol v1.0.0](https://a2a-protocol.org/v1.0.0/specification/) — optional Agent Card signing, conditional signature verification.
- [W3C PROV-O](https://www.w3.org/TR/prov-o/) — provenance vocabulary.
- [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) — voluntary risk management.
- [NOMOS (2026 preprint)](https://arxiv.org/abs/2610.11030) — policy compilation and false-denial risk.
- [The Horizon Gap (2026 preprint)](https://arxiv.org/abs/2608.06663) — task horizon versus model context versus memory.
- [InjecMEM (2026 preprint)](https://arxiv.org/abs/2608.23471) and [Poison Once (2026 preprint)](https://arxiv.org/abs/2604.02623) — persistent-memory attack cases.
- [EU AI Act consolidated regulation](https://eur-lex.europa.eu/eli/reg/2024/1689) — role- and use-dependent legal obligations.

## 9. Methodological limitations and further evidence needs

- There is no validated unique count of sources across overlapping rounds.
- The broad review contains third-party claims and preprints, not all independently checked full text. Do not transplant precise rates or market-wide claims without primary-source checking.
- A benchmark validity finding does not mean every use case is unreliable, and a reported negative effect of memory does not prove memory is universally harmful.
- Static conformance tests cannot substantiate deployment safety or acceptance.
- Remaining P0 residuals are **test/research and deployment blockers**, not evidence that a master architecture must solve all theoretical agent reliability problems before a single read-only agent can exist.
- A future requirements decision table should assign each candidate requirement a normative level (CORE / CONDITIONAL / OPTIONAL / HOST), owner, explicit source, schema location, test case, decision and status. The companion coverage index maps all 96 original IDs to their primary question without deciding their adoption.
