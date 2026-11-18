# ProjectHub Reconstitution — PH-WP15 Learn & Closeout

**Process:** FFOS-DEVOPS-PH-RECON-001  
**DevOps model:** FFOS-DEVOPS-OM-001@1.1  
**Level:** L3 Controlled  
**State:** COMPLETE  
**Date:** 2026-11-18

## Outcome versus intent

### Intended
Reconstitute ProjectHub as a fully native FFOS subsystem in `Motherpher/FFOS`, independent of the frozen legacy runtime and independent of Barnombudet, while preserving useful donor patterns and establishing methodology autonomy.

### Observed
Achieved.

The accepted baseline now has:
- native ProjectHub module/model placement;
- methodology profiles `FULL_FF | CONFIGURED | PROJECT_NATIVE`;
- no compulsory FFC/Pius dependency;
- transactional PostgreSQL persistence contract;
- versioning/idempotency/audit;
- project-scoped rights and PH-D0–PH-D3 ceilings;
- Project Field/North Star/monitoring;
- timeline, economy/funding and evidence engines;
- bounded UDL/FIELD adapters;
- bounded Project Steward;
- CDX-mediated A3 and contract-ready A4;
- generic A5 denial;
- protected UI/API;
- linked-artifact review semantics;
- real-project acceptance evidence;
- synchronized governed projection in `Motherpher/form-flode`.

## What the process learned

### 1. The legacy implementation was useful as evidence, not as a codebase
The strongest move was to preserve Phase-IV/V semantics and acceptance evidence while reimplementing against the current FFOS repository, PostgreSQL and CDX architecture. Continuing the old Python/Twin estate would have recreated technical debt.

### 2. ProjectHub needed autonomy before more features
The v0.3 compulsory Pius-led chain was a design constraint that no longer matched the desired system. Contract v0.4 made autonomy explicit before implementation:
- FULL_FF when full FF methodology is chosen;
- CONFIGURED when selected components are chosen;
- PROJECT_NATIVE for owner-native methods.

This removed hidden methodology coercion.

### 3. Real negative tests found material defects
PH-WP11 found issues that a happy-path demo would not:
- authorization originally occurred after idempotency replay;
- nested command payloads were not fully represented in the digest;
- JavaScript `structuredClone` callback misuse;
- TypeScript cross-package compile issues;
- unsafe Project Field construction cast.

The process improved the implementation because failures were treated as evidence rather than as release inconvenience.

### 4. Domain adapters must stay honest
UDL and FIELD integration was deliberately bounded. ProjectHub can project/hold relevant project state without claiming to be the canonical UDL or FIELD runtime.

### 5. Release and deployment separation prevented false completion
The Director accepted and released the internal native baseline without pretending that a production database, provider credentials, multi-user identity or external write authority had been admitted.

### 6. Cross-estate security drift can occur independently
After the ProjectHub merge, Household Family Security began failing because the npm advisory database newly flagged Hono/Vitest dependency paths. The ProjectHub merge did not change Household files and Household functional CI remained green.

This is tracked independently as Issue #84. The lesson is to preserve causal attribution instead of blocking or rewriting an otherwise valid subsystem release.

## Rework / process friction

Material rework occurred in:
- CI bootstrap because the ProjectHub workflow did not yet exist on main;
- branch conflict after the bootstrap merge;
- Node native TypeScript loader incompatibility;
- strict Next/TypeScript integration;
- exact-source assurance and post-merge reconciliation.

These were bounded and resolved within the activated DevOps process.

## Residual ProjectHub debt

The following are deliberately outside the accepted baseline and require new prospective governance:

1. production ProjectHub database admission/migration;
2. deployment environment and runtime secrets;
3. broad multi-user identity/RBAC rollout;
4. PH-D4 sensitive-data admission;
5. live Miro/Figma/Docs/funding-provider writes;
6. live A4 grant/payment/contract/public actions;
7. automatic Pius routing;
8. exact production bindings for canonical UDL/FIELD/Pius adapters;
9. future Barnombudet↔FFOS ports, each explicit and independently accepted.

## Parallel development law

Barnombudet ProjectHub and FFOS ProjectHub remain separate.

Future comparison is encouraged. Future transfer requires an explicit port record and must not create:
- runtime dependency;
- shared canonical state;
- automatic synchronization;
- shared release authority.

## Process disposition

- PLAN — COMPLETE
- DESIGN — COMPLETE
- BUILD — COMPLETE
- TEST — COMPLETE
- RELEASE — COMPLETE for internal baseline
- DEPLOYMENT — NOT PART OF THIS ACCEPTANCE / NOT DEPLOYED
- LEARN — COMPLETE

**FFOS-DEVOPS-PH-RECON-001 CLOSED.**
