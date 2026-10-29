# F8 — Conductellence Security and Agent-Risk Assurance

**Date:** 2026-10-29  
**Classification:** INDEPENDENT CROSS-CUTTING ANALYSIS / NON-NORMATIVE  
**Placement:** Companion to the AMA seven-question source-to-architecture review; **not an eighth universal requirement domain**.  
**Question:** **How will Conductellence, purpose-built for risk from non-human digital agency, enforce and evidence security and risk controls over agents constructed under AMA—without replacing AMA, becoming an unrestricted super-admin, or claiming enforcement before runtime integration?**

## 1. Executive judgment

**Designed coverage: substantial. Reference implementation: materially advanced. Verified estate enforcement: not yet established.**

Conductellence (CDX) is not a generic security add-on introduced because the AMA source review discovered threats. Its own law and implementation already contain a structured agent-risk architecture:

```text
Human sovereign authority
        |
     Conductellence (internal constitutional law and controls)
        |  versioned policies + revocations + conformance obligations
        v
Governed host / system with local CDX anchor
        |  local verified control and effect enforcement
        v
AMA-compliant agent instance
        |  typed workflow / capabilities / action context / run
        v
ALLOW | ALLOW_WITH_CONTROLS | REQUIRE_HUMAN
QUARANTINE | DENY | SECURITY_STOP | CONSTITUTIONAL_STOP
        |
SPETL evidence + independent custody and verification
        |
Security Twin, audits, incident process, changes and suspension
```

The exact CDX decision vocabulary comes from `POLICY/engine.py`. A policy result is **not** evidence of applied enforcement until the local adapter, authority, receipt and downstream effect are verified. A governance anchor proves declared binding, not that every action passes a correct runtime gate.

**Boundary:** AMA defines universal *interfaces and input semantics* for risk and enforcement. CDX supplies *host-specific constitutional obligations, control decisions, policy publication, evidence and assurance*. The host owns the effect-execution boundary. No named system is imported into normative `AMA.md`.

## 2. Authoritative CDX evidence and maturity

### 2.1 Source hierarchy

1. [CDX Act, version 1.0.0](https://github.com/Hybrismannen/Conductellence-/blob/main/LAW/CONDUCTELLENCE-ACT.md): internally **ADOPTED** constitutional law, seven principles, 19 chapters, 131 legal sections. It does not supersede external law.
2. [CDX control registry](https://github.com/Hybrismannen/Conductellence-/blob/main/POLICY/control-registry.json) + [Control Catalogue](https://github.com/Hybrismannen/Conductellence-/blob/main/CONTROL-CATALOGUE/law-bindings.json): **69 reference-runtime controls**, **62 review-governed sections**, not 131 production-enforced checks.
3. [Policy engine](https://github.com/Hybrismannen/Conductellence-/blob/main/POLICY/engine.py): deterministic predicate evaluation against supplied context; unknown/malformed control or no applicable control leads to restrictive behavior. It does not authenticate all supplied context.
4. [SPETL](https://github.com/Hybrismannen/Conductellence-/blob/main/SPETL/README.md): hash-linked append-only reference journal; [custody deployment state](https://github.com/Hybrismannen/Conductellence-/blob/main/SPETL/custody/deployment-state.json) records a **VERIFIED_REFERENCE_CUSTODY** GitHub Actions producer/custodian/verifier chain. Long-lived separate Vercel custody remains externally blocked.
5. [Security Twin](https://github.com/Hybrismannen/Conductellence-/blob/main/SECURITY-TWIN/README.md): derived relation graph, not independent source of truth. Current graph uses canonical registries; live runtime edges and observations remain a future integration.
6. [Red-Team](https://github.com/Hybrismannen/Conductellence-/blob/main/RED-TEAM/README.md): narrow constitutional red-team suite for self-escalation, delegation overflow, memory/content-to-authority, external effects, evidence omissions, security stop and related failures; not general penetration testing.
7. [CDX runtime integration contract](https://github.com/Hybrismannen/Conductellence-/blob/main/RUNTIME-INTEGRATION/README.md), [Estate Anchor Standard](https://github.com/Hybrismannen/Conductellence-/blob/main/GOVERNANCE/CDX-ESTATE-ANCHOR-STANDARD.md), and [state model](https://github.com/Hybrismannen/Conductellence-/blob/main/GOVERNANCE/state-model.md) define exactly what must be verified before asserting production runtime enforcement.

### 2.2 Machine-readable state as of 29 Oct 2026

Read from `GOVERNANCE/system-state.json`:

| Axis | Declared current state | Implication |
|---|---|---|
| Constitutional | `ADOPTED` | Internal doctrine adopted |
| Core runtime | `VERIFIED_REFERENCE_RUNTIME` | Tested local/reference implementation |
| Release | `PRE_RELEASE` | Not a released production authority package |
| Enforcement | `BOOTSTRAP` | No estate-wide ENFORCING claim |
| Estate integration | `PENDING_RUNTIME_BINDINGS` | Consequential app runtime not bound |
| FFOS repository anchor | `CDX_CI_MONITORED` | Local anchor and CI verified, not app runtime |
| FFOS runtime | `BOUND_PENDING_RUNTIME_INTEGRATION` | Policy mediation not verified in application |
| WP04 evidence custody | `VERIFIED_REFERENCE_CUSTODY` | Reference custody proof; not a production store |
| Core release blocker | `CDX-BLOCK-REPO-PROTECTION-001` | Core release closure incomplete |
| Estate enforcement blocker | `CDX-BLOCK-ESTATE-RUNTIME-001` | Verified consumer effect binding incomplete |

Current FFOS `.cdx/anchor.json` uses `PINNED_COMMIT`, contains no declared `AGENT_STABLE_EFFECT_GATE` point and reports pending integration. That is appropriate to development but not to production: the CDX Estate Anchor Standard requires `PINNED_RELEASE` for consequential production runtime enforcement. Its current FFOS runtime gate deliberately fails closed.

**Freeze constraint:** `GOVERNANCE/release-boundary-v1.json` identifies CDX 1.0 as **FROZEN_FOR_CLOSURE**. F8 must not opportunistically add constitutional §§, new first-class CDX domains, authority classes or top-level products. Changes should first be mapped onto existing clauses, controls, audit procedures or runtime contracts; anything crossing the frozen boundary requires the separately specified human exception process.

## 3. Agent-risk crosswalk: known source threats → CDX law/control → operational proof

| Risk found in AMA source round | CDX constitutional source | Concrete current reference control or subsystem | Coverage | Required production assurance |
|---|---|---|---|---|
| Agent impersonation, misbound identity | Ch. 4 §§1–6; Ch. 12 | `IDENTITY_AUTHORITY` controls, credential isolation | Doctrine + reference predicates | Authenticated workload identity, issuer/audience, credential binding and negative tests |
| Self-escalation, excessive delegation | Ch. 5 §§1–8 | `CDX-CTL-AUTH-004`, `CDX-CTL-DELEG-001`, recursion/non-transitive trust | Reference enforced on context fields | Verified principal chain and subset rights from trusted source, expiry/revocation |
| Sensitive observations, data mixing, exfiltration | Ch. 6–7, 10, 13 | Dataset Passport, `CDX-CTL-10-04` egress | Doctrine plus partial data controls | Independently classified inputs, purpose/recipient validation, data-flow and aggregate-disclosure tests |
| Prompt injection/content-to-authority | Ch. 8 §§1–3 | `CDX-CTL-CONTENT-001` | Reference check against flags | Trusted/tainted channels and enforcement *before* capability mutation |
| Persistent memory poisoning/cross-project contamination | Ch. 8 §§4–7 | `CDX-CTL-MEM-001`, `CDX-CTL-08-06` | Conditional memory flags, review duties | Memory write admission, retrieval trust, scope binding, delayed-poisoning tests |
| Unauthorized model/tool use; tool poisoning | Ch. 9–11 | `CDX-CTL-TOOL-001`, `CDX-CTL-TOOL-002`; supply-chain control surface | Registered/allowed booleans | Cryptographic tool/package identity, tool-definition change detection, independent capability decision |
| Rogue agents, cascading failures | Ch. 5, 6, 9, 17 | `CDX-CTL-09-08`, containment, Security Stop | Reference/quarantine predicates | Live revocation and kill switch, blast-radius graph, staged incident test |
| Multi-step policy bypass/reward hacking | Ch. 13, 16, 17 | `RUNTIME_AUTH` controls, RED-TEAM, control-of-controls | Mostly per-action evaluation | Stateful/path-dependent policy evaluation, change-rate checks, anti-gaming independent outcome audits |
| Consequential external effect or irreversibility | Ch. 13–14 | `CDX-CTL-EFFECT-001`, policy pin, `SECURITY_STOP` | Reference decision only | Real effect guard, idempotency/reconciliation, human release, revocation under load |
| Missing/tampered evidence | Ch. 15–16 | `CDX-CTL-SPETL-001`, SPETL hash chain, WP04 custody | Reference custody verified | App-local receipt authenticity, independent persistent custody, blocked-attempt completeness and read-side audit |
| Model/provider and dependency drift | Ch. 9, 11, 18 | Model registration, source/dependency/supply-chain audits | Law + reference controls | Live inventory, drift alarms, provenance and compatibility-release gates |
| Human oversight, inappropriate self-approval | Ch. 14, 18–19 | Human-reserved authority and review procedures | Normative + review-bound | Authenticated independent reviewer, time-bound decision and reviewed evidence |

**Interpretation:** This is broad **constitutional coverage** of the AMA threat landscape. It does not show that every row is fully prevented, monitored or verified at a deployed effect boundary.

### 3.1 The "boolean oracle" gap

The reference control registry contains useful checks, but many predicates test caller-supplied flags:

- `CDX-CTL-TOOL-001`: `tool_registered=true` and `tool_admitted=true`.
- `CDX-CTL-13-04`: `policy_evaluated=true` plus a policy version present.
- `CDX-CTL-CONTENT-001`: `authority_state_changed=false` and `security_policy_changed=false` when `input_untrusted=true`.
- `CDX-CTL-EFFECT-001`: `external_effect_gate_passed=true` and a release decision ID present.

The reference predicates are not evidence that the booleans were generated by a trusted component. A compromised agent that supplies an unrestricted context **must not** be allowed to attest its own admission, approval, egress classification or policy compliance.

**F8 control requirement:** distinguish `ASSERTED`, `RESOLVED_FROM_TRUSTED_REGISTRY`, `VERIFIED_CREDENTIAL`, `POLICY_EVALUATED`, `OBSERVED_EFFECT`, `INDEPENDENTLY_ATTESTED` and `UNKNOWN`. Require externally resolved, versioned and attributable facts for consequential authorization. Avoid using model or tool text to fabricate those facts.

### 3.2 Decision vocabulary integration gap

CDX reference runtime decisions:
`ALLOW | ALLOW_WITH_CONTROLS | REQUIRE_HUMAN | QUARANTINE | DENY | SECURITY_STOP | CONSTITUTIONAL_STOP`.

The current FFOS `agent-runtime/src/effect-gate.ts` expects only:
`ALLOW | DENY | HOLD`.

**F8 contract requirement:** versioned, total and fail-closed decision translation. Only a *verified unconditional* `ALLOW` may proceed under base rules. `ALLOW_WITH_CONTROLS` may proceed **only after each obligation is independently verified**. Other decisions must map to bounded restrictive states with distinct evidence/severity; unrecognized or expired policies always DENY/HOLD. Do not silently downgrade `SECURITY_STOP` or `CONSTITUTIONAL_STOP` to a generic retriable `HOLD`.

### 3.3 Read-side information and cumulative behavior

E0 observation can expose sensitive records. A set of individually allowed reads can become an unauthorized disclosure when aggregated. The Act's data, purpose, trust-domain and egress rules support prevention but the *current local effect gate* is intentionally geared toward consequential effects and rejects E0 through a separate-gate placeholder.

**F8 control requirement:** classified read admission, purpose and audience binding, taint labels, cross-boundary transfer controls, stateful risk accumulation, recipient-based egress checks and end-to-end trace evidence. This is an execution-control implementation requirement, not a reason to rename E0 universally.

### 3.4 Trusted control selection and applicability

The reference `POLICY/engine.py` selects controls by `context.surface` and accepts an optional `control_ids` filter. It denies when no applicable controls remain. However, **selecting an incomplete but non-empty subset is not equivalent to enforcing all mandatory controls**. The production adapter must obtain the applicable control set from the trusted policy/registry for the action, not from model-selected filter arguments.

Some rules use `implies` on context flags such as `input_untrusted` or `external_effect`. If the classification flag is omitted or incorrectly asserted, the premise can evaluate false and a conditional rule may appear satisfied. **Required context completeness, type validation and classification provenance must be enforced before evaluating the rule**, not assumed from its boolean result.

**F8 acceptance tests:** omit `input_untrusted`, change `surface`, select a harmless control subset, omit `external_effect`, or replay a stale policy binding; every affected consequential action must be held/denied until the trusted enforcement layer reconstructs the correct mandatory control set. Allow legitimate classified requests and measure false denial as well.

This is an evidence-based *integration-security risk*, not a claim that the standalone reference engine is approved as a production API accepting arbitrary caller input.

## 4. F8 — Independent eighth stress question

**F8 question:** *Can Conductellence demonstrably govern the identity, agency, behavior, data, tools, memory, external effects and accountability risks of AMA-constructed agents throughout their lifecycle, with independently verifiable local enforcement, while remaining subordinate to human authority and separate from AMA's universal template?*

### Test A — Rule coverage
**Question:** Can each of AMA's high-risk requirements be linked to an existing CDX chapter/section, concrete control, policy predicate, audit and SPETL evidence contract?

**Evidence now:** All major categories appear in CDX-LAW-001. The control catalogue lists 69 implemented reference control bindings and 62 review-bound sections.

**Pass condition:** Crosswalk includes (requirement ID → exact law section → control ID or review procedure → policy version → runtime enforcement point → evidence → test case). A missing binding is explicitly UNBOUND rather than verbally declared covered.

### Test B — Real control effectiveness
**Question:** Can an untrusted agent forge `tool_admitted`, `policy_evaluated`, or `external_effect_gate_passed` and obtain an ALLOW?

**Evidence now:** The reference predicates check supplied fields, so context authenticity is not proven by control evaluation alone.

**Pass condition:** All such inputs are derived from trusted registries/verifiers/side-effect receipts, with tamper and replay tests demonstrating that self-attestation cannot grant permission.

### Test C — Decision completeness
**Question:** Do all seven CDX decisions map exactly onto host enforcement, including controlled ALLOW, human review, quarantine and both stop levels?

**Evidence now:** FFOS local gate supports three outcomes and has mock-driven CI tests; no real CDX adapter is bound.

**Pass condition:** Exact semantics, obligation receipts, human approval, stop propagation and unrecognized-decision denial verified in live adapter tests.

### Test D — Dynamic and cumulative agent risk
**Question:** Can a multi-step plan violate privacy, resource limits or delegated purpose even when each step is individually allowed?

**Evidence now:** Constitutional coverage exists through purpose limitation, runtime mediation, data domains and Security Twin. Live path-sensitive graph control is not demonstrated.

**Pass condition:** Trace-history-aware control evaluation, confidential-data flow constraints and multi-step adversarial test outcomes; appropriately authorized legitimate actions still pass.

### Test E — Memory, tools and supply chain
**Question:** Are memory writes, retrieved instructions and mutable tool descriptions independently trusted and scoped, including across time and trust domains?

**Evidence now:** The Act and reference controls prohibit content-to-authority promotion and unauthorized memory writes; production proof of memory admission and tool definition integrity is not established.

**Pass condition:** Controlled write/read pipeline, integrity-checked connector/tool definitions, provenance/poisoning tests and comprehensive compromised-provider quarantine.

### Test F — Evidence, assurance and failure modes
**Question:** Can an independent reviewer reconstruct a denied, allowed, failed, partially committed or revoked action despite storage or policy-system failure?

**Evidence now:** Reference SPETL hash chain and independently verified GitHub Actions custody; external long-lived custody not provisioned and FFOS app-level runtime evidence not connected.

**Pass condition:** Verified SPETL decision and effect receipts, independent custodial persistence, completeness tests for denied attempts and post-effect unknown states, evidence redaction policy, recovery rehearsal.

### Test G — Constitutional/operational boundary
**Question:** Can Conductellence safely stop nonconforming agents without inheriting unrestricted repository access or unilaterally overruling human constitutional authority?

**Evidence now:** Estate Anchor Standard explicitly says CDX publishes control contracts and local systems enforce; current enforcement is BOOTSTRAP and consumer runtime pending.

**Pass condition:** Versioned local anchor + independently attested binding + emergency revocation/stop + no downstream super-admin + authorized human exception and release evidence.

## 5. First-level recommendation F8 — leverage CDX, do not duplicate it

**F8 is independent of F2.** F2 specifies the *universal* authorization and risk-interface contract applicable to any AMA instance; F8 verifies the *CDX-specific security and risk governance capability* and its operational proof for the governed estate. F8 does **not** replace R1–R7/F1–F7, and adding F8 does not automatically close any current or second-level gap.

Deliver F8 as seven subwork packages:

| Package | Implement and verify | Ownership | Initial disposition |
|---|---|---|---|
| F8.1 Source/risk-to-control crosswalk | Map A–L risk candidates and advanced residuals to CDX §/control/audit/evidence with unmapped statuses | CDX security/control catalogue; AMA publishes generic requirement IDs | Mapping required |
| F8.2 Trusted-context and mandate binding | Build independently verified identity, mandate, tool-admission, data scope and policy-fact resolution; disallow self-attested booleans | CDX reference/host enforcement interface | Security-critical |
| F8.3 Full decision + obligation semantics | Support 7-way CDX decision translation and control obligations; proof before effect | Host effect adapter + CDX policy | Security-critical |
| F8.4 Stateful risk and Security Twin | Evaluate cumulative tool, memory, data, delegation and recipient risk using observed runtime graph, not only one action at a time | CDX Security Twin + host runtime | Advanced control |
| F8.5 SPETL independent assurance | Verify provenance, receipts, blocked cases, unknown effects, custody, auditability and independent acceptance | CDX evidence/custody + local emitter | Security-critical |
| F8.6 Adversarial and incident lifecycle | Expand typed red-team suites, emergency stop, credential revocation, degradation, threat drift and false-denial testing | CDX audits/RED-TEAM + host | Risk lifecycle |
| F8.7 Release and estate integration | Clear existing core closure blockers, publish pinned release, bind FFOS runtime, verify production policy/receipt paths and independently approve activation | CDX and FFOS governed release | **Current gating blocker** |

All F8 work should first be satisfied through existing CDX chapters and subsystems. Constitutional amendments are prohibited during the CDX 1.0 freeze without the specified human-approved boundary exception.

### Prerequisite ordering

```text
AMA F1 ontology + F2 abstract authority interface
        |
CDX F8.1 source/control/evidence mapping
        |
F8.2 trusted facts/identity/delegation
        +-------- F8.3 full decision semantics
        |                  |
        +-------- F8.4 dynamic risk controls
                           |
                    F8.5 independent SPETL
                           |
                    F8.6 adversarial testing
                           |
CDX core release boundary + F8.7 host integration
                           |
        independently verified effect mediation
                           |
                 authorized activation
```

The sequence is a *dependency model*, not a new CDX constitutional programme or a claim that these are already committed work packages.

## 6. Level-two reconciliation: what remains after F1–F8?

F8's first-order contribution is to **assign security and risk governance to its intended independently controlled subsystem**, reducing duplicate design work in AMA. But it does **not** eliminate the initial second-level risks simply by claiming controls.

### Existing residuals that F8 can directly manage, without automatically closing

| Earlier residual | What F8 adds | Still needed for closure |
|---|---|---|
| S02 path-sensitive information leakage | Dataset Passport, trust domains, purpose/egress policy, Security Twin | Proven stateful read+aggregation+egress enforcement |
| S03 revocation/delegation freshness | Continuous authorization, subset delegation, Security Stop | Authenticated identity and live race/lease tests |
| S05 memory poisoning and repair | Content-Authority Firewall, memory admission, cross-project controls | Long-session injection and correctness repair testing |
| S06 evidence retention/privacy | Data protection and SPETL governance | Validated retention/erasure and independent legal review |
| S07 uncertain external effects | External effect and reconciliation gates | Real downstream idempotency, reconciliation and failover |
| S08 evaluation gaming | RED-TEAM, control-of-controls and independent audit | Out-of-distribution adversarial tests and observer independence |
| S09 sensitive audit evidence | SPETL data-minimization and independent custody | Policy-based field access, integrity-preserving redaction |
| S10 standards/protocol drift | Source authority, versioned controls and regulatory drift | Source-pinned change detection, verified migrations |
| S11 host operational binding | CDX Estate Anchor Standard, runtime contract | Production release and real FFOS runtime verification |

### New F8-specific second-level residuals (do NOT double-count earlier issues)

- **S12 — Trusted policy-fact provenance:** A correct policy predicate can be defeated by attacker-controlled inputs unless the host independently resolves and authenticates the facts. See F8.2.
- **S13 — Full decision/obligation semantic preservation:** Mapping seven CDX outcomes into a reduced host outcome may silently lose enforcement meaning. See F8.3.
- **S14 — Policy/composition coverage completeness:** A law section can be declared mapped while action-sequence, information-flow or multi-control semantic gaps remain. See F8.1/F8.4/F8.6.
- **S15 — Control-of-controls and reference-to-estate assurance:** Reference tests, CI, custodial evidence and the current anchor can all pass while the consequential production execution path remains unmediated. See F8.5/F8.7.

**Method rule:** These new S12–S15 are only residual *after* F8.1–F8.7 are materially implemented and independently tested. Their *current precursors* are implementation blockers, not separate proof that F8 is ineffective.

## 7. F8 readiness assessment (source-backed, not synthetic score)

| Layer | Current status | Meaning |
|---|---|---|
| Agent-risk constitutional law | **ADOPTED** | CDX has a clear agent-centric mandate |
| Policy catalogue | **69 reference controls / 62 review-bound sections** | Broad controls; not 131 automatically enforced duties |
| Deterministic reference policy engine | **IMPLEMENTED / VERIFIED_REFERENCE_RUNTIME** | Local reference semantics exercised; facts and policy service not fully authenticated for production |
| SPETL independent reference custody | **VERIFIED_REFERENCE_CUSTODY** | CI-separated evidence producer, custodian and verifier |
| Real estate deployment | **PENDING_RUNTIME_BINDINGS** | No verified FFOS consequential runtime integration |
| Active estate enforcement | **BOOTSTRAP** | No production ENFORCING claim |
| Security Twin active agent graph | **DERIVED STATIC / FUTURE RUNTIME INPUTS** | Useful architectural basis, not verified real-time threat sensor |
| Full F8 security coverage | **NOT YET PROVEN** | Requires F8.1–F8.7 and R2 adversarial verification |

## 8. Recommended overall verdict

**F8 is justified as an independent eighth research and governance stress test.** It is not an eighth generic AMA layer or an invitation to place Conductellence's name in the universal master template. Its purpose is to test whether the distinct Conductellence system **actually discharges** the security, risk, assurance and operational authority roles for the estate.

**What the source round changes:** Most risks identified by the research already have constitutional treatment in CDX. Instead of rebuilding those controls inside AMA, reconcile them to CDX controls and demand independently verifiable runtime proofs. The highest-value near-term work is **control semantic authenticity**, **decision mapping**, **SPETL-to-effect correlation**, and **live anchor/effect mediation**. Avoid adding speculative constitutional clauses during the CDX 1.0 freeze.

**Outcome classification:** F8 DESIGN SUPPORTED / CONTROL COVERAGE PARTIAL / REFERENCE RUNTIME VERIFIED / GOVERNED PRODUCTION ENFORCEMENT UNVERIFIED.

## Source and scope qualification

The primary evidence here comes from the actual CDX and FFOS GitHub repositories on 2026-10-29. The TinyFish/Article Galaxy research provides *threat and methodological context* but does not itself prove CDX runtime behavior. No external audit of deployed credentials, policy engine security, production adapter or SPETL custody service was conducted by this document. All CDX constitutional obligations are internal rules and cannot be presented as state-enacted legislation.
