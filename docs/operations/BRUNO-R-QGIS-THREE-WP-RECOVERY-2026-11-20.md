# Bruno → R → FF-Spatial/QGIS | Three-WP recovery programme

**Baseline:** 2026-11-20. **State:** IMPLEMENTATION IN PROGRESS — NOT END-TO-END ACCEPTED.
**Coordinator:** FFOS; **domain owners:** FFOS (governed orchestration, Bruno API contracts); FF-Spatial (R, geographic data, GIS artifacts); Director (external authorisation and acceptance).

## Scope and precedence

This recovery effort has **exactly three programme work packages**: WP01, WP02, WP03. Internal engineering tasks, tickets, existing PR numbers and the FF-Spatial sourcing register SRC-WP00–39 are **not additional programme WPs** and must not be deleted, renumbered or falsely marked complete. Existing AMA, HCC, HARP, Pius governance, licence and approval gates take precedence. Director approval cannot be inferred from this document, repository merge, prior conversation or an HTTP 200.

Bruno is a versioned request-contract and developer testing layer, **not** an agent or an autonomous server. FFOS owns admission, runtime orchestration, secrets boundary and receipts; the R processing domain and QGIS/headless GIS execution remain with FF-Spatial. An approved GitHub workflow dispatch is not equivalent to successful artifact/readback acceptance.

## WP01 — API & Data Integration (FFOS → Bruno contracts → governed provider adapter → R)

**Starting evidence:** FFOS PR #51 merged the OpenCollection Central API Ledger; FFOS PR #52 remains open for a bounded Bruno CLI connector. FF-Spatial PR #40 remains open for a guarded R processing pipeline. Prior local Kolada→R 25/25 and R/QGIS generator 4/4 tests are historical component evidence, not a fresh or continuous production acceptance.

**Provider access evidence — assertions supplied by Director, not independently tested:**

| Registry subject | Access assertion | Verified runtime status | Required evidence |
| --- | --- | --- | --- |
| SCB Allmänna företagsregistret (AFR) | Request approved, API key issued | NOT TESTED | Header-secret injection, authorised endpoint and schema/identity readback |
| Lantmäteriet account | Account created | NOT TESTED | Actual approved service entitlement |
| Lantmäteriet Geotorget | Access granted | NOT TESTED | Dataset licence, API/portal capability, approved download/readback |
| Bolagsverket API | API data access granted | NOT TESTED | Exact product, endpoint, scope, credential and identity/response verification |

Lantmäteriet account and Geotorget are two assertions regarding **one provider**. Do not register four distinct organisations. SCB AFR is separate from SCB public statistics. No keys, tokens, provider payloads or personal data are to be committed, pasted in issues, or copied to shared Bruno environment files. Existing key values are **not** present in this document.

**Tasks:** review FFOS #52 and FF-Spatial #40 against main; keep Director/CI gates; reconcile real collection paths and output report format; verify local secret handling; check provider terms, pagination, identity, rate limiting, observation year and geography vintage; produce canonical input contracts and deterministic R output with provenance; preserve the original raw source.

**Exit:** independent run evidence linking authorised request → HTTP response identity/pagination and rights → validation → pinned R transformation → output hash/provenance → FFOS run receipt. Explicitly record untested providers; no blanket provider-coverage claim.

## WP02 — Spatial Execution & Persistence (R → FF-Spatial → QGIS or headless GIS)

**Starting evidence:** FF-Spatial PR #41 remains open and depends on #40; PR #43 is merged, providing governed local bridge job/readback logic; PR #44 merged headless GDAL workflow; PRs #47–49 merged opt-in Drive persistence and create-only security boundary. Neither a merged PR nor an offline test proves a live Mac or cloud acceptance.

**Tasks:** reconcile #41 after #40; verify GeoPackage geometry, named layer, IDs, CRS, feature count and source year; test the local QGIS MCP/live readback route and separately the cloud GDAL route; use source rights-specific geography and no unapproved vintage substitutions; retain artifact hashes and independent validation; validate Drive create-only restrictions, approved root, release flag and fresh-file readback before publication.

**Exit:** independently verified spatial output with source/data/transform lineage and stored artifact identity; terminal receipt tied to actual selected execution mode. Local and cloud modes require distinct evidence. Never claim completed Kolada municipality spatial join based solely on historical ADM1 boundary layer.

## WP03 — End-to-end acceptance & handover

**Tasks:** select one rights-cleared real analytic case with a compatible geographic level/vintage; execute full Director-authorised FFOS workflow from provider ingestion through R, FF-Spatial/GIS and storage; verify numerical and geographic integrity, readback and terminal status; record faults and recovery; audit HARP, HCC, AMA applicability and no authority amplification; update operational docs, capability ledger, provenance, limitations, and release notes.

**Exit:** Director-reviewed run ID, versions, input origin, linked evidence, hashes, independently checked output, successful terminal state, and explicit release decision. A staged design or static CI never closes this WP.

## Execution / hold rules

1. **Maximum 3 programme WPs.** Failed gates stay as typed blockers inside their parent WP; do not proliferate programme WPs.
2. WP01 → WP02 → WP03 gates are sequential for acceptance; safe, independent code review and test preparation can overlap.
3. No automatic merge, provider-key handling, external publication, local Mac execution or source substitutions based merely on this plan. Follow established repo protection and human authorisation.
4. Any uncertain status is `UNVERIFIED`, `BLOCKED` or `NOT TESTED`; never re-label to PASS without evidence.
5. Each WP produces an evidence ledger, test results, exceptions, Director decision and roll-forward/rollback path. Existing source workpackage statuses remain governed by their own DAG.
6. Cross-repository source of record: this FFOS coordination document, plus FF-Spatial's linked implementation status record. Repository documents do not by themselves provide runtime credentials or invoke jobs.

## Immediate sequencing (2026-11-20 snapshot)

- **WP01 / active:** review FFOS #52, FF-Spatial #40; collect provider-specific non-secret entitlement metadata and secure Mac/runtime preflight. SCB AFR, Lantmäteriet/Geotorget and Bolagsverket are access-confirmed by user report only.
- **WP02 / preparation:** review FF-Spatial #41 dependency; reconcile merged #43/#44/#47–49 to independent live receipts.
- **WP03 / not started:** no complete Director→API→R→GIS→artifact run accepted.
