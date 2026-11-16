# ProjectHub Reconstitution — PH-WP11 Automated Verification Report

**Process:** FFOS-DEVOPS-PH-RECON-001  
**WP:** PH-WP11  
**State:** PASS  
**Verified head:** `df90912f9830fa3671927a526b28646d66cbfc2e`  
**Date:** 2026-11-16

## Required evidence

| Check | Run | Result |
|---|---:|---|
| ProjectHub core | 43792759131 / core | PASS — 28 tests, 27 pass + PostgreSQL-only skip |
| ProjectHub PostgreSQL | 43792759131 / postgres | PASS — 28/28 |
| FFOS cloud runtime contract | 43792758994 | PASS |
| CDX Runtime Binding | 43792759057 | PASS |
| CDX Runtime Diagnostics | 43792759010 | PASS |
| AMA conformance | 43792759092 | PASS |
| DevOps model release watch | 43792758918 | PASS |

## Negative/failure-path coverage evidenced

ProjectHub-specific tests cover:
- PROJECT_NATIVE without FFC/Pius;
- CONFIGURED without selected method rejection;
- cross-project OWNED relation rejection;
- SHARED_REFERENCE without graph import;
- transaction rollback;
- append-only PostgreSQL rejection of DELETE;
- idempotency replay;
- idempotency-key mismatch;
- authorization before replay;
- unauthorized project role;
- PH-D4/PH-D5 first-release rejection;
- multi-currency finance rejection;
- funding hard eligibility/distortion;
- missing/stale/out-of-project evidence blocking North Star;
- small-N UDL disclosure state and non-causal semantics;
- incomplete FIELD adapter data;
- unbound CDX gate;
- CDX policy unavailable;
- A4 without release decision;
- A5 generic execution denial;
- LinkedArtifact inbound review requirement.

## Rework preserved

Earlier branch runs failed and were not overwritten:
1. native Node strip-only TypeScript rejected parameter properties;
2. Next build rejected cross-package `.ts` imports until explicit TS import configuration;
3. `map(structuredClone)` passed the array index as the structured-clone options argument;
4. strict web compilation exposed an unsafe Project Field constructor cast;
5. idempotency replay was found to occur before authorization and was moved behind authorization;
6. command digest canonicalization was hardened to include nested payloads.

These are recorded as PH-WP11 rework evidence, not hidden as if first-pass implementation was clean.

## Limits

This verification does not claim:
- production DB admission;
- live provider integration;
- PH-D4 handling;
- public multi-user deployment;
- release or deployment.

Those remain later release/deployment decisions.

## Exit

**PH-WP11 PASS.** Proceed to real-project acceptance pilot.
