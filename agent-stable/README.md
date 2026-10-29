# FFOS Agent Stable

**Subsystem ID:** FFOS-AGENT-STABLE-001  
**Repository position:** `FFOS → Agent Stable`  
**Fleet registry:** `agent-stable/registry.json`

Agent Stable is the canonical FFOS estate for first-class agent identity, lifecycle, manifests and shared agent-governance infrastructure. It is **not an agent**.

## Estate structure

```text
agent-stable/
├── README.md
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

The executable implementation layers remain separated:
- shared AMA model/runtime → `packages/agent-model/`, `packages/agent-runtime/`, `packages/registry/`;
- Household Family implementation → `modules/household-family/`;
- UI/product shell → `apps/`;
- provider bindings → `integrations/`.

## Canonical fleet

1. **MESSI** — `FFOS-AGENT-MESSI-001` — DRAFT / NOT IMPLEMENTED.
2. **Household Family** — `FFOS-AGENT-HOUSEHOLD-002` — IMPLEMENTATION CANDIDATE / NOT PRODUCTION ACCEPTED.

Fleet numbering is identity order, not implementation maturity.

## Non-fleet infrastructure

- **AMA** — universal first-class-agent architecture; not an agent.
- **Agent Mechanic** — technical conformance, maintenance, migration and health control plane; not an agent.
- **Director** — external governing authority; not part of Agent Stable and not a Household role.

## Workflow classification

- Household internal workflows/roles: **Janitor, Handyman, Verifier**.
- MESSI candidate workflows/commands/capabilities: **Cashin, Carpenter, Evaluate, Research**.
- A named workflow, role, method or capability does not become a first-class agent without independent identity, mandate, lifecycle and accountability.

## Development law

All new FFOS agent development starts here:

```text
AMA contract
→ registered agent identity
→ workflow/command/capability bindings
→ implementation
→ Mechanic conformance/maintenance
→ independent verification
→ Director acceptance
→ lifecycle activation
```

No agent may self-authorize, self-accept or infer a broader mandate from technical capability.
