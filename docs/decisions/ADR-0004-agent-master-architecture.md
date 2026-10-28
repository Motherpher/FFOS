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

The **Director** retains architectural purpose/mandate authority. The **Agent Mechanic** owns technical conformance and maintenance mechanics but cannot authorize semantic or authority expansion.

Conductellence remains the external constitutional authority source for consequential non-human execution. FFOS owns its local enforcement points.

## Consequences

- New FFOS agents must target AMA rather than inventing independent architectures.
- Existing Household is not automatically AMA-compliant; it will be migrated later.
- J0/J1/J2 remain Household semantics, not AMA primitives.
- Commands/workflows do not become agents by naming convention.
- AMA version upgrades require compatibility, regression and rollback handling.
- The existing FFOS Pius boundary remains intact: AMA is FFOS agent architecture informed by Pius doctrine, not an implementation of the Pius runtime.
