# AMA — Granular Agent Architecture Source Round (2026-10-29)

**Status:** Evidence-informed requirements dossier; not an adopted AMA specification and not a completed formal HARP RefA.  
**Scope:** Universal first-class agent architecture, independent of any named agent/domain, provider or production platform.  
**Compared against:** `docs/architecture/AMA.md`, `packages/agent-model/agent-manifest.schema.json`, shared types, static conformance and host runtime boundary on the draft development branch.

## Method and evidence semantics

Sources were selected for (i) primary technical specifications, (ii) authoritative standards/guidance, (iii) peer-reviewed or original research, and (iv) tested open-source/reference engineering patterns. Industry guides and preprints support engineering judgments, not compulsory standards. A release date matters: 2026-07-28 MCP supersedes earlier design assumptions; OpenTelemetry agent semconv is still **Development**. The EU AI Act applies according to risk/use and legal role, not to every software agent merely because it uses AI. ISO standard landing pages provide public summaries rather than a license to claim reading their paywalled normative body.

Legend: **C** = proposed mandatory AMA core invariant; **X** = mandatory interface if capability enabled; **O** = optional module contract; **H** = host implementation, NOT normative AMA; **R** = research insight, not a universal rule. "Should be in AMA" means contract specification, not adoption of a particular framework.

## Research synthesis: architecture principles

1. **Agent vs workflow vs command vs capability vs skill vs tool vs run vs task vs role vs model** must be independently defined. A workflow may use AI and still be a workflow. Skills are reusable instruction/resource modules, not independent authority.
2. **Reasoning and authorization are different systems.** Reasoning may propose a plan; a deterministic, independently maintained policy decision must govern effect permissions.
3. **Agent identity is not human identity.** Require actor, principal, agent/workload, delegation chain, authorized mandate, destination/target and revocation. Proposed NIST 2026 identity tenets favor distinct, verifiable identities, zero standing privilege, attenuation, signed mandates and human review.
4. **Scope is multidimensional, not only an ordinal effect rank.** A read can disclose sensitive records. Evaluate action kind, resource scope, data classification, reversibility, recipient exposure, blast radius, geography and obligation class separately.
5. **Agent model/scaffold is a replaceable implementation.** Separate runtime class, reasoning and model binding, prompt package, capability descriptions, tool adapters, memory/state, persistence, policy and evidence.
6. **Durability is independent of transport.** 2026 MCP statelessness removes hidden session dependency but does not implement jobs, retries, idempotency or checkpointed orchestration.
7. **An agent result is not accepted work.** Evidence of execution, independent verification, and authorized acceptance have different security and workflow semantics.
8. **Evaluation must operate on actions and final state.** Response fluency cannot substitute for state-based correctness, repeated-trial reliability, adversarial resilience, recovery and cost.
9. **Memory is untrusted mutable data, not authority.** Distinguish conversation buffer, run checkpoints, episodic/semantic records, retrieval indexes and domain source-of-truth; require policy, provenance, expiry, poisoning detection and deletion.
10. **Specifications must be layered.** The normative AMA core defines invariants and interfaces; optional capability profiles define extras; host adapters select technologies; instances define missions; tests use synthetic fixtures.

## Proposed universal requirements catalogue

### A. Ontology and identity (C)

- A01 Formal glossary with type disjointness and permitted relations: Agent owns Workflow; Command resolves Workflow; Workflow requests Capability; Tool implements Capability; Run instantiates Workflow; Module extends Agent; Agent may delegate to another independently registered Agent.
- A02 Immutable `agentId`, version, contractVersion, schemaVersion, revision/digest, status, activation policy and declared responsible principal.
- A03 First-class admission test: mandate, independent lifecycle and accountable control boundary; avoid converting named procedures into agents.
- A04 Separate `agent_definition`, `runtime_deployment`, `identity_principal`, `workload_instance` and `run` identities.
- A05 Versioned compatibility declarations and immutable historical versions.
- A06 Machine-readable and human-readable discoverability/description without treating description as authority.
- A07 Documentation card for purpose, intended users, known limitations, prohibited applications, test profile and change history.

### B. Mandate, identity and authorization (C)

- B01 Explicit mandate issuer, subject, allowable action kind/resource target, issued/expiry times, revocation pointer, non-goals and signed/verifiable proof where supported.
- B02 Principal–agent–tool delegation linkage; downstream rights are attenuated, never amplified.
- B03 Zero/least standing privilege; just-in-time credential binding and expiration/rotation.
- B04 Policy decision interface distinct from model planner, including signed/pinned policy, decision expiry, deny reasons and obligations.
- B05 Target/resource-level checks for read **and** write; a read may be sensitive even if no mutation occurs.
- B06 Multidimensional risk/effect classification: action class, data sensitivity, recipients, reversibility, financial impact, blast radius, network exposure, retention/jurisdiction.
- B07 Deterministic independent human-review triggers, approval request package and expiration; no approval inferred from prompt text.
- B08 Revocation/fail-closed behavior before consequential effects and after pause/resume.
- B09 Cross-tenant isolation and user-consent boundaries with provenance.
- B10 Authorization-denial evidence emitted for attempts, including service unavailable/indeterminate outcomes, with privacy safeguards.

### C. Reasoning and planner profile (X, model use)

- C01 Optional typed model-adapter binding and provider-agnostic interface, version, provenance/hash, supported modalities and sampling behavior.
- C02 Versioned instructions/prompts and their precedence; separately controlled developer configuration vs untrusted source content.
- C03 Strategy interface: direct response, plan-and-act, ReAct-style interleaving, deterministic sequential/parallel routing, reflective loop, evaluator–optimizer; none is compulsory.
- C04 Bounded plan graph with objectives, assumptions, steps, dependencies, expected outcome and allowed tool/capability IDs.
- C05 Max reasoning cycles, max tool calls, recursion/delegation depth, context and token budgets; absolute timeout and cancellation triggers.
- C06 Grounding/fact-verification and uncertainty/abstention policy; input confidence is never authorization.
- C07 Separate synthesis, checking and authorized finalization. No model-generated self-assertion of acceptance.
- C08 Fallback/model substitution rules require regression against the approved model binding, not a silent upgrade.

### D. Workflows, commands, tasks and tools (C)

- D01 Version-pinned Command→Workflow mapping; declared inputs and outputs as JSON Schema, with semantic validation beyond schema.
- D02 Workflow step graph, dependency and concurrency boundaries, finite stopping conditions and terminal-state map.
- D03 Typed capability registry with implementation adapter, action kind, target scope, authentication scopes, quotas, failure codes and availability state.
- D04 Tool schema version, deterministic validation, tool-call allowlist, output contract, error semantics, trusted/untrusted provenance and content redaction.
- D05 Transaction envelope: preview → authorize → execute → reconcile for impactful actions; dry-run where supported.
- D06 Decompose input-source instructions from operational authority; prompt injection from tool response cannot rewrite command/mandate.
- D07 Explicit human input/approval resumability; approval is separately authenticated, scoped and time-bounded.
- D08 Inter-agent invocation is optional and must define identity, delegation, context minimization, capability negotiation and task-state contracts.

### E. Memory, context and knowledge (C policies; O persistence engines)

- E01 Declare context assembly strategy, token budgets, truncation/compaction and provenance; do not treat a long model window as guaranteed retrieval.
- E02 Differentiate ephemeral context, short-term run/thread state, long-term episodic/semantic memory, retrieval indexes, shared knowledge and authoritative domain data.
- E03 Memory stores are typed, versioned, scoped, access-controlled, attributable and default disabled if not configured.
- E04 Memory write admission, source trust rank, retention/expiry, revalidation, correction, deletion/erasure and poisoning defense.
- E05 Retrieval quality checks: relevance, provenance, recency, contradictory claims, source access and no instruction injection.
- E06 Explicit context handoff and summarization with fidelity tests and privacy minimization.
- E07 No learned/remembered statement can bypass a rule, tool permission or human decision.

### F. Durable runtime and state transitions (C interfaces; O backend)

- F01 Separate session/conversation, task, run, step, event, approval, receipt and deployment identities.
- F02 State machine with legal transitions, monotonic event history, optimistic concurrency/leases and cancellation.
- F03 Checkpoints, resume, retry/replay boundaries, idempotency keys for external writes and dead-letter/reconciliation states.
- F04 Effect execution and outcome uncertainty must be modeled explicitly: PREPARED/AUTHORIZED/EXECUTING/COMMITTED/UNKNOWN, as applicable.
- F05 External effects cannot be assumed exactly-once merely because the workflow runner is durable. Use idempotent downstream APIs, transaction/outbox/saga/compensation when appropriate.
- F06 Crash recovery, worker fencing, lease expiry, backpressure, queue limits, poison task quarantine and bounded retries.
- F07 Safe suspension/kill switch that prevents queued, running and resumed work from exceeding currently valid authority.
- F08 Reproducible replay of **control events**, while accepting that stochastic model output may not reproduce byte-for-byte.

### G. Security, privacy and supply chain (C)

- G01 Threat model covering tool misuse, prompt injection, goal hijack, credential abuse, memory/context poisoning, cross-agent communication, rogue delegation, cascading failures and untrusted code.
- G02 Network/file/secret compartmentalization; sandbox code execution, no ambient shell/FS access without explicit capability.
- G03 Source trust labels for every untrusted input, tool result, retrieved document, memory and external skill; deny instruction laundering.
- G04 Tool and protocol OAuth resource/audience validation, token separation, refresh policies, least privilege and no token passthrough.
- G05 Secure import of prompts/skills/tool packages with integrity pin, provenance, review and SBOM where appropriate.
- G06 Restrict sensitive logs; classify/redact PII, credentials, prompts, retrieved records, chain-of-thought or private system instructions as required.
- G07 Data residency, retention, deletion, tenant isolation and consent controls as host-linked policy profiles.
- G08 Emergency disable, incident severity, forensics and evidence integrity.
- G09 Supply-chain provenance for deployed runtime and tool dependencies; approved plugin/skill update mechanism.
- G10 Do not treat model guardrails as substitutes for deterministic authorization.

### H. Evaluation and release assurance (C)

- H01 Evaluation taxonomy: contract, authorization, binding, execution correctness, evidence integrity, regression, safety/adversarial, performance, human usability and deployment.
- H02 Reference datasets with provenance/version, representative positive/negative edge cases and domain-owned gold-state checks.
- H03 Assess final environment state and side-effects, not only textual outputs. Test tool names, arguments, timing, target and rollback.
- H04 Multi-run reliability (including pass^k or equivalent), variance, random seed/config metadata, flakiness and inter-run drift.
- H05 Independent human calibration of model-based graders; graders are neither self-certifying nor sufficient for effect authorization.
- H06 Adversarial tests for untrusted tool outputs, memory poisoning, delegation amplification, confirmation fatigue, tool response tampering and replay.
- H07 Measure task success, policy violations, recovery, completion latency, token/currency cost, throughput and resource consumption.
- H08 Gate promotion via explicit thresholds and complete evidence, with severities and waiver policy; failure cannot be hidden as warning.
- H09 Record evaluation environment/model/tool versions, dataset digest, code revision, sample size and confidence limitations.

### I. Observability, provenance and audit (C)

- I01 End-to-end correlation across principal, agent, workflow, task, run, step, policy decision, tool call and output artifact.
- I02 Typed spans/events for agent, workflow, planner, model, retrieval, memory and tools; OTel semantic conventions usable as optional export mapping.
- I03 Append-only decision/effect ledger with before/after receipts and ambiguous outcome classification.
- I04 Preserve input and output artifact digests, source, creator, version, access basis, transformation and verification links.
- I05 Audit trail independent of mutable session memory; retention/erasure mechanisms must balance privacy with legally required audit retention.
- I06 Record tool/token/cost/latency metrics with missing/unknown semantics; zero and unknown must not be confused.
- I07 Redaction and sampling policy is separate from proof-required evidence; sampling telemetry cannot remove mandatory audit records.
- I08 Reconciliation receipts and independent acceptance references.

### J. Operational engineering and SRE (C interfaces)

- J01 Health/readiness/liveness contracts, degraded modes, dependency and model-provider outage behavior.
- J02 Quotas, per-run/per-principal cost ceiling, rate limits, concurrency controls, admission control and circuit breakers.
- J03 SLOs for correct task completion, latency, availability, stalled jobs, denial accuracy and evidence completeness.
- J04 Inventory, health, drift, vulnerability, registry integrity and unsupported version audit interfaces.
- J05 No self-upgrade into production: signed release/provenance, migration plan, rollback, canary/shadow strategy and independent promotion.
- J06 Incident/forensic record, emergency suspension, recovery procedure and notification/escalation obligations.
- J07 Tenancy and data segregation across persistent state, credentials, telemetry and tool results.

### K. Interoperability and adapters (X/O)

- K01 Generic adapter interface for model provider, tool execution, policy decision, identity, memory, event bus and data store.
- K02 MCP: optional tool/resource/prompt endpoint; if implemented against 2026-07-28, support stateless core, per-request version/capabilities, explicit state handle, tool schemas and transport authorization; Tasks as separately negotiated extension.
- K03 A2A: optional externally discoverable agent API, Agent Card, task/multimodal negotiation, authentication, streaming and cancellation; **not** the internal registry schema.
- K04 OpenAPI/JSON Schema: typed I/O and reference resolution; validation does not encode all semantic constraints.
- K05 OpenTelemetry: optional exporter and stable custom application event IDs; agent/workflow/tool span conventions currently Development.
- K06 Extensible skills/packages via declared schema, integrity pins and bounded capability expansion only after approval.
- K07 Protocol-version negotiation, deprecation windows, compatibility tests and security regression.

### L. Governance, documentation and responsible deployment (C interfaces)

- L01 Agent card: intended use, restrictions, capabilities, known limitations, evidence/benchmarks, deployment and incident contact.
- L02 Risk register with purpose, affected users, potential harms, model assumptions and controls.
- L03 Governance obligations are conditional by deployment role/jurisdiction and risk; do not encode a particular statute as universal law.
- L04 Separate agent acceptance, conformance and policy approvals; record approver identity and jurisdiction.
- L05 Human oversight designed for meaningful review, not habituated click-through; escalation includes context, alternatives and likely effects.
- L06 Signed audit, release and incident/change provenance where required.
- L07 Clear ownership for lifecycle, authority, policies, data and tools.

## Proposed **normative artifacts** (not one giant manifest)

1. `AMA-CORE.md`: ontological definitions, invariants and requirements language.
2. `agent-manifest.schema.json`: typed declarative identity, mandate and bindings.
3. `workflow.schema.json` + `command.schema.json`: versioned procedure and invocation contracts.
4. `capability.schema.json` + `tool-adapter.schema.json`: scoped technical and security interface.
5. `model-profile.schema.json` + `prompt-package.schema.json`: optional reasoning implementation.
6. `memory-profile.schema.json` + `context-policy.schema.json`: optional memory with mandatory default-deny behavior.
7. `authorization-context.schema.json` + `effect-policy.schema.json`: provider-neutral interface (not a policy engine).
8. `run-event.schema.json` + `evidence-record.schema.json`: state, provenance and audit.
9. `evaluation-profile.schema.json` + `conformance-report.schema.json`: thresholds, tests, evidence and accepted states.
10. `deployment-binding.schema.json`, `lifecycle-transition.schema.json`, `compatibility-report.schema.json`, `incident.schema.json`: release and operations.
11. `AMA-SECURITY-PROFILE.md`, `AMA-GOVERNANCE-INTERFACES.md`, `AMA-TEST-CONFORMANCE.md`: normative requirements separate from implementation.
12. Host-specific adapter schemas/docs and concrete agent manifests live **outside** these normative artifacts.

## Current repository gap screen

Source: current AMA 0.1 document and manifest Schema (19 top-level properties), shared TS types, offline contract validator, PostgreSQL and effect-gate CI. The following is **assessment**, not a claim that code does not exist elsewhere.

| Dimension | AMA.md | Manifest/schema/runtime | Finding |
| --- | --- | --- | --- |
| Agent–workflow–command–capability distinctions | Defined | Basic arrays of string IDs and typed definitions | **Partial**: richer versioned schemas and references needed |
| Agent identity/mandate | Defined | Simple names/scope strings and two authority-required booleans | **Partial**: cryptographic provenance, delegation and machine-readable target scopes absent |
| Reasoning/model and prompt binding | Only implied by agent concept | No explicit versioned model/strategy/instruction profile | **Major gap** |
| Planning and strategy | Not specified at useful granularity | No plan object, evaluator, budget or stop contract | **Major gap** |
| Inputs/outputs and tool contracts | Described | Manifest lacks typed I/O fields and detailed tool adapter schema | **Major gap** |
| Scoped action authorization | Effect classes described | Ordinal E0–E4 and optional targetScope; real policy adapter absent | **Major gap**: multidimensional risk, read-data policy, consent, E4 separation |
| Memory/context | Policy categories and optional modules | Memory mode + durable bool; no provenance, retention, deletion or memory trust policy | **Major gap** |
| Durable execution/recovery | Mentioned | Registry and action gate tested, but no generic resumable worker/lease | **Major gap** |
| Evidence and audit | Good principles | Basic required booleans, separate SQL evidence ports | **Partial**: standardized evidence schema, denial/uncertainty linkage missing |
| Conformance | C1–C6 defined | C1/C2/C3/C6 static tested, C4/C5 partially mocked | **Partial**: independent live evaluation and risk gates missing |
| Observability | Trace requirements described | No stable semconv/export, cost/latency profile | **Major gap** |
| Privacy/data lifecycle | Mentioned | No machine-readable data classification, purpose, TTL, deletion, residency | **Major gap** |
| Supply chain | Not explicit | No skill/tool/model provenance, SBOM or release attestations | **Major gap** |
| Interoperability | Interface-agnostic wording | No versioned MCP/A2A adapter contract | **Optional gap**, not mandatory core |
| Incident and SRE | Generic mention | No operational SLO/budget/incident policy schema | **Major gap** |
| Upgrade assurance | Documented | Diff checks, tested registry version isolation | **Partial**: change impact matrix and production promotion incomplete |

### Important correction to effect model

E0 through E4 can be used as a rough legacy compatibility rank, but **must not** become the sole policy or risk model. An E0 read of sensitive data can be high-risk; an E3 publication and payment have incomparable obligations; E4 authority changes require a separate governance gate, not merely a higher ceiling. The canonical future design should have **effect kind + authorized resource + data exposure + risk class + reversibility + approval requirements**, not `rank <= ceiling` alone.

## Proposed implementation order after research approval

- **P0 — semantic correctness and security:** ontology; typed bindings; identity/delegation/mandate; resource-level authorization; E0 sensitivity and E4 separation; policy-independent approval; testable denial/evidence; schema-to-document parity.
- **P1 — agent execution completeness:** model/prompt profiles; planning and stop budgets; context/memory/retention; state and idempotency; durable pause/resume; deterministic and stochastic evaluation.
- **P2 — operational strength:** provenance/supply chain; incident, observability, performance/cost; deployment compatibility; conformance and independent release gates.
- **P3 — optional extension profiles:** MCP Tasks, A2A, multi-agent composition, skill bundles, alternate memory/planner engines, multimodal inputs. Optional profiles OFF unless explicitly registered.

## Bibliography / source inventory

Sources below were accessed via primary publisher/maintainer pages and technical documentation, except research titles where only published abstract/landing page was screened. Technical claims in this dossier are *synthesis*, not quotations from one author. Formal full-text, per-claim HARP RefA has **not** been completed.

### Standards, public governance and security

1. NIST, **Design Tenets for Agent Identity Management Systems** (2026-10-27), https://www.nist.gov/blogs/cybersecurity-insights/design-tenets-agent-identity-management-systems — proposed design tenets.
2. NIST, **AI RMF 1.0** (2023), https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-ai-rmf-10 — voluntary AI risk lifecycle.
3. NIST, **Generative AI Profile** (2024), https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence — voluntary companion.
4. NIST, **ARIA Evaluation Planning Manual** (2026-09-18), https://www.nist.gov/publications/aria-evaluation-planning-manual-elements-aria-style-ai-evaluations — model/red-team/user testing.
5. NIST, **AI Agent Standards Initiative** (2026-02-17), https://www.nist.gov/news-events/news/2026/02/announcing-ai-agent-standards-initiative-interoperable-and-secure — emerging standards, not final normative rulebook.
6. ISO, **ISO/IEC 42001:2023**, https://www.iso.org/standard/42001 — public landing summary only, management system standard.
7. ISO, **ISO/IEC 23894:2023**, https://www.iso.org/standard/77304.html — public landing summary only, risk-management guidance.
8. EU, **Regulation (EU) 2024/1689, consolidated 2026 text**, https://eur-lex.europa.eu/eli/reg/2024/1689 — applicability conditional; logging and human oversight for relevant high-risk systems.
9. OWASP, **Top 10 for Agentic Applications 2026** (published 2025-12-09), https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/ — agent-specific threat classes.
10. OWASP, **Agent Control Standard** (2026-09-01), https://genai.owasp.org/resource/agent-control-standard-acs/ — runtime hooks/control design, not proof of certification.
11. OWASP, **Secure MCP Server Development** (2026-02-16), https://genai.owasp.org/resource/a-practical-guide-for-secure-mcp-server-development/ — delegated tools/validation/security.
12. OWASP, **Q3 2026 Agentic Exploit Roundup** (2026-10-08), https://genai.owasp.org/2026/10/08/genai-and-agentic-ai-exploit-roundup-q3-2026/ — concrete threat scenarios; interpretation differs from universal incidence rate.
13. W3C, **PROV-O** (2013), https://www.w3.org/TR/prov-o/ — stable provenance vocabulary.
14. SLSA, **Specification v1.2**, https://slsa.dev/spec/v1.2/ — source/build artifact provenance.
15. SPDX, **Specification 3.0**, https://spdx.dev/use/specifications/ — supply-chain metadata option.
16. Open Policy Agent, **Policy and decision interface**, https://www.openpolicyagent.org/docs — example of separating policy decisions and enforcement; not a mandated provider.
17. JSON Schema, **Draft 2020-12**, https://json-schema.org/draft/2020-12 — normative format for schema validation.

### Interoperability and vendor engineering guides

18. MCP, **2026-07-28 release**, https://blog.modelcontextprotocol.io/posts/2026-07-28/ — stateless protocol core, tasks extension and auth changes.
19. MCP, **2026-07-28 changelog**, https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/changelog.mdx — explicit migration/downgrade detail.
20. MCP, **authorization security considerations**, https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/basic/authorization/security-considerations.mdx — token binding, audience and no passthrough.
21. MCP, **tool semantics**, https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/server/tools.mdx — tool schemas and execution errors.
22. MCP, **Tasks extension**, https://modelcontextprotocol.github.io/ext-tasks/specification/2026-07-28/tasks.html — optional durable asynchronous task facade.
23. A2A, **v1.0.0 Protocol Specification**, https://a2a-protocol.org/dev/specification/ — discovery, Agent Card, task state, security and remote interoperability.
24. OpenTelemetry, **GenAI agent spans** (Development), https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-agent-spans.md — optional observability mapping.
25. OpenAI, **Practical Guide to Building Agents** (2026-01-15), https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/ — practical design patterns.
26. Anthropic, **Building Effective Agents**, https://www.anthropic.com/research/building-effective-agents — workflows vs agents, tool and orchestration patterns.
27. Anthropic, **Common Architecture Patterns**, https://claude.com/resources/guides/building-effective-ai-agents/common-architecture-patterns — complexity economics and composability.
28. OpenAI, **Evaluate Agent Workflows**, https://developers.openai.com/api/docs/guides/agent-evals — trace/dataset evaluation.
29. OpenAI, **Datasets and evaluation**, https://developers.openai.com/api/docs/guides/evaluation-getting-started — annotation and reference grading.
30. OpenAI, **Agents SDK durable integrations**, https://openai.github.io/openai-agents-python/running_agents/ — Temporal, Dapr, Restate as choices.
31. LangGraph, **Persistence**, https://github.com/langchain-ai/docs/blob/main/src/oss/langgraph/persistence.mdx — checkpointer and store separation.
32. LangGraph, **Interrupts**, https://github.com/langchain-ai/docs/blob/main/src/oss/langgraph/interrupts.mdx — pause/resume semantics and replay hazards.
33. Temporal, **Workflow execution/replay**, https://docs.temporal.io/workflows — durable event history and deterministic replay.

### Peer-reviewed publications and original research

34. Wang et al., **A Survey on LLM-Based Autonomous Agents** (2024), https://doi.org/10.1007/s11704-024-40231-1 — broad architecture taxonomy (published open-access article).
35. Li et al., **Survey of LLM Multi-agent Systems** (2024), https://link.springer.com/article/10.1007/s44336-024-00009-2 — profile, perception, action, interaction, evolution.
36. Yehudai et al., **A Survey on Evaluation of LLM-Based Agents**, ACL Findings 2026, https://aclanthology.org/2026.findings-acl.1330/ — evaluation dimensions and cost/safety gaps.
37. Yao et al., **ReAct** (2022/2023), https://arxiv.org/abs/2210.03629 — interleaved reasoning/tool action (abstract screened).
38. Shinn et al., **Reflexion** (2023), https://arxiv.org/abs/2303.11366 — feedback and reflective memory (abstract screened).
39. Schick et al., **Toolformer** (NeurIPS), https://ai.meta.com/research/publications/toolformer-language-models-can-teach-themselves-to-use-tools/ — tool selection (abstract screened).
40. Park et al., **Generative Agents**, UIST 2023, https://doi.org/10.1145/3586183.3606763 — memory/plan/reflect (abstract screened).
41. Packer et al., **MemGPT** (2023), https://arxiv.org/abs/2310.08560 — hierarchical context/memory (abstract screened).
42. Zhang et al., **Survey of LLM Agent Memory**, ACM TOIS 2025, https://doi.org/10.1145/3748302 — long-term memory architecture (abstract screened).
43. Liu et al., **Lost in the Middle**, TACL 2024, https://aclanthology.org/2024.tacl-1.9/ — long-context positional degradation.
44. Yao et al., **τ-bench** (2024), https://arxiv.org/abs/2406.12045 — final state and repeated-run reliability (abstract screened).
45. Debenedetti et al., **AgentDojo**, NeurIPS 2024, https://arxiv.org/abs/2406.13352 — tool-output injection benchmark (abstract screened).
46. Andriushchenko et al., **AgentHarm**, ICLR 2025, https://proceedings.iclr.cc/paper_files/paper/2025/hash/c493d23af93118975cdbc32cbe7323f5-Abstract-Conference.html — harmful multi-step actions benchmark.
47. Xie et al., **OSWorld** (2024), https://arxiv.org/abs/2404.07972 — state-based computer tasks (abstract screened).
48. Jimenez et al., **SWE-bench** (2024), https://arxiv.org/abs/2310.06770 — environment-based software engineering evaluation.
49. Princeton, **Holistic Agent Leaderboard**, https://hal.cs.princeton.edu/about — third-party reproducible cost-aware evaluation.
50. Mitchell et al., **Model Cards for Model Reporting** (2019), https://doi.org/10.1145/3287560.3287596 — reporting intended use and limitations.
51. Gebru et al., **Datasheets for Datasets**, CACM 2021, https://www.microsoft.com/en-us/research/publication/datasheets-for-datasets/ — data provenance/documentation.

## Review limitations / explicit open work

- This is a **wide source round**, not a PRISMA systematic review: no database search strings, all exclusion decisions, independent dual screening, or citation-graph completeness audit.
- Vendor pages and specs were reviewed in rendered form or indexed text where available. Academic articles are often screened from original abstracts/landing pages; **full-text review is not asserted** unless explicitly noted.
- Full paid ISO clause-by-clause conformity assessment and EU legal applicability advice are outside the scope.
- Current hosted architecture may change after 2026-10-29, and source URLs should be date-pinned on incorporation.
- Next step is a **decision table** mapping A01–L07 to mandatory core / conditional / optional / host, with schema ownership, test ID, implementation status, and authority for adoption. Do **not** blindly paste vendor-specific field names into normative AMA.
