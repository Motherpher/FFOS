# Supabase ProjectHub storage admission

**Target:** Existing Supabase project **FF Estate**, `tambsukbyoldkrxnmvpa`, Frankfurt (`eu-central-1`).  
**Owner:** `Motherpher/FFOS` — ProjectHub is an FFOS subsystem.  
**Repository authority:** `packages/registry/migrations/0008_projecthub.sql`.  
**Deploy scope:** private `ffos` PostgreSQL schema only; never modify `public`, Auth, website, Drive or spatial domain records.

## Preflight (verified 2026-11-18)
- Supabase project is `ACTIVE_HEALTHY`; PostgreSQL 17.
- Existing `ffos` schema has only four isolated Data Asset Registry tables, all RLS enabled and no `anon` / `authenticated` / `service_role` SELECT grants.
- Existing live database migrations: `ffos_isolated_data_asset_registry_v0007`, `ffos_registry_writer_rls_v0008`.
- Existing registry contains zero asset/work-order entries. Do not seed fake project records.
- ProjectHub implementation is an accepted internal baseline (see `modules/projecthub/README.md`), **not yet a production service**.

## Verified production admission (2026-11-18)

- **Target:** FF Estate / `tambsukbyoldkrxnmvpa` / PostgreSQL 17 / `eu-central-1`.
- **Migration v0009:** `20261118032128 ffos_projecthub_isolated_private_admission_v0009` applied successfully, six `ffos.projecthub_*` tables.
- **Hardening v0010:** `20261118032425 ffos_projecthub_trigger_fixed_search_path_v0010` applied successfully; trigger function `search_path` pinned to empty string in canonical source, [PR #103](https://github.com/Motherpher/FFOS/pull/103).
- **Database acceptance:** all six tables RLS enabled, no `anon` / `authenticated` / `service_role` SELECT grants, six immutable triggers, all ProjectHub tables empty; preexisting four data registry tables preserved.
- **Security advisors:** zero warnings/high findings; six INFO `rls_enabled_no_policy` are intentional denial by default, not grounds for granting public access.
- **Evidence:** [schema PR #101](https://github.com/Motherpher/FFOS/pull/101) and the verified acceptance comment; independent Supabase database metadata, migration list and advisor readback.
- **Release distinction:** **PRIVATE DATABASE SCHEMA DEPLOYED / VERIFIED**; ProjectHub application service / authenticated authorizer / public site integration still **NOT DEPLOYED**. No real project data was ingested.

## Admission requirements
1. Apply the complete canonical `0008_projecthub.sql` as one Supabase migration. It creates 6 ProjectHub tables only in private `ffos` schema, scoped indexes and immutable mutation triggers.
2. Every ProjectHub table must have RLS **enabled with zero access policies** at this stage.
3. No `anon`, `authenticated` or `service_role` table grants; revoke sequence and trigger function EXECUTE rights.
4. Confirm existing 4 data-asset tables and writer policies remain untouched.
5. Re-run Supabase security advisors and table listing; check no exposed `public` ProjectHub object exists.
6. Treat migration admission and application runtime binding as **separate release decisions**. Database tables alone do not give the website, Lovable frontend, FFOS agents or Project Steward any operational permissions.
7. Store *no credentials* in this repo. When binding a runtime later, use a distinct project-scoped authority/mandate and a least-privileged database identity, with tested row-level rights, transactional Unit-of-Work and CDX A3 effect mediation.
8. No real project records, PH-D4/PH-D5, data ingestion or public APIs admitted by this migration.

## Acceptance matrix

| Verification | Required |
|---|---|
| Existing FF Estate healthy | PASS |
| 6 private ProjectHub tables present | REQUIRED |
| RLS on all 6 | REQUIRED |
| Unauthenticated/signed-in/service keys denied by grants | REQUIRED |
| Immutable triggers present | REQUIRED |
| No ProjectHub records created | REQUIRED |
| No `public` ProjectHub tables | REQUIRED |
| Existing data registry intact | REQUIRED |
| Supabase security advisors | no new high-severity issues |
| Runtime app/website connection | **NOT AUTHORIZED** by this migration |

Follow-up after DB admission: FFOS transactional data adapter with a governed database principal and independent authorization, idempotency and CDX effect testing. The public `formflode-com` website remains purely presentational; no service key or direct ProjectHub access in Vite.
