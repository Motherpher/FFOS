# Agent Stable runtime ports — AMA-07 / AMA-08

**State:** IMPLEMENTED ON FEATURE BRANCH; NOT DEPLOYED.

Agent Stable is an FFOS subsystem, not an agent. It contains AMA, Agent Mechanic (audit) and the FFOS agent registry/fleet. Individual agents and their workflows are governed by separate implementation manifests, never by hardcoded examples in the master architecture.

## AMA-07: Registry and lifecycle

- PostgreSQL append-only agent/binding definitions with SHA-256 content digests.
- Per-version lifecycle events with serialized per-agent advisory transaction locks.
- Candidate registration never activates an agent and does not displace active versions.
- Trusted CI report provenance verifier before recording conformance.
- Independently authenticated Director verifier for lifecycle progression.
- DEPLOYABLE/ACTIVE additionally require an independent readiness verifier, including runtime CDX/C4/C5 when bound.
- Multiple ACTIVE versions, stale transitions, unverified authorization or invalid digests fail closed.
- Apply schema.sql then migrations 0002 and 0003 only through governed release process.

## AMA-08: Consequential effect gate

- Validates ACTIVE lifecycle, exact workflow version, scoped capability, effect ceiling and module activation.
- Requires pinned CDX commit, verified runtime-bound anchor and the AGENT_STABLE_EFFECT_GATE enforcement point.
- Injected CDX evaluator; absent/unavailable policy, restrictive verdict or mismatched pin/target/effect/receipt denies execution.
- Rechecks revocation and anchor immediately before effect.
- Durable PRE_EFFECT audit before invoking a callback; POST_EFFECT record and HOLD/reconciliation after uncertain failure.
- E4 authority change and E0 observation are not admitted to this gate.

## Integration boundaries

The current FFOS CDX anchor is still BOUND_PENDING_RUNTIME_INTEGRATION, has no declared Agent Stable enforcement point and must fail the production anchor guard. No production CDX evaluator, independent Director authentication adapter, SPETL receipt verification, HCC-CDX interface, deployed database or distributed execution lease is delivered in this branch. Test doubles are strictly CI fixtures and may not be treated as connected runtime.

A callback may race with external revocation after its final check, and post-effect audit failure cannot undo a side effect. Operators must reconcile uncertain outcomes; never auto-retry.

## Test scope

Node tests and disposable PostgreSQL 17 integration validate registry transactions, upgrade isolation, append-only evidence and denial rules. This does not constitute live production runtime assurance or Director acceptance.

Keep PR #19 DRAFT until production database release, real CDX and Director adapters, C4/C5 validation, and independent approval.

## AMA M4 — Durable run coordination (candidate; not deployed)

`src/durable-run.ts` adds a PostgreSQL-backed run/worker coordinator that **composes the existing `AgentEffectGate`**; it does not relax the CDX or Director requirements. Migration `packages/registry/migrations/0004_ama_m4_durable_runs.sql` introduces durable run state, append-only events/attempts/checkpoints/receipts and effect operation-key deduplication.

Workers use epoch-fenced leases. Checkpoint/resume, cancellation, uncertain effects and independent reconciliation are covered by disposable PostgreSQL tests at `tests/m4-durable-pg.test.mjs`. A prepared/dispatched or callback-returned effect **cannot be automatically replayed or called committed without a verifier-issued receipt**. An independent resume approval is required after HOLD; callback return is not run acceptance.

**Release boundary:** all adapters in CI are test doubles. Real CDX runtime binding, external receipt attestation, safe database roles and release acceptance are still absent. The SQL migration has NOT been applied to production. [M4 technical specification](../../docs/roadmap/AMA-M4-DURABLE-EXECUTION-CONTRACTS.md).
