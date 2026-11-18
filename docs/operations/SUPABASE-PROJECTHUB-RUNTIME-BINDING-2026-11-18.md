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


## WP01–WP02 evidence ledger (updated 2026-11-18)

| Gate | Evidence | Status |
| --- | --- | --- |
| Canonical read-only migration | FFOS [PR #111](https://github.com/Motherpher/FFOS/pull/111); ProjectHub PostgreSQL CI PASS | MERGED / TESTED |
| Supabase role migration | `20261118115925 ffos_projecthub_select_only_reader_v0012` | DEPLOYED |
| Dedicated read-only identity | `ffos_projecthub_reader_login`, LOGIN, NOINHERIT, NOBYPASSRLS, no direct project table privileges | DB VERIFIED |
| Role membership | `ffos_projecthub_reader` exclusively; `inherit_option=false`, `set_option=true` | DB VERIFIED |
| Application credential | GitHub `projecthub-read-canary` encrypted environment secret `FFOS_PROJECTHUB_READ_DATABASE_URL`, required Director reviewer | SECURED / METADATA VERIFIED |
| Live GitHub canary | [Accepted run #44419433670](https://github.com/Motherpher/FFOS/actions/runs/44419433670) | **PASS** — Director-approved restricted DB login, TLS, role and scope |
| Deployed FFOS Next.js runtime | No authenticated service URL/runtime binding evidence | NOT DEPLOYED / NOT VERIFIED |
| Live authenticated HTTP project read | Requires approved service and explicit scope | NOT ACCEPTED |
| CDX A3 write capability | Separate governed mutation implementation/release | BLOCKED |

**Approval completed:** The Director approved the corrected read-only deployment in [run #44419433670](https://github.com/Motherpher/FFOS/actions/runs/44419433670), which completed SUCCESS. The database connection canary is accepted. **Do not automatically set `FFOS_PROJECTHUB_READS_ENABLED=true` or deploy the Next.js app from this canary; authenticated application HTTP E2E and runtime binding remain unverified.**

The original append-capable `ffos_projecthub_runtime` remains separate and is **not** a member of the login. The SELECT-only role is applied only after server-side Director and project-scope authorization. The custom PostgreSQL setting is a scoping mechanism, not an authentication proof.


## WP02 TLS diagnosis and pinned CA remediation — 2026-11-19

Live Director-approved runs [#44300285768](https://github.com/Motherpher/FFOS/actions/runs/44300285768) and [#44391916261](https://github.com/Motherpher/FFOS/actions/runs/44391916261) failed at `CONNECT`. The second run's safe diagnostics established `SELF_SIGNED_CERT_IN_CHAIN` **before database authentication**. A credential-free `openssl s_client -starttls postgres` check independently observed that the Supabase shared session pooler presents a chain ending in `Supabase Root 2021 CA` with a wildcard certificate for `*.pooler.supabase.com`; Node's default CA bundle does not include this private issuer.

The correction is `scripts/projecthub-verify-supabase-tls.sh`: fetch the **public** Supabase root CA over HTTPS from Supabase-owned endpoints; verify the pinned SHA-256 X.509 fingerprint `807025AD50D4ED219D2C9C7D299C004F824EB00CF7F65AFEF607D07B72E6CAFA`; then validate the live pooler certificate chain **and hostname** with OpenSSL. This credential-free check runs on pull requests. Only after it passes may the protected canary use `NODE_EXTRA_CA_CERTS` pointing to the verified temporary CA, retaining `rejectUnauthorized: true`. Do not disable SSL verification or add `sslmode` or `sslrootcert` to the DSN, since those parameters may override Node `pg` options.

**Evidence contract:** TLS preflight PASS is necessary but not sufficient for WP02 PASS. An independently approved live canary must subsequently authenticate the restricted login, verify the reader-only role, confirm absent/foreign project scopes return no data and confirm denied direct table access. The corrected live read-only database run subsequently passed (see acceptance below); the earlier `WP02_HOLD` is superseded for the database canary, but not for application HTTP-runtime acceptance.

**Trust and rotation:** The root certificate is public, not a secret. Fingerprint pinning is an operator-level trust decision against Supabase's published root; future CA rotations must be reconciled against authenticated Supabase guidance and a reviewed change. Never trust an unverified certificate just because a network endpoint returned it.


## WP02 accepted database-canary evidence — 2026-11-19

**Protected GitHub Actions:** [run #44419433670](https://github.com/Motherpher/FFOS/actions/runs/44419433670) — `read-only-acceptance` job SUCCESS after explicit Director approval. The public CA fingerprint and actual Supabase pooler TLS chain/hostname validation passed before reading credentials.

**Production canary receipt:** `outcome=PASS` with `login_verified=true`, `role_verified=true`, `scope_verified=true`, `direct_access_denied=true`, `zero_rows_without_scope=true`, `zero_rows_with_nonexistent_scope=true`. No provider secrets, project content or query results were emitted.

**Independent post-run database check:** six project-scoped reader RLS policies still exist; `ffos_projecthub_reader_login` has `rolbypassrls=false`; zero `ffos.projecthub_projects` rows; zero `ffos.projecthub_events` rows; Supabase security advisors returned **zero findings**.

**Acceptance:** WP01 dedicated private identity and WP02 real restricted Supabase connection/scope canary **PASS**. These are limited to database access, TLS, role enforcement, project-scope plumbing and empty/unknown project negative tests. They do **not** prove cross-project isolation with nonempty production records, Director application HTTP authentication, live FFOS web deployment, authorized portfolio query, or CDX-mediated canonical writes.

**Remaining release hold:** A deployed, authenticated FFOS application must separately prove Director session, project authorization and actual `GET /api/projecthub/projects/{projectId}` read behavior via the protected read-only database identity. Keep write paths fail-closed; no `formflode-com` public client credentials or database schema exposure.
 

## WP02 authenticated HTTP read acceptance — 2026-11-19

**Canonical change:** [PR #116](https://github.com/Motherpher/FFOS/pull/116), merged as `a9ddfcc79c7e08699ca505c43374e73f0ff45fed`, adds an actual Next.js production-app HTTP acceptance runner and a separate synthetic PostgreSQL dataset (CI-only, never FF Estate).

**Independent synthetic test PASS:** [GitHub Actions #44422338772](https://github.com/Motherpher/FFOS/actions/runs/44422338772) compiled the FFOS Next.js application and started it as a local HTTP server, then exercised the actual CDX-gated Director login and project-scoped database reader with two synthetic projects: successful authenticated project GET `200`, nonexistent project GET `404`, denied unauthenticated/tampered cookie access, denied invalid login, no unscoped portfolio enumeration, no writes, rejected oversized project scope. Local PostgreSQL RLS isolation was separately asserted with *nonempty* cross-project data.

**Live DB-backed HTTP admission:** manual main-only [run #44422571120](https://github.com/Motherpher/FFOS/actions/runs/44422571120) dispatched under Director-reviewed `projecthub-read-canary` environment. At authoring time this run is **WAITING FOR REQUIRED DIRECTOR APPROVAL**, not accepted. It reuses the existing encrypted restricted reader DSN only inside a temporary GitHub-hosted Next.js production server, independently validates pinned Supabase CA and hostname, then makes authenticated loopback HTTP requests against FF Estate (production database remains empty). Job explicitly sets `FFOS_PROJECTHUB_WRITES_ENABLED=false`. No runtime secrets reach the source repository or website.

**WP02 closure rule:** `WP02_HTTP_CLOSED` only after the live run concludes SUCCESS with an HTTP acceptance JSON `outcome=PASS` and independent database readback confirms no mutations. If the protected run fails, WP02 stays HOLD while corrections are reviewed and rerun.

**WP04 boundary:** The above is a real authenticated application HTTP/DB integration test in a protected ephemeral GitHub-hosted runner. It is **not** a permanently deployed or publicly reachable FFOS ProjectHub service. A durable authenticated application host, environment configuration and UI enablement remain WP04. Do not silently treat these as part of WP02's bounded CI-hosted acceptance or assert them as operational.
