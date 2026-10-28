# Shared Runtime Packages

Shared capabilities:

- `core-model/` — FFOS object, lifecycle and provenance contracts
- `registry/` — append-only registry interfaces and transition invariants
- `agent-model/` — Agent Master Architecture (AMA) manifests, execution context and agent/workflow/command/capability contracts
- `agent-runtime/` — Agent Stable PostgreSQL version registry, lifecycle decision port, local effect gate, CDX anchor continuity and evidence journal (CI tested; not deployed)

Planned shared capabilities:

- `dispatch/` — dispatch state machine and transition rules
- `schemas/` — canonical shared object schemas
- `auth/` — identity and authority enforcement
- `ui/` — shared interface primitives

Shared packages must remain domain-neutral unless an explicit domain extension is defined.
