# FFOS Phase 0 — Operational Spine

## Objective

Establish the minimum viable operating spine before broad domain integration.

## Work packages

### WP-00 — Repository and architecture
Status: STARTED

- initialize canonical repository
- establish architecture baseline
- establish ADR discipline
- define control-plane boundary

### WP-01 — Vercel application shell
Status: NOT STARTED

- Next.js application
- production/preview environments
- initial navigation shell
- private operations surface

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
Status: NOT STARTED

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
Status: NOT STARTED

- `UDL_READY` route
- Director approval gate
- external deployment confirmation
- version/URL registration

### WP-08 — Conducellence room
Status: NOT STARTED

- reserved first-class module surface
- no premature ontology lock

### WP-09 — FFC room
Status: NOT STARTED

- assignment/project business surface
- later RAMx linkage

### WP-10 — Pius reserved room
Status: NOT STARTED

- visible reserved state only
- no runtime implementation

## Phase 0 acceptance test

One real artifact must complete:

`Work → READY → UDL_READY → Director approval → UDL dispatch → confirmed result → registry CLOSED`

Phase 0 is not complete until this end-to-end flow works with a real artifact and preserved provenance.
