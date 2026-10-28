# Agent Master Architecture (AMA)

**Architecture ID:** FFOS-AMA-001  
**Version:** 0.1.0  
**State:** FOUNDATION  
**Owner:** FFOS  
**Operational governing authority:** FFOS Director within explicitly delegated mandate; not universal constitutional authority  
**Mechanical stewardship:** Agent Mechanic  
**External governance dependency:** Conductellence (CDX) for consequential-action authority boundaries  
**Normative lineage (not active Pius runtime):** Pius agent doctrine (bounded modular agency), FFOS authority/object model, CDX authority/runtime contracts

## 1. Purpose

The Agent Master Architecture (AMA) is the common, versioned architecture for every first-class agent implemented in FFOS.

AMA exists so agents are not independently improvised products. Every agent inherits one shared contract for identity, mandate, authority, capabilities, workflows, state, evidence, evaluation, deployment, observability, maintenance, upgrade and retirement.

AMA is deliberately not a universal agent that performs all work. It is the architecture from which individual agents are instantiated.

**Director-defined target hierarchy:** Human Director → CDX → FFC → FFOS → Agent Stable { AMA, Agent Mechanic, registered FFOS agents }; FFOS → Pius { HCC ↔ CDX, Piusites built on AMA }. **Authority topology:** [AMA-AUTHORITY-TOPOLOGY.md](AMA-AUTHORITY-TOPOLOGY.md) is the normative FFOS AMA cross-system reconciliation.

The former linear `Pius → CDX → AMA → Agent` diagram is **withdrawn**. Human sovereignty, independent Pius/HCC moral oversight, versioned Pius doctrine, independent CDX governance, FFOS Director authority, AMA contracts, Agent Mechanic stewardship and agent execution are **distinct planes**, not a sequence of delegated sovereignty.

```text
Human-authorized FFOS Director mandate / work decision
      → AMA-registered agent + approved workflow and capabilities
      → applicable FFOS local CDX enforcement (when runtime-bound)
      → bounded execution, verification, evidence
      → separate Director/domain acceptance where required

Pius Codex / Ex-Inerta / HCC / APz: separate Pius governance and
normative lineage; Pius FFOS runtime binding remains RESERVED.
CDX: independent policy source; not a subordinate AMA module.
```

**Integration status:** This is an architecture target, not a claim of verified production runtime enforcement.

## 2. Architectural law

1. **Agent ≠ workflow ≠ command ≠ capability.**
2. **Capability ≠ authority.**
3. **Assignment ≠ mandate.**
4. **Execution ≠ acceptance.**
5. **Defined ≠ implemented ≠ connected ≠ tested ≠ active.**
6. **A child role, worker or sub-process never inherits more authority than its parent.**
7. **An agent may propose a change to its own architecture but may not authorize that change.**
8. **All consequential actions require explicit authority and mandate context.**
9. **Every material run terminates in an auditable state.**
10. **AMA upgrades never silently overwrite agent-specific purpose, permissions, acceptance gates or domain constraints.**

## 3. First-class entity test

A software construct is registered as a first-class **Agent** only when it needs an independently governed combination of:

- durable operational identity;
- explicit mandate or mission boundary;
- independently bounded permissions;
- state that survives an individual command invocation;
- lifecycle and versioning;
- independent conformance/evaluation;
- operational accountability or escalation.

A construct should remain a **Workflow**, **Command**, **Capability**, or internal **Role** when those properties are not required.

This rule prevents agent proliferation. Named operational procedures do not become agents merely because they are important or complex.

## 4. AMA component model

### 4.1 Core Contract

Mandatory for every agent:

- identity and immutable agent ID;
- semantic version;
- purpose;
- mandate;
- explicit non-goals;
- owner / governing authority;
- runtime class;
- activation modes;
- authority requirements;
- capability bindings;
- workflow and command bindings;
- input/output contracts;
- state and memory policy;
- evidence requirements;
- escalation rules;
- conformance profile;
- lifecycle state;
- AMA version pin.

### 4.2 Workflow & Command Registry

Commands are stable operator-facing entry points. Workflows are versioned procedures invoked by commands, schedules, dispatches or other governed workflows.

A command does not contain hidden authority. It resolves to:

```text
command
→ workflow version
→ required capability set
→ authority / mandate checks
→ execution
→ verification
→ evidence
→ terminal run state
```

### 4.3 Capability Registry

Capabilities describe what an agent can technically do. Each capability is typed, versioned and scoped.

Capability registration must state:

- provider / implementation;
- effect class;
- resource scope;
- input/output type;
- authentication requirements;
- timeout/retry policy;
- evidence requirements;
- test status;
- revocation state.

Optional capability modules are OFF unless explicitly enabled by the agent definition or a governed runtime profile.

### 4.4 Context & State

AMA separates:

- **definition state** — versioned agent specification;
- **runtime configuration** — environment-specific configuration;
- **run state** — one execution attempt;
- **durable operational state** — approved persistent state;
- **evidence state** — append-only records proving what occurred;
- **domain memory** — optional bounded memory explicitly admitted for the agent.

No conversational context, retrieved content, tool output or remembered instruction can enlarge authority.

### 4.5 Execution & Authorization

Every consequential run carries:

- agent identity and version;
- workflow identity and version;
- principal / actor;
- `authority_ref`;
- `mandate_ref`;
- requested effect;
- target scope;
- policy/constraint version;
- input provenance;
- correlation/run ID.

Execution fails closed when mandatory authority, mandate, policy or capability context is absent.

### 4.6 Evaluation & Conformance

Every deployable agent must pass a versioned conformance suite covering at least:

- manifest/schema validity;
- authority denial cases;
- capability scope tests;
- workflow/command resolution;
- happy-path execution;
- blocked/failed execution;
- evidence production;
- state-transition invariants;
- external-effect mediation;
- rollback or safe termination;
- regression tests against the previous accepted agent version.

Evaluation is separate from operational acceptance. An agent or worker may produce evidence but may not independently convert its own work into accepted state.

### 4.7 Agent Mechanic

The **Agent Mechanic** is the technical steward of AMA conformance and agent operational health.

It owns mechanics, not purpose.

The Agent Mechanic may:

- maintain the agent registry;
- validate manifests and AMA-version compatibility;
- inspect workflow/command/capability bindings;
- run conformance and regression suites;
- monitor deployment/runtime health;
- detect version drift;
- open bounded maintenance or upgrade proposals;
- track incidents and degraded states;
- prepare rollback;
- report unsupported or obsolete agent versions.

The Agent Mechanic may **not**:

- redefine an agent's purpose or mandate;
- grant itself or another agent authority;
- approve consequential external effects;
- lower Director or CDX gates;
- convert failed evaluation into acceptance;
- silently alter domain semantics.

### 4.8 Director

The Director remains the governing authority for agent purpose and controlled progression.

Director responsibilities include:

- approving creation of a first-class agent;
- defining or approving purpose and mandate;
- approving material permission expansion;
- approving activation, suspension and retirement;
- approving AMA migrations that materially change authority or semantics;
- resolving architecture conflicts that exceed mechanical compatibility.

## 5. Runtime classes

AMA supports multiple runtime forms without changing the core contract:

- `REQUEST_RESPONSE` — invoked per request, no durable worker;
- `DURABLE_WORKER` — persistent backend worker with queue/state;
- `SCHEDULED` — timer/event-driven execution;
- `EVENT_DRIVEN` — reacts to registered events;
- `COMPOSITE` — one governed agent exposing multiple internal roles;
- `HYBRID` — combination of the above.

A ChatGPT/MCP-facing plugin is an interface surface, not the complete agent architecture. Durable operations must live in a persistent backend when the agent requires state, scheduled execution, resumability or long-running work.

## 6. Internal roles and composite agents

An agent may contain named internal roles. Internal roles do not become independent agents unless they pass the first-class entity test.

A composite agent must declare for each internal role:

- permitted workflows;
- permitted capabilities;
- mutation scope;
- whether the role can verify work created by another role;
- whether the role may create external effects;
- escalation path.

Role decomposition never creates new sovereignty.

## 7. Effect classes

AMA uses a generic effect classification:

- `E0_OBSERVE` — read/query/compute with no persistent mutation;
- `E1_INTERNAL_STATE` — bounded mutation of FFOS/agent-owned state;
- `E2_REPOSITORY_CHANGE` — source/configuration mutation through governed change control;
- `E3_EXTERNAL_EFFECT` — publish/send/deploy/payment/account mutation or equivalent external consequence;
- `E4_AUTHORITY_CHANGE` — permissions, mandate, policy, governance or authority mutation.

Agent manifests declare the maximum effect class they may request. Actual execution remains subject to applicable Director/CDX controls.

Domain agents may define more specific internal taxonomies without replacing these effect classes.

## 8. Lifecycle

Agent definition lifecycle:

`DRAFT → REGISTERED → VALIDATED → DEPLOYABLE → ACTIVE → SUSPENDED → DEPRECATED → RETIRED`

Rules:

- `REGISTERED` means the identity exists; it does not imply runtime implementation.
- `VALIDATED` means the definition and conformance suite pass.
- `DEPLOYABLE` means required runtime bindings exist.
- `ACTIVE` requires explicit activation authority.
- `SUSPENDED` denies consequential execution.
- `DEPRECATED` permits only explicitly supported compatibility operation.
- `RETIRED` is terminal for new execution.

## 9. Run lifecycle

Common AMA run states:

`QUEUED | RUNNING | PASS | PASS_WITH_WARNING | FAIL | HOLD | SKIPPED | WAIVED | CANCELLED`

Every attempted material run writes an evidence record, including holds, denials, skips, waivers and failures.

A warning may never conceal a failed hard gate.

## 10. Version inheritance and synchronized updates

Every agent pins an `amaVersion`.

A shared AMA update follows:

```text
new AMA version
→ compatibility analysis
→ affected-agent inventory
→ migration proposal
→ schema/conformance upgrade
→ regression suite
→ authority-impact check
→ deployable candidate
→ Director promotion where required
→ controlled rollout
→ evidence
→ rollback available
```

AMA changes are classified:

- **PATCH** — clarification or backward-compatible mechanical correction;
- **MINOR** — new optional fields/modules/capabilities with backward compatibility;
- **MAJOR** — breaking contract, lifecycle, authority or semantic change.

No synchronized update may silently widen an agent's permissions, change its mandate, activate an optional module, or replace its domain-specific acceptance criteria.

## 11. Optional modules

AMA modules are explicitly activated and versioned. Initial module classes:

- durable memory;
- retrieval / knowledge access;
- scheduler;
- event subscriptions;
- queue / resumable worker;
- human review;
- multi-role orchestration;
- external connector;
- repository mutation;
- evaluation harness;
- domain-specific policy pack.

Inactive modules have no runtime effect.

## 12. Evidence and observability

Each material run must be reconstructable from evidence sufficient to answer:

1. Which agent/version acted?
2. Under which workflow/version?
3. Who or what was the principal?
4. What authority and mandate applied?
5. Which inputs and capabilities were used?
6. What decisions/gates occurred?
7. What mutations or external effects occurred?
8. What verification ran?
9. What terminal state resulted?
10. Which artifacts/receipts prove the result?

Operational telemetry may summarize performance, but telemetry is not acceptance evidence unless explicitly admitted by the relevant conformance contract.

## 13. Security invariants

- Secrets are never stored in agent manifests.
- Capabilities use least privilege and explicit resource scopes.
- Tool/content availability cannot create authority.
- Policy failure never becomes implicit allow.
- External effects require an applicable effect gate.
- Privilege/mandate changes are E4 and cannot be self-approved.
- Revoked/suspended agents fail closed for consequential execution.
- Delegation may reduce authority but may not amplify it.
- Evidence for consequential actions is append-only at the audit layer.

## 14. AMA registry

The FFOS Agent Registry is the authoritative FFOS record of agent definitions and accepted versions.

Minimum registry dimensions:

- agent ID / name;
- current accepted agent version;
- AMA version pin;
- lifecycle state;
- runtime class;
- authority class;
- effect ceiling;
- active workflow set;
- active capability set;
- deployment binding;
- conformance status;
- last evaluation;
- last deployment;
- health state;
- incident/open-maintenance state.

The registry must also preserve historical versions and migration records.

## 15. Household relationship

Household is not the source architecture for AMA.

When Household is migrated to AMA:

- Household becomes one first-class agent/family orchestrating registered workflows;
- Janitor, Handyman and Verifier are registered as distinct workflows within the Household agent, not agents or internal agent roles;
- Director remains external governing authority;
- Household-specific repair classes such as J0/J1/J2 remain a domain extension;
- Household workflows/commands register under the shared Workflow & Command Registry;
- Household permissions, tests, evidence, upgrades and deployment inherit AMA controls.

## 16. Non-goals of AMA 0.1

AMA 0.1 does not:

- implement Pius runtime semantics inside FFOS;
- replace Conductellence;
- make every workflow an agent;
- define Household-specific repair semantics;
- grant autonomous authority to Agent Mechanic;
- define application-specific business logic;
- claim production readiness merely because the architecture is documented.

## 17. Foundation acceptance

AMA foundation is considered structurally implemented when:

1. the architecture specification is committed;
2. a machine-readable Agent Manifest schema exists;
3. shared TypeScript model types exist;
4. first-class agent/workflow/command/capability distinctions are encoded;
5. authority/effect ceilings are encoded;
6. Agent Mechanic and Director boundaries are explicit;
7. version inheritance/migration rules are explicit;
8. the FFOS architecture references AMA without collapsing the existing Pius reserved boundary.

Runtime admission, registry persistence and production conformance automation are subsequent implementation work.
