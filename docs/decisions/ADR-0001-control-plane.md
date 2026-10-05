# ADR-0001 — FFOS as Control Plane

**Status:** Accepted

## Decision

FFOS is the orchestration and control plane for the Form & Flöde operating environment. Existing domain repositories remain canonical for their own content and runtime.

FFOS may index, reference, dispatch to, receive status from and orchestrate domain systems. It must not silently absorb or replace their canonical source.

## Consequences

- Cross-repository integrations require explicit contracts.
- The central database, when introduced, stores orchestration state and provenance rather than becoming an uncontrolled duplicate of domain data.
- Public-facing surfaces can be separated from private operational surfaces.
- Domain systems can evolve independently while FFOS maintains a common operational view.
