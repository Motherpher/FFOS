# Agent Stable — FFOS Agent Infrastructure Contract

**ID:** FFOS-AGENT-STABLE-001  
**Status:** STRUCTURAL BASELINE MERGED / PARTIALLY IMPLEMENTED / NOT DEPLOYED  
**Director-defined hierarchy:** Human Director → CDX → FFC → FFOS → Agent Stable.  
**Structural baseline commit:** `4c70d74b468202303b4f4249567154fb0a02ad2b` (PR #31).

## Purpose and ownership

**Agent Stable** is an FFOS subsystem, **not an agent**. It owns the inventory, versioned definitions, lifecycle and maintenance services shared by FFOS agents. It contains:

1. **AMA — Agent Master Architecture:** construction contracts, registries, manifests, capability limits and evaluation requirements.
2. **Agent Mechanic:** the *audit and maintenance function* for conformance, drift, health, regression and upgrade proposals. Mechanic has no independent mandate-approval or self-acceptance powers.
3. **Agent fleet:** a deliberately small population of registered first-class FFOS agents with named operational purpose, deployment versions and state. The canonical fleet identity order is **#1 MESSI; #2 Household Family**.
4. **Shared workflows/commands/capabilities:** typed versioned bindings used by the fleet. These are not promoted to agent identities merely because they are named.

System-specific integration and governance links are defined in the separate FFOS estate architecture, not in the AMA master template.

## Classification rule

Use a **workflow** when a procedure has bounded inputs, steps, decisions and outputs under an existing agent mandate. Create a **first-class agent** only for independently governed identity, lifecycle, bounded mandate and operational accountability.

**Agent implementation separation:** Agent Stable retains agent-independent definitions, registry entries and conformance services; particular agents and their named workflows are defined only in their own implementation packages. They must not be embedded in the AMA master specification.

## Stable lifecycle contract

```text
Definition + Git provenance
→ AMA-06 static conformance (C1/C2/C3/C6)
→ append-only registry candidate (AMA-07)
→ runtime binding / authority / CDX/HCC gates (AMA-08, where applicable)
→ independent operational evaluation C4/C5
→ Director activation decision
→ ACTIVE with registered version pin
→ Mechanic audits, alerts, prepares safe upgrades
→ Director-controlled semantic change, suspension or retirement
```

Static validation must never mutate the agent's acceptance or operational lifecycle. A conformance test must not self-register an ACTIVE agent, approve a migration, or create an external effect.

## Architectural interfaces

- `packages/agent-model/agent-manifest.schema.json`: versioned manifest schema.
- `packages/agent-model/src/index.ts`: typed agent/workflow/command/capability definitions and structural execution-context guard.
- `packages/agent-model/conformance/ama_conformance.py`: offline pre-admission contract checks.
- `packages/registry/migrations/0002_agent_stable.sql` and `0003_agent_stable_hardening.sql`: append-only schema **tested against ephemeral PostgreSQL, not deployed**.
- `packages/agent-runtime/src/stable-registry.ts`: candidate and lifecycle transaction port.
- `packages/agent-runtime/src/effect-gate.ts`: local CDX-authorized effect boundary, currently fail-closed without verified adapters.
- `packages/agent-runtime/src/cdx-anchor.ts` and `pg-evidence.ts`: anchor verification and audit records.
- `docs/architecture/FFOS-ESTATE-AUTHORITY-TOPOLOGY.md`: Director-defined cross-system positioning.
- `docs/specifications/AGENT-MECHANIC.md`: permitted mechanics and prohibited authority changes.

## Acceptance and implementation visibility

| Component | Status |
| --- | --- |
| Agent Stable naming and ownership | SPECIFIED |
| AMA shared manifests and types | COMMITTED |
| Agent Mechanic audit mandate | SPECIFIED |
| Static manifest and binding gate | IMPLEMENTED + CI TESTED |
| Append-only registry and lifecycle port | CI-TESTED WITH POSTGRESQL; NOT DEPLOYED |
| Director decision interface | IMPLEMENTED AS VERIFIER PORT; AUTHENTICATED ADAPTER NOT CONNECTED |
| Consequential effect gate | IMPLEMENTED AND NEGATIVE-TESTED; LIVE CDX NOT VERIFIED |
| HCC–CDX integration | NOT IMPLEMENTED |
| Durable agent worker / MCP endpoint | NOT IMPLEMENTED |
| Fully deployed FFOS agent fleet | NOT PRESENT |

No claim of a running Agent Stable service is made solely from these files.


## Canonical fleet — 2026-10-29

Fleet numbering is **identity order, not implementation maturity**.

| # | Agent | State | Purpose |
|---:|---|---|---|
| 1 | MESSI | DRAFT / NOT IMPLEMENTED | Broad user-facing Form & Flöde worker; named functions such as Cashin/Carpenter/Evaluate/Research remain workflows/commands/capabilities, not separate agents |
| 2 | Household Family | IMPLEMENTATION CANDIDATE / NOT PRODUCTION ACCEPTED | Bounded Director-assigned repository/work-package maintenance using Janitor, Handyman and Verifier internal roles |

Machine registry: `agent-stable/registry.json`.

Director remains external governing authority for both agents. AMA and Agent Mechanic are infrastructure, not fleet agents.
