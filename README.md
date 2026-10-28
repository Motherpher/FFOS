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

## FFC Agent Stable (Cashin only) and autonomous ProjectHub — proposed

Only **Cashin**, the F&F revenue / Proposal & Assignment agent, is currently developed in the [FFC Agent Stable](https://github.com/Motherpher/form-flode/tree/main/18-agent-stable) (draft PR; link resolves to main only after release). The earlier **Carpenter** agent proposal has been archived, not registered as an agent. ProjectHub is a separate **project system** that can operate without any F&F methods or agents.

[ProjectHub optional methodology and dossier interfaces](docs/specifications/projecthub-methodology-and-optional-ffc-interfaces-v0.1.md) proposes full F&F assignment dossiers, selected FFC components or native project methods. Pius results are optional and governed separately; future Piusite design remains outside FFOS. [Deferred FFC Agent Stable binding](docs/specifications/ffc-agent-stable-binding-v0.1.md) is a HOLD, not a live adapter. Existing FFOS ProjectHub governance remains in force pending explicit reconciliation of the broader entry modes.

## FFC AMA / Agent Mechanic / CDX architecture (developmental)

[Agent Master Architecture (AMA)](https://github.com/Motherpher/form-flode/pull/34) is FFC Agent Stable's proposed shared engineering contract. [Agent Mechanic](docs/specifications/ama-agent-mechanic-cdx-architecture-v0.1.md) will consume actual FFOS deployment, execution, policy, quality and incident evidence. This is not yet a running monitoring service.

**CDX** is the mandatory external governance authority. FFOS's existing `.cdx/anchor.json` reports `CDX_CI_MONITORED`, but runtime remains pending; FFC's new anchor is staged as `ANCHOR_DECLARED / NOT_VERIFIED`. CDX is pre-release/BOOTSTRAP. CDX draft PR #16 reconciles estate-level repository status with runtime status; these are distinct, not inherently contradictory. No statement of complete CDX enforcement is warranted without a tested local policy adapter, estate reconciliation and actual evidence. Optional methodologies such as UDL remain independent source-owned integrations, not CDX or AI-agent identities.

## Status

Repository initialized. No domain runtime has yet been implemented.
