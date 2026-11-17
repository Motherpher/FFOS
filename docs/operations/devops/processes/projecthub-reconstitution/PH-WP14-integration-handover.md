# ProjectHub Reconstitution — PH-WP14 Integration & Handover

**Process:** FFOS-DEVOPS-PH-RECON-001  
**State:** TECHNICAL INTEGRATION COMPLETE / PROJECTION UPDATE IN PROGRESS  
**Date:** 2026-11-18

## Accepted baseline

- Human Director disposition: **ACCEPT**
- Accepted candidate: `3196e3e8abc48bb18dd7698f78b4965403eec413`
- Implementation PR: #79
- Merge commit: `d139bcda3d467fb2e6e9c6729c2ae26fc2ec7f1e`
- Release state: **RELEASED_INTERNAL_BASELINE**
- Deployment state: **NOT_DEPLOYED**

## Operator handover

### Runtime locations
- domain model: `packages/projecthub-model/`
- domain runtime: `modules/projecthub/`
- PostgreSQL schema: `packages/registry/migrations/0008_projecthub.sql`
- CDX adapter: `integrations/cdx/projecthub-runtime.ts`
- linked-surface inventory: `integrations/projecthub/surface-inventory.json`
- protected web: `apps/web/app/(protected)/projecthub/`
- API: `apps/web/app/api/projecthub/`

### Runtime admission variables
ProjectHub remains fail-closed without:
- `FFOS_PROJECTHUB_DATABASE_URL`
- `FFOS_PROJECTHUB_AUTHORITY_REF`
- `FFOS_PROJECTHUB_MANDATE_REF`

Canonical writes additionally require:
- `FFOS_PROJECTHUB_WRITES_ENABLED=true`

No production value for those variables is authorized by this closeout.

## Release versus deployment

Merged/released internal code is not equivalent to a deployed ProjectHub service.

A future deployment process must independently admit:
1. target database;
2. authority/mandate refs;
3. user/role identity boundary;
4. runtime secrets;
5. deployment environment;
6. any external provider connector;
7. PH-D4 scope if ever proposed.

## Post-merge reconciliation

Post-merge CDX Runtime Binding, DevOps watch and Household functional CI passed.

Household Family Security failed only because the current npm advisory database newly flags Hono/Vitest dependency paths. The ProjectHub merge changed no Household files. This is tracked as independent estate debt in **Issue #84** and is not rewritten as a ProjectHub defect.

## Projection

The governed `Motherpher/form-flode/17-ffos` projection must now be updated so:
- ProjectHub Contract v0.4 replaces v0.3 as current ProjectHub semantics;
- the native implementation points to `Motherpher/FFOS`;
- the old ProjectHub UI/runtime is explicitly legacy evidence;
- Pius/PIVE is optional governed ingress, not compulsory chain;
- Barnombudet remains independent donor genealogy.

PH-WP14 closes only after that projection update is merged.
