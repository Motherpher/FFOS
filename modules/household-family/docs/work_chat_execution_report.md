# Household Family 2.0 — execution report

Date: 28 October 2026. Classification: **implemented and committed candidate; 46 GitHub CI tests pass; live deployment/integration gates remain open**.

## Delivered implementation

- One narrow MCP adapter with ten tools, accurate safety metadata, OAuth/JWKS validation, live token introspection, server-side scope/project authorization and protected-resource discovery.
- Durable PostgreSQL/SQLite state, fenced leases, optimistic revisions, unique WP revisions/idempotency keys, queue, external operation ledger, transactional progression outbox, repeat-safe backoff/dead letters and persistent cancellation/recovery.
- Read-only Janitor, registered J1 Handyman and a fresh credential-free Verifier process evaluating exact commit/CI observations. No arbitrary shell or unrestricted autonomous coding is exposed.
- GitHub App adapter with reduced per-repository installation tokens, default-branch validation, immutable file/diff observations, feature-branch/draft-PR candidates, trusted CI workflow digests, raw run/job/artifact evidence and read-back.
- External signed Director authorization/decisions, explicit automation identity, HCC/CI cost references, pinned external CDX effect decisions/SPETL evidence, append-only evidence and hash-chained audit.
- JSON schemas for project/WP/run/evidence/decision/audit/fault/policy, migrations, HTTP boundary specification, disabled observation configuration, plugin packaging template, Docker/Compose configuration, runbook and release rollback plan.

## Source reconciliation

Fifty pinned repository source reads and the supplied governing documents are recorded in `source_lineage.json`. Canonical J0/J1/J2 were positively located; J2 is a stop, not a substantive automatic repair class. AMA is unresolved and carries no authority. Closed September mandates were not reused. The newer FFOS domain/Pius/CDX boundaries were preserved. The FF-Spatial source inspection found 40 sourcing packages, all PLANNED; the P1–P5 mapping was not verified.

## Verification obtained

Local TypeScript compilation passed. The retained Vitest report records **45 passed, 0 failed, 1 skipped**; the skipped test requires a PostgreSQL service not available in the local build container. The suite includes AT01–AT25 fixture assertions plus security/governance/recovery cases. The local dependency audit reported zero known vulnerabilities at the time recorded; it is not a timeless security certification.

The production GitHub/Director/CDX HTTP adapter contracts, actual MCP SDK client/server handshakes, token revocation/expiry/audience checks, independent Verifier processes, crash-after-commit reconciliation and cancellation boundaries were exercised against isolated services. The demonstration completed two dependent fixture WPs, including one failed criterion and bounded repair, and produced 78 hash-chained audit events with a valid chain. Fixture public verification material is retained with the demo. No fixture acceptance represents genuine external Director or HCC/CDX clearance.

Source commit [`a327c6978d31a72a6d6cb0bc514ef755dbc83bc2`](https://github.com/Motherpher/FFOS/commit/a327c6978d31a72a6d6cb0bc514ef755dbc83bc2) is delivered in [draft PR #20](https://github.com/Motherpher/FFOS/pull/20). All 77 original committed files were verified against local Git blob hashes. Both push and PR CI/security workflows passed. The downloaded test artifact digest matched GitHub metadata and records **46 passed, 0 failed, 0 skipped**, including the real PostgreSQL driver/concurrency/restart/audit test. The downloaded security artifact digest also matched and records zero known vulnerabilities. The CI fixture demo retained 78 valid audit events. Full observations are in `docs/evidence/github-integration.json`. They prove source delivery and CI execution; they do not prove a deployed MCP endpoint, installation of the backend's own GitHub App, or a live Director/CDX connection. The Vercel preview check is failing and links to account-deployment-blocked guidance; the deployment API returned no deployment for this commit. The exact account-level reason was not independently verified or changed.

## Work-package disposition

| WP      | Disposition                                                                                                 | Remaining gate                                                                      |
| ------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| HF-WP00 | Source discovery/reconciliation implemented                                                                 | AMA unresolved; live authority not inferred                                         |
| HF-WP01 | Contracts, authority matrix and schema candidate delivered                                                  | Canonical release acceptance remains external                                       |
| HF-WP02 | MCP/auth tools locally integration-tested                                                                   | Real IdP enrollment and ChatGPT connection                                          |
| HF-WP03 | Durable core/recovery tested on SQLite and real PostgreSQL CI                                               | Production deployment/persistence drill remains open                                |
| HF-WP04 | Roles and GitHub adapter implemented; bounded HTTP sandbox exercised                                        | Backend GitHub App installation and live permission envelope                        |
| HF-WP05 | Signed Director/CDX contract adapters and automatic progression tested                                      | Genuine current authority/service binding and acceptance                            |
| HF-WP06 | 25 fixture acceptance cases plus security/governance/recovery regressions; 46 total tests passed in real CI | Live AT25 and production/security/operator acceptance remain open                   |
| HF-WP07 | Two-WP local contract sandbox passed                                                                        | A genuine externally approved live sandbox is not claimed                           |
| HF-WP08 | Plugin metadata/template, OAuth transport and connection instructions delivered                             | HTTPS host/tunnel, account consent, registration and actual ChatGPT tool invocation |
| HF-WP09 | Connected read-only FF-Spatial source inspection completed                                                  | Director identifies exact approved safe pilot and resolves P1–P5 mismatch           |
| HF-WP10 | Candidate release/runbook/rollback prepared                                                                 | Human license, merge/tag and constitutional release decision                        |

## Deployment and human actions

**Household backend deployed by this build: none.** No production URL, custom plugin ID, genuine Director acceptance, HCC seal or live CDX/runtime registry entry is asserted. The existing FFOS Vercel project was inspected read-only; its configured Phase-0 login is not a substitute for the new service identities. No existing deployment/permissions/secrets were altered. The current FFOS default branch reports `protected=false`; the backend now explicitly denies bounded mutation until actual default-branch protection is verified.

The concrete next gate is a single approved deployment/identity envelope: durable host and PostgreSQL, OAuth issuer/JWKS/introspection and callback/client setup, a selected-repository GitHub App, current signed Director dispatch/acceptance feed, genuine pinned CDX evaluation and HCC/CI-capacity clearance. Secret values should be entered through the host/provider interfaces, not sent through chat. After those are provisioned, follow the README/operator manual to deploy, perform live connection tests and complete a fresh-conversation retrieval. A human must approve ChatGPT's account/workspace connection consent and the final release/license.

## References

- User (2026) _Household Family 2.0 execution directive_ and _HF-2.0-WORK-001 v1.0_, supplied 28 October 2026.
- Canonical/private and official technical references: `source_lineage.md`, with immutable source identifiers in `source_lineage.json`.
- Inspectable implementation evidence: `docs/evidence/vitest-local.json`, `docs/evidence/npm-audit.json`, `docs/evidence/sandbox-demo.json`, `docs/evidence/ff-spatial-read-only.json` `docs/evidence/vitest-ci.json`, `docs/evidence/npm-audit-ci.json`, `docs/evidence/sandbox-ci.json` and the repository integration record.
