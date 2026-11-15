# FFOS Repository Structure — Canonical Development Layout

**State:** CANONICAL STRUCTURAL BASELINE  
**Date:** 2026-10-29  
**Purpose:** prevent future FFOS development from reintroducing duplicate agent/runtime estates.

## Top-level law

```text
FFOS/
├── agent-stable/      first-class agent identity, lifecycle and shared agent governance
├── modules/           concrete executable implementations
├── packages/          reusable domain-neutral runtime/model/registry code
├── apps/              human-facing application shells
├── integrations/      external provider/domain adapters
├── docs/              architecture, decisions, governance, research and roadmap evidence
└── .github/workflows/ verification and lifecycle gates
```

## Agent Stable

```text
agent-stable/
├── README.md
├── ARCHITECTURE.md
├── registry.json
├── ama/
│   └── README.md
├── mechanic/
│   └── README.md
├── agents/
│   ├── 01-messi/
│   └── 02-household-family/
└── tests/
```

Rules:
- AMA is architecture, never an agent.
- Agent Mechanic is technical stewardship, never a fleet agent.
- MESSI is Agent #1.
- Household Family is Agent #2.
- Janitor, Handyman and Verifier are Household internal workflows/roles.
- Cashin, Carpenter, Evaluate and Research are MESSI workflow/command/capability candidates, not fleet identities.
- Director remains external governing authority.

## Implementation placement

A fleet definition does not contain its complete implementation.

- Household identity/contracts: `agent-stable/agents/02-household-family/`
- Household implementation: `modules/household-family/`
- shared agent model/schema/conformance: `packages/agent-model/`
- shared agent runtime/lifecycle/effect machinery: `packages/agent-runtime/`
- durable registry infrastructure: `packages/registry/`

MESSI receives a module only when implementation work actually begins.

## Documentation placement

- `docs/architecture/` — cross-system architecture; old AMA/Mechanic paths are compatibility pointers.
- `docs/specifications/` — general FFOS specifications; not duplicate canonical Agent Stable definitions.
- `docs/roadmap/` — execution records and historical plans; not active code locations.
- `docs/research/` — evidence and research.
- `docs/governance/` — FFOS-local governance bindings.

## Proposed data-asset/work-order governance — non-canonical pointer

See [Asset-first Work Orders v0.1](../specifications/ASSET-FIRST-WORKORDER-GOVERNANCE-PROPOSED-v0.1.md) for candidate rules covering existing-asset discovery, stable asset versions, layered outputs, FF-Spatial ownership and per-domain work-order lineage. Do not implement a new parallel registry or treat this design as deployed until Director and schema/runtime gates pass.

## Prohibited structural drift

Do not:
- recreate top-level `agents/`;
- place agent implementations inside AMA;
- place Director inside Household Family;
- create a fleet agent for a workflow, method or role without independent governance need;
- place executable implementation only in documentation;
- duplicate canonical domain source from another repository;
- infer deployment or authority from file presence.

## Cross-repository boundary

`Motherpher/FFOS` is the sole technical FFOS development/runtime estate.

`Motherpher/form-flode/17-ffos` is the governed FFC projection, architecture/current-state interface and preserved programme history. Legacy Python/Household operational code there is frozen compatibility evidence and must not receive new feature development.
