# AMA Foundation Workstream

**Workstream:** FFOS Agent Master Architecture  
**Started:** 2026-10-28  
**Current target:** AMA 0.1 foundation before Household migration

## AMA-01 — Source reconciliation
**Status:** COMPLETE

Reconcile Pius agent doctrine, FFOS control-plane boundaries, existing Household mechanics, Conductellence authority constraints and prior architecture decisions.

## AMA-02 — Master architecture
**Status:** IMPLEMENTED ON FEATURE BRANCH

Define agent/workflow/command/capability separation, lifecycle, effect classes, state model, optional modules, authority model, evidence, version inheritance and Household boundary.

## AMA-03 — Machine-readable contract
**Status:** IMPLEMENTED ON FEATURE BRANCH

Create Agent Manifest schema and shared TypeScript types.

## AMA-04 — Workflow & Command Registry contract
**Status:** IMPLEMENTED ON FEATURE BRANCH

Define stable command-to-versioned-workflow resolution and invariants.

## AMA-05 — Agent Mechanic
**Status:** SPECIFICATION IMPLEMENTED ON FEATURE BRANCH

Define technical stewardship, compatibility, maintenance, incident and upgrade responsibilities without architectural sovereignty.

## AMA-05A — Authority topology reconciliation
**Status:** DOCUMENTED ON FEATURE BRANCH; RUNTIME PRECEDENCE UNVERIFIED

Replace the oversimplified Pius → CDX → AMA chain with distinct human, HCC/Pius, CDX, FFOS Director, AMA contract, Mechanic and execution planes. Record evidence boundaries and preserve Pius RESERVED status. See `docs/architecture/AMA-AUTHORITY-TOPOLOGY.md`. No claim of exhaustive chat/repository history or verified runtime binding.

## AMA-06 — Conformance harness
**Status:** STATIC CONTRACT GATE IMPLEMENTED + GITHUB ACTIONS PASS; RUNTIME GATES PENDING

Implemented and CI-tested Draft 2020-12 manifest validation, workflow/capability and command-version resolution, effect-ceiling checks, authority-reference policy, inactive-module checks, immutable version policy, change review, structured `STATIC_PASS`/`FAIL` reports, positive fixture and negative test cases. GitHub Actions `AMA conformance` succeeded on PR #19 (2026-10-29). This does **not** evaluate C4 runtime effects or C5 live evidence; it cannot activate or accept an agent. See `packages/agent-model/conformance/`.

## AMA-07 — Persistent Agent Registry
**Status:** DATABASE MIGRATION STAGED; NOT APPLIED/CONNECTED

A PostgreSQL append-only schema migration for agent definitions, versioned bindings, conformance reports and Director lifecycle decision events exists at `packages/registry/migrations/0002_agent_stable.sql`. It has not been applied to a live database; authentication, transactional continuity, query APIs, reconciliation and test coverage remain pending.

## AMA-08 — Runtime enforcement
**Status:** PLANNED

Bind AMA execution context to FFOS local CDX enforcement before consequential effects.

## AMA-09 — Agent Mechanic runtime
**Status:** PLANNED

Implement inventory, conformance execution, drift detection, upgrade proposals, health/incident state and rollback preparation.

## AMA-10 — Reference agent fixture
**Status:** PLANNED

Build a minimal non-Household reference agent to prove the architecture without importing Household-specific semantics.

## AMA-11 — Household migration
**Status:** DEFERRED UNTIL AMA RUNTIME AND AUTHORITY GATES PASS

Rebuild Household on AMA. Preserve Director as external authority; model Janitor, Handyman and Verifier as workflows (not agents or roles), and preserve Household-specific J0/J1/J2 semantics as an extension.

## October 2026 research baseline

External standards and adoption boundaries are documented in `docs/research/AMA-2026-ENGINEERING-BASELINE.md`. MCP adapter, OpenTelemetry instrumentation, A2A interoperability, OWASP runtime controls, durable orchestration and NIST identity guidance are design inputs and future integration contracts — not deployed FFOS capabilities.
