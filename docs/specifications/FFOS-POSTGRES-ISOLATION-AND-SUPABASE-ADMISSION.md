# FFOS PostgreSQL schema-isolation integration — candidate

**Implementation:** new `0007_ffos_isolated_data_assets.sql` migration creates *only* `ffos.*` asset/work-order tables and a local immutable-row trigger. It does not migrate or overwrite the Digital Twin tables or any `public` tables.

**Important history:** `0006_data_asset_workorders.sql` is a previously merged prototype using unqualified table names. **Do not apply 0006 in the intended Supabase target.** A deploy controller must select 0007 explicitly. Existing environments that have already applied 0006 need a separately reviewed migration reconciliation and cannot use an automatic blind clean-up.

The new SQL persistence ports target `ffos.data_work_orders`, `ffos.data_asset_versions` and `ffos.data_reuse_decisions` explicitly, irrespective of a runtime's search path. The CI fixture creates a separate fake Twin schema to verify no cross-schema mutation and uses PostgreSQL 16.

**Live database discovery:** Lovable FFOS Control Tower project `0d5e5783-1b31-42ad-8cc1-6552137354bc` reported `enabled=true`, `stack=supabase`. Its read-only schema inspection returned `Database is possibly not accessible at the moment`. Therefore neither the existing Digital Twin Supabase environment's actual endpoint/schema nor its ownership/access controls are verified. Do not blindly run this migration there.

**Prerequisites for live activation**
1. Read-only inspection of actual target schemas, applied migrations and owner. Confirm this is the correct FFOS instance rather than a separate Lovable app backend.
2. Confirm backups, admin-owned migration authorization, test connection and least-privilege app role. No unrestricted `public` schema writes.
3. Run migration in an isolated restored copy; then, with a verified authorized window, in a live target.
4. Carry out real work-order INSERT/read-back using separately provisioned secrets. Never copy credentials to chat, CI logs or repository.
5. Verify rollback/restore and record receipts. Vercel is not a dependency.

**Status:** Schema/CI implementation only, not a production migration or verified Cloud Supabase link.
