# GitHub Estate Operations — WP04

**Status:** WP04 BOUNDED STAGE MERGED AND VERIFIED / **DG-04 FINAL HOLD**. **Source:** [FF-GH-WP04 Issue #46](https://github.com/Motherpher/FFOS/issues/46) · [Director stage approval](https://github.com/Motherpher/FFOS/issues/46#issuecomment-6602862060) · [merged PR #47](https://github.com/Motherpher/FFOS/pull/47) · [exact merge commit](https://github.com/Motherpher/FFOS/commit/014b75b538f54e6141504d40aebad22d269ae4b0).  
**Privacy:** private FFOS repository; snapshots may include metadata and titles of private source Issues.

## Director's entry points

1. **[Motherpher Estate Portfolio](https://github.com/orgs/Motherpher/projects/2)** — interactive private Project (current native Issues and saved views); *planning projection, not source authority*.
2. [Estate dashboard snapshot](ESTATE-DASHBOARD.md) — dated source-backed metrics and risk/decision entry points.
3. [31-repository adoption register](ADOPTION-REGISTER-v1.md) — Tier A/B/C/D classification, selective source treatment and access implications.
4. [Director handover](DIRECTOR-HANDOVER-v1.md) — how to operate and inspect the estate.
5. [DG-04 assurance report](VERIFICATION-DG04-v1.md) — PASS/PARTIAL/HOLD against WP04 T31–T47.

## Implemented work and status

| WP04 element | Working object | Exact status |
|---|---|---|
| 04.01 Adoption register | [MD](ADOPTION-REGISTER-v1.md) and [JSON](data/estate-adoption-register-v1.json) | 31/31 accessible repositories inventoried and classified; maintainers not individually approved |
| 04.02 Project intake | [Live Project](https://github.com/orgs/Motherpher/projects/2), [D25 native issue ledger](PROJECT-ADOPTION-LEDGER-v1.md), [snapshot](data/portfolio-snapshot-2026-11-03.json) | 13 additional existing Issues linked, 22 total; no source Issue closure |
| 04.03 Reusable configuration | [Standard](CONFIGURATION-STANDARD.md), [templates](templates/) | FFOS-local Issue/PR templates merged into main; reusable candidates not installed in other repos |
| 04.04 Controlled automation | [Contract](PROJECT-SYNCHRONISATION-CONTRACT-v1.md), [script](../../../tools/estate/reconcile.py), [tests](../../../tests/test_estate_reconcile.py) | Read-only offline integrity checks; no live recurring worker or credentials |
| 04.05 FFOS/CDX integration | [Proposed spec](FFOS-CDX-INTEGRATION-SPEC-v1.md) | Design only; not CDX runtime-bound |
| 04.06 Estate dashboard | [Source-backed dashboard](ESTATE-DASHBOARD.md) and native Project views | Interactive GitHub Project with dated reporting snapshot; no fake live refresh |
| 04.07 Evaluation | [Metric baseline](EVALUATION-BASELINE-v1.md) | Observed population and denominators; benefit/effort not measured |
| 04.08 Maintenance | [Operations playbook](OPERATIONS-PLAYBOOK-v1.md) | Defined procedure, no scheduled background service |
| 04.09 Assurance | [DG-04 tests](VERIFICATION-DG04-v1.md) | Mixed PASS/PARTIAL/HOLD, pending independent review |
| 04.10 Handover | [Director handover](DIRECTOR-HANDOVER-v1.md) | Prepared, awaiting review and approval |

## Source restrictions

- FFOS does not own Pius/UDL/Conductellence canonical law or product data.
- FFC governs Corpus, not a duplicate FFOS runtime.
- Source Issue closed ≠ system verified ≠ Director accepted.
- The live Project's Auto-close issue workflow remains OFF.
- Work stages, metrics and source links are not authority or proof of deployment.
- Do not publish private Project snapshots, grant admin tokens or enable automated cross-owner writes without policy and approval.

## Data and tests

[REST metadata snapshots](data/) were captured with authenticated GitHub access and explicitly dated 2026-11-03. Reconciliation is deterministic and can run with no network. [Read-only GitHub Actions run 41627933272](https://github.com/Motherpher/FFOS/actions/runs/41627933272) passed at the exact pre-merge PR head; the authorised bounded PR #47 was subsequently merged into main. This tests only offline snapshot integrity, not current API connectivity or production runtime.

**DG-04 remains HOLD pending source-owner, independent user/technical assurance, privacy, restore and live sync gates.** This directory provides a coherent operating map, not an additional constitutional system.
