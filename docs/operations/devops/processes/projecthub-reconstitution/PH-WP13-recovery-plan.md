# ProjectHub Reconstitution — Release & Recovery Plan

**Process:** FFOS-DEVOPS-PH-RECON-001  
**WP:** PH-WP13  
**Date:** 2026-11-16

## Before merge

Rollback is trivial: keep PR #79 unmerged or close it. No ProjectHub runtime is changed on `main`.

## After merge, before deployment

If a merged candidate is rejected:
1. revert the ProjectHub merge through ordinary Git history;
2. preserve the process/audit documents;
3. do not delete historical ProjectHub PostgreSQL rows where any test/non-production target has been used.

The legacy ProjectHub is not reactivated as a production fallback by default.

## Database migration

Migration 0008 is additive and append-oriented.

Production database application is **not authorized by this release candidate**.

If a future admitted database migration fails:
- roll back the SQL transaction where possible;
- disable ProjectHub writes/routes;
- restore from the pre-migration backup if a production change has been separately authorized;
- preserve append-only evidence already committed;
- do not “rollback” by deleting audit history.

## Runtime recovery

Fast containment order:
1. set `FFOS_PROJECTHUB_WRITES_ENABLED=false`;
2. remove/disable ProjectHub application exposure at deployment layer if necessary;
3. keep read access disabled where authority/database configuration is uncertain;
4. preserve SPETL/audit/effect evidence;
5. reconcile any in-flight A4 external effect separately.

## External effects

The candidate contains no live provider integration and no generic A4 execution endpoint.

If a future A4 effect is admitted, rollback claims must follow the target system's actual reversibility:
- reversible → execute verified reversal and record receipt;
- partially reversible/irreversible → compensating action + residual consequence;
- unknown → stop before effect.

## Recovery acceptance

A restore is complete only when canonical state, event history, object versions, authority state and external receipts reconcile. A healthy UI alone is not recovery evidence.
