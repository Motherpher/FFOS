# FF Estate / FFOS least-privilege database role (2026-11-18)

**Purpose:** Provide narrowly scoped DB privileges for an explicitly authorized future server runtime, *without* creating any credential or granting access to a Supabase API user.

## Migration and status

The migration `packages/registry/migrations/0008_ffos_registry_writer_rls.sql`:
- pins append-only trigger function `search_path` to empty;
- explicitly revokes `PUBLIC`, `anon`, `authenticated`, `service_role` schema/table privileges;
- enables RLS for four FFOS tables;
- creates non-login, non-BYPASSRLS role `ffos_registry_writer`, with schema USAGE and table SELECT/INSERT only;
- scopes SELECT/INSERT RLS policies to **that role alone**. The `USING (true)` conditions are not public: only this private role can use them, and only upon separate credential provisioning and membership approval.
- creates no account password, JWT, connection string, membership or service deployment.

**Not complete:** No `LOGIN` role, server secret, app auth adapter, runtime readback in live Supabase or Director operational activation. No production data. Granting membership requires a separately governed decision and server secrets handled outside ChatGPT and GitHub. Application-level AMA/CDX authorization remains mandatory before insert.

**Test:** Verify new role has NOLOGIN, NOBYPASSRLS; anon/authenticated/service_role retain no schema USAGE, no table SELECT/INSERT; four tables have RLS; RLS policies target only `ffos_registry_writer`; role cannot UPDATE/DELETE; `ffos.reject_asset_mutation` has pinned `search_path`.

**Boundary:** Lovable Control Tower remains read-only; Vercel remains non-blocking.
