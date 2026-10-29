# AMA — Post-Research Development Roadmap (F1–F8)

**Date:** 2026-10-29  
**Status:** PROPOSED IMPLEMENTATION ROADMAP — not an authorized production deployment or adopted normative revision.  
**Source baseline:** [Seven universal stress tests + F8](../research/AMA-KNOWLEDGE-INSIGHT-SEVEN-STRESS-TESTS-2026-10-29.md), [F8 Conductellence assessment](../research/AMA-F8-CONDUCTELLENCE-SECURITY-RISK-ASSURANCE-2026-10-29.md), [96 candidate requirements](../research/AMA-96-REQUIREMENT-COVERAGE-INDEX-2026-10-29.json).  
**Governance:** Preserve universal AMA master-contract purity. Host/CDX implementations and agent instances live in separate architecture, adapter and instance artifacts. CDX Act 1.0 is frozen for closure, with its own authorized exception process.  
**Current branch:** \`feat/ama-foundation-20261028\` / draft PR #19. No merge, production migration or live agent activation is implied.

## Decision: stop broad sourcing, start controlled development

The 51-source dossier, seven supplementary research records and 86-reference TinyFish review (overlapping source sets) are sufficient to start a **versioned candidate AMA specification**. Academic abstracts, preprints, source-screening totals and vendor guides are not automatically binding.

Further research is **targeted only**, triggered by:
- conflicting or unsupported requirements that would become a MUST;
- ambiguous CDX / AMA responsibility or policy-rule semantics;
- protocol-specific MUST/SHOULD/MAY distinctions when activating MCP/A2A profiles;
- unclear legal applicability or evidence retention/erasure duties;
- observed failures during formal conformance and adversarial tests.

The 96 original requirements are **candidates**, not automatically accepted requirements. Before implementing a candidate as mandatory, record source, decision, scope, type (CORE/CONDITIONAL/OPTIONAL/HOST), component owner, assurance test and intended compatibility impact.

## Workstreams and dependency structure

\`\`\`mermaid
flowchart TD
  M0["M0 — Decision register, source validation and compatibility baseline"]
  M1["M1 — F1: Universal ontology and modular contract schemas"]
  M2["M2 — F2: Provider-neutral identity, mandate and authorization semantics"]
  M8["M2-CDX — F8: Trusted CDX control/decision adapter, separate host track"]
  M3["M3 — F3 + F4: Model, planning, context and memory profiles"]
  M4["M4 — F5: Durable task/run/effect/recovery protocol"]
  M5["M5 — F6: Evaluation, conformance, evidence and adversarial proof"]
  M6["M6 — F7: Release compatibility, health, incidents and stewardship"]
  M7["M7 — Universal reference conformance + independent admission decision"]
  M0 --> M1
  M1 --> M2
  M1 --> M3
  M2 --> M8
  M2 --> M4
  M3 --> M4
  M4 --> M5
  M8 --> M7
  M5 --> M6
  M6 --> M7
\`\`\`

F8 is an **independent host-security assurance track**, not a new agent-specific section in \`AMA.md\`. F8 and F2 progress in parallel after a shared versioned authority/effect interface. F3 and F4 may begin in parallel with F2 where they do not require a live security decision. Implementation stages may be delivered as separate reviewable PRs with independent acceptance.

## Milestone M0 — First actionable development package

**Work package:** \`AMA-NEXT-00 — Evidence-to-Requirement Admission\`

**Inputs**
- 96-candidate index + original source dossier;
- targeted source expansion and completed TinyFish synthesis;
- F1–F8 knowledge/stress-test reports;
- current \`AMA.md\`, JSON Schema, TypeScript types, conformance tests and registry/effect-gate interfaces;
- CDX law/control catalogue, runtime contract and machine-readable state.

**Deliverables**
1. \`AMA-REQUIREMENTS-DECISION-REGISTER.json\`: each of the 96 original IDs mapped to one disposition \`ADOPT_CORE | ADOPT_CONDITIONAL | ADOPT_OPTIONAL | HOST_BOUND | DEFER | REJECT | SOURCE_REVIEW_REQUIRED\`, explicit rationale, evidence confidence, owner, normative target, schema artifact, test ID and compatibility consequence.
2. \`AMA-CONTRACT-COMPATIBILITY.md\`: meaning of AMA 0.1, proposed future version, semantic change classification and migration plan. Do **not** silently rename existing schema IDs or \`ffos.ama.*\` wire contracts merely to improve naming.
3. \`AMA-REQUIREMENT-TRACEABILITY.json\`: verified source → evidence claim → recommendation → requirement → proposed control/test. Distinguish original source statements, AI synthesis and implementation choices.
4. \`AMA-F8-SECURITY-CROSSWALK.json\`: risk requirement → exact CDX chapter/§ → control/review → policy surface → audit/evidence → runtime adapter → status; allow \`UNMAPPED\`/ \`REFERENCE_ONLY\` rather than false coverage.
5. \`AMA-RELEASE-GATES.md\`: state explicit criteria \`SPECIFIED\`, \`SCHEMA_VALID\`, \`STATIC_TESTED\`, \`INTEGRATION_TESTED\`, \`RUNTIME_BOUND\`, \`INDEPENDENTLY_ACCEPTED\`.

**Tests/acceptance**
- All 96 original candidate IDs are present once, with no duplicates or silent deletions.
- Every proposed mandatory requirement identifies an unambiguous test or approved manual verification procedure.
- Every mapping to CDX has a concrete reference or is marked \`UNMAPPED\`.
- No named agent, use case or Conductellence-specific implementation appears in normative AMA master contracts.
- No normalized source-count inflation or claim of already-adopted research requirements.

**Output:** a reviewable decision register and baseline for all later implementation PRs; the current source round is not regenerated.

## M1 — F1: Versioned, composable universal contracts

**Build:** normative core/glossary; typed schemas for agent, workflow, command, capability, tool, task/run, effect, evidence and conditional-profile references. Version-pinned dependencies and formal \`additionalProperties\`/extension policy. Maintain semantic backward compatibility or plan version migration explicitly.

**Prove:** valid/invalid synthetic manifests, cross-object integrity, immutable digests, version-compatibility edges, default-off optional features, no host/agent identity in normative templates. Preserve existing registry/CI behavior.

**Risk:** Current schema title and \`$id\` include host-specific naming (e.g. \`FFOS AMA Agent Manifest v1\` and \`ffos.local\`), although \`AMA.md\` itself is agent-neutral. Correct **via documented compatibility/version strategy**, not a breaking silent rename.

**Gate:** M1-COMPATIBILITY-PASS.

## M2 — F2: Agent-independent scoped authorization contract

**Build:** principal/workload identity, mandate and delegation proof, target/resource authorization, read-data classification, action/effect dimensions, obligation/approval references, revocation and policy freshness, complete trusted-context requirements.

**Prove:** denial of unauthorized E0 sensitive observations, unknown principals, action/resource scope violations, delegation amplification, expired/stale policy, untrusted tool content and self-approval. Maintain independently authenticated human acceptance.

**Gate:** M2-AUTHORITY-CONTRACT-PASS (schema/interface assurance only; real host assurance requires F8).

## M2-CDX — F8: Conductellence security assurance and host binding

**Build separately from normative AMA:**
- F8.1 exact §/control/audit/evidence coverage matrix;
- F8.2 independently verified context facts and **trusted mandatory control selection** (not model-supplied booleans or reduced control filters);
- F8.3 total seven-way CDX decision/obligation adapter; preserve QUARANTINE/SECURITY_STOP/CONSTITUTIONAL_STOP semantics, verify ALLOW_WITH_CONTROLS obligations;
- F8.4 path/history-aware policy and data/authority graph observations;
- F8.5 authenticated SPETL receipts plus independent custody/reconciliation;
- F8.6 adversarial tampering, revocation, policy outage, false denial and emergency stop;
- F8.7 governed core release and actual estate/runtime binding.

**Critical CDX release boundary:** Current CDX \`PRE_RELEASE\`/\`BOOTSTRAP\` and FFOS \`BOUND_PENDING_RUNTIME_INTEGRATION\` block production assurance. CDX Estate Anchor Standard requires \`PINNED_RELEASE\` for consequential production enforcement; a currently pinned commit is for controlled pre-release development. Never flip anchor states to \`VERIFIED_RUNTIME_BOUND\` based on mock tests.

**Prove:** independent authenticated allow/deny/hold and all remaining CDX outcomes; falsified approval flags, omitted \`external_effect\` classifier, changed \`surface\`, cherry-picked \`control_ids\`, revocation during work, policy drift, ledger failure and remote outcome uncertainty fail closed. Independent custody and response evidence verified.

**Gate:** M2-CDX-VERIFIED-RUNTIME-BOUND. If blocked, other contract engineering may continue, but production activation must not.

## M3 — F3 + F4: Model, planning, context and memory

**Build:** optional profiles for model binding, instructions, reasoning strategy, plan graph, horizon, budgets and stop rules. Separate working context, checkpoints, source-of-truth, episodic memory and retrieval. Require provenance/trust/admission/retention/deletion semantics whenever persistent memory is enabled.

**Prove:** simple agent can conform without optional modules; memory-enabled runtime detects delayed tool/memory poisoning; prompt provenance and substitution tests; context compaction fidelity; long-horizon evaluation. Do not prescribe a model or planner vendor.

**Gate:** M3-CONDITIONAL-PROFILES-PASS.

## M4 — F5: Durable execution and effect uncertainty

**Build:** Task/Run/Step/Attempt/Approval/Effect/Receipt/Reconciliation schemas; retry/idempotency, checkpoint/resume, cancellation, worker fencing, journal and safe uncertain states; adapt the existing CI-tested registry/effect-gate instead of rebuilding it.

**Prove:** interruption after remote effect, duplicate resume, stale authority, failed/late receipt, concurrent promotion, inconsistent audit and memory state. No automatic replay of non-idempotent remote action.

**Gate:** M4-DURABILITY-PASS for declared runtime classes; live effects still gated by F8.

## M5 — F6: Independent evaluation and assurance

**Build:** multi-axis suite—structural, policy, tool/target correctness, final state, resource/cost/reliability, red-team, false allow/deny, durability, privacy and independent acceptance. Record evidence provenance and evaluation limitations.

**Prove:** test-set adversarial perturbation, repeated runs, external evaluator/calibration, audit completeness, malicious input and simulated operational outage.

**Gate:** M5-INDEPENDENT-ASSURANCE-PASS; structural pass ≠ live C4/C5 certification.

## M6 — F7: Host-neutral operational interfaces and compatibility

**Build:** extension/version compatibility, drift/incident/health/cost, canary/rollback and release controls. MCP/A2A and OTel remain **conditionally bound adapters**; do not turn protocol-specific requirements into universal AMA MUSTs. Technical steward can audit/prepare repairs but cannot authorize or self-accept changes.

**Prove:** synthetic version upgrade, revoked tool, model substitution, protocol contract change, emergency suspension and rollback; evidence survives incident.

**Gate:** M6-OPERATIONAL-CONTRACT-PASS.

## M7 — Synthetic first-class reference and readiness decision

**Build:** one **generic** read-only synthetic reference (or synthetic suite covering only required feature profiles), no particular domain semantics and no host-specific governance names in AMA's normative files. Register the instance outside the master contract. Exercise a controlled E0 classified-read policy and one non-production simulated consequential effect.

**Prove:** definition/instance separation; authorization decisions; identity; memory OFF versus memory ON profile; resume; evaluation; evidence; independent acceptance. Include multiple-runtime-profile assertions where needed.

**Gate:** only independently authorized reviewers may declare an integration version DEPLOYABLE/ACTIVE. No claim of a universal reference agent covering every optional capability.

## Work-package / acceptance ordering

| Sequence | Work package | Main acceptance artifact | State |
|---|---|---|---|
| 0 | M0: evidence/requirement decision register | 96 controlled disposition records | NEXT |
| 1 | M1: universal type/schema suite | compositional conformance & compatibility | PLANNED |
| 2 | M2: generic scoped authority | authorization contract negative suite | PLANNED |
| 2 (parallel) | M2-CDX: F8 trust/decision/evidence adapter | independently tested CDX policy binding | BLOCKED FOR LIVE BINDING BY CDX RELEASE STATE |
| 3 | M3: conditional model/memory profiles | profile conformance and poisoning evals | PLANNED |
| 4 | M4: durable runtime protocol | restart/replay/duplicate-effect tests | PLANNED |
| 5 | M5: assurance evaluation | independent outcomes + source-backed regression | PLANNED |
| 6 | M6: operations/extension contracts | change/incident/rollback suite | PLANNED |
| 7 | M7: synthetic reference admission | independent acceptance evidence | DEFERRED |

## Operational boundaries / implementation hygiene

- **Do not merge PR #19** without separate review and authorization. Prefer small subsequent PRs rather than accumulating all work on one large draft branch.
- **Do not deploy** PostgreSQL migrations or claim an operational policy service from a passing local/CI test.
- **Do not alter** frozen CDX constitutional law or its canonical IDs as a side effect of the AMA plan.
- **Do not import** named agents, specific domain workflows, CDX or FFOS estate topology into the normative AMA master.
- **Do not declare** S01–S15 second-level residuals closed merely because F1–F8 design work exists. Require concrete adversarial/runtime evidence.
- Distinguish decision approval, schema conformance, independent verification and human acceptance.
- Production adapter and evidence-release work may be blocked by external account, infrastructure or governance constraints. Continue non-effect contract work without overstating the release state.

## Recommendation

Start **M0 now**, then implement **M1**. In parallel, F8.1 mapping and trusted-fact control-interface design may proceed without the live CDX service. F8 runtime acceptance is a release blocker, not a prerequisite for designing modular AMA schemas. Reserve additional research for specific normatively consequential or contradictory source claims revealed during M0/M1.
