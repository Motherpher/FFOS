# FFOS Architecture Baseline

## Purpose

FFOS is the control plane for the wider Form & Flöde environment. It provides common state, dispatch, decision, registry and integration surfaces while preserving domain ownership.

## Director-defined target hierarchy (not deployed runtime)

```text
Human Director → CDX → FFC → FFOS
                             ├─ Agent Stable → AMA + Agent Mechanic + registered FFOS agents
                             └─ Pius → HCC (linked to CDX) + Piusites (built on AMA)
```

See [FFOS estate authority topology](FFOS-ESTATE-AUTHORITY-TOPOLOGY.md). Current repository surface layout and Pius RESERVED status below describe the implementation baseline, not an alternate target hierarchy.

## Top-level operating model

```text
FF Operating Environment
│
├── FFC
├── FFOS
├── Conductellence
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
├── Agent Master Architecture (AMA)
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

AMA is a cross-cutting execution architecture rather than another node in this business-object chain. Agent definitions, workflow/command bindings and capability registrations are governed control-plane objects attached to Runs, Dispatches, Decisions and evidence.

## Agent Master Architecture boundary

FFOS owns the Agent Master Architecture (AMA) for first-class FFOS agents.

AMA defines shared agent mechanics: identity, mandate, lifecycle, authority context, effect ceilings, workflows, commands, capabilities, state, evidence, evaluation, deployment compatibility, version inheritance and Agent Mechanic stewardship.

AMA does **not** implement the Pius runtime. It preserves the existing Pius reserved boundary while incorporating compatible governing principles for bounded artificial agency. Conductellence is an independent external governance and policy source for applicable consequential non-human execution, while FFOS owns its local enforcement points. Human mandate/Director decision, Pius/HCC constitutional doctrine, CDX policy, AMA agent contracts and execution are different authority planes, not a linear delegation chain. See [AMA authority topology](FFOS-ESTATE-AUTHORITY-TOPOLOGY.md).

New FFOS agents should be built against AMA. Existing agent families may be migrated only through explicit compatibility and conformance work.

Canonical specification: [AMA.md](AMA.md).

## Control plane / domain plane separation

FFOS stores orchestration metadata, state and provenance. It must not duplicate a domain repository's canonical source unless an explicit synchronization contract exists.

Examples:

- UDL source and site remain owned by UDL.
- Pius source remains owned by Pius repositories.
- FF-Spatial remains authoritative for spatial implementation.
- Conductellence remains authoritative for its constitutional, control, policy, assurance and evidence architecture until and after FFOS integration.
- FFC business/assignment logic may be surfaced in FFOS but retains its own domain semantics.

## Initial navigation

1. Counter
2. Work
3. FFC
4. Conductellence
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

AMA does not alter this status. AMA is the FFOS-native master architecture for FFOS agents; it is not a hidden Pius implementation.

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

## Conductellence boundary

Conductellence is a first-class external domain surface with its own FFOS room, but its canonical implementation remains in the Conductellence repository. FFOS must not absorb, fork or redefine Conductellence law, policy, control or evidence semantics.

The FFOS room may surface Conductellence status before integration, but runtime binding remains `NOT STARTED` until Conductellence has completed release closure and exposes an explicit versioned integration contract. Once binding begins, FFOS owns the local enforcement point while Conductellence remains the canonical governance source.

AMA execution contexts are designed to carry explicit authority/mandate references and effect classification so future CDX runtime enforcement can mediate consequential actions without importing mutable CDX law into AMA. Neither the `.cdx/anchor.json` nor this design proves application runtime binding.

## Architectural law

**Defined ≠ Implemented ≠ Connected ≠ Tested ≠ Canonical.**

FFOS must track these distinctions explicitly to prevent conceptual documentation from being mistaken for operational capability.
