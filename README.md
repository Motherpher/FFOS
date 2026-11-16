# FFOS — Form & Flöde Operating System

FFOS is the central operating shell for Form & Flöde. It coordinates work across domains without absorbing their canonical repositories.

## New DevOps processes — operating model 1.0

**Version 1.1 — optionally offered, never imposed.** Active development repositories may use a passive `.ffos/devops-hook.json` to discover the [six-phase DevOps Operating Model](docs/operations/devops/README.md). For larger **new** development efforts the Director may choose to activate L1 (Lightweight), L2 (Structured) or L3 (Controlled). Small changes and explicit declines follow the normal repo workflow. See the [1.1 discovery amendment](docs/operations/devops/AMENDMENT-v1.1-OPTIONAL-DISCOVERY.md) and [conditional CDX review reference](docs/operations/devops/CDX-REVIEW-INTERFACE-v1.1.md).

**No retrospective migration:** existing/historical work packages, repositories, active processes and releases are not rewritten or evaluated against this new model. CDX, AMA, Pius/HCC and canonical domain obligations remain in force independently. See the [transition record](docs/operations/devops/TRANSITION-DECISION-2026-11-16.md).

## Cloud Storage v1 (Google Drive)

[Google Drive storage adapter and OAuth acceptance](docs/architecture/GOOGLE-DRIVE-CLOUD-STORAGE-v1.md) stages optional, independently SHA256-verified persistent outputs to the Director-selected private Drive folder. **Drive uploads are disabled by default until a separate authorized OAuth grant is configured and verified.**

## Cloud execution (Mac-independent pilot)

[Cloud-independent execution contract](docs/architecture/CLOUD-INDEPENDENT-EXECUTION-2026-11-16.md) defines GitHub-hosted Kolada API export, direct FFOS→FF-Spatial dispatch and the headless GIS path. **Manual cloud pilot only**, not yet an accepted durable production service. Bruno and QGIS Desktop are optional operator interfaces; local LaunchAgents are not required by these new workflows.

## Start here — operating FFOS

- **[GitHub Estate Operations — WP04](docs/governance/github-estate/README.md)** — private source-backed estate register, portfolio, dashboard, operating standard and DG-04 review (implementation candidate; not accepted or runtime-bound).

- **[FFOS Operator Manual](docs/operator/README.md)** — practical Director and authorised-operator guide (DG-03 bounded pilot accepted; independent signed-in usability test pending; not a runtime certification).
- **[Source-linked manual](docs/operator/FFOS-OPERATOR-MANUAL-v1.0.md)** — work packages, status, evidence, approvals, escalation and troubleshooting.
- **[Motherpher Estate Portfolio](https://github.com/orgs/Motherpher/projects/2)** — private cross-repository planning projection; source decisions remain authoritative.

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

The Director-defined target containment is `Human Director → CDX → FFC → FFOS`, with **Agent Stable** (`AMA`, `Agent Mechanic`, and the registered FFOS fleet: **#1 MESSI, #2 Household Family**) and **Pius** (HCC linked to CDX, Piusites built on AMA) inside FFOS. This is a target architecture; Pius integration remains reserved. See `agent-stable/ARCHITECTURE.md` and `docs/architecture/FFOS-ESTATE-AUTHORITY-TOPOLOGY.md`.

AMA is the shared FFOS contract for first-class agents: identity, mandate, authority context, effect ceilings, workflows/commands, capabilities, state, evidence, evaluation, deployment compatibility and lifecycle.

Director is external governing authority and governs purpose, mandate, priorities and acceptance. Agent Mechanic governs technical conformance and maintenance mechanics. Neither an agent nor Agent Mechanic may self-authorize an expansion of authority.

AMA does not implement Pius inside FFOS and does not replace Conductellence. See `agent-stable/ama/README.md`.

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
agent-stable/          Canonical agent estate: AMA, Mechanic, fleet definitions and suite tests
modules/               Concrete product/agent implementations; currently Household Family
packages/              Shared domain-neutral runtime/model/registry capabilities
apps/                  Human-facing application shells
integrations/          External provider/domain bindings
docs/architecture/     Cross-system FFOS architecture and compatibility pointers
docs/specifications/   General FFOS specifications and compatibility pointers
docs/decisions/        Architecture decision records
docs/governance/       FFOS-local governance bindings
docs/research/         Research and assurance evidence
docs/roadmap/          Historical/current implementation records; not canonical runtime location
```

Development-placement law: **agent identity and lifecycle live in `agent-stable/`; implementations live in `modules/`; reusable runtime contracts live in `packages/`; provider bindings live in `integrations/`.**

See `docs/architecture/REPOSITORY-STRUCTURE.md`.

## Status

The Agent Stable structural baseline is merged on `main` at `4c70d74b468202303b4f4249567154fb0a02ad2b` (PR #31). AMA contracts, Agent Mechanic, fleet registry, MESSI candidate definitions, Household Family 2.0 candidate implementation, shared agent model/runtime packages and conformance infrastructure are now part of the canonical technical baseline.

This is **not** a production-agent activation. MESSI remains DRAFT / NOT IMPLEMENTED. Household Family remains IMPLEMENTATION CANDIDATE / NOT PRODUCTION ACCEPTED. Agent Stable registry/effect-gate components are not production-deployed or bound to complete live authorization/CDX services. Future lifecycle advancement still requires executable conformance, security, runtime, independent verification and Director acceptance.


## Canonical Agent Stable fleet

The current fleet identity order is:

1. **MESSI** — broad Form & Flöde worker; DRAFT / not implemented.
2. **Household Family** — bounded Director-assigned work-package/repository maintenance agent; implementation candidate, not production accepted.

Fleet registry: `agent-stable/registry.json`.

Cashin, Carpenter, Evaluate and Research are not separate fleet agents; where retained they are MESSI workflows/commands/capabilities. Janitor, Handyman and Verifier are Household internal roles/workflows.
