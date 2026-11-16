# FFOS Modules

`modules/` contains **concrete implementations**, not architecture definitions and not domain rooms that do not yet exist.

## Current modules

- `household-family/` — implementation candidate for Agent Stable Agent #2. Janitor, Handyman and Verifier remain internal workflows/roles.
- `projecthub/` — native FFOS ProjectHub reconstitution candidate under DevOps process `FFOS-DEVOPS-PH-RECON-001`; **not released or deployed**.

## Placement rule

A new directory is added here only when there is executable implementation owned by FFOS.

- Agent identity/manifest/lifecycle → `agent-stable/`
- Shared architecture/runtime machinery → `packages/`
- External provider/domain binding → `integrations/`
- UI shell → `apps/`
- Architecture/specification/evidence → `docs/`

Planned domains are documented in architecture/roadmap records but do not receive empty module directories.
