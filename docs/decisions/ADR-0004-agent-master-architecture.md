# ADR-0004 — Adopt Agent Master Architecture (AMA)

**Status:** ACCEPTED FOR FOUNDATION IMPLEMENTATION  
**Date:** 2026-10-28

## Context

FFOS already has a control-plane architecture, Director authority boundary, object model and external CDX governance anchor. Earlier FFOS/FFC development also contains a Household implementation with Director/Janitor/Handyman mechanics, but Household is a domain-specific agent family and cannot serve as the master definition for all future agents.

Pius agent doctrine requires modular, bounded, registered agents whose capabilities do not become sovereignty. FFOS therefore needs a shared agent architecture before additional agents are implemented or existing agent families are generalized.

## Decision

Adopt **Agent Master Architecture (AMA)** as the common FFOS agent contract.

AMA owns the shared mechanics for:

- first-class agent identity and lifecycle;
- versioned manifests;
- workflows and commands;
- capabilities and effect ceilings;
- runtime/state boundaries;
- authority/mandate context;
- evidence and observability;
- evaluation/conformance;
- deployment compatibility;
- synchronized version inheritance;
- Agent Mechanic maintenance.

The **FFOS Director**, acting under an explicitly authorized human mandate, governs agent purpose, operational mandate and acceptance inside FFOS. This does not make the FFOS Director the Supreme Director of the Pius universe or confer automatic waiver rights. The **Agent Mechanic** owns technical conformance and maintenance mechanics but cannot authorize semantic or authority expansion. HCC moral oversight and Pius/APz orchestration are distinct Pius domains; FFOS does not claim to implement their runtime.

Conductellence (CDX) remains an **independent estate-governance and policy source** for applicable consequential non-human execution. It does not acquire the human principal's sovereignty or FFOS dispatch rights. FFOS owns its local enforcement points; an anchor or CI binding is not verified runtime enforcement. The cross-system relationship is a multi-plane topology, **not** a linear Pius → CDX → AMA authority delegation. See `docs/architecture/AMA-AUTHORITY-TOPOLOGY.md`.

## Consequences

- New FFOS agents must target AMA rather than inventing independent architectures.
- Existing Household is not automatically AMA-compliant; it will be migrated later.
- J0/J1/J2 remain Household semantics, not AMA primitives.
- Commands/workflows do not become agents by naming convention.
- AMA version upgrades require compatibility, regression and rollback handling.
- The existing FFOS Pius boundary remains intact: AMA is FFOS agent architecture informed by Pius doctrine, not an implementation of the Pius runtime.

## Director hierarchy clarification — 2026-10-29

The Director-defined target is **Human Director → CDX → FFC → FFOS**, with **Agent Stable (AMA, Agent Mechanic audit/conformance, and registered FFOS agents)** and **Pius (HCC linked to CDX; Piusites built on AMA)** inside FFOS. This supersedes earlier target *containment* diagrams showing these components as peers, but does not assert Pius runtime readiness or abolish CDX/HCC-specific gates. Refer to `docs/architecture/AMA-AUTHORITY-TOPOLOGY.md`.
