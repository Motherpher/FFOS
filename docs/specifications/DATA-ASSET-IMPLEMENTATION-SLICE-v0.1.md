# FFOS asset-first implementation slice v0.1

**State:** CODE STAGED, DATABASE MIGRATION NOT APPLIED, RUNTIME NOT CONNECTED.

This slice adds append-only PostgreSQL tables in `packages/registry/migrations/0006_data_asset_workorders.sql` a side-effect-free compatibility evaluator `packages/registry/src/data-assets.ts`, and parameterized, injected-client SQL persistence operations in `packages/registry/src/data-assets-store.ts`.

The SQL adds immutable work order records, logical assets with immutable version IDs and checksums, explicit reuse decisions and links from work order to input/output asset versions. Reuse assessments are logged by a future runtime; this repository commit does not independently execute that runtime or migrate a running database.

The evaluator fails closed on absent rights, absent QA and invalid checksums; rejects geography vintage, population, observation period, geographic scope and schema mismatch; returns refresh required for stale source. `REUSE_WITH_TRANSFORMATION` is reserved for a separately admitted, explicitly approved transformation contract and is never guessed from a mismatch.

Existing `ffos_objects` / `ffos_events` remain the core immutable state and event lineage. A work order's changing status should use those existing events, not mutable status fields on the new tables.

**Not yet implemented:** database migration/application to a running instance, transaction-bound production backend integration, data source adapter, secret vault, R worker, cross-repo service transport, QGIS bridge runtime, local machine access and ChatGPT plugin. No live external effect or deployment is implied.

**Validation:** `.github/workflows/data-assets-ci.yml` runs offline Node tests for both the reuse evaluator and parameterized SQL ports. These use an in-memory mock SQL client, not PostgreSQL. The migration requires a PostgreSQL integration test and explicit release/Director authorization before application. A demonstration cannot count as production.
