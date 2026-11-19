# ProjectHub production activation — writer runtime binding candidate

**Process:** FFOS-DEVOPS-PH-PROD-001  
**Issue:** Motherpher/FFOS#102  
**Build slice:** PROD-WP06–08  
**State:** SOURCE CANDIDATE — NOT LIVE / NOT ACCEPTED

## What is implemented

### PROD-WP06 — persistence/runtime identity candidate

- scoped atomic writer transaction is merged through PR #119;
- `ScopedPgProjectHubStore` forces canonical append operations through a transaction;
- migration 0011 prepares `ffos_projecthub_writer_login` as:
  - NOLOGIN;
  - NOINHERIT;
  - NOBYPASSRLS;
  - member only of `ffos_projecthub_runtime`;
  - membership `inherit=false / set=true`;
  - no direct ProjectHub table/sequence privileges.
- no password exists in source or migration.

### PROD-WP07 — authorization/privacy boundary

- Director session remains the only currently admitted HTTP mutation principal;
- local ProjectHub authorizer still runs before A3;
- PH-D4/PH-D5 remain hard denied;
- portfolio enumeration remains not admitted;
- project scope is transaction-local and database enforced.

Broad multi-user ProjectRoleGrant production admission is not claimed by this slice.

### PROD-WP08 — server write binding candidate

`createProjectFromApi` now has the complete source path:

```
Director session
 -> authority/mandate context
 -> source-controlled write admission
 -> separate writer DSN
 -> ScopedPgProjectHubStore(projectId)
 -> local ProjectHub authorization
 -> pinned FFOS CDX A3
 -> durable PRE_EFFECT
 -> atomic scoped ProjectHub UoW
 -> durable POST_EFFECT
```

But the canonical source admission remains:

`PROJECTHUB_WRITE_ADMISSION.state = NOT_ACCEPTED`

Therefore `FFOS_PROJECTHUB_WRITES_ENABLED=true` alone cannot activate the writer.

## Protected live canary

The workflow `projecthub-production-write-canary.yml` is rollback-only. It is designed to prove:

- exact writer login identity;
- no direct table privilege;
- SET ROLE to `ffos_projecthub_runtime`;
- exact project scope;
- pinned CDX A3 permissive decision;
- rollback with zero idempotency residue;
- cross-project RLS denial.

It requires a protected environment named `projecthub-write-canary` and secret
`FFOS_PROJECTHUB_WRITE_DATABASE_URL`.

No connector available in this execution can create/manage GitHub environment secrets, so secret provisioning remains a human/operator security boundary rather than being bypassed.

## Admission sequence

1. merge source candidate with green ProjectHub L3 CI;
2. apply migration 0011 live while writer principal remains NOLOGIN;
3. verify role/membership/advisors live;
4. provision a strong writer password through a secure operator channel and change only that identity to LOGIN;
5. place the resulting session-pooler DSN only in the protected GitHub environment;
6. Human Director approves the protected canary run;
7. require PASS;
8. separately update source admission from NOT_ACCEPTED to ACCEPTED under the production release gate.

Until step 8, the HTTP write path remains blocked even if a credential exists.

## Non-effects

This slice does not:
- deploy a durable application host;
- enable production writes;
- admit PH-D4;
- enable A4/provider writes;
- create browser/Supabase Data API access;
- grant service_role/postgres access to the application.
