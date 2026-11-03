# FFOS Operator Manual — source-linked practical guide v1.0

**Guide ID:** FF-GH-WP03-D20 · **Audience:** Human Director; authorised FFOS operator; repository maintainer; reviewer  
**Status:** DG-03 bounded documentation pilot accepted ([Director decision](https://github.com/Motherpher/FFOS/issues/45#issuecomment-6599403434)); independently observed operator usability and production-runbook certification remain **NOT VERIFIED**.  
**Reconciled:** 2026-11-03 against FFOS current `main` source files.  
**Authority:** This is an **interpretive guide**. Canonical architecture is [FFOS README](../../README.md), [Authority Topology](../architecture/FFOS-ESTATE-AUTHORITY-TOPOLOGY.md), [Object Model](../specifications/OBJECT-MODEL.md) and [AMA source](../../agent-stable/ama/README.md).  
**Access:** FFOS private repository. Never insert credentials or personal data into an Issue, Project or example.

> **Critical distinction:** A document describing a command, route, agent, integration or release is **not** proof that it works in the deployed environment. Source presence ≠ implementation ≠ connection ≠ passing tests ≠ Director acceptance ≠ production activation.

## 1. What you are operating

FFOS is the Form & Flöde operational/control shell. It coordinates work, dispatch, decisions, state, registry and external domain links **without absorbing those domains' canonical source**.

The Director-defined **target** organisational containment is:

`Human Director → CDX → FFC → FFOS → {Agent Stable, Pius}`

Within the target: Agent Stable contains AMA, Agent Mechanic and the small registered FFOS fleet; Pius retains HCC and Piusites with AMA compatibility and HCC↔CDX governance linkage. **Target containment is not proof of runtime delegation or software connectivity.**

For everyday use, think of three distinct surfaces:

1. **Canonical system source:** FFOS repository, domain repositories and registered decisions — where specifications, code and evidence live.
2. **Operational projection:** [Motherpher Estate Portfolio](https://github.com/orgs/Motherpher/projects/2), GitHub Issues, Pull Requests and generated dashboards — where work is visible.
3. **Runtime and effect boundary:** actual connected services, local control checks and registered evidence — only functioning when independently deployed and verified.

Do not promote a value from surface 2 into a claim about surface 3.

### Current implementation position

| Component | Verified source status | What an operator may conclude |
| --- | --- | --- |
| FFOS technical repository | Architectural and Agent Stable baseline merged on `main` | Source is present; not all runtime is bound or deployed |
| FFOS web application | `apps/web/README.md`: `STAGED` | Do **not** claim a production console is available from the planned route map |
| AMA | Agent construction and lifecycle contract; source README reports FOUNDATION 0.1.0 | Contract available; **not** equivalent to accepted AMA v1.0 release |
| Agent Mechanic | Technical conformance role/function in Agent Stable | Maintenance is not an independent Director approval |
| MESSI (#1) | `DRAFT_NOT_IMPLEMENTED` in fleet registry | No operational agent may be invoked by assumption |
| Household Family (#2) | `IMPLEMENTATION_CANDIDATE_NOT_PRODUCTION_ACCEPTED`; implementation merged to `main` | Not a production-accepted or self-authorising agent |
| Pius runtime | `RESERVED / PENDING` in FFOS baseline | No FFOS runtime invocation is documented as working |
| UDL integration | External destination / controlled dispatch architecture | Do not claim a functioning publish API without connector evidence |
| CDX runtime binding | Governance anchor and relevant CI are not proof of full runtime enforcement | Inspect actual policy/effect gate evidence; [CDX blocker](https://github.com/Hybrismannen/Conductellence-/issues/7) remains source of open work |

**Important:** These are status observations from the named source baselines, **not** a fresh deployed-runtime penetration or acceptance test.

## 2. Start-here navigation

For a Director needing to find work today:

1. Open [Motherpher Estate Portfolio](https://github.com/orgs/Motherpher/projects/2). Confirm the Project is **private**.
2. Open **Estate Overview** for the mixed-programme work index.
3. Open **Director Decisions** to see items that require explicit human disposition. The view is a **queue**, not an approval mechanism.
4. Open **Risks & Blockers** for dependency/verification problems; use each Issue's native link.
5. Select the **source repository Issue**. Read its body, latest comments, related PRs, tests and canonical references.
6. Consult its authoritative specification, not just its Project `Status`.
7. Record a decision in an appropriate **source Issue/decision record** with scope, effect, conditions and evidence. Do not use `Status: Done` as a signature.
8. Check the Project is subsequently updated as a **projection** of that decision, including `Authority Gate` and `Evidence Reference`.

The portfolio currently uses separate custom fields: `Programme`, `Work Stage`, `Work Type`, `Priority`, `Authority Gate`, `Canonical Object ID`, `Evidence Reference`, `Dependency Reference`, `Target Date`. Built-in `Status` is for work planning; it is **not** the canonical lifecycle.

**Built-in automation warning:** `Auto-close issue` was verified **OFF** at the WP02 gate. `Item closed` / `Pull request merged` may still change Project Status. Never interpret an automatic Project state change as acceptance.

## 3. Interpret the work objects

The [canonical FFOS object model](../specifications/OBJECT-MODEL.md) defines:

`Programme → Project → Mission → Work Package → Run → Dispatch → Output → Decision → Next State`.

An operator should distinguish:

- **Programme:** long-horizon purpose and connected projects.
- **Project:** bounded endeavour.
- **Mission:** decision-relevant objective.
- **Work Package:** bounded scope, source inputs, constraints, expected outputs and acceptance conditions.
- **Run:** an execution attempt linked to procedure, parameters, outputs and terminal status.
- **Dispatch:** transport/control of bounded instructions to a domain or recipient.
- **Output:** linked artefact or result.
- **Decision:** explicit authorisation, rejection, hold, waiver or state-changing act.
- **Next State:** recorded and traceable transition after the required evidence/decision.

Generic object states (for example `READY`, `ACTIVE`, `HOLD`, `BLOCKED`, `COMPLETE`) are not interchangeable with AMA lifecycle states or GitHub Project `Status`.

A `Run: PASS` alone is **not** a Director-approved work package unless the governing source says the run is sufficient for that acceptance gate.

## 4. Operating a governed work package

This is the **required governance sequence**, not a claim that one end-to-end UI wizard is already deployed.

### Step A — Understand the mandate

Record the Director's bounded objective, authorised repository/domain, work-package ID, inputs and non-goals. Do not infer a mandate from GitHub write privileges.

Confirm the owning source repository. For UDL, use UDL's repo. For Pius, use Pius's current authoritative development, not historical Codex 5 as deployed Pius 6. For CDX, use Conductellence as constitutional source.

### Step B — Resolve dependencies and prohibitions

Inspect original Issues, PRs, decision records, relevant specification versions and active blockers. Identify whether work requires independent CDX evaluation, local authority enforcement, an AMA contract, a domain gate or explicit human approval.

If policy services are unavailable for a consequential effect, **hold**; do not invent a pass or execute outside the authorised boundary.

### Step C — Make work observable

Use the repository's existing issue/work-package identifier and link to the portfolio. Keep planning fields accurate; create a new Issue only if no suitable canonical source work item exists.

Avoid recreating existing Issues or renumbering work packages.

### Step D — Execute only approved actions

Code or documentation changes should be done on a bounded branch and reviewed through a Pull Request where required by source governance. Tests and CI are implementation evidence. A merged PR alone is not acceptance, and a source branch is not production.

No operator may self-amplify permissions or substitute automated labels for valid Director decisions.

### Step E — Verify independently and report

A verifier checks the actual changed files, commits and tests; for runtime claims, check the **deployed** component and its dependencies. Record PASS, PASS_WITH_WARNING, HOLD or FAIL as applicable, with explicit reasons.

Report remaining unverified conditions; never treat a missing result as zero or a pass.

### Step F — Obtain acceptance, then project status

The Director or other independently authorised party makes the formal acceptance or hold decision. Register its traceable reference before setting `Authority Gate = Approved (Source Recorded)` in the Project.

Closure of an Issue is an administrative action governed by the owning repository. It must not close unrelated work or conceal unverified dependencies.

## 5. Using GitHub as the operational projection

The live private Project is [Motherpher Estate Portfolio #2](https://github.com/orgs/Motherpher/projects/2). It was accepted as a **bounded WP02 pilot** under [DG-02](https://github.com/Motherpher/FFOS/issues/43#issuecomment-6591480963), including explicit limits.

### Portfolio views

| View | Intended interpretation |
| --- | --- |
| Estate Overview | Source-linked portfolio table |
| Workflow Board | Planning state board; grouping by programme not independently validated |
| Director Decisions | Human-gate cases; view entry does not grant approval |
| Risks & Blockers | Source issues needing resolution |
| Verification Queue | Work awaiting evidence/review |
| Roadmap — Dates Pending | Roadmap surface; no official schedule until adopted |
| Release Readiness | Candidate releases, **not** released systems |
| Source Reconciliation | Issues that need provenance/metadata review |

The Project **does not** currently guarantee full automatic Issue intake or complete role-by-role privacy testing. These are accepted limits of the WP02 pilot to be addressed in later hardening.

### Example — AMA release gate

1. Open [AMA-FIN-05](https://github.com/Motherpher/FFOS/issues/41). It explicitly requires preceding FIN gates, Director adoption and a protected, evidenced release.
2. Check [AMA-FIN-04](https://github.com/Motherpher/FFOS/issues/40), the independent technical audit.
3. Check [AMA-M7-A](https://github.com/Motherpher/FFOS/issues/42), the blocked CI/external verification evidence.
4. Treat [PR #34](https://github.com/Motherpher/FFOS/pull/34) as a candidate until source evidence says otherwise.
5. **Do not** declare AMA v1.0 released simply because the candidate PR merged or a Project card moved to Done.

### Example — CDX runtime gate

[CDX-BLOCK-ESTATE-RUNTIME-001](https://github.com/Hybrismannen/Conductellence-/issues/7) distinguishes repository-level anchors/CI from `VERIFIED_RUNTIME_BOUND`. For a runtime claim, inspect enforcement-point identification, pinned policy context, fail-closed tests, pre-effect policy decision and SPETL evidence. A green README badge cannot replace this.

## 6. Agent Stable, AMA and current capability boundaries

AMA applies to first-class agents admitted under its contract, not to every workflow or code module.

- **Director:** external governing authority. Decides purpose, mandate, approval, acceptance and lifecycle.
- **Agent Stable:** FFOS subsystem for identity, conformance, registries and lifecycle infrastructure — **not an agent**.
- **AMA:** construction/compatibility contract — **not an agent** and not a source of permission.
- **Agent Mechanic:** technical conformance and maintenance role — cannot enlarge mandates or self-accept.
- **MESSI:** registered identity #1, draft and not implemented.
- **Household Family:** registered identity #2, source implementation candidate. Janitor, Handyman and Verifier are **internal roles**, not separate fleet members.
- **Cashin, Carpenter, Evaluate, Research:** MESSI workflow/command/capability candidates, not fleet agents.
- **Piusites:** separate Pius-governed agents in the target architecture. Their AMA compatibility does not override the Pius Codex/HCC controls or establish active runtime availability.

**Prohibited operator interpretation:** "The feature is listed in AMA, therefore I can invoke it through FFOS." First determine whether a verified command binding, runtime service, authority and available credentials exist. If any are missing, mark **NOT VERIFIED / NOT AVAILABLE** and escalate.

## 7. Governance, evidence and acceptance

### Evidence minimum

For consequential or governed work, retain:

- Source object / canonical ID and repository.
- Exact commit SHA, contract or policy version.
- Who requested the action and who performed it.
- Target and effect class.
- Required mandate/authority references.
- Tests and outcomes, including failure cases.
- Independent verification where required.
- Director decision reference with scope and date.
- Remaining blockers and authorised next state.

Never put tokens, passwords, private healthcare data, children’s data or unrelated client records into Project notes.

### Meaning of common states

| Observed statement | What it proves | What it does **not** prove |
| --- | --- | --- |
| README or architecture exists | Documented intention / source present | Deployed function |
| `main` contains implementation | Code at a revision | Live integration or production |
| CI PASS | Specific check passed at a revision | Entire governance accepted |
| GitHub Issue closed | Administrative Issue closure | Constitutional/Director approval |
| Project Work Stage Accepted | A projection of acceptance | Acceptance without a source decision |
| Release tag | Identifiable source release | Correct deployed version and authority |
| Runtime verification evidence | Tested behaviour in bounded environment | Acceptance of different system/revision |

## 8. Troubleshooting and escalation

**I cannot find a command.** Search [AMA](../../agent-stable/ama/README.md), current [workflow registry](../specifications/WORKFLOW-COMMAND-REGISTRY.md), local implementation and tests. Distinguish a registered candidate command from a deployed, callable command. Do not invent syntax.

**The Project says Done but the source says HOLD.** Treat the canonical issue/decision and its evidence as authoritative. Check the built-in status workflow; update the Project's projection rather than editing source state to fit the board.

**A required policy gate is unavailable.** Put work in HOLD; preserve exact failure and escalation reference. Do not bypass enforcement for convenience.

**An agent is defined but unresponsive.** Inspect [fleet registry](../../agent-stable/registry.json) first. It may be DRAFT or IMPLEMENTATION CANDIDATE and therefore not supposed to respond.

**Pius or UDL integration does not work.** Inspect source-owned integration state. Pius is RESERVED in current FFOS baseline, UDL is an external dispatch destination. Avoid creating a second implementation under FFC `17-ffos`.

**A guide contradicts implementation.** Open a discrepancy Issue with the guide location, authoritative source path/version, actual observation and severity. Do not silently change a canonical contract from a handbook.

**No verification is available.** Mark `NOT_VERIFIED` or `HOLD`; ask for the missing test, source commit or qualified reviewer. Do not turn absence of evidence into PASS.

## 9. Operator case — one bounded work package

**Illustrative, not an executed run:** An FFOS work package requires preparation of an external UDL evaluation export.

1. Identify the FFOS Work Package, responsible Director, desired output and UDL-owned target. Keep UDL's content/data semantics outside FFOS.
2. Determine whether a valid UDL connector has been implemented and tested. If it has not, the dispatch remains `HOLD` or `PENDING`, regardless of the proposed route.
3. If an approved connector exists, prepare a [Dispatch Object](../specifications/DISPATCH.md) recording `dispatch_id`, source version, target, action, approval requirement, Director decision reference and result receipt.
4. Director review occurs **before** a consequential dispatch where specified. Do not use GitHub Project state as approval.
5. Capture actual connector response and destination confirmation if executed. A documented dispatch model does not make the transfer real.
6. Verify output and register the outcome. Only then may an authorised actor accept work and project the state into GitHub.

The point is to preserve the complete line from intent through evidence and acceptance, not to make an unimplemented integration look operational.

## 10. Glossary and reference directory

- **Canonical source:** repository/model/document whose governance actually owns the concept.
- **Projection:** a filtered view of source state, not the upstream authority.
- **Mandate:** explicit bounded grant from a competent authority.
- **Capability:** implemented action possibility; **not** authorisation.
- **Effect gate:** control at a consequential execution point.
- **AMA:** Agent Master Architecture for first-class agents, independent of named agents.
- **HCC:** Pius-specific ethical/moral oversight, distinct from Agent Mechanic.
- **SPETL:** CDX evidence/decision logging surface required by its runtime contract.
- **Acceptance:** an independently authorised disposition with verifiable scope and evidence.
- **BROWNFIELD:** functioning inherited implementation whose target architectural compliance is not necessarily established.

### Canonical references

- [FFOS README](../../README.md) · [Current technical architecture](../architecture/ARCHITECTURE.md) · [Target topology](../architecture/FFOS-ESTATE-AUTHORITY-TOPOLOGY.md).
- [Source structure](../architecture/REPOSITORY-STRUCTURE.md) · [Object model](../specifications/OBJECT-MODEL.md) · [Dispatch specification](../specifications/DISPATCH.md).
- [Agent Stable](../../agent-stable/README.md) · [Fleet registry](../../agent-stable/registry.json) · [AMA](../../agent-stable/ama/README.md) · [Household Family](../../agent-stable/agents/02-household-family/README.md).
- [CDX runtime blocker](https://github.com/Hybrismannen/Conductellence-/issues/7) · [DG-02 portfolio acceptance](https://github.com/Motherpher/FFOS/issues/43).
- [GitHub documentation standard](../governance/github-documentation/WP03-DOCUMENTATION-TAXONOMY-AND-PROVENANCE-v1.0.md).

**Change control:** Update this guide through a reviewed Pull Request when its source contracts, operational status or steps change. The Operator Manual is **not** a general warrant for autonomous execution, and cannot override a source contract. **DG-03 accepted this bounded interpretive guide, with documented validation limitations.** It is not a certified runtime operating procedure or a substitute for the canonical source.
