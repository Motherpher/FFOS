# FFOS — Form & Flöde Operating System

FFOS is the central operating shell for Form & Flöde. It coordinates work across domains without absorbing their canonical repositories.

## Core rules

1. **FFOS owns orchestration, not every domain.** Existing repositories remain authoritative for their own systems, methods and products.
2. **Domain repositories stay canonical.** UDL owns UDL; Pius owns Pius; FF-Spatial owns spatial; other domain repositories keep their own source, history and releases.
3. **Pius is reserved only.** No Pius runtime, command surface or architecture is implemented here until the current Pius redevelopment is complete and explicitly integrated.
4. **UDL is an external dispatch destination.** FFOS will support an `UDL_READY` state and a controlled dispatch flow to the UDL site/repository.
5. **Conductellence (`CDX`) is a first-class external domain room.** Its canonical source remains the Conductellence repository. FFOS may surface its state, but must not copy or redefine its constitutional source. Runtime binding begins only after Conductellence release closure through an explicit versioned integration contract.
6. **Human authority remains explicit.** Director approval, waiver, hold and rejection states must be represented in runtime state, not implied in prose.
7. **No fake integration.** A documented protocol is not considered connected until its software binding is implemented, tested and registered.
8. **CDX anchoring is mandatory.** FFOS maintains its local Conductellence governance hook at `.cdx/anchor.json`; CDX publishes governance outward while FFOS owns its local enforcement point.
9. **FFOS agents share one master architecture.** First-class agents are built against Agent Master Architecture (AMA); workflows, commands, capabilities and internal roles are not promoted into agents without independent governance need.

## Agent Stable and Agent Master Architecture

The Director-defined target containment is `Human Director → CDX → FFC → FFOS`, with **Agent Stable** (`AMA`, `Agent Mechanic`, and the registered FFOS fleet: **#1 MESSI, #2 Household Family**) and **Pius** (HCC linked to CDX, Piusites built on AMA) inside FFOS. This is a target architecture; Pius integration remains reserved. See `docs/architecture/AGENT-STABLE.md` and `docs/architecture/FFOS-ESTATE-AUTHORITY-TOPOLOGY.md`.

AMA is the shared FFOS contract for first-class agents: identity, mandate, authority context, effect ceilings, workflows/commands, capabilities, state, evidence, evaluation, deployment compatibility and lifecycle.

Director is external governing authority and governs purpose, mandate, priorities and acceptance. Agent Mechanic governs technical conformance and maintenance mechanics. Neither an agent nor Agent Mechanic may self-authorize an expansion of authority.

AMA does not implement Pius inside FFOS and does not replace Conductellence. See `docs/architecture/AMA.md`.

## Initial application spaces

- Counter
- Work
- FFC
- Conductellence
- UDL
- Pius — reserved
- Knowledge
- System

## First operational vertical slice

`Work → Ready → Dispatch → Director approval → UDL → deployment confirmation → Registry closed`

## Repository structure

```text
apps/web/              Vercel/Next.js application shell
modules/               Product/domain rooms
packages/               Shared runtime capabilities
integrations/           External system bindings
docs/architecture/      Architecture specifications
docs/decisions/         Architecture decision records
docs/specifications/    Runtime/object specifications
docs/roadmap/           Work packages and implementation sequence
```

## Status

Repository initialized. Core control-plane contracts exist. AMA static conformance checks and CI tests are implemented on the AMA feature branch. Agent Stable registry and local effect gate are implemented on the feature branch and verified with disposable PostgreSQL integration tests, but neither is deployed or bound to production authorization/CDX policy services. No claim is made that durable agent runtime, CDX runtime enforcement, HCC–CDX integration or a production first-class agent is complete until executable bindings, human approvals and live-evidence gates pass.


## Canonical Agent Stable fleet

The current fleet identity order is:

1. **MESSI** — broad Form & Flöde worker; DRAFT / not implemented.
2. **Household Family** — bounded Director-assigned work-package/repository maintenance agent; implementation candidate, not production accepted.

Fleet registry: `agents/registry.json`.

Cashin, Carpenter, Evaluate and Research are not separate fleet agents; where retained they are MESSI workflows/commands/capabilities. Janitor, Handyman and Verifier are Household internal roles/workflows.
