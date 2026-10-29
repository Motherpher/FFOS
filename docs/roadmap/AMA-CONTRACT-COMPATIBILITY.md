# AMA M0 — Compatibility Baseline

**State:** Proposed; independent acceptance pending.
**Existing baseline:** AMA 0.1.0 with `ffos.ama.agent-manifest/v1` and `https://ffos.local/schemas/ama-agent-manifest-v1.json`.
**Proposed target:** AMA 0.2.0 candidate. No wire identifier, database migration or production binding is changed by M0.

## Compatibility rules

The current manifest remains authoritative for existing registered versions. Future typed schemas require independent version and digest references. Never silently rewrite `agentVersion`, `amaVersion`, lifecycle, mandate, effect ceiling, command meaning or workflow bindings.

- Editorial fixes that preserve semantics: compatibility test and patch candidate.
- Additive disabled-by-default profile: minor candidate with tests and explicit opt-in.
- New required field, authority/effect reinterpretation, changed state transition or acceptance semantics: breaking semantic review; affected agents require versioned migration and human authorization.
- Optional MCP/A2A, telemetry or host adapter changes: version-specific test and negotiation, not universal requirements.
- Historical schema IDs: preserve v1 parser and its registry records. Any generic rebranding must define a **new** schema identifier and dual-read/deprecation strategy, not overwrite history.

## Migration gates

1. Pin existing schema and definition digests.
2. Prepare a field-level and behavioral compatibility report including source IDs.
3. Compare authority, mandate, scope, data disclosure, human-review and effect semantics.
4. Implement a separately identified vNext schema and resolvers while preserving v1.
5. Exercise positive and negative fixtures, downgrade, compatibility and rollback cases.
6. Independently review every semantic or permission change.
7. Promote via staged and separately authorized lifecycle transition.
8. Preserve a valid rollback target, or suspend when rollback would restore revoked authority.

## Known material risks

- An E0 read may require data-specific authorization not expressible by the ordinal effect ceiling.
- A policy engine may require decisions beyond the currently implemented local three-state gate; translating a restrictive stop to a retryable hold is unsafe.
- CDX pre-release commit binding is **not** verified production policy enforcement.
- Research candidate `F08` (replay) must not be confused with independent F8 risk governance.

**M0 deliverable:** compatibility and impact rules only. AMA.md, runtime state and registered agents are unchanged.