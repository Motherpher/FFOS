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

## Status

Repository initialized. No domain runtime has yet been implemented.
