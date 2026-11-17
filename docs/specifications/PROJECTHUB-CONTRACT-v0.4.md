# FFOS ProjectHub Contract v0.4

**Status:** DESIGN BASELINE — FFOS-DEVOPS-PH-RECON-001  
**Date:** 2026-11-16  
**Supersedes for new implementation:** ProjectHub Contract v0.3 semantics where explicitly changed below  
**Historical v0.3 remains preserved in Motherpher/form-flode.**

## 1. Identity

ProjectHub is the independently owned FFOS project operating subsystem.

It is:
- a native FFOS subsystem;
- the governed operational representation of a project through its lifecycle;
- methodology-selectable;
- source/provenance aware;
- capable of operating without FFC or Pius.

It is not:
- a Barnombudet deployment;
- an F&F Agent Stable agent;
- a Pius agency/Piusite;
- a mandatory front end to Pius;
- an accounting system;
- an unrestricted autonomous executor.

## 2. Canonical project chain

There is no single compulsory upstream methodology chain.

Canonical ProjectHub lifecycle:

```text
PROJECT INGRESS
    ↓
PROJECT CORE
    ↓
PROJECT FIELD
    ↓
GOVERNED PROJECT STATE
    ↓
DESIGN / WORK / RESOURCES / FUNDING / EVIDENCE / ACTORS
    ↓
DELIVERY / MONITORING / LEARNING
    ↓
CHANGE / REASSESSMENT / CLOSURE / MEMORY
```

Optional governed sources may enter the chain:

```text
FFC Assignment Dossier ─┐
DNA-Box / FF methods ────┤
Pius/PIVE outputs ───────┤──► Project Ingress / Project Field
External methodology ────┤
Owner-native material ───┘
```

No optional source becomes mandatory merely because ProjectHub supports it.

## 3. Methodology profiles

Every ProjectHub project declares exactly one active methodology profile.

### FULL_FF
The project explicitly adopts the current approved F&F/FFC assignment methodology. An Assignment Dossier, DNA-Box or other named FF methods may become governed project sources. Pius/PIVE outputs remain separately optional unless the project mandate explicitly requires them.

### CONFIGURED
The project declares a finite set of FFC/FF methods/components. Only those named components apply.

### PROJECT_NATIVE
The project operates under its owner's, client's or external methodology. No FF/Pius method, commercial assumption or organizational policy is inherited by default.

A profile change is a governed ProjectHub change and must preserve prior provenance.

## 4. Project ingress

`ProjectIngress` requires:

- project identity or creation request;
- project owner/mandate reference;
- methodology profile;
- project purpose/objective;
- source references;
- scope / non-scope;
- rights/data-class declaration;
- initial governance/acceptance conditions;
- provenance.

Optional:
- FFC assignment dossier reference;
- FFC component references;
- DNA-Box reference;
- Pius/PIVE dispatch references;
- resource/budget sources;
- external methodology references.

Ingress content cannot grant authority.

## 5. Project Core

Project Core is the current governed definition of what the project is.

Minimum dimensions:
- need/problem;
- purpose/intended movement;
- scope/non-scope;
- target groups/beneficiaries where relevant;
- mechanism;
- intervention/form;
- geography/time/scale;
- owner/governance;
- methodology profile;
- constraints;
- premises/unknowns.

Core identity is versioned and change-controlled.

## 6. Project Field

Canonical dimensions:

**Need · Purpose · Actors · Evidence · Mechanism · Resources · Funding · Outcomes**

Maturity vocabulary:

`UNKNOWN → SEED → DRAFT → DESIGNED → NORTH_STAR`

These are descriptive maturity states, not a universal score.

## 7. North Star

North Star is a scope-relative coherence state:

> the currently most coherent and sufficiently evidenced project configuration capable of pursuing its stated purpose within its actual scope, constraints and available resources.

North Star readiness must validate:
- dimension maturity;
- evidence existence and project scope;
- evidence provenance/state/freshness;
- material contradictions;
- strategic/design blockers;
- governance conditions.

A radar percentage may be used only as a visual projection, never as canonical truth.

## 8. Monitoring strata

ProjectHub monitors six substantive strata:

1. Strategic
2. Governance
3. Design
4. Delivery
5. Economy & Funding
6. Learning & Evidence

Each stratum must expose:
- status;
- source-backed signals;
- unknowns;
- staleness/freshness where relevant;
- linked decisions/evidence;
- trace references.

`UNKNOWN` is a valid first-class state and must not be rendered as healthy.

## 9. Operational domains

ProjectHub may own native implementations for:
- project governance, decisions, gates and change;
- work packages, deliverables, milestones and dependencies;
- project resources/capacity;
- project budget/forecast/funding state;
- premises/evidence;
- risk/issue/dependency/opportunity;
- linked artifacts;
- Project Steward proposals/actions;
- project monitoring and read models.

Where ProjectHub uses Pius/PIVE, UDL, FIELD or another separately canonical domain, ProjectHub stores governed references/derived project state and uses versioned adapters. It must not silently redefine the external domain's canonical protocol.

## 10. Economy and funding

Funding is a Project Field condition and operational domain, not the project's purpose.

Funding intelligence separates:
1. hard eligibility;
2. fit dimensions;
3. distortion/missionshift risk;
4. decision to pursue;
5. application;
6. award/agreement;
7. disbursement/reporting.

`discovered` or `qualified` never means secured.

PROJECT_NATIVE projects do not inherit F&F consulting rates, Barnombudet payroll rules or other unrelated economic assumptions.

## 11. Project Steward

Project Steward is an internal FFOS operational role, not a fleet agent identity.

Authority classes:

- **A0 Observe**
- **A1 Analyse**
- **A2 Draft/Propose**
- **A3 Governed reversible canonical mutation**
- **A4 External / financial / contractual / public effect**
- **A5 Mission / Project Core / DNA / policy redesign**

A0–A2 may be automated within authorized data scope.

A3 requires:
- ProjectHub authorization;
- validated transaction/idempotency/version conditions;
- applicable CDX decision/evidence;
- audit trace.

A4 requires separate action-specific human authority, applicable CDX mediation and target-system receipt.

A5 requires governing human decision/change control and is never a generic Steward mutation.

## 12. Rights and data classes

ProjectHub uses the PH-D0–PH-D5 classification defined by PH-WP02.

Project rights are project-scoped. Content cannot grant or enlarge authority.

PH-D5 secrets never become project content.

PH-D4 admission requires a separate explicit decision and controls beyond the first native release.

## 13. Canonical state and persistence

ProjectHub canonical writes must be:
- atomic;
- append-only/versioned in historical representation;
- idempotent;
- optimistic-concurrency protected;
- provenance complete;
- project-scope validated;
- rights checked before read/write;
- event/audit producing.

The current FFOS PostgreSQL/registry architecture is the starting technical substrate. Legacy SQLite/Twin is migration evidence only.

## 14. One project, many surfaces

ProjectHub owns cross-surface project semantics.

Specialized surfaces may include:
- Miro — collaborative/spatial working model;
- Figma — visual/interface design;
- GitHub — code/schema/provenance;
- Docs/Drive — source documents and deliverables;
- funding providers — provider-owned funding records;
- other external systems under explicit connector contracts.

No surface silently rewrites canonical ProjectHub state.

## 15. LinkedArtifact sync classes

- `REFERENCE`
- `DERIVED`
- `WORKING`
- `BIDIRECTIONAL_REVIEW`
- `CANONICAL_EXTERNAL`

Inbound working changes become review/change proposals unless a separate explicit external-authority contract permits otherwise.

## 16. Genealogy

Barnombudet ProjectHub is the practical predecessor and one-time design donor.

From the copy boundary onward:
- independent runtime;
- independent data/state;
- independent releases;
- independent roadmap;
- no automatic sync;
- explicit future ports only.

The donor snapshot remains provenance, never runtime dependency.

## 17. Release semantics

The following are distinct and may not be inferred:

`PROPOSED → IMPLEMENTED → TESTED → MERGED → RELEASED → DEPLOYED → ACCEPTED`

A historical ProjectHub operational acceptance does not constitute acceptance of the reconstituted native runtime.

## 18. Initial release boundary

The first native release does not authorize:
- autonomous contracting/payment/grant submission;
- automatic Pius routing;
- automatic Barnombudet sync;
- PH-D4 sensitive-data operation;
- broad public multi-tenant service;
- claims that optional external providers are live unless verified.

## 19. Supersession of v0.3

v0.4 changes one fundamental v0.3 rule:

**Pius/PIVE is no longer the compulsory first stage of the canonical ProjectHub chain.**

All v0.3 laws not contradicted here—genealogy independence, monitoring, North Star non-scoring, bounded Steward authority, staged external surfaces—are retained.

## 20. Implementation state

This contract is a design baseline. It becomes canonical for the reconstituted runtime only after the PH-WP13 Director release decision.
