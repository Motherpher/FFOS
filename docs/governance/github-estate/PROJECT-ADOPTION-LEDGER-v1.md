# WP04 D25 — Project Adoption and Issue-Linkage Ledger v1.0

**Date:** 2026-11-03 · **State:** Executed, source-linked **noncanonical** intake. **Project:** [Private Motherpher Estate Portfolio #2](https://github.com/orgs/Motherpher/projects/2). **Work order:** [WP04 Issue #46](https://github.com/Motherpher/FFOS/issues/46).

## Purpose

Document exactly which **existing** native GitHub Issues were added under WP04 and why. Distinguish **registration** (all 31 repos), **Project representation** (selected Issues in 12 repos) and **repository-local adoption** (requires maintainer consent).

Before WP04, the Project contained **9** linked Issues; WP04 added **13**, producing **22** items. All were verified unique and OPEN after intake. No source Issue numbers were changed and no new sources were created to inflate the portfolio.

| Source Issue | Native Project item ID | Tier | Inclusion purpose | Guardrail |
|---|---|:---:|---|---|
| [Motherpher/CareerHubZero#53](https://github.com/Motherpher/CareerHubZero/issues/53) | `PVTI_lADOE9niMs4Bp6f2zhFp9J0` | B | WP40.4 release / profile-fleet hardening | Source parent #41; gated release evidence |
| [Motherpher/CareerHubZero#39](https://github.com/Motherpher/CareerHubZero/issues/39) | `PVTI_lADOE9niMs4Bp6f2zhFp9Kk` | B | Live HRDM-R / search / wish routing defects | Source predecessor #38; not claimed fixed |
| [Motherpher/Politent#20](https://github.com/Motherpher/Politent/issues/20) | `PVTI_lADOE9niMs4Bp6f2zhFp9Ls` | B | Release audit and independent Director handoff | Depends on #19; not accepted |
| [Motherpher/Politent#19](https://github.com/Motherpher/Politent/issues/19) | `PVTI_lADOE9niMs4Bp6f2zhFp9MU` | B | QGIS production package and export work | Depends on earlier Phase IV source tasks |
| [Motherpher/GreenBell#7](https://github.com/Motherpher/GreenBell/issues/7) | `PVTI_lADOE9niMs4Bp6f2zhFp9NY` | B | Company/product StatsVault authority boundary | Cross-owner product contract |
| [Motherpher/GreenBell#4](https://github.com/Motherpher/GreenBell/issues/4) | `PVTI_lADOE9niMs4Bp6f2zhFp9OA` | B | HARP claims and research audit | Evidence gate; no publication cleared |
| [Hybrismannen/Opal-Sense-I#16](https://github.com/Hybrismannen/Opal-Sense-I/issues/16) | `PVTI_lADOE9niMs4Bp6f2zhFp9Os` | B | Existing editorial Projects command centre | Native P0 label retained; no new Project created |
| [Hybrismannen/Opal-Sense-I#13](https://github.com/Hybrismannen/Opal-Sense-I/issues/13) | `PVTI_lADOE9niMs4Bp6f2zhFp9Pk` | B | Existing Wiki seed and reference architecture | Native P0 label retained; Wiki not enabled |
| [Hybrismannen/green-bell-statsvault#7](https://github.com/Hybrismannen/green-bell-statsvault/issues/7) | `PVTI_lADOE9niMs4Bp6f2zhFp9QY` | B | Dual metadata dashboard operational improvement | Not proof of connected usage analytics |
| [Motherpher/BDNA#13](https://github.com/Motherpher/BDNA/issues/13) | `PVTI_lADOE9niMs4Bp6f2zhFp9RM` | B | External Vercel mock-gate replay blocker | Maintains MOCK-DONE distinction |
| [Hybrismannen/Digital-Apartheid#2](https://github.com/Hybrismannen/Digital-Apartheid/issues/2) | `PVTI_lADOE9niMs4Bp6f2zhFp9SQ` | C | HARP source reconstruction exception | No source claims cleared by Project membership |
| [Hybrismannen/pius-pwe#2](https://github.com/Hybrismannen/pius-pwe/issues/2) | `PVTI_lADOE9niMs4Bp6f2zhFp9Ss` | B | Repeated Vercel integration failures | No readiness or deployment acceptance |
| [Motherpher/FFOS#46](https://github.com/Motherpher/FFOS/issues/46) | `PVTI_lADOE9niMs4Bp6f2zhFp9TM` | A | WP04 active control and DG-04 assurance | Work Stage Verification; source Issue remains OPEN |
 
## Intake method and verification

1. Read the original source Issues individually, including work state, dependencies and known privacy/authority boundaries.
2. Confirm no source Issue was already represented; call GitHub Projects V2 `addProjectV2ItemById` with native Issue node ID, never create new Issue copies.
3. Populate programme/work stage/work type from actual sources. For `Opal-Sense-I` only, use its existing source-defined `priority:P0`; no fictitious priority assigned to others.
4. Preserve exact source code identifiers where available. Supplement with native Issue URL where no canonical WP ID is available. A descriptive local label does not redefine a canonical source object.
5. Source Issue OPEN/CLOSED was not changed. Acceptance and release fields were **not** promoted.
6. Verify Project remains private and Auto-close issue remains OFF.
7. Replay `Motherpher/FFOS#46` addition to test GitHub's native idempotent intake; it returned **existing item `PVTI_lADOE9niMs4Bp6f2zhFp9TM`**, not a duplicate.
8. Re-read the Project: **22 total, 22 unique source node IDs, all source Issues OPEN**. This is a bounded native API test, not proof of distributed event/replay correctness.

## Non-adoption and access limits

- No Tier D (historic/profile/derivative) Issue was admitted during WP04.
- Tier C Digital Apartheid HARP issue was selected as a provenance exception, not as a blanket research backlog.
- No forced admission for repositories without relevant current Issues (FF-Spatial, Re-Eco, Barnombudet in current accessible Issue search).
- Public repository Issues may be represented in this **private** Project; public access to the Project remains restricted. No source repository visibility was changed.
- Only the three Motherpher-private repos FFOS, FFC and GreenBell were formally linked in the organisation-owned Project's repository tabs. Cross-owner repositories were represented by native linked Issue items, not by false same-owner tab associations.
- Neither a new Wiki, runtime connection, agent activation, production deployment nor repository-template rollout was created by intake.

## Recovery and reconciliation

This ledger is an audit of **what was actually added**; the machine-readable [Project snapshot](data/portfolio-snapshot-2026-11-03.json) preserves all linked items and fields at capture time. For a future change: re-read native Issues and current Project items, compare stable source node IDs, emit a discrepancy, and make bounded source-preserving corrections only when authorised.

**DG-04 remains awaiting independent assurance and Director decision.**
