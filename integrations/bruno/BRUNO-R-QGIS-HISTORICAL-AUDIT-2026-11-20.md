# Bruno · R · QGIS · FFOS — historical integration audit and learning archive

**Audit date:** 2026-11-20  
**Record:** `FFOS-BRQ-ARCHIVE-20261120-001`  
**Status:** SOURCE-LINKED RECONSTRUCTION; NOT A COMPLETE LIVE SYSTEM VERIFICATION  
**Programme scope:** WP01 API & Data; WP02 Spatial Execution & Persistence; WP03 End-to-End Acceptance & Handover — **maximum three programme work packages**.  
**Archive owner:** `Motherpher/FFOS`; implementation authority remains with each owning repository.  
**Source snapshots read:** FFOS `4b59c9a7bcdb1dd8a2887494bd6475006e50beb5`; FF-Spatial `4e8b3ca3afffb9193186ad95dc67a29c04b11106`; FFC `51e3ac6224621abf9fb112415e51ce5e9e51931b`; Pius Codex `90be571ea6bd463096e842deae0d886d013ec84a`; Pius Universe `e91571b4776d404a45e1c2086558e6b4fc0c0385`; GreenBell `7671ac17432f335595b31ba4bb69386bb92c8c23`. A SHA pins repository content observed, **not** all prior activity or untracked local files.

## 1. How to read this record

This is a retrospective and a guide to find original evidence, not a replacement for original pull-request review, source files, CI logs or run receipts. Source evidence is classified as:
- **DESIGNED** — requirements or proposal only.
- **IMPLEMENTED** — source code exists on named branch/main.
- **TESTED-OFFLINE** — local mocks/CI contract tests, no live provider or external effect.
- **LIVE-EXERCISED** — a particular runtime interaction was reported/evidenced, not necessarily semantically complete.
- **CONNECTED** — a specific supported system boundary is genuinely reachable; distinguish local vs cloud.
- **ACCEPTED** — independent required result, source rights, output readback, authority approval and durable receipt.
- **UNVERIFIED / BLOCKED** — unavailable source, missing receipt, unknown entitlement, pending authorisation or unexecuted step.

**Status is per interface and run, never inherited from another component or a merged PR.** GitHub merge is version-control evidence, not production activation.

## 2. System ownership and architecture

| System / repository | Authoritative role | Evidence and limitations |
| --- | --- | --- |
| [FFOS](https://github.com/Motherpher/FFOS) | Central API Ledger, execution policies, provider adapters, work orders, audit receipts, platform integration | Bruno OpenCollection on main; bounded CLI runner PR #52 open; cloud Kolada workflow exists; whole chain not accepted |
| [FFC / form-flode](https://github.com/Motherpher/form-flode) | Business/method semantics, requirements, source and visual governance | PR #43 merged a **proposed** workflow and FFC-DATA-01–18; not runtime authority by itself |
| [FF-Spatial](https://github.com/Motherpher/FF-Spatial) | Geographic source registry, R/GIS transformation, spatial asset identity, QGIS bridge/headless GIS | R PR #40 and handoff PR #41 open; local and cloud code on main; independent end-to-end result absent |
| [Pius Codex 5](https://github.com/Hybrismannen/pius-codex-5) / [Pius Universe](https://github.com/Hybrismannen/pius-universe) | Separately governed HARP/HCC/Pius requirements; may constrain source decisions | Do not assume automatic live integration or transfer constitutional authority from repository references |
| [GreenBell](https://github.com/Motherpher/GreenBell) | Independent research, models and datasets | Domain consumer/candidate, not evidence that a live Bruno/R/QGIS adapter is deployed |
| Domain repositories | Own project meaning and restricted data | Reusable API/geographic assets may be referenced by immutable ID; no uncontrolled bulk copies |

### Intended workflow (may skip stages where genuinely unnecessary)

`Director/ChatGPT question → FFC semantic specification → FFOS work order and existing-asset reuse check → Bruno-versioned request contract / bounded API adapter → approved dataset → optional R transform → optional FF-Spatial spatial analysis/QGIS or headless GDAL → independent QA/provenance → rights-approved durable artifact → FFOS receipt → optional visual publication`.

Do **not** confuse Bruno Desktop with FFOS runtime or QGIS Desktop with the mandatory execution engine. FFC-DATA-09 explicitly permits skipping R for reusable verified base layers; FFC-DATA-15 makes visual apps derived consumers, not source authorities.

## 3. Source-linked chronology

| Date (2026) | Historical event / primary evidence | Correct interpretation |
| --- | --- | --- |
| 29–30 September | [FF-Spatial](https://github.com/Motherpher/FF-Spatial) created; original QGIS→GitHub integration concept | Initial repo/architecture, not automatically linked Desktop |
| 13 November | [FF-Spatial R PR #40](https://github.com/Motherpher/FF-Spatial/pull/40) opened; R 4.6.2/RStudio, QGIS R Processing provider and test_sf demonstration recorded in `R/IMPLEMENTATION_STATUS.md` | Local R/QGIS interoperability; later R renv/smoke + 21-feature EPSG:3006 pilot described in PR, but PR open |
| 15 November | FFOS/Bruno Central API Ledger ownership discussed and [ADR proposed](https://github.com/Motherpher/FFOS/blob/main/docs/decisions/ADR-API-LEDGER-OWNERSHIP-PROPOSED.md) | Proposed ownership; no local collection import automatically established |
| 15–16 November | [FFOS PR #51](https://github.com/Motherpher/FFOS/pull/51) merged OpenCollection YAML requests, source docs and static QA | Source-controlled API definitions; HTTP 200 on separate local Kolada testing does not certify the entire dataset or new repository checkout |
| 15–16 November | [FFOS PR #52](https://github.com/Motherpher/FFOS/pull/52) staged hash-pinned allowlisted Bruno CLI and tests | Still OPEN, pre-agent; `FFC-INTERSYSTEM-WORKFLOW-V1.md` records a Director-run local `--execute` with exit_code=0 and private reporter. Reporter semantics were initially unverified |
| 15–16 November | [FF-Spatial PR #41](https://github.com/Motherpher/FF-Spatial/pull/41) prepared R-derived GeoPackage→typed approved bridge job | OPEN and based on #40 branch; generator alone never dispatches |
| 16 November | [FF-Spatial PR #43](https://github.com/Motherpher/FF-Spatial/pull/43) merged approved-job/live-readback guards | Prior user-reported 25/25 FFOS→Bruno→Kolada→CSV→R and 4/4 handoff tests, local QGIS MCP ping and historical 21-feature ADM1 layer; final exact approved QGIS live receipt still requires evidence |
| 16 November | [FFOS PR #53](https://github.com/Motherpher/FFOS/pull/53), [FF-Spatial PR #42](https://github.com/Motherpher/FF-Spatial/pull/42), [FFC PR #43](https://github.com/Motherpher/form-flode/pull/43) merged asset-first and reusable data/GIS contracts | Metadata/registry code and proposed governance, not complete verified reusable live spatial assets |
| 16 November | [FF-Spatial PR #44](https://github.com/Motherpher/FF-Spatial/pull/44) merged headless GDAL GeoPackage workflow; FFOS cloud API and dispatch workflows present | Mac-independent path implemented; dispatch receipt ≠ downstream success, cloud pilot rights and independent result require verification |
| 16–18 November | FF-Spatial [PRs #47](https://github.com/Motherpher/FF-Spatial/pull/47), [#48](https://github.com/Motherpher/FF-Spatial/pull/48), [#49](https://github.com/Motherpher/FF-Spatial/pull/49) merged cloud persistence and create-only/security controls | Google Drive v1 code; OAuth, protected environment, live upload/readback separate acceptance gates |
| 18 November | `FF-Spatial` main `4e8b3ca` includes stronger Drive write constraints | Evidence of code state, not a Google Drive storage run receipt |
| 19–20 November | FFOS ProjectHub production work [PR #120](https://github.com/Motherpher/FFOS/pull/120) / [#121](https://github.com/Motherpher/FFOS/pull/121) | Separate FFOS runtime/DB progress; latest #121 records a live NOLOGIN principal but source write admission remains NOT_ACCEPTED |
| 20 November | [FFOS PR #122](https://github.com/Motherpher/FFOS/pull/122) and [FF-Spatial PR #50](https://github.com/Motherpher/FF-Spatial/pull/50) opened | Three-programme-WP recovery documents; draft/unmerged, not new execution or test results |

## 4. Bruno inventory and archive history

**Observed local Mac screenshot, 2026-11-20:** Bruno 4.3.0; collection `/Users/linusfast/Documents/bruno/Central API Ledger`; Development selected; **18 requests**; folders SCB AFR, SCB/PxWeb, Kolada, Eurostat, OECD, World Bank, public governance, health/welfare, funding, FFOS, FFC/Work and Green Bell. Screenshot shows an `Initialize Git` control, not remote linkage.

**GitHub main:** `integrations/bruno/central-api-ledger/opencollection.yml` with one SCB AFR auth test, 14 numbered Kolada requests and three historic top-level Kolada requests (18 requests), plus folder placeholders. **Matching total count does not establish identical request content, folder hierarchy or environment.** Local contains FF-specific folders not in GitHub main's imported tree. Local `Development` contents and credentials are not accessible through GitHub.

**Archive standard:** versioned, reviewed, safe request definitions in FFOS; hash/filename inventory for admitted definitions; local secrets excluded; CI static check + separately identified live tests; PR and commit history; pointer to approved external evidence rather than raw sensitive payloads. See `integrations/bruno/ARCHIVE.md` on this archive branch. The actual Mac-to-Git safe reconciliation, independent second-checkout restore and full historical migration are NOT COMPLETE.

## 5. R and QGIS evidence, old and new

**R** — [PR #40](https://github.com/Motherpher/FF-Spatial/pull/40): new `R/scripts/spatial_pipeline.R`, smoke tests, `renv` files. Director reported local smoke success and historical geoBoundaries SWE ADM1 (21 features, 2009 vintage), EPSG:4326→3006, opened in QGIS. GDAL/curl mismatch and independent sidecar hash verification remained outstanding. The older status file itself predates later positive evidence; read the PR chronology, not only its stale ledger.

**FFOS data → R** — [PR #52](https://github.com/Motherpher/FFOS/pull/52) staged private reporter inspection, canonical Kolada CSV with provenance and controlled export. [PR #41](https://github.com/Motherpher/FF-Spatial/pull/41) includes `R/scripts/import_ffos_kolada_lookup.R`, validating Uppsala municipality ID `0380` to non-spatial RDS. Municipality identity metadata is **not polygon geometry**.

**QGIS local** — `qgis/` Python scripts and `bridge/` local approved-job/receipt semantics; QGIS MCP documented ping and historic 21-feature layer. [PR #43](https://github.com/Motherpher/FF-Spatial/pull/43) adds independent live readback requirement. Do not mark final layer ingestion accepted without terminal verified receipt.

**GIS cloud** — [docs/CLOUD-HEADLESS-GIS.md](https://github.com/Motherpher/FF-Spatial/blob/main/docs/CLOUD-HEADLESS-GIS.md) and Actions `cloud-headless-adm1.yml` use GDAL and geoBoundaries, independent of a local Mac. Does **not** establish official DeSO/municipal statistics join, current SCB authority or all worldwide ADM levels. GitHub artifacts expire; durable data is a separate product.

**Reusable assets** — `gateway/spatial_assets.py` on main registers compatible metadata versions and access/QA requirements; JSON storage is not a concurrent transactional database and metadata record is not proof a file opens. FFOS work-order database concepts and PostgreSQL port require separately verified live admission.

## 6. Provider / API entitlements

User-confirmed communications (not inspected as complete provider contracts): SCB Allmänna företagsregistret API key issued; Lantmäteriet account created and Geotorget access granted; Bolagsverket API data access granted.

| Provider/product | Local/Git evidence | Remaining proof |
| --- | --- | --- |
| Kolada | 14 grouped Bruno requests, 3 legacy, documented manual CLI pilot and FFOS cloud municipality adapter | Each operation's schema, paging, rights and current live run; actual historical extraction not implied by lookup |
| SCB public PxWeb/statistics | Folder / FF-Spatial adapters and catalogue sources | Per-endpoint tests, schema and geographic/vintage contracts |
| SCB AFR | Bruno auth definition uses `{{scb_afr_api_key}}`; Director says key issued | Secure local env binding and authorised real response/readback |
| Lantmäteriet / Geotorget | Account and portal access reported; FF-Spatial NGP/STAC discovery roadmap | Exact API/dataset entitlements, licences, endpoint, credentials and test |
| Bolagsverket | Folder placeholder and user-reported API access | Actual authorised product/endpoint, credentials, contract, test |
| Eurostat, OECD, World Bank and other local category folders | Screenshot folder presence | No request and no connectivity inferred from an empty folder |
| geoBoundaries | R historical pilot and cloud ADM1 source adapter | Publication/vintage/rights and live cloud result separately checked |

**Do not put keys or provider email body in repository history.** Access to one portal is not entitlement to every product.

## 7. Other integration applications — mapped without implied connectivity

Primary source: [FFC integration register](https://github.com/Motherpher/form-flode/blob/main/17-ffos/system-and-integration-register.md) and [machine contracts](https://github.com/Motherpher/form-flode/blob/main/17-ffos/integrations/contracts.json). These are **source-declared states**; this audit did not exercise every app.

| App / service | Source-declared role | Relation to Bruno/R/QGIS |
| --- | --- | --- |
| GitHub + Actions | Active code/CI, reviewed workflow dispatch, short-lived artifacts | Source control and bounded cloud execution; not an always-on runtime or complete data archive |
| Google Drive | FFC source-document metadata reconciliation; separate FFOS/FF-Spatial create-only storage candidate | Provider-state/credential boundaries differ; ChatGPT Drive access does not confer GitHub Actions OAuth. Live verified publication pending |
| PostgreSQL / Supabase | FFOS registry/data-assets and ProjectHub candidates; live ProjectHub NOLOGIN principal reported separately | Potential transactional work-order/asset index; asset-store runtime not automatically connected |
| Miro | FFC-VIS primary visual runtime per FFC register | Derived diagrams, process maps, workrooms; not GIS layer/data authority |
| Canva | FFC derived visual production/publication surface | Presentation asset consumer, not geodata/version source |
| Figma | Optional specialist visual adapter | UI/design, not GIS runtime |
| Lovable | FFOS Control Tower project; source register notes credits/sync limitations | Optional app/view builder, not authoritative GIS or DB writer |
| Vercel | Optional hosting/publishing; billing/credit pause reported in 2026-11-16 PRs | Nonessential to Bruno/R/GIS acceptance; fresh deployment not verified in this audit |
| OpenAI API | Separate model-cost/auth project infrastructure | Credentials and billing distinct from ChatGPT connectors and provider data APIs |
| Gmail / Calendar / CRM | FFC register: Gmail deferred, Calendar and CRM candidate/unadmitted | Outside current data/GIS critical path and not permissioned by this audit |
| Finance/accounting | Current provider unconfirmed in FFC register; writes prohibited | Out of scope; historical provider names do not grant connection |
| GreenBell / Pius | Domain systems with own rights and evidence boundaries | Possible consumers of approved assets; not inferred live direct API bindings |

## 8. Major audit gaps and contradictions

1. **Mac source absent from this read-only GitHub audit.** Original local Bruno collection files/environment, QGIS project state, R console, historical reporter bodies and untracked receipts were not independently copied or inspected.
2. **Merged source and declared runtime diverge.** PR #51 has source-controlled Bruno definitions, but local collection is not proven to match. PR #52 / #40 / #41 are still open as of snapshot.
3. **Mixed old/new design states.** Historic QGIS Mac bridge stays valid as local evidence; later cloud-native design removes the Mac dependency for selected workflows, not for all interactive QGIS tasks.
4. **Mismatch of geographic grain.** Kolada municipality identity `0380` cannot be directly joined to county-level ADM1 shapes; the historic 21-feature layer does not solve municipality/DeSO analyses.
5. **Storage and archive are different.** Google Drive new-folder/readback is useful working persistence but not immutable WORM; private GitHub Actions artifacts have bounded retention. Durable archive requires versioned definitions *and* retained evidence references/approved artifact storage.
6. **Proposal vs acceptance.** FFC-DATA-01–18, Bruno ownership ADR and several cross-repo interfaces are proposals even where implementation source was merged. Approval requires separate evidence.
7. **New SCB/Lantmäteriet/Bolagsverket access does not prove API onboarding.** Formal endpoint/scope terms, secret injection, pagination and rights tests missing.
8. **Audit tooling itself needs verification.** The archive branch's `archive_inventory.py` is a candidate utility until parser and negative tests run; static hashes do not establish semantic validity. No claim of tested archive automation is made.

## 9. What a future operator should be able to reconstruct

For every integration change/run, preserve a stable record with:

`work_order_id, programme_wp, operation_id, run_id, requested_by, authorised_by, repository, commit_sha, branch_or_tag, provider, endpoint_contract_id, secret_reference_only, rights_or_licence_ref, data_schema_version, geography_level, geography_vintage, observation_period, request_hash, response_identity, pagination_completeness, software_environment, transformation_version, output_asset_id, output_checksum, verification_receipt, execution_mode, storage_object_id/version, test_scope, approval_state, exceptions, rollback_reference, timestamps_utc`.

**Separate history types:**
1. **Decision history:** why, alternatives, authority and approval.
2. **Change history:** what files/code/contracts changed, by whom and in which commit/PR.
3. **Execution history:** precise invocation, versions, runtime environment, outcomes/errors/receipts.
4. **Data history:** source rights, source hash, transformation, QA, derived artifact, storage and retrieval.
5. **Learning history:** glossary, explanatory examples, failure analysis, restoration guide and corrected assumptions.

Never reconstruct these from a chat summary when primary evidence is available. A chat is supporting context, not a durable independent source of operational truth.

## 10. Education map — distinctions that prevent mistakes

- **Provider/API:** external system supplying data, e.g. Kolada/SCB. An approved account is not a successful query.
- **Bruno collection:** files defining and testing API requests. `Development` is a named local environment, not a deployed server.
- **API key:** secret authentication credential; archive only the variable/reference and access-control decision.
- **Git repository:** versioned set of files. `git init` locally does not configure GitHub synchronisation.
- **Branch → PR → merge:** proposed change, review, then incorporation to main. No implication of runtime deploy.
- **CI PASS:** specified automated checks passed. The test may use mocks and no provider access.
- **R / renv:** data transformation and reproducible R package environment, not automatically an FFOS worker.
- **GeoPackage:** physical geographic data product; requires layer/CRS/feature/source/rights verification.
- **QGIS:** optional desktop spatial workspace; headless GDAL can produce GIS data without a QGIS window.
- **MCP/plugin:** authenticated interface/tool connection; documenting a bridge is not deploying one.
- **Provenance:** trace of source, versions and transformations, beyond a hash alone.
- **Receipt:** evidence of a specific run and effect; it is not created simply by writing a design doc.
- **Acceptance:** independent validation plus accountable authorization of specified outcomes.

## 11. Programme placement — three WPs, not more

- **WP01 — API & Data:** complete archive/migration inventory, review existing Bruno API definitions and credentials *by reference*, verify allowed provider connections, reconcile FFOS #52 and FF-Spatial #40, record verified R outputs.
- **WP02 — Spatial & Persistence:** review FF-Spatial #41 and merged local/cloud implementations, independently test geographic outputs and storage under governing rights/approval.
- **WP03 — End-to-End & Handover:** reproduce one legitimate cross-system example, independently verify linked receipts and final artifact, restore the archive on a fresh checkout, create final audit and Director decision.

Existing FF-Spatial SRC-WP00–39 remain within their own operational register; they are not new programme WPs.

## 12. Source index / next reads

**Bruno:** [FFOS OpenCollection README](https://github.com/Motherpher/FFOS/blob/main/integrations/bruno/central-api-ledger/README.md); [collection history PR #51](https://github.com/Motherpher/FFOS/pull/51); [runtime candidate PR #52](https://github.com/Motherpher/FFOS/pull/52); `integrations/bruno/validate_collection.py`; `docs/decisions/ADR-API-LEDGER-OWNERSHIP-PROPOSED.md`.

**R/QGIS:** [R PR #40](https://github.com/Motherpher/FF-Spatial/pull/40); [R/QGIS PR #41](https://github.com/Motherpher/FF-Spatial/pull/41); [bridge PR #43](https://github.com/Motherpher/FF-Spatial/pull/43); [cloud PR #44](https://github.com/Motherpher/FF-Spatial/pull/44); `R/IMPLEMENTATION_STATUS.md`, `R/QGIS_HANDOFF_V1.md` on their respective feature branches; [FF-Spatial overview](https://github.com/Motherpher/FF-Spatial/blob/main/docs/FF-SPATIAL-SYSTEM-OVERVIEW.md).

**Asset/store/cloud:** [FFOS PR #53](https://github.com/Motherpher/FFOS/pull/53), [FF-Spatial PR #42](https://github.com/Motherpher/FF-Spatial/pull/42), [FFC PR #43](https://github.com/Motherpher/form-flode/pull/43), [FFOS cloud execution](https://github.com/Motherpher/FFOS/blob/main/docs/architecture/CLOUD-INDEPENDENT-EXECUTION-2026-11-16.md), [FFOS Drive v1](https://github.com/Motherpher/FFOS/blob/main/docs/architecture/GOOGLE-DRIVE-CLOUD-STORAGE-v1.md).

**Architecture / other apps:** [FFC workflow proposal](https://github.com/Motherpher/form-flode/blob/main/17-ffos/architecture/FFC-END-TO-END-DATA-SPATIAL-WORKFLOW-PROPOSED-v0.1.md); [asset governance](https://github.com/Motherpher/form-flode/blob/main/17-ffos/architecture/FFC-DATA-ASSET-AND-WORKORDER-GOVERNANCE-PROPOSED-v0.2.md); [integration register](https://github.com/Motherpher/form-flode/blob/main/17-ffos/system-and-integration-register.md); [machine contracts](https://github.com/Motherpher/form-flode/blob/main/17-ffos/integrations/contracts.json).

**Archive work:** [FFOS three-WP draft #122](https://github.com/Motherpher/FFOS/pull/122); [FF-Spatial companion #50](https://github.com/Motherpher/FF-Spatial/pull/50). This audit is **historical reconstruction, not exhaustive raw evidence export**. The next archive reconciliation must inspect the actual Mac collection and authorised runtime receipts without placing secrets or private data into GitHub.
