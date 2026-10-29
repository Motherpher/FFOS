# AMA M6 — Operational Lifecycle, Compatibility and Release Safety

**Date:** 2026-10-29  
**Milestone:** M6 / F7 — governed operational interfaces, health, incident response, compatibility, canary and rollback  
**Status:** Candidate engineering only, non-normative; no production activation  
**Source basis:** AMA post-research roadmap M6 / F7, M4 durable runtime, M5 independent assurance, existing Agent Stable registry and F8 Conductellence consumer binding.

## Purpose and architecture

M6 defines operational obligations for any AMA-built agent while preserving the distinction between a universal contract and an optional provider-specific adapter. It extends **no constitutional or principal authority**, cannot accept its own work, and does not permit an agent to change its release status. The technical steward may observe, verify candidate compatibility, assemble evidence, recommend or **prepare** changes. Independently authenticated governing authorities alone can authorize containment, adoption, live release and eventual rollback.

The source M6 requirements are: **extension/version compatibility; drift/incident/health/cost; canary/rollback and release controls; optional MCP/A2A and OpenTelemetry bindings; synthetic upgrade, revoked-tool, model substitution, protocol change, emergency suspension and rollback; surviving evidence.** Every capability below follows this envelope. Live F8.7 enforcement is still unavailable and M7-O cannot be certified at this point.

## Six new portable v0.2 schemas

| Schema | Required evidence and constraints |
| --- | --- |
| `operational-profile` | Agent/version pin, heartbeat age, failure rate, p95 latency, monetary ceiling, required signals, maximum canary percentage, independent decision, conditional protocol references |
| `compatibility-assessment` | From/to versions, change class (patch/minor/major/protocol/model/tool/policy), affected capabilities, reversibility, breaking changes, regression tests and evidence |
| `health-snapshot` | Pinned operational profile, source provenance, timestamp, health/cost/latency, revocation and policy drift, unsettled effects, redacted evidence |
| `incident-record` | Incident kind/severity/state, original source evidence, optional containment and independent closure evidence; release authorization hard-coded `false` |
| `release-plan` | Candidate/version/digest, compatibility and monitoring pins, full safety-check list, canary limits, rollback reference and `activationAuthorized=false` |
| `rollback-plan` | Prior version digest, triggers, independent approval, append-only evidence, explicitly held uncertain effects and `activationAuthorized=false` |

The `bundle.schema.json` composes these as **optional** records; the number of candidate schemas advances from 39 to 45. Separate TypeScript declarations are in `packages/agent-model/src/operations-vnext.ts`. Existing v1, M1–M5 and F8 interfaces remain unchanged. This is not universal adoption of MCP/A2A/OTel: bindings are conditional, versioned and optional. An agent without these features remains structurally admissible.

## Static risk and compatibility preflight

`packages/agent-model/conformance/ama_operations.py` validates all earlier bundle constraints then checks exact pinned references, version changes, capability impact, compatibility verdict consistency, canary limits, health signal completeness, signed-verifier *port* result, actual tracked incident state and mandatory independent review. Conditional optional telemetry/protocol bindings are not silently assumed to be operational.

- **Version changes:** breaking or irreversible migrations, missing regression tests, and major-version claims cannot be described as safe compatible upgrades. Model/tool/protocol changes must identify affected capabilities. A future registered version must be evaluated separately from the active version.
- **Health/observability:** missing/expired heartbeat, high failure rates, latency/cost excess, policy drift, revoked tools and unsettled effects are restrictive. A claimed trust label never substitutes for a separately injected verifier.
- **Incidents:** severity and evidence are recorded; critical/high open or merely contained incidents prevent release proposals. An incident cannot close itself without an independent reviewer and human-acceptance reference.
- **Canary:** recommend STOP_AND_HOLD when unhealthy, or REFER_FOR_INDEPENDENT_REVIEW when thresholds are met. It never shifts traffic, deploys or grants approval.
- **Rollback:** a proposal can identify a known prior digest and targets but cannot execute rollback, erase evidence, cancel remote effects retroactively or self-declare an independently accepted state.

All output retains `deployment_authorized=false`, `rollback_authorized=false`, `runtime_authorized=false`, `independent_accepted=false`, and `operational_ready=false` for the candidate.

## Host-side implementation and emergency response

The **optional** host adapter `packages/agent-runtime/src/operational-steward.ts`, backed by migration `packages/registry/migrations/0005_ama_m6_operations.sql`, provides three deliberately limited operations:

1. `recordHealth`: independently attested health observations stored in append-only PostgreSQL records; no mutation to active agent state.
2. `prepareRelease`: verifies an externally authorized *proposal* and persisted healthy observation, no unresolved effects or high-severity incidents; stores `APPROVAL_PENDING`, never commits the candidate into production.
3. `emergencySuspend`: **requires an independently authenticated suspension decision**. Locks and fences M4 active/queued/held runs, increments lease epochs, cancels non-consequential work and retains uncertain effects as HOLD/UNKNOWN requiring the existing M4 reconciliation pathway. The incident, per-run effects and evidence are appended in the same transaction. No automatic rollback or self-reinstatement is possible.

The durable `ama_m6_suspensions` barrier additionally prevents new run insertions even if a generic admission guard was omitted. It synchronizes the insert and emergency operation through an agent advisory transaction lock. The optional `M6GuardedAdmission` composes independently verified M4 admission with the version-scoped suspension check to deny new runs and lease recovery. All existing v1 registry state transitions remain governed by the external Director authority.

The M6 database tables (health, incident, incident actions, suspension and release proposals) are append-only, with mutation-rejection triggers. Retention/encryption, restricted SQL roles, incident response personnel, authentic log shipping and GDPR/privacy handling are **not** settled by the schema.

## Evidence and nonclaims

- Every control and emergency suspension is tested only against disposable PostgreSQL and test-double authority/reviewer ports; these prove transactional safety boundaries, not authentic signatures or real CDX/SPETL integration.
- M4 callback outcome and unresolved-effect safeguards continue to apply; M6 cannot resolve an UNKNOWN external effect by declaring a rollback.
- No real canary traffic, monitoring backend, live incident pager, model provider, production database migration, registry agent activation or live rollback has been executed.
- The M6 synthetic CI report is machine-readable but is not a certificate or production release.
- F8.7 remains an external release/security dependency. M7-E can establish end-to-end **engineering** integration after M6; M7-O cannot until F8.7 and M5 independent live evidence are established.

## Candidate engineering gate

`M6-OPERATIONAL-CONTRACT-PASS` requires: 45 valid agent-neutral schemas, static negative regression suites, Node type parsing, disposable PostgreSQL suspension/release/immutability tests and a successful combined GitHub Actions run with the explicit synthetic M6 readiness artifact.

**Human adoption, CDX F8.7 live binding, independently signed acceptance and production deployment remain separate gates.**
