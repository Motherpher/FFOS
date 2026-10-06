# FFOS Core Object Model v0.1

## Purpose

Define the minimum canonical object grammar for FFOS without absorbing domain-owned logic from UDL, Pius, Conductellence, Spatial or other repositories.

FFOS owns orchestration, state, dispatch, authority, provenance and cross-domain linkage. Domain repositories remain authoritative for their own internal models and protocols.

## Canonical hierarchy

`PROGRAMME → PROJECT → MISSION → WORK_PACKAGE → RUN → DISPATCH → OUTPUT → DECISION → NEXT_STATE`

This is an orchestration hierarchy, not a claim that every domain must internally use the same ontology.

## Shared base fields

Every FFOS object must carry:

- `id` — canonical immutable identifier
- `type` — object class
- `title` — human-readable label
- `status` — lifecycle state
- `version` — integer object version
- `createdAt`
- `updatedAt`
- `createdBy`
- `sourceSystem`
- `sourceRef` — optional external canonical reference
- `parentId` — optional immediate FFOS parent
- `tags`
- `provenance`

## Object classes

### Programme
Long-horizon operating container grouping multiple projects around a durable purpose.

### Project
Bounded assignment, initiative, product or development effort.

### Mission
A decision-relevant objective inside a project. Mission is the bridge between purpose and executable work.

### Work Package
A bounded unit of work with explicit objective, inputs, constraints, owner, acceptance criteria and lifecycle.

### Run
One execution instance of a protocol, workflow, analysis, build, evaluation or connector action. A run must preserve the invoked procedure, inputs, outputs and termination state.

### Dispatch
The transport/control object for moving a bounded instruction or artifact from an origin to one or more recipients/destinations. Dispatch is generic; domain-specific dispatch contracts are adapters.

### Output
A produced artifact or machine-readable result linked to the run and/or dispatch that produced it.

### Decision
A human or governed-system decision that changes state, authorizes progression, rejects, holds, waives or redirects work.

## Lifecycle states

### Work lifecycle
`DRAFT | READY | ACTIVE | HOLD | BLOCKED | COMPLETE | CANCELLED | ARCHIVED`

### Run lifecycle
`QUEUED | RUNNING | PASS | PASS_WITH_WARNING | FAIL | HOLD | SKIPPED | WAIVED | CANCELLED`

The generic FFOS run vocabulary deliberately includes the PIVE termination vocabulary because PIVE explicitly requires registry records for PASS, FAIL, HOLD, SKIPPED, WAIVED and PASS_WITH_WARNING; adapter-specific metadata remains outside the generic core.

### Dispatch lifecycle
`DRAFT | READY | AWAITING_APPROVAL | APPROVED | SENT | ACKNOWLEDGED | FAILED | HOLD | REJECTED | CLOSED`

### Decision lifecycle
`PROPOSED | REQUIRED | MADE | SUPERSEDED | REVOKED`

## Dispatch contract

Every dispatch must contain:

- `origin`
- `recipients[]`
- `destinationType`
- `payloadRefs[]`
- `instruction`
- `requiredInputs[]`
- `forbiddenMove` — optional
- `approvalRequired`
- `approvalAuthority`
- `state`
- `sentAt`
- `acknowledgedAt`
- `closedAt`
- `externalReceipt` — optional deployment/API/connector receipt

This preserves the operational logic found in PIVE dispatch sheets: recipient resolution, first move/instruction, required input, forbidden move/trap, dispatch logging and explicit run-state gating, without implementing Pius itself.

## Provenance

All state-changing operations must produce provenance sufficient to answer:

1. What changed?
2. Which object changed?
3. From what state to what state?
4. Who or what caused the change?
5. Which source/run/dispatch/decision justified it?
6. When did it happen?

`provenance` therefore contains one or more immutable references to source objects, source systems, commits, documents, runs, decisions or external receipts.

## Domain-boundary rules

- **Pius:** room reserved. FFOS may model generic `Run`, `Dispatch`, `Decision` and registry semantics but must not freeze current Pius command or runtime architecture into FFOS.
- **FIELD:** integration remains `PIUS_INTEGRATION_PENDING`; FFOS must not invent the future Pius placement. FIELD can later bind through an adapter while retaining its own internal architecture.
- **UDL:** UDL remains an external canonical destination/product. `UDL_READY` is a dispatch route/state convention, not a replacement for UDL's own model.
- **Conductellence:** remains a first-class external canonical domain with explicit adapter boundary.

## Authority

Authentication establishes actor identity. Authorization determines whether that actor may perform a state transition.

Phase 0 authority class:

`DIRECTOR`

Director-governed transitions initially include:

- approve dispatch
- reject dispatch
- hold dispatch
- close governed work
- later issue protocol-specific waiver/override only where the relevant domain contract explicitly permits it

## Registry compatibility

The object model is designed so WP-04 can implement an append-only registry. The registry will not mutate historical events; it will append state-transition events and derive current state.

## Versioning rule

Object identity is stable; object versions are monotonic integers. Material changes create a new object version. External domain references must include version/revision when available.

## Non-goals for v0.1

- no database implementation yet
- no Pius runtime implementation
- no FIELD/Pius binding
- no UDL publishing API implementation
- no Conductellence ontology duplication
- no multi-user RBAC beyond the Director authority placeholder
