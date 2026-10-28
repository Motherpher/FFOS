# Agent Stable — FFOS Agent Infrastructure Contract

**ID:** FFOS-AGENT-STABLE-001  
**Status:** PARTIALLY IMPLEMENTED (specification + static conformance + schema proposal)  
**Director-defined hierarchy:** Human Director → CDX → FFC → FFOS → Agent Stable.

## Purpose and ownership

**Agent Stable** is an FFOS subsystem, **not an agent**. It owns the inventory, versioned definitions, lifecycle and maintenance services shared by FFOS agents. It contains:

1. **AMA — Agent Master Architecture:** construction contracts, registries, manifests, capability limits and evaluation requirements.
2. **Agent Mechanic:** the *audit and maintenance function* for conformance, drift, health, regression and upgrade proposals. Mechanic has no independent mandate-approval or self-acceptance powers.
3. **Agent fleet:** a deliberately small population of registered first-class FFOS agents with named operational purpose, deployment versions and state.
4. **Shared workflows/commands/capabilities:** typed versioned bindings used by the fleet. These are not promoted to agent identities merely because they are named.

Pius is a sibling FFOS subsystem in the Director target hierarchy. Piusites depend on AMA's construction contract but retain Pius-specific HCC/Codex constraints. HCC is linked to CDX through an interface yet to be specified; Pius runtime remains RESERVED under the current FFOS baseline.

## Classification rule

Use a **workflow** when a procedure has bounded inputs, steps, decisions and outputs under an existing agent mandate. Create a **first-class agent** only for independently governed identity, lifecycle, bounded mandate and operational accountability.

**Household Family** is one proposed first-class agent. **Janitor**, **Handyman** and **Verifier** are three workflows owned by Household. Neither these workflows nor their software implementations gain agent-level authority.

## Stable lifecycle contract

\`\`\`text
Definition + Git provenance
→ AMA-06 static conformance (C1/C2/C3/C6)
→ append-only registry candidate (AMA-07)
→ runtime binding / authority / CDX/HCC gates (AMA-08, where applicable)
→ independent operational evaluation C4/C5
→ Director activation decision
→ ACTIVE with registered version pin
→ Mechanic audits, alerts, prepares safe upgrades
→ Director-controlled semantic change, suspension or retirement
\`\`\`

Static validation must never mutate the agent's acceptance or operational lifecycle. A conformance test must not self-register an ACTIVE agent, approve a migration, or create an external effect.

## Architectural interfaces

- \`packages/agent-model/agent-manifest.schema.json\`: versioned manifest schema.
- \`packages/agent-model/src/index.ts\`: typed agent/workflow/command/capability definitions and structural execution-context guard.
- \`packages/agent-model/conformance/ama_conformance.py\`: offline pre-admission contract checks.
- \`packages/registry/migrations/0002_agent_stable.sql\`: append-only registry schema **not applied**.
- \`docs/architecture/AMA-AUTHORITY-TOPOLOGY.md\`: Director-defined cross-system positioning.
- \`docs/specifications/AGENT-MECHANIC.md\`: permitted mechanics and prohibited authority changes.

## Acceptance and implementation visibility

| Component | Status |
| --- | --- |
| Agent Stable naming and ownership | SPECIFIED |
| AMA shared manifests and types | COMMITTED |
| Agent Mechanic audit mandate | SPECIFIED |
| Static manifest and binding gate | IMPLEMENTED + CI TESTED |
| Append-only registry storage contract | MIGRATION STAGED, NOT APPLIED |
| Authenticated Director lifecycle decisions | NOT IMPLEMENTED IN STABLE |
| Runtime CDX enforcement | NOT VERIFIED |
| HCC–CDX integration | NOT IMPLEMENTED |
| Durable agent worker / MCP endpoint | NOT IMPLEMENTED |
| Fully deployed FFOS agent fleet | NOT PRESENT |

No claim of a running Agent Stable service is made solely from these files.
