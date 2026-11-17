# FFOS ProjectHub UX & Control Room Architecture v0.1

**Process:** FFOS-DEVOPS-PH-RECON-001  
**WP:** PH-WP05  
**State:** DESIGN COMPLETE  
**Design lineage:** Barnombudet overview-first grammar, independently reimplemented for FFOS.

## 1. UX law

The ProjectHub UI is a projection of canonical ProjectHub state. It is not a second project database.

The interface must answer, in order:

1. What needs attention?
2. Which project and why?
3. What changed?
4. What decision/action is required?
5. What evidence supports it?
6. What happens if nothing is done?
7. What authority is required?

## 2. Global navigation

### Overview
Portfolio pulse, Director/action queue, deadlines, blocked work, funding/economic attention, stale evidence and Project Steward proposals.

### Projects
Portfolio/bank with filters for methodology profile, status, owner, monitoring state, North Star state, funding state and deadlines.

### Deadlines
Cross-project milestones, application/reporting deadlines, review dates and evidence freshness.

### Steward Queue
A2 proposals, A3 approval requirements, A4/A5 escalations and reconciliation-required actions.

### System & Trace
Data freshness, integration state, failed sync, unresolved receipts, audit trace and provider status.

## 3. Project detail navigation

One project opens:

- **Pulse** — executive project state and attention;
- **Core & Field** — Project Core + Project Field spider/radar + North Star assessment;
- **Work** — work packages, deliverables, milestones, timeline, dependencies;
- **People & System** — actors, relationships, FIELD/Helix derived view where available;
- **Economy** — resources, RAMx/capacity, budget versions, forecast, actual refs, funding gap;
- **Funding** — opportunities, eligibility, distortion, applications, awards, obligations;
- **Evidence** — premises, sources, evidence state, contradictions, freshness;
- **Outcomes & Learning** — outcome/indicator/measurement/UDL-linked views;
- **Decisions & Change** — decisions, gates, change requests, RAIDO;
- **Artifacts** — Miro/Figma/GitHub/Docs/provider links and sync status;
- **Steward** — proposals/actions/approval state;
- **Trace** — versions, events, authority, provenance, receipts.

## 4. Control Room

Control Room is a high-information operational view, not a decorative dashboard.

Primary regions:

### Project Pulse
- current phase/status;
- methodology profile;
- North Star state;
- top blockers/attention;
- next milestone/deadline;
- owner/authority.

### Monitoring Strata
Six horizontal/radial strata with explicit:
- OK;
- ATTENTION;
- BLOCKED;
- UNKNOWN.

Status always links to source signals.

### Project Field
Eight-spoke visual:
Need / Purpose / Actors / Evidence / Mechanism / Resources / Funding / Outcomes.

Geometry is derived from maturity state only. Numeric visual coordinates are non-canonical.

### Work / Timeline
Milestones, dependency blocks, slippage and critical path/chain where supported.

### Economy / Funding
Budget version, forecast, actual-source status, funding secured/applied/gap and obligations. UNKNOWN remains UNKNOWN.

### Evidence / Learning
Premise state, evidence gaps, freshness and outcome/learning signal.

### Steward
Prioritized proposals grouped by A0–A5 and required authority.

### Traceability rail
Latest changes, decisions, versions, source provenance and external receipts.

## 5. Barnombudet design inheritance

Transferred as design principles:
- overview first;
- next actions/deadlines visible early;
- project/funding/application state understandable without repository navigation;
- system freshness/history exposed;
- sensitive transitions require human approval.

Not copied:
- Barnombudet information architecture as a fixed template;
- Barnombudet data;
- Swedish-only product assumption;
- Barnombudet funding corpus;
- Barnombudet branding.

## 6. Methodology profile UX

The active methodology profile is visible in Project Pulse.

### PROJECT_NATIVE
The UI must not display missing FFC/Pius components as deficiencies.

### CONFIGURED
Only selected FFC components appear in methodology/completeness views.

### FULL_FF
The UI may expose Assignment Dossier/DNA/FFC/Pius-linked artefacts where present and valid.

This prevents ProjectHub from visually coercing every project into F&F methodology.

## 7. Authority UX

The UI visually separates:
- informational status;
- proposal;
- internal governed mutation;
- consequential external effect;
- mission/core redesign.

A user must never be able to mistake “drafted”, “approved” and “executed” for the same state.

A4/A5 actions require an explicit escalation surface; no generic “Save” button may perform them.

## 8. Rights/privacy UX

- PH-D2+ content is not included in portfolio cards unless authorized.
- PH-D3 participant identity is hidden from analytical dashboards by default.
- small-N subgroup views must support suppression policy.
- PH-D4 material is outside first-release scope.
- secrets never render from ProjectHub objects.

## 9. Linked work surfaces

Artifacts show:
- system;
- artifact type;
- source authority;
- canonicality;
- sync policy;
- version/freshness;
- pending review;
- last receipt.

External edits never appear as canonical ProjectHub change until reviewed/accepted under the configured policy.

## 10. Responsive modes

### Desktop
Full Control Room and deep project workspace.

### Tablet
Operational project views, decisions and Steward queue.

### Mobile
Attention, deadlines, approvals, project pulse and trace; not full complex diagram editing.

## 11. Visual system

Use the canonical FFOS visual system when available.

ProjectHub may introduce reusable domain components:
- Project Pulse card;
- Stratum bar;
- Project Field radar;
- North Star badge/gate;
- Evidence state chip;
- Steward action card;
- Funding pipeline;
- Decision gate;
- Trace rail.

Do not infer canonical brand colours from historical screenshots. Figma may later own approved visual component design; ProjectHub owns the semantic component contract.

## 12. Initial implementation routes

Target protected routes:

- `/projecthub`
- `/projecthub/projects`
- `/projecthub/projects/[projectId]`
- `/projecthub/deadlines`
- `/projecthub/steward`
- `/projecthub/system`

Target API prefix:

- `/api/projecthub/*`

## 13. Acceptance

PH-WP10 UI is not complete because a mock page exists. Acceptance requires real source-backed data, authorization, empty/unknown/error states, and tested distinction between proposals, canonical mutations and external effects.

## Exit

**PH-WP05 DESIGN COMPLETE.**
