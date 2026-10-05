# FFOS Phase 0 — Operational Spine

## Objective

Establish the minimum viable operating spine before broad domain integration.

## Work packages

### WP-00 — Repository and architecture
Status: BASELINE COMPLETE

- initialize canonical repository
- establish architecture baseline
- establish ADR discipline
- define control-plane boundary

### WP-01 — Vercel application shell
Status: CODE COMPLETE / VERCEL LINK BLOCKED

- Next.js application shell created under `apps/web`
- initial Dispatch Counter screen created
- navigation rooms created for Work, FFC, Conducellence, UDL, Pius, Knowledge and System
- Pius explicitly reserved / not implemented
- UDL represented as external destination / connector pending
- responsive visual baseline created
- Vercel project creation attempted 2026-10-05
- blocker: authenticated Vercel connection returned HTTP 403 `forbidden` for project creation
- Vercel team visible as `Linus Fast's projects` on Hobby plan, with no linked projects
- next action: resolve Vercel account/team project-creation permission, then link `Motherpher/FFOS` with root directory `apps/web`

### WP-02 — Authentication and authority
Status: NOT STARTED

- authenticated operations area
- Director authority class
- future collaborator roles

### WP-03 — Core object model
Status: NOT STARTED

- Programme
- Project
- Mission
- Work Package
- Run
- Dispatch
- Output
- Decision

### WP-04 — Registry
Status: NOT STARTED

- append-only event history
- object state registry
- provenance
- integration event records

### WP-05 — Dispatch Counter
Status: STRUCTURAL MOCK CREATED / LIVE DATA NOT STARTED

- active traffic
- holds
- failures
- ready dispatches
- completed dispatches

### WP-06 — Director Console
Status: NOT STARTED

- approval
- rejection
- return for rework
- hold
- governed override/waiver where applicable

### WP-07 — UDL connector
Status: CONTRACT STAGED / IMPLEMENTATION NOT STARTED

- `UDL_READY` route
- Director approval gate
- external deployment confirmation
- version/URL registration

### WP-08 — Conducellence room
Status: STRUCTURAL ROOM CREATED

- reserved first-class module surface
- no premature ontology lock

### WP-09 — FFC room
Status: STRUCTURAL ROOM CREATED

- assignment/project business surface
- later RAMx linkage

### WP-10 — Pius reserved room
Status: STRUCTURAL ROOM CREATED

- visible reserved state only
- no runtime implementation

## Phase 0 acceptance test

One real artifact must complete:

`Work → READY → UDL_READY → Director approval → UDL dispatch → confirmed result → registry CLOSED`

Phase 0 is not complete until this end-to-end flow works with a real artifact and preserved provenance.
