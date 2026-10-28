# AMA Foundation Workstream

**Workstream:** FFOS Agent Master Architecture  
**Started:** 2026-10-28  
**Current target:** AMA 0.1 universal foundation, separated from all agent instances

## AMA-01 — Source reconciliation
**Status:** COMPLETE

Reconcile universal agent construction principles, FFOS control-plane boundaries, independent policy constraints and prior master-contract decisions. Domain-specific implementations and use cases are not part of the template.

## AMA-02 — Master architecture
**Status:** IMPLEMENTED ON FEATURE BRANCH

Define agent/workflow/command/capability separation, lifecycle, effect classes, state model, optional modules, authority model, evidence, version inheritance and the template-to-instance separation.

## AMA-03 — Machine-readable contract
**Status:** IMPLEMENTED ON FEATURE BRANCH

Create Agent Manifest schema and shared TypeScript types.

## AMA-04 — Workflow & Command Registry contract
**Status:** IMPLEMENTED ON FEATURE BRANCH

Define stable command-to-versioned-workflow resolution and invariants.

## AMA-05 — Technical stewardship interface
**Status:** SPECIFICATION IMPLEMENTED ON FEATURE BRANCH

Specify independent technical stewardship, compatibility, maintenance, incident and upgrade responsibilities without architectural sovereignty.

## AMA-05A — Authority topology reconciliation
**Status:** HOST INTEGRATION SEPARATED FROM MASTER CONTRACT; RUNTIME PRECEDENCE UNVERIFIED

Host organization and governance topology are recorded in the separate system-integration document and are not normative AMA template content. The master contract defines only abstract authority, policy and verification interfaces. No claim of verified runtime binding.

## AMA-06 — Conformance harness
**Status:** STATIC CONTRACT GATE IMPLEMENTED + GITHUB ACTIONS PASS; RUNTIME GATES PENDING

Implemented and CI-tested Draft 2020-12 manifest validation, workflow/capability and command-version resolution, effect-ceiling checks, authority-reference policy, inactive-module checks, immutable version policy, change review, structured `STATIC_PASS`/`FAIL` reports, positive fixture and negative test cases. GitHub Actions `AMA conformance` succeeded on PR #19 (2026-10-29). This does **not** evaluate C4 runtime effects or C5 live evidence; it cannot activate or accept an agent. See `packages/agent-model/conformance/`.

## AMA-07 — Persistent Agent Registry
**Status:** POSTGRESQL INTEGRATION TESTED IN CI; NOT DEPLOYED

Append-only migrations 0002/0003 and `packages/agent-runtime/src/stable-registry.ts` implement versioned registry storage, content hashing, transactional lifecycle continuity and human-authorization, conformance and readiness verification ports. Disposable PostgreSQL 17 integration tests exercise candidate admission, registered-versus-active state, Director transitions, competing version denial, suspension and version replacement. No live database, authenticated human-approval adapter or operational service has been connected.

## AMA-08 — Runtime enforcement
**Status:** LOCAL EFFECT GATE AND NEGATIVE TESTS IMPLEMENTED; HOST POLICY INTEGRATION PENDING

`packages/agent-runtime/src/effect-gate.ts` rejects missing local enforcement, policy mismatch/denial, insufficient mandate, disabled capabilities, expired active version and revocation. The host-specific policy-anchor adapter correctly refuses a pending runtime binding. `pg-evidence.ts` records pre/post effects and restricted decisions in append-only PostgreSQL. Tests use *mock* external policy and approval services; real policy decisions, evidence receipt validation, deployment, stronger effect-lease controls and complete denial audit remain pending.

## AMA-09 — Technical stewardship runtime
**Status:** NEXT — OPERATIONAL RUNTIME NOT IMPLEMENTED

Implement inventory, conformance execution, drift detection, upgrade proposals, health/incident state and rollback preparation. The technical steward remains non-authorizing and non-accepting.

## AMA-10 — Reference agent fixture
**Status:** PLANNED

Build and evaluate a synthetic, non-production reference fixture to prove generic contracts without importing any domain semantics.

## AMA-11 — Generic adoption interface
**Status:** DEFERRED UNTIL AMA RUNTIME AND AUTHORITY GATES PASS

Deliver an instance-registration and extension interface allowing independently governed agents to implement the universal contract. No domain-specific agent, workflow, naming convention or repair classification is defined by this workstream.

## October 2026 research baseline

External standards and adoption boundaries are documented in `docs/research/AMA-2026-ENGINEERING-BASELINE.md`. MCP adapter, OpenTelemetry instrumentation, A2A interoperability, OWASP runtime controls, durable orchestration and NIST identity guidance are design inputs and future integration contracts — not deployed FFOS capabilities.
