# FF-GH-WO-002 — Reconciliation & Work-Order Change Control v1.1

**Prepared:** 2026-11-16  
**State:** SOURCE-VERIFIED PROPOSED CHANGE ADDENDUM — not Director-accepted; no WP or runtime added  
**Governing work-order source:** [FFOS #48](https://github.com/Motherpher/FFOS/issues/48) · [WP02 implementation source #50](https://github.com/Motherpher/FFOS/issues/50).  
**New current estate inventory:** [33 repositories](CURRENT-ESTATE-REGISTER-33-v1.1.md), [machine-readable data](ESTATE-REGISTER-33-v1.1.json).  
**Current FFOS main:** commit [54d4fafcfc4577c2299243346d7dd17e0c0ffef9](https://github.com/Motherpher/FFOS/commit/54d4fafcfc4577c2299243346d7dd17e0c0ffef9).

## Executive determination

**Keep FF-GH-WO-002 at three work packages.** Update the count and source-based dispositions from 31 to 33 currently visible repositories. Include new FFC/FFOS/FF-Spatial asset-first and Bruno work as **dependency, navigation and authority-boundary evidence**, not as additional execution WPs or approved runtime.

Operational GitHub work orders, Project V2 cards, proposed FFOS typed data work orders and immutable data-asset versions have **different authorities and lifecycles**. They may be source-linked but must never be identified as the same object or automatically transition each other's approval state.

**No changes implied to:** established native Projects, source Issue statuses, branch protection, repo visibility, Wiki publication, FFC Corpus law, CDX/Pius/AMA effect authority, provider credentials, storage, migration or production runtime.

## A. Source-backed cross-repository developments since 3 November

| Source | Current verified state | Effect on WO-002 | Prohibited inference |
|---|---|---|---|
| [FFOS main Bruno landing zone](https://github.com/Motherpher/FFOS/blob/main/integrations/bruno/README.md) + [proposed ownership ADR](https://github.com/Motherpher/FFOS/blob/main/docs/decisions/ADR-API-LEDGER-OWNERSHIP-PROPOSED.md) | Landing docs committed to main 2026-11-15, ADR explicitly proposed | WP01 index must identify source-owned developer docs; WP03 publication boundary for credentials and API sources | Bruno is now an autonomous service or proposal is accepted |
| [FFOS #51](https://github.com/Motherpher/FFOS/pull/51) | Open non-draft PR; versioned Bruno/OpenCollection requests and static QA | Add a developer-facing guide pointer only after reviewed merge; preserve current source/security gate | Collection is live authenticated or complete across all pages |
| [FFOS #52](https://github.com/Motherpher/FFOS/pull/52) | Draft bounded SHA-pinned CLI runner, mock tests; no user's local collection import | D03 maintenance references source-vs-runtime status; D09 never treats mocked tests as production | ChatGPT remote Mac/Bruno execution exists or agent is activated |
| [FFOS #53](https://github.com/Motherpher/FFOS/pull/53) | Draft asset-first data-work-order/asset-version/reuse registry and offline tests, migration not applied | D07–D09 prepare work-order/asset identity **crosswalk** and owner separation; do not mutate Projects V2 or deploy | Typed FFOS `work_order_id` is the same authority as this GitHub governance WO |
| [FFC #43](https://github.com/Motherpher/form-flode/pull/43) | Draft proposed FFC-DATA-01–18 and FFC→FFOS→R→FF-Spatial process; no canonical decision or operating chain | Navigation acknowledges FFC as source of intended semantic rules, not approved cross-repo law; keep FFC review/version gate | FFC-DATA-01–18 are adopted without Director source decision |
| [FF-Spatial #42](https://github.com/Motherpher/FF-Spatial/pull/42) | Draft metadata-only spatial asset catalogue/CLI and tests; no live geometry/QGIS bridge | WP01 technical-guide directory, WP02 references and WP03 documentation status distinguish metadata from actual asset | Registry entry means real polygons, verified map or published geodata |
| [Ideburen main](https://github.com/Motherpher/Ideburen) | Newly in estate scope; public domain source, internal WP01–WP10, CI/metadata and pre-release, no native Issues; [API Ledger](https://github.com/Motherpher/Ideburen/blob/main/docs/API_LEDGER.md) no live key or authenticated fetch | Add Tier-B **candidate** and guide pointers to 33-row register; no new board until native source-Issue lifecycle and mandate | 2022 polygon map, national census, SCB AFR live data or release approved |
| [Texts-n-Lyrics main](https://github.com/Hybrismannen/Texts-n-Lyrics) | Newly visible source-preserving public literary archive; source-controlled [Wiki atlas](https://github.com/Hybrismannen/Texts-n-Lyrics/blob/main/wiki/Home.md), publishing workflow conditional on native Wiki initialization; no native Issues | Add Tier-C **candidate**; WP03 investigate publication status/rights, no duplicate Wiki | Native Wiki actually published or all source/lyrics rights independently reviewed |
| [Opal main CDX updates](https://github.com/Hybrismannen/Opal-Sense-I) | CDX anchor/policy/CI changed on main 2026-11-13; editorial Project still private, 16 Issues | Revalidate navigation and CDX authority claims at current main; no source owner delegation from a Project card | GitHub Project creation grants CDX admission |
| [UDL Twin, StatsVault, RFSU-FF, Barnombudet dashboards](https://github.com/Hybrismannen/udl-twin) | Main branches show repeated metadata/dashboard refresh commits after 3 November | D03 should define freshness and generated-dashboard documentation review triggers; recheck source links after material changes | A CI-generated dashboard equals live telemetry or independent user-task PASS |
| [GreenBell main](https://github.com/Motherpher/GreenBell) | New internal article/synopsis records 2026-11-13, existing Estate-linked governance | No new GreenBell Project justified by this alone; support source-native publication review | Internal synopsis is a validated publication or requires a separate Project |

**In-flight status is noncanonical:** listed PRs must be checked at their exact heads immediately before merger. When these items later merge, the historical proposal remains a proposal until its distinct source decision/runtime gate is satisfied.

## B. Identity and authority crosswalk (new mandatory distinction)

| Layer | Identifier and source | Authority | May appear in GitHub Project? | May trigger execution or release? |
|---|---|---|---|---|
| **GitHub estate governance work order** | e.g. `FF-GH-WO-002`, [source Issue #48](https://github.com/Motherpher/FFOS/issues/48) | Director-approved operational governance under relevant source repository | Yes, by original Issue link | **No**, only with separately competent mandate |
| **Original source Issue/PR** | `owner/repo#number`, immutable GitHub node ID | Owning repo, review policy, explicit decision | Yes, same native Issue in appropriate boards | Not by its Project Status alone |
| **Proposed typed FFOS data work order** | `work_order_id` + `request_id` in proposed [FFOS #53](https://github.com/Motherpher/FFOS/pull/53) SQL schema | FFOS typed registry/orchestrator once independently approved and implemented | Future reference *only*, after canonical schema/owner decision | **NOT TODAY**; migration/runtime not connected |
| **Data asset version / reuse decision** | `asset_id`, `asset_version_id`, reuse decision and source receipts, proposal only | FFOS cross-domain index; owner repo and FF-Spatial own actual data semantics | Future evidence URL/ID reference only | Requires rights, quality, identity and verification |
| **Geospatial asset** | Stable geographic identity/vintage/CRS and source hash | FF-Spatial geographic registry and actual checked geometry | Read-only reference | Not until actual source, licence, QA and authorised runtime |
| **Wiki/guide** | Path and source SHA, native Wiki revision when published | Owning editorial/repository review | Navigational link only | **No**, no authority escalation |
| **Director acceptance** | Explicit source-recorded decision, exact object/version and scope | Human Director/competent authority | Project Authority Gate can project verified decision | Only within accepted scope and other controls |

**Never equate** `FF-GH-WO-002` with an FFOS database `work_order_id` without a deliberate separately approved cross-reference. A successful Project field write is not a database transaction, and a metadata-only asset does not prove actual dataset bytes exist.

## C. Revised three-work-package scope (NO new WPs)

### WP01 — Documentation & governance reconciliation

**Original D01–D04 remain intact**, but add:
- **D01:** update the active scope to **33** with an as-of date and two complete new repository dispositions. Preserve the 31-row snapshot as history. Re-audit only material changed source paths on subsequent runs.
- **D02:** link Ideburen release/API/GIS documents and Texts-n-Lyrics source atlas; index *actual* FFOS Bruno main docs and mark #51/#52/#53/FFC #43/FF-Spatial #42 explicitly PROPOSED/STAGED.
- **D03:** add source→proposed execution contract→asset→evidence→guide status separation, rights/secret rules and dashboard freshness triggers. Use `described / built / connected / tested / accepted / published` distinctions without adopting unapproved FFC-DATA rules as law.
- **D04:** reconcile the existing **seven WP01 draft PRs**, their current mergeability/latest main, two still-missing root READMEs, wiki-flag evidence conflict, and outstanding independent usability/security tests.
- FFC Corpus local authoring requires its own version/owner process; do not bulk edit its normative source under a GitHub estate work order.

### WP02 — Selective Projects and operating integration

**Original D05–D09 remain intact**, but add:
- **D05:** extend to **33** decisions. Ideburen and Texts-n-Lyrics currently have **no native open Issues** and no native Projects V2 association; establish **no** additional domain Projects by default.
- **D06:** retain existing verified **3 private domain boards / 47 native Issues**. No further automatic intake or authority field promotion.
- **D07:** explicitly distinguish cross-project source-Issue projection from the **draft** FFOS typed data-work-order/asset lineage model; mappings must remain manual/read-only until schemas, source rights and authority are verified.
- **D08:** guide users to source-owned APIs, datum/vintage, asset receipts and provenance where applicable, without promising that Bruno/R/QGIS or ChatGPT runs are connected.
- **D09:** add negative tests for wrong owner/source, data version/rights collision, duplicate Project creation after ambiguous responses, unsupported live sync, and Project/asset double counting.
- GreenBell remains on Estate Portfolio; Ideburen might merit future domain board only after its native Issue workflow and owner need are established. Do not create Project boards to represent every internal chapter or every data asset.

### WP03 — Wikis, real user tests and final handover

**Original D10–D15 remain intact**, but add:
- **D10:** 33-repo Wiki disposition, **13 current enabled flags**, with `Re-Eco` historical REST/GraphQL ambiguity noted. Feature flag is not a published Wiki.
- **D11:** Opal pilot remains priority, subject to native Wiki initialization, source review, editorial rights and authorisation.
- **D12:** add Texts-n-Lyrics as an **existing Wiki-source/mirror verification** case. Do not create a duplicate Wiki or trigger its publishing workflow before rights, actual native state and maintainer review are established. Politent/WPB/BDNA remain conditional/optional.
- **D13:** independent role-based tasks must include a source-approved reference, correct status/rights, private-project access separation, link back to canonical dataset or text, and a recovery/error path. No presumed live Bruno/R/QGIS test.
- **D14:** Director entry directory must include 33 repos, FFOS Bruno main *documentation*, Ideburen release/API guides, Texts atlas; **proposal links** must carry proposed-not-live state.
- **D15:** final report must identify the precise GitHub source snapshots and changed repo counts, separate runtime gaps and all unresolved older Director gates.

## D. Dependencies that remain explicitly NOT accepted

1. WO-002 **DG-01 (WP01)** and **DG-02 (WP02)** are still pending even though WP02 implementation is technically present.
2. Prior [FF-GH-WP04 DG-04](https://github.com/Motherpher/FFOS/issues/46): final HOLD, notably T34–T37, T42, T44, T46.
3. No authorised live auto-sync across owners, no automatic DOI/asset-catalogue publication, no credential injection by GitHub Projects, no autonomous ChatGPT/Bruno/Mac/R/QGIS runtime.
4. New FFC-DATA principles and FFOS asset-first/FF-Spatial schemas remain proposed until explicit source decision; a successful code CI is not full end-to-end data QA.
5. Ideburen's source release status remains pre-release, missing real geometry/licence/HARP RefA and human release gates.
6. Texts-n-Lyrics native Wiki publication and copyrighted lyric-source rights are NOT independently confirmed.
7. Existing WP01 README PRs (7 total) and WP02 documentation/navigation PRs (3 total) remain source-owner review candidates; fresh HEAD/rebase and link checks required before authorised merges.

## E. Decision requested under this review

**Proposed:** Accept **reconciliation scope only** — preserve three existing WPs, add two repo rows, add identity/lineage distinctions and current source links, update source Issue statuses. **Not proposed:** DG-01/DG-02/DG-03 acceptance, merging outstanding PRs, modifying actual Projects, publishing Wikis, applying database migrations or approving any new agent/runtime binding.

This document is a **reviewable change addendum**, not a replacement for accepted FFC law or native GitHub governance decisions. It may be revised by the owning source and competent Director authority.
