# FFOS Architecture Baseline

## Purpose

FFOS is the control plane for the wider Form & Flöde environment. It provides common state, dispatch, decision, registry and integration surfaces while preserving domain ownership.

## Top-level operating model

```text
FF Operating Environment
│
├── FFC
├── FFOS
├── Conducellence
├── UDL
├── Pius [RESERVED]
├── Knowledge
└── System

FFOS runtime spine
│
├── Work
├── Dispatch
├── Director Decisions
├── Registry
├── Integration Events
└── Audit Trail
```

## Canonical object chain

```text
Programme
  → Project
  → Mission
  → Work Package
  → Run
  → Dispatch
  → Output
  → Decision
  → Next State
```

The chain may be extended, but existing object meanings must not be silently changed.

## Control plane / domain plane separation

FFOS stores orchestration metadata, state and provenance. It must not duplicate a domain repository's canonical source unless an explicit synchronization contract exists.

Examples:

- UDL source and site remain owned by UDL.
- Pius source remains owned by Pius repositories.
- FF-Spatial remains authoritative for spatial implementation.
- FFC business/assignment logic may be surfaced in FFOS but retains its own domain semantics.

## Initial navigation

1. Counter
2. Work
3. FFC
4. Conducellence
5. UDL
6. Pius
7. Knowledge
8. System

## Pius boundary

Pius has a reserved room only. Until the Pius redevelopment establishes the canonical runtime contract, FFOS must not implement old Codex structures as current runtime truth.

Required visible status:

- Runtime: RESERVED
- Integration: PENDING
- Canonical source: external Pius repositories
- FFOS binding: NOT STARTED

## UDL boundary

UDL is an external destination. FFOS will support controlled publication through dispatch rather than direct uncontrolled writes.

Initial desired flow:

```text
Work artifact
  → UDL_READY
  → Director review
  → APPROVED_FOR_UDL
  → UDL connector
  → deployment result
  → version / URL registered
  → dispatch CLOSED
```

## Conducellence boundary

Conducellence is a first-class domain surface with its own room, future objects and dispatch interfaces. Its ontology is intentionally not fixed in this baseline.

## Architectural law

**Defined ≠ Implemented ≠ Connected ≠ Tested ≠ Canonical.**

FFOS must track these distinctions explicitly to prevent conceptual documentation from being mistaken for operational capability.
