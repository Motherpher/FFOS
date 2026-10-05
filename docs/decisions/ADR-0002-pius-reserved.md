# ADR-0002 — Pius Reserved Integration Boundary

**Status:** Accepted

## Decision

FFOS reserves a dedicated Pius room and integration boundary but does not implement a Pius runtime at this stage.

The ongoing Pius redevelopment is authoritative. Existing older Codex descriptions must not be promoted into FFOS runtime assumptions merely because they are documented.

## Required initial state

- Room exists in navigation.
- Status is visible as `RESERVED` / `PENDING`.
- Links to canonical Pius repositories may be added later.
- No protocol invocation, routing, agency execution or state mutation is represented as operational until explicitly integrated and tested.

## Exit condition

This ADR may be superseded only when the current Pius architecture establishes a canonical runtime/integration contract approved for FFOS implementation.
