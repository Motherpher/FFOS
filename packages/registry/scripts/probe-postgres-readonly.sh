#!/usr/bin/env bash
# FFOS / PostgreSQL read-only admission probe, v1.
# Does not create/alter any data. No SQL from caller and no secrets printed.
set -euo pipefail

if ! command -v psql >/dev/null 2>&1; then
  echo "BLOCKED: psql is not installed" >&2
  exit 2
fi
if [[ -z "${DATABASE_URL:-}" && -z "${PGHOST:-}" ]]; then
  echo "BLOCKED: Configure DATABASE_URL or PGHOST/PGDATABASE/PGUSER securely, outside the repository" >&2
  exit 2
fi
# PostgreSQL libpq reads DATABASE_URL only when explicitly supplied as a psql
# connection argument. A PGHOST/PGDATABASE/PGUSER environment is also supported.
conn=()
if [[ -n "${DATABASE_URL:-}" ]]; then
  conn=("--dbname=${DATABASE_URL}")
fi

echo "FFOS database admission: read-only preflight"
# psql -X ignores user .psqlrc. The transaction is READ ONLY, so even an
# overprivileged connection cannot mutate tables through this SQL request.
psql -X -v ON_ERROR_STOP=1 "${conn[@]}" <<'SQL'
BEGIN READ ONLY;
SELECT 'database' AS check_name, current_database() AS result;
SELECT 'connection_role' AS check_name, current_user AS result;
SELECT 'server_version' AS check_name, current_setting('server_version') AS result;
SELECT 'ffos_schema_exists' AS check_name,
       (to_regnamespace('ffos') IS NOT NULL)::text AS result;
SELECT 'ffos_table_count' AS check_name,
       (SELECT count(*) FROM information_schema.tables
        WHERE table_schema='ffos' AND table_name IN
          ('data_work_orders','data_asset_versions',
           'data_reuse_decisions','data_work_order_asset_links'))::text AS result;
SELECT 'public_legacy_0006_count' AS check_name,
       (SELECT count(*) FROM information_schema.tables
        WHERE table_schema='public' AND table_name IN
          ('ffos_data_work_orders','ffos_data_asset_versions',
           'ffos_data_reuse_decisions','ffos_data_work_order_asset_links'))::text AS result;
SELECT 'schema_create_capability' AS check_name,
       has_database_privilege(current_user,current_database(),'CREATE')::text AS result;
SELECT 'ffos_schema_usage' AS check_name,
       CASE WHEN to_regnamespace('ffos') IS NULL THEN 'NOT_CREATED'
            ELSE has_schema_privilege(current_user,'ffos','USAGE')::text END AS result;
COMMIT;
SQL
echo "Preflight SQL completed. It does not prove application authentication, backup, migration safety or live runtime."
