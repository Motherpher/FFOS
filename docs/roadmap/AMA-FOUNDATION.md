# AMA Foundation Workstream

**Workstream:** FFOS Agent Master Architecture  
**Started:** 2026-10-28  
**Current target:** AMA 0.1 universal foundation, separated from all agent instances

## AMA-01 — Source reconciliation
**Status:** COMPLETE

Reconcile universal agent construction principles, FFOS control-plane boundaries, independent policy constraints and prior master-contract decisions. Domain-specific implementations and use cases are not part of the template.

## AMA-02 — Master architecture
**Status:** IMPLEMENTED ON FEATURE BRANCH

Define agent/workflow/command/capability separation, lifecycle, effect classes, state model, optional modules, authority model, evidence, version inheritance and the template-to-instance separation.

## AMA-03 — Machine-readable contract
**Status:** IMPLEMENTED ON FEATURE BRANCH

Create Agent Manifest schema and shared TypeScript types.

## AMA-04 — Workflow & Command Registry contract
**Status:** IMPLEMENTED ON FEATURE BRANCH

Define stable command-to-versioned-workflow resolution and invariants.

## AMA-05 — Technical stewardship interface
**Status:** SPECIFICATION IMPLEMENTED ON FEATURE BRANCH

Specify independent technical stewardship, compatibility, maintenance, incident and upgrade responsibilities without architectural sovereignty.

## AMA-05A — Authority topology reconciliation
**Status:** HOST INTEGRATION SEPARATED FROM MASTER CONTRACT; RUNTIME PRECEDENCE UNVERIFIED

Host organization and governance topology are recorded in the separate system-integration document and are not normative AMA template content. The master contract defines only abstract authority, policy and verification interfaces. No claim of verified runtime binding.

## AMA-06 — Conformance harness
**Status:** STATIC CONTRACT GATE IMPLEMENTED + GITHUB ACTIONS PASS; RUNTIME GATES PENDING

Implemented and CI-tested Draft 2020-12 manifest validation, workflow/capability and command-version resolution, effect-ceiling checks, authority-reference policy, inactive-module checks, immutable version policy, change review, structured `STATIC_PASS`/`FAIL` reports, positive fixture and negative test cases. GitHub Actions `AMA conformance` succeeded on PR #19 (2026-10-29). This does **not** evaluate C4 runtime effects or C5 live evidence; it cannot activate or accept an agent. See `packages/agent-model/conformance/`.

## AMA-07 — Persistent Agent Registry
**Status:** POSTGRESQL INTEGRATION TESTED IN CI; NOT DEPLOYED

Append-only migrations 0002/0003 and `packages/agent-runtime/src/stable-registry.ts` implement versioned registry storage, content hashing, transactional lifecycle continuity and human-authorization, conformance and readiness verification ports. Disposable PostgreSQL 17 integration tests exercise candidate admission, registered-versus-active state, Director transitions, competing version denial, suspension and version replacement. No live database, authenticated human-approval adapter or operational service has been connected.

## AMA-08 — Runtime enforcement
**Status:** LOCAL EFFECT GATE AND NEGATIVE TESTS IMPLEMENTED; HOST POLICY INTEGRATION PENDING

`packages/agent-runtime/src/effect-gate.ts` rejects missing local enforcement, policy mismatch/denial, insufficient mandate, disabled capabilities, expired active version and revocation. The host-specific policy-anchor adapter correctly refuses a pending runtime binding. `pg-evidence.ts` records pre/post effects and restricted decisions in append-only PostgreSQL. Tests use *mock* external policy and approval services; real policy decisions, evidence receipt validation, deployment, stronger effect-lease controls and complete denial audit remain pending.

## AMA-09 — Technical stewardship runtime
**Status:** M6 CANDIDATE IMPLEMENTED AND CI VERIFIED; HOST DEPLOYMENT/EXTERNAL AUTHORITY PENDING

Implement inventory, conformance execution, drift detection, upgrade proposals, health/incident state and rollback preparation. The technical steward remains non-authorizing and non-accepting.

## AMA-10 — Reference agent fixture
**Status:** PLANNED

Build and evaluate a synthetic, non-production reference fixture to prove generic contracts without importing any domain semantics.

## AMA-11 — Generic adoption interface
**Status:** DEFERRED UNTIL AMA RUNTIME AND AUTHORITY GATES PASS

Deliver an instance-registration and extension interface allowing independently governed agents to implement the universal contract. No domain-specific agent, workflow, naming convention or repair classification is defined by this workstream.

## October 2026 research baseline

External standards and adoption boundaries are documented in `docs/research/AMA-2026-ENGINEERING-BASELINE.md`. MCP adapter, OpenTelemetry instrumentation, A2A interoperability, OWASP runtime controls, durable orchestration and NIST identity guidance are design inputs and future integration contracts — not deployed FFOS capabilities.

## Post-research development sequencing — F1–F8 (29 October 2026)

The source-round synthesis and independent Conductellence F8 analysis have been converted into a **non-normative, gated development plan**:

- [AMA post-research development roadmap](AMA-POST-RESEARCH-DEVELOPMENT-2026-10-29.md)
- [F1–F7 source insights and seven stress tests](../research/AMA-KNOWLEDGE-INSIGHT-SEVEN-STRESS-TESTS-2026-10-29.md)
- [F8 CDX security and risk assurance](../research/AMA-F8-CONDUCTELLENCE-SECURITY-RISK-ASSURANCE-2026-10-29.md)
- [96-requirement candidate coverage index](../research/AMA-96-REQUIREMENT-COVERAGE-INDEX-2026-10-29.json)

**Immediate work package:** M0 requirements admission and source traceability. The original 96 research-derived requirements remain unadopted candidates until dispositioned. F8 is cross-cutting host integration and must remain outside the universal master contract.

**Research decision:** No further broad source round before M0/M1. Targeted source validation is required only where normative priority, standards semantics, legal applicability or contradictory findings affect a specific requirements decision.

**Release boundary:** PR #19 stays draft; CDX production runtime binding and independent C4/C5 evidence remain blocked/unverified.

## M1 — Universal Contract Engineering (2026-10-29)

**Status:** CANDIDATE ENGINEERING COMPLETE, CI VERIFIED; NORMATIVE HUMAN ACCEPTANCE PENDING.

The new [M1 execution report](AMA-M1-EXECUTION-REPORT.md) covers twelve versioned, agent-neutral schemas, isolated TypeScript candidate definitions, cross-object static conformance, compatibility and negative tests. [CI run 40806829631](https://github.com/Motherpher/FFOS/actions/runs/40806829631) succeeded, including existing v1 and PostgreSQL integration regressions.

The normative AMA 0.1 master and historical v1 manifest remain unchanged. Production authorization, CDX runtime integration, C4/C5 and independent acceptance have **not** been established. Next is M2 scoped authorization, with F8 host risk governance in a separate track.

## M2 — Provider-neutral scoped authorization (2026-10-29)

**Status:** ENGINEERING CANDIDATE IMPLEMENTED; NORMATIVE HUMAN ACCEPTANCE AND REAL F8 RUNTIME ENFORCEMENT PENDING.

Six additional agent-neutral v0.2 schemas and portable TypeScript contracts define principals, mandates, delegation, authorization requests, policy decisions and approvals. A separate static gate validates claim structure, scoped grants, sensitive E0 reads, risk dimensions, restrictions, expiry and self-approval denial, **but never grants runtime authority**.

See [M2 contract specification](AMA-M2-AUTHORIZATION-CONTRACTS.md) and [M2 execution report](AMA-M2-EXECUTION-REPORT.md). Existing v1 runtime and constitutional governance remain unchanged. F8 must independently attest policy facts, revocation and actual read/effect mediation.

## M3 — Conditional reasoning and governed memory (2026-10-29)

**Status:** ENGINEERING CANDIDATE VERIFIED; NORMATIVE HUMAN ACCEPTANCE AND RUNTIME/F8/M5 ASSURANCE PENDING.

Eight candidate schemas and a provider-neutral validator define model/instruction pins, bounded planning and stopping, context compaction source traceability, memory lifetime and quarantine, trusted retrieval scope and optional cognitive binding. A valid agent may still have no model and no memory.

[M3 candidate specification](AMA-M3-COGNITIVE-MEMORY-CONTRACTS.md) · [M3 execution report](AMA-M3-EXECUTION-REPORT.md) · [CI run 40809807317](https://github.com/Motherpher/FFOS/actions/runs/40809807317).

All M3 checks are static/synthetic. They cannot establish live model performance, memory erasure, real poisoning resilience, provenance authenticity, independent authorization or agent activation. Proceed to M4 candidate execution design, with F8 and M5 evidence as separate gates.

## M4 — Durable Execution and Effect Reconciliation (2026-10-29)

**Status: ENGINEERING CANDIDATE VALIDATED IN DISPOSABLE POSTGRESQL; NO PRODUCTION ENFORCEMENT OR HUMAN NORMATIVE ACCEPTANCE.**

Seven generic durable run/attempt/checkpoint/receipt schemas, a Python conformance checker and an independently injected PostgreSQL coordinator provide lease fencing, crash-safe checkpoint verification, append-only run evidence, operation-key deduplication, cancellation and explicit independent effect reconciliation. The coordinator wraps (and does not replace) the existing effect gate.

[M4 architecture](AMA-M4-DURABLE-EXECUTION-CONTRACTS.md) · [M4 verification report](AMA-M4-EXECUTION-REPORT.md) · [CI success 40812050101](https://github.com/Motherpher/FFOS/actions/runs/40812050101) (207 combined tests).

**Release boundary:** Migrated only in disposable CI; no live policy/receipt binding, deployed database, agent activation or C4/C5 certification. Next: M5 independent outcome/evidence evaluation and the separate F8 security runtime integration.

## M5 — Independent evaluation and evidence assurance (2026-10-29)

**Status:** EVALUATOR CONTRACT ENGINEERING VERIFIED; REAL INDEPENDENT ASSURANCE AND NORMATIVE ACCEPTANCE NOT ESTABLISHED.

Six additional agent-neutral v0.2 schemas and isolated TypeScript types provide evaluation case/oracle, repeated observation, provenance, candidate report and non-self-accepting assessment contracts. `ama_evaluation.py` checks false allow/deny, target and outcome correctness, axis coverage, injection/outage/recovery, held-out test splits, evidence/source trust, repeated-run variance, cost, latency and sensitive-output redaction.

The synthetic CI test harness does **not** certify live C4/C5 or promote agents; even a passing synthetic metric set never returns activation authority.

[M5 assurance specification](AMA-M5-INDEPENDENT-EVALUATION-ASSURANCE.md) · [M5 report](AMA-M5-EXECUTION-REPORT.md) · [combined CI baseline success 40835331056](https://github.com/Motherpher/FFOS/actions/runs/40835331056).

Separate F8 identity/policy, independent verification of real final states, original oracle provenance, authorized human review and runtime deployment remain required. PR #19 stays draft.

## F8 — Conductellence security and risk consumer integration (2026-10-29)

**Development status:** F8.1–F8.6 candidate engineering and adversarial CI verified; F8.7 authentic CDX production release/runtime binding **blocked by upstream governance**.

Source-grounded control coverage maps 131 CDX-LAW-001 sections to 69 reference controls and preserves 62 review-governed sections. The FFOS adapter adds independent policy/fact/attestation interfaces, complete mandatory control selection, exact seven-way decisions, verified obligations and SPETL v1.1 custody correlations, late authority-graph drift checks and a separate classified E0 read gate.

[Architecture](AMA-F8-CDX-SECURITY-BINDING.md) · [Execution and release blockers](AMA-F8-EXECUTION-REPORT.md) · [GitHub Actions 40839505822](https://github.com/Motherpher/FFOS/actions/runs/40839505822) **SUCCESS**, 264 combined tests, source-matrix audit and machine-report upload.

The authoritative CDX 1.0 source is `PRE_RELEASE`; FFOS remains `PINNED_COMMIT` and `BOUND_PENDING_RUNTIME_INTEGRATION`. No live production effects, independent operational evidence, release-state override or constitutional changes were made. M6 can continue as contract engineering only.

## M6 — Operational Compatibility, Health and Incident Safety (2026-10-29)

**Status:** ENGINEERING CANDIDATE VERIFIED; NORMATIVE/HUMAN ADOPTION, REAL F8.7 AUTHORITY AND PRODUCTION RELEASE BLOCKED.

Six agent-independent v0.2 schemas and a standalone static operational validator define compatibility, model/tool/protocol changes, health/cost and drift evidence, incident escalation, rollback/canary safety and non-self-authorizing release proposals. `PgOperationalSteward` and additive migration `0005_ama_m6_operations.sql` implement append-only operational evidence, separately authorized emergency suspension and M4 lease/effect fencing. A persisted suspension tombstone and DB insert guard prevent new work after containment; optional `M6GuardedAdmission` supplies additional worker-claim checks. No live deployment, automatic rollback or unrestricted technical steward authority exists.

[M6 specification](AMA-M6-OPERATIONAL-LIFECYCLE-CONTRACTS.md) · [M6 execution report](AMA-M6-EXECUTION-REPORT.md) · [CI 40846425828](https://github.com/Motherpher/FFOS/actions/runs/40846425828) (298 combined tests, success).

**Next:** M7-E integration and readiness engineering, followed by independent F8.7 CDX release/binding and final M7-O operational evaluation and authorized human acceptance. PR #19 remains draft.
