# ProjectHub scoped Supabase runtime — admission checkpoint

**Status:** NOLOGIN ROLE DEPLOYED + APP READ-CANDIDATE SOURCE MERGED / APPLICATION BINDING STILL PENDING  
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

## Independently verified live admission (2026-11-18)

- Canonical [PR #107](https://github.com/Motherpher/FFOS/pull/107) merged, with passing ProjectHub PostgreSQL CI.
- Supabase migration `20261118033752 ffos_projecthub_scoped_nologin_role_v0011` applied successfully in existing `FF Estate`.
- Live verification: exactly 12 project-scoped RLS policies across 6 RLS-protected ProjectHub tables; dedicated role `rolcanlogin=false`, `rolbypassrls=false`; zero actual project/audit rows; **Supabase security advisors: 0 findings**.
- Canonical [PR #108](https://github.com/Motherpher/FFOS/pull/108) merged, and ProjectHub PostgreSQL CI passed. Scoped read adapter requires Director auth, single read-only transaction, exact runtime role and exact transaction-local project scope. Legacy unscoped mutation path is fail-closed.
- Application service URL, dedicated backend login role membership, protected credentials, real server deployment and read-only Supabase HTTP canary **NOT YET VERIFIED**. CDX A3 writes and public frontend access remain denied.

## WP01–WP02: strict read-only production admission (2026-11-18)

**New DB role:** `ffos_projecthub_reader` (`NOLOGIN`, `NOBYPASSRLS`, `NOINHERIT`), independent of the append-capable `ffos_projecthub_runtime` writer. Canonical migration: `packages/registry/migrations/0010_projecthub_readonly_role.sql`. Only six private `ffos.projecthub_*` tables get `SELECT` privileges and six `SELECT TO ffos_projecthub_reader` scoped RLS policies. No `INSERT`, `UPDATE`, `DELETE`, sequence privileges, registry permissions, or public API grants.

**Server-only login:** `ffos_projecthub_reader_login` is a separate Postgres LOGIN, `NOINHERIT`, `NOBYPASSRLS`; member of **reader only**, never writer/admin. Credential handling uses the protected GitHub Actions environment `projecthub-read-canary`, secret `FFOS_PROJECTHUB_READ_DATABASE_URL`. Never place this connection string in repository files, website bundles, CI logs, issues or chat. Restrict network/TLS as supported by provider; rotate immediately on suspected disclosure.

**Canary:** Manual workflow `.github/workflows/projecthub-production-read-canary.yml`, launched from main under required Director review, uses `modules/projecthub/read-canary.mjs`. It validates a real TLS database connection under the dedicated login, absence of direct table access, `SET LOCAL ROLE ffos_projecthub_reader`, no-scope denial, transaction-local exact scope and no nonexistent project returned. The workflow makes no DB mutations. A green CI test against ephemeral PostgreSQL is not a substitute for the live secret-bound canary.

**App:** `withScopedProjectHubRead` now explicitly selects the reader role; the existing Next.js ProjectHub API verifies a Director session before any read and does not expose portfolio enumeration or writes. No application host is deployed by the canary. Enable `FFOS_PROJECTHUB_READS_ENABLED=true` **only after** a bound FFOS server, Director auth, route protection, real reader connection and cross-project negative test have been accepted. `FFOS_PROJECTHUB_WRITES_ENABLED` remains false.

**Security note:** The custom `ffos.project_scope` setting is scope plumbing, not a database-enforced proof of Director authorization. If the reader login password is stolen, arbitrary project scope could be chosen within the private database. The secret therefore belongs exclusively to a trusted FFOS backend with authenticated, project-authorized requests; do not create a direct client/Supabase Data API access path. Future multi-user admission requires a stronger authenticated principal-to-project DB boundary.

**Release classification:** `READ_ROLE_DEPLOYED` / `RESTRICTED_LOGIN_BOUND_TO_CLOUD_CANARY` / `LIVE_CANARY_PASS` are separate from `PROJECTHUB_APP_DEPLOYED` and `CDX_A3_WRITES_ACCEPTED`. Never merge these statuses.
