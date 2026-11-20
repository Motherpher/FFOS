# Cross-chat and 35-repository development provenance — 2026-11-20

**Record:** FFOS-ESTATE-HIST-20261120-002  
**Owner:** FFOS integration-history archive; all project repositories remain authoritative for their own files, work orders, domain data and legal rights.  
**Audit classification:** WIDE-ESTATE DISCOVERY + SELECTED SOURCE AUDIT, **not** exhaustive all-chats/all-commits replay.  
**Programme:** contained within WP01 (history/API), WP02 (spatial/data execution evidence), WP03 (restoration/end-to-end acceptance); exactly three parent WPs.

## 0. What was actually sourced

1. **GitHub:** connected repository inventory returned **35** visible repositories across `Hybrismannen` and `Motherpher`. Recursive `main` trees were inspected for all 35. Detailed original files were read for key owners: FFOS, FF-Spatial, FFC, CDX, Pius Universe, UDL Twin, CareerHubZero, Ideburen, Politent, GreenBell/StatsVault, Form & Flöde website and RFSU internal/public. Specific open/merged PR bodies and GitHub Actions execution/jobs/artifact records were checked.
2. **Historical chats:** personal-context retrieval across prior ChatGPT discussions produced *selected contextual excerpts* from September–November 2026, including governance decisions, requests, tool outcomes and later corrections. This facility is NOT a full transcript export or proof that every historical chat was indexed. No immutable ChatGPT message URL or full transcript was established for every excerpt. Treat these as **HISTORICAL CHAT LEADS**, corroborate with primary Git/Actions evidence.
3. **Local Mac:** Bruno 4.3.0 screenshot, environment selection, R/QGIS pilot outcomes previously provided by Director and documented in repositories. Private local `Development`, actual complete request files, QGIS project, R session, historical private receipts and local raw data were NOT directly fetched in this audit.
4. **Other services:** Lovable, Miro, Figma, Canva, Supabase, Vercel, Drive and OAuth state were reviewed mainly through repository declarations and relevant GitHub workflow evidence. This audit did not enumerate all private objects/versions inside those services.
5. **Excluded for safety:** API keys, tokens, client secret values, private response bodies, personal provider messages and unapproved data copies.

For repository discovery list and per-repository classification, see `audit/CONNECTED-ESTATE-REPOSITORY-INVENTORY-2026-11-20.json`. A file tree proves existence of paths; *not* implementation completeness or functionality. Historical exports and inaccessible account content remain uncovered.

## 1. Architectural development lineage

### A. Early governance and system foundations (pre-September to September 2026)

Historical chat leads place Form & Flöde as the organisational/method layer (FFC), FFOS as the operating system, Pius as separately governed epistemic/model processing and a Human Director above delegated execution. Pius Operational Home was conceived as a provenance and output structure, while Pius Codex and Terminal had distinct roles. **These are design-history descriptions**; do not reassign authority from memory alone.

FFC Phase II and III discussions and the September FFC/FFOS general audit record an evolving repository-first system with GitHub, Google Drive metadata reconciliation, Miro/Figma/Canva, Lovable, Vercel, applications and linked repositories. See [FFC general audit](https://github.com/Motherpher/form-flode/tree/main/00-governance/audits/ffc-ffos-general-audit-2026-09-24/) and [system integration register](https://github.com/Motherpher/form-flode/blob/main/17-ffos/system-and-integration-register.md). Reports of WP00–WP90 closure refer to the *historical programme*, not universal deployed FFOS runtime.

CDX 1.0.0 is the released system according to [CDX source README](https://github.com/Hybrismannen/Conductellence-/blob/main/README.md). It distinguishes policy, local effect, independent evidence and human authority. Historical chat on 16 November explicitly rejected an unapproved CDX 2.0/LACE path; preserve that as a governance conflict needing the original decision source, not as an accepted CDX 2.0 release. [Pius Universe](https://github.com/Hybrismannen/pius-universe/blob/main/README.md) contains Pius 6 development tracks and a product boundary; `main` is not evidence of a released Codex 6.

### B. Spatial foundation (29 September–13 November 2026)

[FF-Spatial](https://github.com/Motherpher/FF-Spatial) originated as an independently owned geographic source, QGIS and provenance repository, initially involving desktop QGIS, a local bridge, job queue and GitHub. Related spatial consumers are [Politent QGIS](https://github.com/Motherpher/Politent/blob/main/qgis/README.md) and [Ideburen geography/QGIS](https://github.com/Motherpher/Ideburen/blob/main/docs/WP07_QGIS_INTEGRATION.md), but no automatic production cross-link is proven by those documents.

On 13 November, [R PR #40](https://github.com/Motherpher/FF-Spatial/pull/40) introduced reproducible R spatial derivation and recorded local RStudio/QGIS interoperability. Historical pilot: geoBoundaries Sweden ADM1 2009 with 21 features, transformed to EPSG:3006 and opened in QGIS. GDAL/curl warnings and independent sidecar integrity checks remained open. QGIS R Processing integration is not equivalent to FFOS orchestration.

### C. Central API Ledger and Bruno (15–16 November 2026)

Previous-chat leads identify `Central API Ledger` being developed in Bruno 4.3.0 on Mac, with SCB AFR, Kolada, SCB PxWeb and planned additional providers, and `Development` as a local environment. The user explicitly chose FFOS as central ownership; AMA/agents were deferred until integrations are verified.

[FFOS PR #51](https://github.com/Motherpher/FFOS/pull/51) brought the OpenCollection repository definitions and static CI into FFOS. [PR #52](https://github.com/Motherpher/FFOS/pull/52) created a bounded, SHA-pinned Bruno CLI runner candidate on an **open** branch. Its [runtime guide](https://github.com/Motherpher/FFOS/blob/feat/ffc-data-workflow-connectors-v1/integrations/bruno/runtime/README.md) later records a Director-run local Kolada CLI test. Prior chat excerpts reported Kolada Municipality Lookup `0380` HTTP 200, 1/1, with later private reporter/CSV/R verification. Distinguish each test's scope.

An earlier personal-context extract reports a tested SCB AFR `X-API-Key` request, `/v1/juridiskaenheter/count`, and a previously exposed key needing revocation. **Do not re-publish or reconstruct the key.** This chat claim must be reconciled against provider records and local test evidence before promoting AFR to operational in current inventory. [Ideburen API Ledger](https://github.com/Motherpher/Ideburen/blob/main/docs/API_LEDGER.md) also carries its own SCB AFR metadata/dry-run work and a contract requiring exact specification verification; it is NOT replaced simply because FFOS has a central request collection.

### D. R handoff, local QGIS and asset reuse (15–16 November 2026)

[FF-Spatial PR #41](https://github.com/Motherpher/FF-Spatial/pull/41) created a typed R-derived GeoPackage→QGIS approved-job generator. Branch depends on the still-open R #40. [FF-Spatial #43](https://github.com/Motherpher/FF-Spatial/pull/43) merged hardened local job/readback controls, with prior reported 25/25 local FFOS→Bruno→Kolada→CSV→R and 4/4 QGIS generation checks. A manually loaded 21-feature ADM1 layer and live MCP ping were evidenced, but final exact approved new-layer readback was not thereby accepted.

An Uppsala municipality Kolada record (`0380`) is not geometry. It cannot be falsely joined to Swedish county ADM1 boundaries. The intended complete municipal/DeSO analysis needs same-level authoritative boundaries, temporal compatibility and correct identifiers.

[FFOS #53](https://github.com/Motherpher/FFOS/pull/53), [FF-Spatial #42](https://github.com/Motherpher/FF-Spatial/pull/42) and [FFC #43](https://github.com/Motherpher/form-flode/pull/43) proposed/implemented asset-first governance, immutable versions, selective reuse, registry/SQL ports and source-to-output lineage. Merged source does not prove live backend or authoritative dataset materialisation.

### E. Cloud transition and verified correction (16–18 November 2026)

FFOS introduced independent GitHub-hosted Kolada lookup, cross-repository dispatch and managed Drive publishing paths (see [FFOS cloud architecture](https://github.com/Motherpher/FFOS/blob/main/docs/architecture/CLOUD-INDEPENDENT-EXECUTION-2026-11-16.md)). [FF-Spatial #44](https://github.com/Motherpher/FF-Spatial/pull/44) introduced headless GDAL, moving selected GIS data generation away from mandatory Mac/QGIS Desktop.

**Primary source confirmation:** [FF-Spatial Actions run 43789803086](https://github.com/Motherpher/FF-Spatial/actions/runs/43789803086) on **2026-11-16 02:03 UTC** concluded SUCCESS; the jobs report success for cloud gateway contract, GDAL install, fetch/reprojection/verification and private artifact upload. Artifact `ffspatial-swe-adm1-43789803086` existed; **Google Drive publishing was SKIPPED**. This positively updates older docs that described the first cloud run as unverified, while still leaving actual artifact content/right checks and full statistics join separate.

**Historical failure and later correction:** prior chats recorded an OAuth/Drive permission and malformed-upload-session sequence on 18 November; never erase the failed states. **Primary source confirmation:** [FFOS Actions run 44228146764](https://github.com/Motherpher/FFOS/actions/runs/44228146764), 2026-11-18 03:07 UTC, concluded SUCCESS; its `validate`, `lookup` and `drive-publish` jobs and `Live public Kolada API request` + `Publish verified Kolada artifacts to approved Google Drive` steps all concluded SUCCESS. Artifacts: `ffos-drive-receipt-44228146764`, `ffos-kolada-0380-44228146764`. This establishes **one executed FFOS Kolada→Drive cloud path**, not unrestricted mutation permissions, permanent archival immutability, FF-Spatial Drive publication or full Bruno→R→QGIS runtime acceptance. The earlier [FFOS Drive runbook](https://github.com/Motherpher/FFOS/blob/main/docs/architecture/GOOGLE-DRIVE-CLOUD-STORAGE-v1.md) contains pre-success HOLD language and must be read as an earlier snapshot, not the final state.

Drive write scope is constrained by create-only policy and approved-root checks, including [FF-Spatial #49](https://github.com/Motherpher/FF-Spatial/pull/49). Google OAuth credentials for GitHub Actions are separate from ChatGPT's Drive connector; untested permissions and unauthorized changes remain forbidden.

### F. Website, ProjectHub, metadata and other apps (October–20 November 2026)

[Website integration contract](https://github.com/Hybrismannen/formflode-com/blob/main/docs/INTEGRATIONS.md) confirms `Hybrismannen/formflode-com` as the native Lovable/GitHub website repository; a separate scaffold is explicitly non-canonical. Website code is not FFOS orchestration or GIS storage. Prior chats around 18–20 November track its S00/S01 and subsequent release sequencing, but their claimed stage labels must be checked against site PRs and GitHub Actions.

[FFOS ProjectHub](https://github.com/Motherpher/FFOS) had earlier historical FFOS Phase-I–VI records before native runtime reconstitution. November ProjectHub work included templates, PostgreSQL and source-gated runtime candidate. [FFOS #121](https://github.com/Motherpher/FFOS/pull/121) reports a live NOLOGIN writer principal and explicit `NOT_ACCEPTED` write admission; this is a narrow database milestone, not deployed project write authority. Historical chats note further ProjectHub plans and protected canaries.

[UDL Twin](https://github.com/Hybrismannen/udl-twin/blob/main/README.md) contains a Lovable-backed evaluation system and metadata dashboard; its canonical Blueprint status does not automatically guarantee live product compliance. [CareerHubZero](https://github.com/Motherpher/CareerHubZero/blob/main/README.md) is the central engine with thin profile repositories `CareerHub-LinusF`, `wpb` and `Gracey`. [GreenBell company](https://github.com/Motherpher/GreenBell/blob/main/README.md) owns the venture canon; [StatsVault](https://github.com/Hybrismannen/green-bell-statsvault/blob/main/README.md) is an independent Lovable/Supabase-linked product implementation. [RFSU internal](https://github.com/Hybrismannen/RFSU-godex-FF/blob/main/README.md) and [RFSU client mirror](https://github.com/Hybrismannen/RFSU-godex) separate internal evidence from Swedish client-facing and Vercel deployment.

[FFC integration register](https://github.com/Motherpher/form-flode/blob/main/17-ffos/system-and-integration-register.md) assigns GitHub/Drive/Miro/Figma/Canva/Lovable/Vercel distinct ownership and status. Gmail was intentionally deferred; Calendar and CRM were proposals in the governing register; finance provider wasn't confirmed. These historical states do not determine the user's present plugin connections. Current direct app connection is NOT independently established by a repository file.

### G. Three-WP recovery and archival work (20 November 2026)

[FFOS PR #122](https://github.com/Motherpher/FFOS/pull/122) and [FF-Spatial PR #50](https://github.com/Motherpher/FF-Spatial/pull/50) stage exactly **WP01 API & Data, WP02 Spatial & Persistence, WP03 End-to-End Acceptance & Handover**. Existing 40 FF-Spatial sourcing WPs are a separate preexisting register, not programme WP proliferation.

[FFOS PR #126](https://github.com/Motherpher/FFOS/pull/126) stages the non-secret Bruno archive, safe inventory utility, tests and historical integration reconstruction. [Bruno archive CI run 44681909432](https://github.com/Motherpher/FFOS/actions/runs/44681909432) succeeded for source-controlled static checks. **The local Mac archive has NOT been imported, live API entitlements have NOT all been tested, and archive restoration has NOT been accepted.**

## 2. App/interface matrix and evidence boundary

| App/system | Canonical owner or source | Historical technical status evidenced | Cannot infer |
| --- | --- | --- | --- |
| Bruno Desktop / CLI | Mac local; FFOS source-controlled API definitions | Local Kolada pilot reported; collection OpenCollection on GitHub; runner #52 open | GitHub synced to Mac or all provider APIs functional |
| R / RStudio / renv | FF-Spatial R branch | Local reproducible R/geopackage pilot | Autonomous cloud FFOS R worker deployed |
| QGIS Desktop / MCP | FF-Spatial local bridge | historic layer and ping; readback code | Every approved job completed |
| GDAL cloud | FF-Spatial | live successful 16 Nov Actions workflow | Full national current geometry or QGIS-style map |
| Kolada | FFOS and FF-Spatial adapters | live cloud Uppsala lookup; private receipt artifact | Complete statistical KPI time-series or spatial join |
| SCB Public/PxWeb | FF-Spatial and Bruno definitions | provider catalogue/adapters | All endpoints, data vintages or live dataset joins verified |
| SCB AFR | FFOS Bruno + Ideburen | user key-issued; local previous chat claims auth test | key secured/rotated; every AFR operation accepted |
| Lantmäteriet/Geotorget | FF-Spatial sourcing domain | user account/portal authorisation reported | service entitlements or working API |
| Bolagsverket | FFOS/Bruno source folder and user access notice | API access reported | exact endpoint or tested connector |
| GitHub | All repos | 35 visible repos; Actions, PRs, commits | universal CI coverage or connected SaaS |
| Google Drive cloud | FFOS/FF-Spatial scoped uploader | FFOS live successful Kolada Drive publication 18 Nov | immutability, unrestricted writes, FF-Spatial upload |
| Supabase/PostgreSQL | FFOS ProjectHub and data-assets; UDL/StatsVault other owners | source-gated DB work and app adapters | general cross-repo shared data store |
| Lovable | website, UDL, StatsVault, others | app–GitHub links documented in respective repos | live deployments match every branch |
| Vercel | optional website/public products | deployment configs, historical billing blockers | release of Bruno/GIS depends on it |
| Figma / Miro / Canva | FFC visual governance | visual contracts and historical app workflows | semantic authority or GIS data ownership |
| OpenAI API | FFOS AI API infrastructure and product repos | project/key billing governance plans | same as ChatGPT plugin or provider data API |
| CDX / Pius | separate governance repos | CDX 1.0 canonical; Pius 6 workstreams | CDX 2.0 approved, Pius 6 released or every repo enforcing live |
| CareerHub | CareerHubZero, thin profile repos | centrally versioned engine and web shell | FFOS Bruno/R/QGIS pipeline connected |
| GreenBell | company root + StatsVault implementation | distinct company/product app systems | production sports API source integrated with central Bruno |
| Politent / Ideburen | respective domain repos | QGIS and API metadata/adapter history | joined FF-Spatial production workflow |
| RFSU | private internal + public mirror | separate governed research/publication/deployment | raw private records can be centrally archived |

## 3. Known contradictions / remediation points

| Conflict | Earlier statement | Newer/better evidence | How to preserve |
| --- | --- | --- | --- |
| FFOS→Drive live | Runbook HOLD, first upload incomplete | 18 Nov Actions run 44228146764 all 3 jobs SUCCESS, receipt artifact | append dated post-success annotation; never rewrite initial failure |
| FF-Spatial headless cloud | Documentation says cloud pilot not yet live-verified | 16 Nov Actions run 43789803086 SUCCESS, artifact exists | record executed cloud vertical slice; separately validate binary and rights |
| Local Bruno vs GitHub copy | Both show 18 requests | local screenshot folder topology differs from repository OpenCollection | do not declare identical until safe per-file diff/second restore |
| SCB AFR | GitHub Ideburen says no live authenticated fetch | earlier chat excerpt reports separate Bruno auth/count test | cross-source conflict; request original local receipt, secret rotation status |
| FFOS historic programme vs runtime | Phase I–VI/WP00–90 closed | ProjectHub and R/GIS bindings in November still pending acceptance | scope historical programme vs runtime product explicitly |
| FFC/asset governance | merged proposals and contracts | separate human canonical acceptance required | avoid status promotion from merge alone |
| QGIS vs Kolada municipal | 21-feature ADM1 layer rendered | Kolada 0380 municipality metadata | wrong geography level; no join until compatible boundary |
| Pius/CDX | prior discussions of future CDX 2.0 | Director deferred/rejected unauthorized proposal | preserve proposal as historical, not approved release |
| App registry | source claims historical state of SaaS apps | actual OAuth/account connection can change | report snapshot date and live evidence source |

## 4. Required permanent archive records

For each original claim, attach `source_type`, `source_uri_or_chat_reference`, `observed_at`, `source_event_at`, `repo_ref_or_commit`, `subject`, `scope`, `evidence_state`, `test_or_run_id`, `artifact_ref`, `rights_ref`, `conflicts_with`, `supersedes_for_current_state` (without deleting the earlier record), `human_authority_ref`, `open_questions`.

**Mandatory separation:** historical chronology, working design, version-control diffs, executable tests, runtime readback, licences, privacy/credential custody, data artifacts, educational glossary and final acceptance.

A complete restoration test needs: chosen repo commit/ref; checked-out Bruno OpenCollection without populated secrets; approved environment template, external secret binding; pinned operation; R lock/versions; layer source CRS/vintage; QGIS or headless target; known-good output hash, legal provenance and runtime receipt; rollback and revocation instructions.

## 5. What 'full' still requires

- Exhaustive chat-by-chat transcripts and attachment inventory, including hidden/unindexed/archive chats: **not accessible via current history lookup**. Use manually supplied transcript exports or sanctioned chat export if completeness is required.
- Full commit-by-commit chronology and PR review/issue metadata across 35 repos: only current main trees, selected PRs, relevant docs and selected Actions runs were inspected. This audit **does not** certify all ~35 repositories at source-line depth.
- Contents of original local Bruno secrets/environment, private execution reports, RStudio session files, QGIS project/snapshots: **not directly accessible**. Do not upload unredacted secrets.
- Non-GitHub app-level full record version histories (Miro boards, Figma files, Lovable project actions, Canva revisions, Drive prior revisions, Supabase logs): not enumerated here.
- Rights, licensing, privacy and independent artifact-readback for some reported successful jobs: pending verification.
- Source repo state may have changed after the pinned audit date. The audit is a dated snapshot.

**Decision:** Preserve this as an append-only dated audit candidate in FFOS PR #126. It must not retroactively alter other domain canon, agent mandates, approvals or privacy constraints.
