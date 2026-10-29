# Agent Master Architecture (AMA)

**Canonical engineering stages:** M0–M7. **F8:** additional external policy-integration specification (external host adapter, never an AMA agent or an M8 stage). See `packages/agent-model/ama-milestones.json` for the current stage/source index and `packages/agent-model/AMA-COMPREHENSIVE-TEMPLATE.md` for practical construction guidance. The supplementary 32-module coverage inventory must not replace M0–M7 or the 96 source-derived candidate requirements.

**Version interpretation:** The historical 0.1.0 foundation and its wire schema remain preserved. Separate v0.2 candidate contracts extend this template without silently modifying legacy compatibility or claiming adoption of a released baseline. Construction work is reviewed and accepted by the owner based on documented technical evidence; no external reviewer is required by the AMA template itself.

**Architecture ID:** FFOS-AMA-001  
**Version:** 0.1.0  
**State:** FOUNDATION  
**Contract owner:** FFOS / Agent Stable  
**Applicability:** All first-class agents admitted under this contract  
**Governance:** Explicit human mandate, independent policy evaluation, technical conformance and independent acceptance

## 1. Purpose and scope

Agent Master Architecture (AMA) is the universal, versioned **construction, admission, operation, lifecycle and assurance contract** for first-class agents. It is an architecture from which agents are instantiated, not an agent or an implementation instance itself.

AMA provides one stable template for agent identity, purpose, mandate, permissions, activation, workflows, commands, capabilities, runtime class, state, evidence, evaluation, security, maintenance, version inheritance, upgrades and retirement. Every actual agent is defined separately through its own registered manifest and bound implementation.

**Template purity invariant:** No specific agent identity, named workflow, domain-specific taxonomy, deployment or host organizational hierarchy belongs in AMA or its normative master contracts. Concrete implementations and extensions are separate, versioned artifacts. Test fixtures may be synthetic but are not normative.

```text
agent definition + immutable version
→ workflow / command / capability registrations
→ authority and mandate admission
→ policy and effect gates
→ bounded execution
→ verification and evidence
→ authorized acceptance and lifecycle decision
```

The contract does not itself grant authority, deploy workloads or imply operational readiness.

## 2. Architectural law

1. **Agent ≠ workflow ≠ command ≠ capability.**
2. **Capability ≠ authority.**
3. **Assignment ≠ mandate.**
4. **Execution ≠ verification ≠ acceptance.**
5. **Defined ≠ implemented ≠ connected ≠ tested ≠ approved ≠ active.**
6. **Delegated or nested execution cannot amplify the parent authority or effect ceiling.**
7. **An agent may propose changes but cannot authorize, accept or activate its own changes.**
8. **Consequential actions require explicit authority, mandate, target and pinned policy context.**
9. **Every material execution attempt must terminate in an auditable state.**
10. **Shared updates cannot silently change purpose, mandate, permissions, active modules, verification or acceptance conditions.**
11. **Untrusted text, tool responses, context and memory never grant authority.**
12. **Contract definitions remain independent of individual agents and domain-specific procedures.**

## 3. First-class entity admission

A construct qualifies as a first-class **Agent** only where independent governance reasonably requires:

- durable operational identity;
- independently bounded purpose, mandate and non-goals;
- declared effect and resource permissions;
- distinct lifecycle, versioning and activation;
- run or persistent state where appropriate;
- independent evaluation, evidence and operational accountability;
- clear escalation and exception boundaries.

Otherwise it should be implemented as a **Workflow**, **Command**, **Capability**, internal **Role** or deterministic service. A named or complex procedure does not automatically become an agent.

## 4. Mandatory agent contract

### 4.1 Identity and mandate

Every agent manifest declares:

- immutable agent ID and display name;
- independent semantic agent version and pinned AMA version;
- explicit purpose, scope and non-goals;
- accountable governing principal and approval requirements;
- runtime class and activation mode;
- input, output and escalation contracts;
- workflow, command and capability bindings;
- maximum requested effect class and resource scope;
- state/memory and data-retention policy;
- conformance and evidence requirements;
- lifecycle and deployment binding status.

No secrets are permitted in a manifest.

### 4.2 Workflow and command registry

A **Command** is an operator-facing invocation that resolves to exactly one approved **Workflow** version. A **Workflow** is a versioned bounded procedure with its own required capabilities, inputs, authorized effect ceiling, terminal states, verification and evidence requirements.

```text
command / event / schedule
→ pinned workflow version
→ approved capability resolution
→ authority + mandate + policy checks
→ bounded execution
→ verification + evidence
→ terminal run state
```

Command tokens and workflow definitions never create independent mandate or agent identity.

### 4.3 Capability registry

Every technical capability registers its implementation/provider, version, effect class, resource scope, input/output contract, credentials/identity requirements, timeout, retry policy, availability status, evidence contract and revocation state.

Capabilities must be explicitly granted to the agent and to the invoking workflow. Optional modules are OFF unless explicitly enabled through an approved configuration. Capability availability never implies authorization.

### 4.4 Context and state

AMA distinguishes:

- **Definition state:** immutable, versioned agent declaration.
- **Runtime configuration:** explicitly admitted environment bindings.
- **Run state:** an execution attempt and its transitions.
- **Durable operational state:** controlled persisted state and checkpoints.
- **Evidence state:** append-only records of decisions, effects and outcomes.
- **Bounded memory:** optional persisted or session knowledge with provenance and retention.
- **External domain state:** remains owned by its authoritative domain source.

A conversational context window is not an authorization mechanism or durable audit store.

### 4.5 Authorization and execution context

A consequential run carries at least:

- agent ID, agent version and AMA version;
- exact workflow ID/version and capability ID/version;
- principal and actor references;
- explicit `authority_ref` and `mandate_ref`;
- target resource and requested effect;
- applicable policy/constraint version or pin;
- source provenance and input references;
- run, correlation and idempotency identifiers where applicable.

Authorization must be evaluated at the local effect boundary and fail closed if authority, mandate, capability, policy, revocation or required evidence services are absent. Authentication alone is not permission.

### 4.6 Governance interface separation

The host environment must provide independently bound interfaces for:

- **Mandate authority:** authenticated, delegated human authorization for purpose, permissions, activation and substantive changes.
- **Policy enforcement:** versioned policy evaluation, restrictions, revocation and external-effect mediation.
- **Technical stewardship:** registry inventory, conformance, health, drift, change proposals, rollback preparation.
- **Independent verification:** evidence assessment against predetermined criteria.
- **Acceptance:** independently authorized decisions about promotion, work outcomes, exceptions, suspension and retirement.

Technical maintenance, verification, agent execution and approval are distinct responsibilities. None inherits authority from being part of the agent architecture.

### 4.7 Evaluation and conformance

Admission requires a versioned suite covering:

- schema and manifest consistency;
- identity, scope and permission denial cases;
- workflow/command version and capability binding integrity;
- active/inactive module boundaries;
- authorized and denied execution paths;
- state transition, cancellation, failure and rollback/safe-termination rules;
- evidence production and independent verification;
- external-effect mediation and revocation;
- baseline comparison and regression across upgrades.

Static schema validation alone is not runtime verification. Evaluators cannot approve their own results.

## 5. Runtime classes

The contract admits several execution forms without introducing any specific implementation:

- `REQUEST_RESPONSE` — invoked for a bounded request;
- `DURABLE_WORKER` — persistent queue/state processing;
- `SCHEDULED` — scheduled invocation;
- `EVENT_DRIVEN` — registered event invocation;
- `COMPOSITE` — one agent with bounded internal components;
- `HYBRID` — a declared combination.

The invocation transport or interface does not determine whether an agent has a durable backend. State, resumability and long-running work require explicit persistent infrastructure.

## 6. Optional internal roles

Internal roles, if used, are subordinate components of the enclosing agent, **not first-class agents by default**. Each role must declare purpose, permitted workflows/capabilities, mutation scope, effect ceiling, evidence requirements, verification separation and escalation.

An internal role cannot grant itself permissions, exceed the enclosing agent ceiling or independently accept its own output.

## 7. Generic effect classes

- `E0_OBSERVE` — read/query/compute with no persistent mutation;
- `E1_INTERNAL_STATE` — bounded mutation of permitted agent-owned or host-managed state;
- `E2_REPOSITORY_CHANGE` — source/configuration mutation through governed change control;
- `E3_EXTERNAL_EFFECT` — publishing, sending, deployment, payments, external account mutation or equivalent consequential action;
- `E4_AUTHORITY_CHANGE` — permissions, mandates, policies, governance or authority mutation.

Manifest ceilings are maximum requested effects, **not grants**. Each action remains subject to resource scope, human and policy controls. Domain extensions may introduce finer effect taxonomies without changing these base classes.

## 8. Agent lifecycle

`DRAFT → REGISTERED → VALIDATED → DEPLOYABLE → ACTIVE → SUSPENDED → DEPRECATED → RETIRED`

- `REGISTERED`: identity and version recorded, not operational admission.
- `VALIDATED`: required definition/conformance evidence accepted at its prescribed gate.
- `DEPLOYABLE`: independently verified runtime bindings exist.
- `ACTIVE`: separately authorized activation of an admitted deployment.
- `SUSPENDED`: consequential execution denied.
- `DEPRECATED`: explicitly limited compatibility operation only.
- `RETIRED`: no new execution permitted.

Every lifecycle transition records actor, authority, mandate, justification, evidence and current-to-next state continuity. Revocation has priority over cached activation.

## 9. Run lifecycle

Common terminal/run states:

`QUEUED | RUNNING | PASS | PASS_WITH_WARNING | FAIL | HOLD | SKIPPED | WAIVED | CANCELLED`

Every material attempt produces evidence even when denied, held, cancelled, failed, skipped or waived. A warning never masks a failed mandatory gate. An execution PASS does not imply independent acceptance.

## 10. Version inheritance and controlled upgrades

Every agent pins `amaVersion` independently of its own `agentVersion`. Shared contract upgrades follow:

```text
AMA candidate
→ impacted agent-version inventory
→ compatibility and semantic-impact classification
→ authorized migration proposal
→ schema and conformance evaluation
→ baseline regression and denial tests
→ separate authority/acceptance review where necessary
→ controlled promotion and rollout
→ monitoring + evidence
→ available rollback or safe suspension
```

- **PATCH:** compatible correction without semantic expansion.
- **MINOR:** backward-compatible optional additions.
- **MAJOR:** breaking structure, interpretation, authority or lifecycle change.

No automatic upgrade may silently expand permissions, rewrite mandate/purpose, activate a module, remove a human gate or replace independent acceptance criteria.

## 11. Optional modules

Initial reusable module classes include durable memory, retrieval, scheduling, event subscriptions, queues and resumable workers, human review, bounded multi-role orchestration, connectors, repository mutation, evaluation and optional policy packs.

Each module is explicitly versioned, scoped and activated. An unconfigured module is inactive.

## 12. Evidence and observability

A material run must allow an independent reviewer to establish:

1. agent ID/version and AMA version;
2. workflow and capability versions;
3. principal, actor, authority and mandate;
4. inputs, provenance and target scope;
5. applicable policy and gate decisions;
6. tool invocations, mutations and external effects;
7. verification results;
8. terminal outcome and unresolved uncertainty;
9. artifacts, receipts, correlation and reconciliation records.

Telemetry is helpful for operations but cannot replace required acceptance evidence. Evidence records should be immutable/append-only, versioned and access-controlled.

## 13. Security invariants

- Secrets are never stored in manifests.
- Capabilities use least privilege, explicit resources and bounded credentials.
- User content, memory, retrieved documents and tool outputs cannot create authority.
- Policy, identity or revocation-service failure must deny or hold consequential actions.
- Effect gates mediate consequential actions **before** execution.
- Authority mutations cannot be self-approved.
- Suspended, revoked or unregistered versions fail closed.
- Delegation can narrow, never amplify, authority.
- Uncertain post-effect outcomes require reconciliation, not uncontrolled replay.
- The host must enforce independent review, audit retention and explicit exception policy.

## 14. Agent Registry contract

The host-managed Agent Registry preserves:

- immutable ID and versioned definitions;
- AMA pins;
- approved mandate/authority/effect ceilings;
- versioned command/workflow/capability bindings;
- lifecycle, activation and revocation history;
- configuration/deployment hashes and evidence;
- conformance/health status;
- incidents, upgrade provenance and rollback history.

Current state is derived from an auditable history; registered status does not equal active status.

## 15. Non-goals

AMA does not:

- define, name or describe any individual agent or its workflows;
- prescribe domain-specific business processes, repair classes or tool sequences;
- embed concrete organizational topology or a named policy provider;
- grant sovereignty, self-approval or autonomous mandate expansion;
- implement a production agent merely by defining a manifest;
- replace the host's domain contracts, constitutional obligations or acceptance gates;
- treat a passed static test as operational authorization.

## 16. Foundation acceptance

The universal architecture foundation requires:

1. a self-contained, agent-independent contract;
2. machine-readable manifest schema and shared types;
3. first-class agent/workflow/command/capability separation;
4. bounded effect, authority and module semantics;
5. independent approval, audit and verification interfaces;
6. versioned state, evidence, lifecycle and conformance requirements;
7. regression-safe upgrade and rollback rules;
8. explicit separation of normative AMA requirements from all agent instances and host integrations.

Deployment and operational acceptance are separately tracked by the host, never inferred from this document.
