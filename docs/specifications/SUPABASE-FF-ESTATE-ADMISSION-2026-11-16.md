# FF Estate — FFOS asset registry migration admission receipt

Date: 2026-11-16
Scope: FFOS data-asset registry; no API adapter, R/QGIS or ChatGPT runtime activation
Environment: Supabase project **FF Estate** (ref `tambsukbyoldkrxnmvpa`), PostgreSQL 17, region eu-central-1
Repository source: `packages/registry/migrations/0007_ffos_isolated_data_assets.sql`

## Verified live state

The connected Supabase management interface reported project status `ACTIVE_HEALTHY`. Before applying the migration:
- No user tables in `public` or `ffos`, no registered Supabase migrations, and `ffos` did not exist.
- An initial read-only SQL query confirmed database connectivity and zero legacy public `ffos_*` tables.
- Security and health advisors reported no findings prior to migration.

The Supabase `apply_migration` call for `ffos_isolated_data_asset_registry_v0007` completed successfully. A new migration record `20261116023132` appeared. Subsequent management queries confirmed **four empty tables** in schema `ffos`:
1. `data_work_orders`
2. `data_asset_versions`
3. `data_reuse_decisions`
4. `data_work_order_asset_links`

Read-only inspection confirmed for each of these tables:
- append-only **BEFORE UPDATE** and **BEFORE DELETE** triggers executing `ffos.reject_asset_mutation()`;
- no RLS (`relrowsecurity=false`);
- `anon`, `authenticated`, `service_role` have **no USAGE privilege on `ffos` schema** and **no SELECT/INSERT on these tables**.

The Supabase table inspection emitted a generic **critical RLS disabled** advisory, asserting potential exposure via client roles. The *direct effective privileges* measured above are more restrictive; it is inaccurate to treat the current tables as demonstrably accessible by those roles. Nonetheless, RLS should be adopted as defense-in-depth under a reviewed policy, without auto-enabling or silently granting broad API access. Supabase's own inspection specifically requested a policy decision before RLS changes.

## What has NOT happened

- No production service-side `DATABASE_URL` binding or privileged runtime secret was configured.
- No actual FFOS runner wrote or read back persistent work-order records in the live database.
- No database access or migration was done in the Lovable Control Tower's separate Supabase backend; that project is a **read-only Digital Twin view**.
- No external API, data-source connector, R or QGIS integration is implied by this migration.
- No RLS policies, production DB app roles, backup / PITR guarantees or runtime grants have been implemented or claimed.
- Vercel is not in the critical path.

## Next controlled gates

1. Decide RLS and least-privilege server-side access model. Prefer private `ffos` schema with `anon` and `authenticated` denied, RLS enabled with no broad policies, and explicitly provisioned FFOS service connection granting only the required operations. Ensure that any append-only enforcement and chosen role permissions agree.
2. Confirm backup and recovery posture before inserting operational data.
3. Bind `packages/agent-runtime/src/data-asset-registry.ts` via existing `pg-driver.ts` to a server-side approved credential (never stored in GitHub).
4. Record first authorized persistent work-order, asset version and reuse-decision **through the runtime**, then verify read-back from a fresh DB session with durable receipts.
5. Admit an API adapter only after those checks pass.

### Gate status

**MIGRATED_SCHEMA / DB_CONNECTIVITY_VERIFIED / TRIGGERS_VERIFIED / CLIENT_ROLES_DENIED / RLS_REVIEW_REQUIRED / LIVE_RUNTIME_NOT_CONNECTED**.
