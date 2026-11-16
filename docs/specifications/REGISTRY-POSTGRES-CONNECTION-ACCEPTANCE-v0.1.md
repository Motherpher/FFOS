# Step 2 — Registry PostgreSQL connection acceptance

**State:** test-environment verification only; no live database connection.

This PR proves that the SQL baseline and asset-first migration can be applied to a clean **temporary PostgreSQL 16 service in GitHub Actions**. Its synthetic fixtures create one work order, one asset version, one reuse decision and one work-order-to-asset reference. Negative fixtures verify append-only triggers, duplicate version refusal and broken work-order reference refusal.

The migration is intentionally run twice to detect non-idempotent statements. This is not a claim that upgrading an existing production schema is safe without inspecting the actual deployed migrations and migration history.

A PASS here is an infrastructure contract result, **not** proof that an FFOS API service, ChatGPT client, R worker or FF-Spatial QGIS adapter is connected. No real DeSO dataset is stored; `fixture://not-a-real-layer` is deliberately fictitious.

Next live-environment gates:
1. Identify authorized current FFOS PostgreSQL instance and configuration owner; do not expose connection strings in chat or GitHub.
2. Read actual schema and applied migrations; evaluate idempotent migration in isolated clone/backup, not against production directly.
3. Obtain explicit approval for any production migration and run a bounded deploy with rollback/restore plan.
4. Bind and test the typed SQL access ports from the authorized FFOS service; record work-order and asset receipt plus READ-BACK evidence.
5. Only then move to provider API adapter.

**Vercel does not enter this path**, and its account credit/hosting is non-blocking.
