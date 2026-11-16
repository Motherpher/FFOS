# Data asset PostgreSQL runtime port — code verification, not production binding

**Goal:** Prove the FFOS service can append a typed work order, asset-version record and reuse decision, with explicit human-authority guard, transaction rollback and verified readback from a separate PostgreSQL connection.

## Scope implemented

- `packages/agent-runtime/src/data-asset-registry.ts` injects the existing FFOS `SqlPool` interface and an explicit `DataRegistryAuthority` guard. SQL queries use schema-qualified `ffos.*` and parameterized values.
- Three bound operations: `createWorkOrder`, `addAssetVersion`, `logReuseDecision`. Each writes and checks a row **within a transaction**; failing operations roll back.
- `data-asset-registry-pg.test.mjs` uses a disposable real PostgreSQL database and tests authorization denial, readback, duplicate refusal, immutable-history enforcement, then separate session persistence.

## Why this does not authorize a live connection

The test gate `CI_DIRECTOR_TEST` is deliberately fictional and cannot replace CDX/AMA/Director checks. Real runtime must provide an authoritative gate, controlled credentials, database migrations, role-level permission controls, backups and operator evidence. No agent or chat parser can self-grant this authority.

**Critical ownership finding:** The Lovable `Form & Flöde Compass` project (`0d5e5783-1b31-42ad-8cc1-6552137354bc`) reads Digital Twin through `src/ffos/twin.server.ts`, expressly stating READ-ONLY BY CONSTRUCTION. Its backend's presence is **not** authorization to run FFOS's data-asset migrations in the Control Tower database. Its SQL query tool currently returns a database accessibility error. The actual DB connection for FFOS must be sourced from a separately verified FFOS-owned backend; do not silently repurpose the view-layer credentials or database.

**Status:** Runtime persistence port and ephemeral CI tests only. NOT_CONNECTED to live Supabase, NOT_DEPLOYED to an FFOS server, NOT_AUTHORIZED for live writes. Vercel remains non-blocking.
