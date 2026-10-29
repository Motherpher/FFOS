# ADR-0004 — Adopt universal Agent Master Architecture (AMA)

**Status:** ACCEPTED FOR FOUNDATION IMPLEMENTATION  
**Date:** 2026-10-28  
**Scope:** Universal agent-independent master contract

## Context

The operational environment requires independently governed agent construction, lifecycle, permission boundaries, execution, evidence, conformance and upgrade compatibility. Without a common architecture, separate implementations can introduce incompatible mandates, uncontrolled permissions, ambiguous workflow identities or unverifiable acceptance claims.

## Decision

Adopt **Agent Master Architecture (AMA)** as the common, reusable agent contract. It defines:

- first-class agent identity and versioned manifest;
- mandatory mandate, non-goals and effect ceilings;
- registered workflows, commands, capabilities and optional modules;
- input/output/state and lifecycle contracts;
- authority and policy interfaces without hardcoding providers;
- execution evidence, evaluation and independent acceptance;
- drift, compatibility and upgrade/rollback mechanisms.

The canonical specification is `docs/architecture/AMA.md`.

**Purity requirement:** The AMA master contract, manifest specification and general conformance specification must not mention or define any particular agent, named workflow, domain taxonomy, host organizational hierarchy or migration candidate. These belong in separate versioned integration and implementation artifacts.

## Consequences

- Every first-class agent must pass the common admission gates.
- A workflow, command, capability or internal role is not automatically a first-class agent.
- Technical stewardship is distinct from human mandate authority and independent acceptance.
- A passing static schema test does not imply deployment, runtime validation or authorization.
- Shared version upgrades preserve agent-specific permissions, mandates and acceptance requirements.
- Additional domain governance may constrain implementations but cannot silently rewrite the universal template.

## Scope boundaries

Host governance and estate structure belong in the host architecture documents. Particular agent implementations, their named workflows and migration schedules belong in their own implementation workstreams. None is part of AMA's normative master definition.
