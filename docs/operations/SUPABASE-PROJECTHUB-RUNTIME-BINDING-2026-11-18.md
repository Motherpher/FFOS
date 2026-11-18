# ProjectHub scoped Supabase runtime — admission checkpoint

**Status:** NOLOGIN ROLE CANDIDATE / NEVER CLAIMS APPLICATION BINDING  
**Target:** Existing `FF Estate` Supabase project (`tambsukbyoldkrxnmvpa`), `ffos` private schema.  
**Canonical source:** `packages/registry/migrations/0009_projecthub_runtime_role.sql`.

## Purpose

This migration adds a dedicated PostgreSQL `ffos_projecthub_runtime` role with `NOLOGIN` and no bypass-RLS permissions. It can only read and append ProjectHub rows when a **transaction-local** `ffos.project_scope` is set to their exact `project_id`.

All six tables use project-filtered `SELECT` and `INSERT WITH CHECK` policies. No `UPDATE`, `DELETE`, `TRUNCATE` or public roles are admitted. Existing immutable triggers remain active. `ffos.data_*` registry tables are not granted to the new role.

**CRITICAL:** PostgreSQL custom transaction settings can be selected by anyone who already holds the database runtime identity. The GUC is therefore **scope plumbing, not authority**. It does not authenticate or validate a Director/mandate/actor or prove CDX consent. Only an authenticated, authorized server service may select a project scope. No direct client use.

## Execution law

```text
Authenticated Director session
   → explicit project ID + mandate + rights authorization
   → CDX A3 decision + SPETL pre-effect record
   → restricted service pool checkout
   → BEGIN
   → SELECT set_config('ffos.project_scope', $1, true)
   → ProjectHub append-only Unit-of-Work
   → audit + idempotency records
   → COMMIT / ROLLBACK
   → CDX post-effect reconciliation
```

Do not perform canonical writes if the CDX port or evidence writer is unavailable. A login grant/secret to a backend runtime and activation of `FFOS_PROJECTHUB_WRITES_ENABLED` require a separate approved deployment, verified environment binding and tests. The current website `formflode-com` must not see any database password or privileged key.

## Admission / verification

1. Supabase `ffos` schema already has six ProjectHub tables, RLS enabled and no public grants.
2. Migrate `0009_projecthub_runtime_role.sql`. Ensure no existing `ffos_projecthub_runtime` role conflicts.
3. Verify `rolcanlogin=false`, `rolbypassrls=false`; all six RLS table policies have *only* `TO ffos_projecthub_runtime`.
4. Query as the restricted role using a rollback-only transaction. Without scope: zero rows. With an unauthorized/mismatched project ID: zero rows and INSERT rejected. Within scope: only that project's rows. Plain PostgreSQL CI uses synthetic fixtures; production uses no real data to test.
5. Existing four data asset tables, public schema and Google Drive remain unchanged; rerun Supabase security advisors.
6. This is **database authorization substrate**, not application runtime acceptance. A later connection secret, service host, session scope wrapper, CDX port and live E2E acceptance are distinct required gates.

## Boundaries and risks

- Role is `NOLOGIN` and not yet granted to any login principal, so it cannot be used by an externally hosted service.
- `SET LOCAL` must be applied inside the same DB transaction and connection as every relevant query. A generic pooled query outside its scope must fail closed.
- PostgreSQL role-based RLS does not automatically implement business-object ownership, Director validation or cross-project rights; those checks remain mandatory in the FFOS authorization layer.
- A Director session and cookie/CSRF protection must precede any HTTP mutation. Never expose raw SQL or unconstrained public CRUD endpoints.
- PH-D4/PH-D5 and A4/A5 remain excluded.

## Status vocabulary

`SCHEMA_DEPLOYED` ≠ `ROLE_ADMITTED` ≠ `RUNTIME_BOUND` ≠ `CDX_ACCEPTED` ≠ `FRONTEND_CONNECTED`.

## Scoped read adapter implementation (candidate)

The FFOS application now includes `modules/projecthub/src/scoped-pg.ts`, an explicit **read-only** scoped transaction. It opens one PostgreSQL connection, starts `BEGIN READ ONLY`, switches to the `NOLOGIN` role with `SET LOCAL ROLE ffos_projecthub_runtime`, verifies effective `current_user`, sets the project scope with a parameterized `set_config(..., true)`, and runs all reads in the same connection before committing or rolling back. The role identity must be granted through a separately approved backend login. When the role cannot be selected, queries fail closed.

The existing `apps/web/lib/projecthub/server.ts` checks the Director session and ProjectHub read feature flag prior to executing the scoped reader. Direct project-specific reads are **candidates only**; no runtime secrets are configured. Portfolio enumeration remains explicitly blocked (single-project RLS must not be weakened merely to populate the dashboard). All web mutation routes remain blocked until separate CDX-evidenced scoped-write acceptance. The current deployment state remains `DATABASE_PRIVATE_APP_NOT_VERIFIED`.

**Required configuration at future runtime deployment (NOT set here):** `FFOS_PROJECTHUB_DATABASE_URL` must identify a dedicated restricted server-only LOGIN role with membership allowing `SET LOCAL ROLE ffos_projecthub_runtime`; `FFOS_PROJECTHUB_AUTHORITY_REF` and `FFOS_PROJECTHUB_MANDATE_REF` must be verified, `FFOS_SESSION_SECRET` must be deployed through protected secrets, and `FFOS_PROJECTHUB_READS_ENABLED=true` only after a bound connection/cross-project test. Do not use the Supabase `postgres` admin URL or any browser-visible `VITE_*` key. `FFOS_PROJECTHUB_WRITES_ENABLED` stays false.
