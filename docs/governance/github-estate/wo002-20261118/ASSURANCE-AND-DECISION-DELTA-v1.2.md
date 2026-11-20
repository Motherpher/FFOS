# FF-GH-WO-002 — Rescan Assurance and Director-Gate Delta v1.2

**Audit date:** 2026-11-18, source status at FFOS `main` `eaddcc44c5821e2583c109a6af1af396f08310c2`  
**Source:** [34-row register](ESTATE-REGISTER-34-v1.2.json) · [Three-WP revision](WORKORDER-RESCAN-v1.2.md) · [Master work order #48](https://github.com/Motherpher/FFOS/issues/48).  
**Scope:** authenticated GitHub repositories, GitHub GraphQL Projects V2, exact current `main` source and PR status. *Not* a new signed-in alternate-user test, external Supabase query, Google Drive publication test, live website route test or end-to-end FFOS execution test.

## Audited findings

| ID | Observation and specific evidence | Result | Correct interpretation |
|---|---|---|---|
| R18-01 | GitHub repository inventory: **34**, Motherpher **14**, Hybrismannen **20**, 1 newly visible private canonical website repo | **PASS** | Historical v1.1 33 and 3 Nov 31 are snapshots, not current |
| R18-02 | **13** repositories report GitHub Wiki feature enabled in authenticated GraphQL | **PASS for flags** | A flag is not a verified published native Wiki |
| R18-03 | Six repositories formally link a Projects V2 board: FFC, FFOS, GreenBell, Opal, Politent, CareerHub | **PASS** | No website/Ideburen/Texts native GitHub Project automatically needed |
| R18-04 | Estate board **25** native source Issues; +1 original FFC #47 for website/PPS adoption; 25/25 unique | **PASS** | New source work linked, not duplicated or accepted |
| R18-05 | Domain boards Opal **16**, Politent **18**, CareerHub **13** (unchanged); all four working Projects private, Auto-close OFF | **PASS** | Only source/planning state verified; alternate-account rights untested |
| R18-06 | Original Estate automatic sub-Issue intake **ON**; domain sub-Issue intake **OFF** | **PASS state / CONTROL REVIEW** | Continued selective intake monitoring required; don't silently flip it |
| R18-07 | Current main SHAs differ from v1.1 for **32 of 34** repositories; latest first commits frequently passive FFOS DevOps discovery-hook rollout or metadata refresh | **PASS for change detection** | Not 32 newly deployed capabilities; source classification required |
| R18-08 | Native website source README, operations, release gates, security and Lovable repository binding verified | **PASS for source** | Public legal-page release/current HTTP content NOT VERIFIED |
| R18-09 | FFOS Bruno #51, asset-first #53, FFC semantic docs #43 and FF-Spatial metadata #42 are now MERGED | **PASS for merge state** | Proposals/technical constraints remain what their source describes |
| R18-10 | FFOS transactional DB runtime-port #71 merged, isolated PostgreSQL contract test code; FFOS #82 merged factual receipt for four empty `ffos` tables on external Supabase with restricted ACL and RLS-disabled advisory | **PASS for recorded source state / EXTERNAL CURRENT NOT VERIFIED** | Cannot infer production registry writer or live data ingestion; #83 remains OPEN |
| R18-11 | FFOS ProjectHub #85 records explicit Director ACCEPT, `RELEASED_INTERNAL_BASELINE / NOT_DEPLOYED` at v0.4; FFC #46 projection merged | **PASS for recorded acceptance** | Different system and decision from GitHub Projects; no production/multiuser effects |
| R18-12 | FFOS Drive policy #91 and diagnostic/resumable fixes through #100 merged; runbook distinguishes OAuth branding from live authenticated upload/readback | **PASS for merged code / LIVE EFFECT HOLD** | No successful new durable Drive write established by this repo scan |
| R18-13 | CDX proposal `OAI-DRIVE-EXTERNAL-EFFECT-CONTROL-v1.1.json` says `CANDIDATE_NOT_ACTIVE` | **PASS for proposed-control state** | Do not claim CDX v1.1 external-effect law deployed; respect existing Director Drive no-mutation default |
| R18-14 | Source permission and exact website legal publication not tested from unauthenticated browser; website release-gates document predates FFOS branding evidence | **PARTIAL / DOC DRIFT** | Reconcile chronological sources and perform independent HTTP/rights tests |
| R18-15 | WO-002 FFOS PR #49, #54, #55 and original local documentation PRs open/DRAFT | **HOLD DG-01, HOLD DG-02** | Do not merge in outdated 31/33 scope or self-approve |
| R18-16 | Prior FF-GH-WP04 Issue #46 final HOLD T34–T37/T42/T44/T46, still original source control | **HOLD** | New ProjectHub internal acceptance does not automatically close GitHub estate runtime/role/recovery gates |
| R18-17 | Pius PWE no root README on main, security source Issue #7 OPEN; Hy no root README on main | **HOLD / PARTIAL** | No claim of repaired secret/build or completed WP01 rollout |
| R18-18 | No user/Director command to execute WO-002 WP03; no new native Wiki publication performed in this review | **NOT STARTED** | Retain WP03 D10–D15 for explicit future execution |

## Required test deltas inside existing WPs

### WP01 / D01–D04
- V12-01: a single **34-repo current index** navigates correct root README and sources; no names inferred from deleted/legacy website bootstrap repo.
- V12-02: API/asset sources declare **merged-code vs connected-runtime**. Test contradictory old guide language, including PRs #51/#53/#43/#42 formerly called open.
- V12-03: documentation separates GitHub Projects V2, ProjectHub internal, data assets and the Lovable website project.
- V12-04: site privacy/terms public route exists at currently published revision with accurate FFC-PPS metadata and appropriate authority, or remains explicitly HOLD.
- V12-05: Pius PWE security, root README gaps and generated dashboards' as-of date remain accurately flagged.

### WP02 / D05–D09
- V12-06: original Estate 25-source-item link preserved; source FFC #47 not duplicated. Do not auto-import all website or database assets as Issues.
- V12-07: native status/DG gate, accepted ProjectHub internal baseline, and FFOS data registry semantics are distinct; **no automatic cross-store promotion** from any one state.
- V12-08: no forged `asset_version_id`, fake physical geodata, or claimed approved release from schema/CI status.
- V12-09: source-backed selective intake, Autoclose OFF, default Estate subissue workflow ON (monitor), and source-only rollback/retry after gateway ambiguity.
- V12-10: proposed future cross-store write is blocked without exact human authority, private access, audited source, and any required CDX/CDX-2 governance.
- V12-11: independent other-user ACL and full native Project reconstruction remain to be demonstrated; prior T42/T46 not closed.

### WP03 / D10–D15
- V12-12: Opal and Texts Atlas native-Wiki permissions, manual author rights and published Home verification separate from `hasWikiEnabled` flag.
- V12-13: source-owned handover follows a real request to canonical FFC or FFOS data/work order, original GitHub Issue, site document or approved public page **without duplicating policy semantics**.
- V12-14: Drive content is never changed, moved, deleted, overwritten, or shared under user-guide maintenance without explicit exact-target Director approval.
- V12-15: two role-based navigation tasks must distinguish *website existing public home vs privacy/terms not independently confirmed*, and *ProjectHub internal accepted vs external runtime absent*.
- V12-16: include licence, source provenance and available artifact versus proposed metadata in any GeoPackage/QGIS/asset guide.

## Merge-conflict and acceptance requirements

Before source PR merge:
1. Refresh current `main` and exact review head, reconcile source conflict and later merged source changes.
2. Check that the versioned current 34-repo report **does not silently overwrite** old 31/33 historical ledgers.
3. Revalidate source links and unverified public UI/ACL claims. Test rights and secrets on intended publication surface.
4. Scope document changes to existing D01–D15; no new sovereign policy, CDX control, FFC Corpus version or runtime effect from an estate docs PR.
5. Obtain local owner review, then explicit Director decision and record it in the correct original source Issue.
6. Verify merge commit and resulting README/guide on `main`; a draft PR and CI success do not count as accepted.

## Decisions and nondecisions

| Decision | Observed state |
|---|---|
| WO-002 WP01 / DG-01 | PENDING — D01–D04 drafted, not merged |
| WO-002 WP02 / DG-02 | PENDING — 3 native domain Projects established, D05–D09 drafted, not merged |
| WO-002 WP03 | NOT STARTED — no implicit approval |
| WO-001 WP04 / DG-04 final | HOLD — original T34–T37, T42, T44, T46 |
| FFOS ProjectHub v0.4 | Separate Director ACCEPTED **INTERNAL BASELINE**; `NOT_DEPLOYED` |
| Drive policy | Director create-only and exact-object permission policy referenced in merged source; enforcement and live provider operations require independent verification |
| Data asset/Bruno/Spatial | Some technical sources now merged; do not turn source presence into live end-to-end acceptance |
| This v1.2 rescan | SOURCE-VERIFIED REVIEW CANDIDATE; no self-acceptance or runtime command |

**Recommended Director review:** adopt factual v1.2 reconciliation (34 repos, current source-state labels, project identities and test deltas) *without accepting unresolved WO-002 WPs or changing production*.
