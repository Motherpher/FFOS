# ProjectHub Reconstitution — PH-WP01 Source Freeze

**Process:** FFOS-DEVOPS-PH-RECON-001  
**DevOps model:** FFOS-DEVOPS-OM-001@1.1  
**Level:** L3 Controlled  
**State:** COMPLETE  
**Date:** 2026-11-16  
**Canonical process record:** GitHub Issue #77

## Purpose

Freeze the sources that may legitimately shape the new FFOS ProjectHub implementation and distinguish:
1. current technical authority;
2. current Director-approved design direction;
3. governed historical/projection evidence;
4. developmental proposals;
5. donor genealogy.

No lower source may silently override a higher source.

## Source hierarchy

### S0 — Human Director instruction
Current Director instructions define the purpose of this process:
- FFOS ProjectHub is an independently constructed FFOS subsystem;
- Barnombudet ProjectHub is a one-time practical donor, not a linked runtime;
- the two systems develop in parallel and may cross-pollinate only by explicit port;
- the FFOS DevOps Operating Model 1.1 is activated for the reconstitution process.

This process record preserves those instructions; it does not manufacture additional authority.

### S1 — Current canonical executable estate: `Motherpher/FFOS@main`
Current FFOS main is the implementation authority for new code, runtime, persistence, web UI, registry, CDX binding and repository architecture.

Frozen intake baseline:
- commit: `4ba011f6b33d0608bcca4c1f89f09882f0cbb447`;
- repository: `Motherpher/FFOS`.

Relevant current contracts:
- `docs/specifications/OBJECT-MODEL.md`;
- `docs/specifications/AUTHORITY.md`;
- `packages/core-model/src/index.ts`;
- `packages/registry/schema.sql`;
- `packages/registry/src/index.ts`;
- `.cdx/anchor.json`;
- `.cdx/CDX-RUNTIME-001.json`;
- `integrations/cdx/runtime-verification-2026-10-30.json`;
- current `apps/web` architecture.

### S2 — Current repository-level CDX binding
The current FFOS repository anchor is `CDX_RUNTIME_VERIFIED` / `VERIFIED_RUNTIME_BOUND` for its declared enforcement points.

This does **not** automatically mean ProjectHub A3/A4/A5 effects are already mediated. ProjectHub must add its own local effect surfaces, tests and SPETL evidence under the existing contract.

### S3 — Director-recorded ProjectHub autonomy decision: Issue #16
Issue #16 records the later design correction that:
- ProjectHub is a project-development/operations system, not an agent;
- project methodology may be FULL_FF, CONFIGURED or PROJECT_NATIVE;
- Pius is optional and source-governed, not compulsory upstream infrastructure;
- no generic agent auto-routing is implied.

Issue #16 is an authoritative design input for PH-WP03, but not executable implementation evidence.

### S4 — Governed FFOS projection/history: `Motherpher/form-flode/17-ffos`
This estate preserves:
- ProjectHub genealogy;
- parallel-development law;
- ProjectHub Contract v0.3;
- legacy Phase-IV/V acceptance;
- donor manifest and port ledger.

It is **not** the canonical development location for the reconstituted runtime.

### S5 — Legacy accepted ProjectHub implementation
Phase V accepted the previous implementation baseline `71ba040ca9400781785dfb331c5feccb00095fc5` with 202 tests and explicit external boundaries.

This is:
- behavioral reference;
- migration/compatibility evidence;
- acceptance-test seed.

It is not a codebase to continue extending.

### S6 — Barnombudet donor snapshot
Source:
- repository: `Hybrismannen/Barnombudet`;
- commit: `9ba24f9229d911a1e8731f1ebfb962abb3c936a6`;
- snapshot date: 2026-10-05.

Accepted donor patterns:
- overview-first interaction;
- projects/funders/matching/applications;
- actions/deadlines;
- system freshness/history;
- generated operational state distinct from canonical objects;
- human approval for sensitive transitions.

Not transferred:
- Barnombudet data;
- IDs;
- funding corpus;
- branding;
- runtime authority;
- state files;
- organizational payroll/cost rules.

### S7 — Draft PR #15
PR #15 is developmental source material only.

Useful inputs:
- proposed FULL_FF / CONFIGURED / PROJECT_NATIVE ingress;
- proposed ProjectIngress shape;
- ProjectHub CDX effect inventory.

Stale statements must be reconciled against current main. In particular, PR #15 predates the now-verified FFOS repository-level CDX runtime binding.

## Domain-source rule

ProjectHub may model adapter contracts for Pius/PIVE, UDL and FIELD, but must not copy or redefine their internal canonical protocols merely from legacy ProjectHub code.

When PH-WP08 binds a domain adapter, the current canonical source repository/version for that domain must be reopened and pinned.

## Frozen conclusions

1. New ProjectHub implementation belongs only in `Motherpher/FFOS`.
2. No Barnombudet runtime dependency is permitted.
3. No legacy ProjectHub runtime dependency is permitted.
4. ProjectHub must work as PROJECT_NATIVE with no FFC/Pius dependency.
5. FULL_FF and CONFIGURED remain optional methodology profiles.
6. Pius/PIVE can be a governed input path, not a compulsory root.
7. Existing CDX runtime binding is reusable infrastructure, not automatic ProjectHub effect acceptance.
8. Current FFOS append-only object/event registry is the starting persistence architecture; the legacy SQLite writer is not.
9. Historical claims remain preserved rather than rewritten.

## Exit

**PH-WP01 COMPLETE.**  
No unresolved source-authority ambiguity blocks PH-WP02 or PH-WP03.
