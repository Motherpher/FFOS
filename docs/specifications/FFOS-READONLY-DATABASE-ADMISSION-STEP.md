# Step 2B – FFOS read-only database admission

Run this **on a trusted machine/runner** with PostgreSQL `psql` installed and a database connection already configured by the authorized operator. Do **not** paste a database password or full connection URL into a ChatGPT conversation, source file, Git issue or Actions log.

```bash
# Example using standard libpq environment variables set via local secret configuration
PGHOST=<approved-host> PGDATABASE=<approved-database> PGUSER=<read-only-user> \
  bash packages/registry/scripts/probe-postgres-readonly.sh
```

Alternatively, export `DATABASE_URL` in an approved local secret store first, then run the script. The script does not print secrets, but your *shell history* may expose credentials if you type them directly into commands; avoid placing values on command lines.

The probe runs **only** `BEGIN READ ONLY; SELECT ...; COMMIT;`. It identifies database, database role, server version, presence of `ffos` schema, count of the four expected tables, and whether prototype `0006` tables exist in `public`. It does not attempt the migration or create roles. `CREATE` capability reporting is informational only; app runtime should use an independently provisioned least-privilege role.

### Release decision table

| Observation | Next action |
| --- | --- |
| Connection fails | Check Supabase accessibility and authorization; do not migrate |
| Wrong database or unexpected owner | Stop; verify this is FFOS's approved database |
| `public_legacy_0006_count > 0` | Stop; reconcile legacy objects with a reviewed migration plan |
| `ffos_table_count = 0`, expected fresh target | Run `0007_ffos_isolated_data_assets.sql` **only after** an approved backup, isolated rehearsal and explicit migration authorization |
| `ffos_table_count = 4` | Check exact schema/constraints and actual SQL port read-back; this probe alone does not prove full health |
| Mixed/partial table count | Stop and inspect schema/migration history before writes |

**Target selection:** The existing Lovable FFOS Control Tower project reports a Supabase database enabled, but its read-only SQL tool currently errors with *Database is possibly not accessible at the moment*. Its identity as the canonical FFOS/Twin database is unconfirmed. Do not use it simply because it is listed. Digital Twin assets retain their own authority and must not be altered.

**Vercel:** paused billing/deployment component and **never** a dependency for FFOS registry or analytics operations.

**Status:** Manual read-only probe code; no production connection or migration attempted.
