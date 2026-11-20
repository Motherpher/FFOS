# FF-GH-WO-002 — Full Rescan and Three-WP Revision v1.2

**Date:** 18 November 2026 (Stockholm)  
**Authority:** [Master WO-002 Issue #48](https://github.com/Motherpher/FFOS/issues/48) · [WP02 Issue #50](https://github.com/Motherpher/FFOS/issues/50)  
**Status:** SOURCE-VERIFIED RECONCILIATION / DIRECTOR REVIEW CANDIDATE; no DG-01/DG-02 acceptance and no WP03 execution implied.  
**Source:** [34 repositories register](CURRENT-ESTATE-REGISTER-34-v1.2.md) · [JSON](ESTATE-REGISTER-34-v1.2.json) · [v1.2 assurance](ASSURANCE-AND-DECISION-DELTA-v1.2.md).  
**FFOS current main reviewed:** `eaddcc44c5821e2583c109a6af1af396f08310c2` (18 Nov 03:07 UTC). Original 31-repo and 16 Nov 33-repo source records remain historical and intact.

## Overall decision

**WO-002 is structurally valid with 3 work packages. Its coverage and inter-system status descriptions need a material revision before acceptance or merge.** No evidence requires creating WP04, mass Wiki rollout, or one GitHub Project per repo.

Critical findings:
1. **Estate now 34 visible repos**, not 31/33; canonical private website source `Hybrismannen/formflode-com` was absent from v1.1. Main source has substantial website/FFC/CDX/FFOS governance, site-release and Drive contracts.
2. **Estate Portfolio now 25 source Items**, with [FFC website/public-provenance Issue #47](https://github.com/Motherpher/form-flode/issues/47) added; three private domain boards remain **Opal 16 / Politent 18 / CareerHub 13**. Auto-close Issue OFF on all four live working boards; original Estate Auto-add sub-issues ON, domain boards OFF.
3. **FFOS Bruno/OpenCollection #51 and asset registry #53 now MERGED**; [FFC semantics #43](https://github.com/Motherpher/form-flode/pull/43) and [FF-Spatial metadata catalogue #42](https://github.com/Motherpher/FF-Spatial/pull/42) also MERGED. Their documents may retain proposed/limited semantic state. Do not continue to call their PRs open or treat merge as functioning API/R/QGIS execution.
4. **FFOS asset registry advanced materially:** merged [#71](https://github.com/Motherpher/FFOS/pull/71) transactional PostgreSQL service-port code and its isolated tests; merged [#82](https://github.com/Motherpher/FFOS/pull/82) a factual source record for a live FF Estate Supabase migration, four empty tables and restricted ACL. The [RLS-disabled advisory and writer role](https://github.com/Motherpher/FFOS/pull/83) remain an open control (PR #83). **Do not claim end-to-end application binding or an authorised operational asset system.** Source evidence is a dated audit, not a fresh independent database query here.
5. **FFOS ProjectHub is a distinct system from native GitHub Projects V2.** [ProjectHub PR #85](https://github.com/Motherpher/FFOS/pull/85) recorded an explicit accepted **native internal baseline v0.4** after PR #79 implementation and [FFC governed projection #46](https://github.com/Motherpher/form-flode/pull/46). [Closeout source](https://github.com/Motherpher/FFOS/blob/main/docs/operations/devops/processes/projecthub-reconstitution/CLOSEOUT-2026-11-18.md) says `RELEASED_INTERNAL_BASELINE / NOT_DEPLOYED`. It does **not** accept GitHub DG-01/DG-02, allow production DB admission, broad multi-user rollout, PH-D4, provider writes, or automatic Pius routing.
6. **FFOS Google Drive infrastructure advanced:** merged cloud/OAuth and resumable-session fixes up to [#100](https://github.com/Motherpher/FFOS/pull/100), and [#91](https://github.com/Motherpher/FFOS/pull/91) records Director's create-only/exact-target policy. The [FFOS cloud runbook](https://github.com/Motherpher/FFOS/blob/main/docs/architecture/GOOGLE-DRIVE-CLOUD-STORAGE-v1.md) distinguishes branding/consent evidence from authenticated live data write + SHA-256 readback. **A merged code fix is not a successful live Drive transfer.**
7. **CDX Google Drive proposal v1.1 is not automatically active law.** Its [source candidate](https://github.com/Hybrismannen/Conductellence-/blob/main/POLICY/proposals/OAI-DRIVE-EXTERNAL-EFFECT-CONTROL-v1.1.json) marks `CANDIDATE_NOT_ACTIVE`. The FFOS Drive policy forbids unapproved mutation to existing Drive objects. Do not treat a publication guide, Wiki, dashboard or Project view as approval to move, modify, delete or re-share a Drive file.
8. **New website source has 0 native Issues and no GitHub Projects V2.** Its connected Lovable project is a different product and not a reason to add another GitHub board. The [FFC website Issue #47](https://github.com/Motherpher/form-flode/issues/47) is already represented in Estate Portfolio. Public website/legal-route verification and FFC-PPS provenance remain a separately competent release gate.

## Interpreting merged code and accepted/held states

| System | Observed source state | Not established by this rescan |
|---|---|---|
| GitHub Projects V2 | Four private operational planning Projects; 25+47 native source-Issue links in their appropriate boards | Full restore, alternate-user ACL, autonomous sync or Director approval |
| FFOS ProjectHub | Director-accepted *internal* v0.4 baseline and governed FFC projection, **not deployed** | GitHub WO-002 acceptance, live multi-user service, autonomous provider actions |
| Bruno Central API Ledger | Merged developer request definitions/static validation | Authenticated live source dataset, full pagination or ChatGPT/Bruno runtime |
| FFOS data asset registry | Merged code and transactional tests; source-reported isolated live Supabase schema with empty tables, RLS advisory | Production writer binding, live ingestion, approved data-asset/reuse policies |
| FF-Spatial | Merged metadata-only asset catalogue and Drive-control changes | Actual DeSO polygons, verified QGIS project or live geographic service |
| FFC source | FFC-DATA v0.2 proposed principles merged as documentation; ProjectHub projection merged | Automatic canonical adoption of every proposed analytic rule or production workflow |
| Google Drive integration | Merged code/diagnostic changes, restrictive policy reference and source-level safety work | New Drive content written/verified; authorization for changes to existing Drive objects |
| Website Lovable source | Canonical private source, existing website domain, CI and privacy/terms source code | Public route revision/HTTP verification for privacy/terms, FFC-PPS final publication approval |
| Pius PWE | Open remediation Issue #7; README review PR #8 still open | Credential rotation, safe browser build or deployed app |

## WP01 — Documentation, navigation, provenance and governance (D01–D04)

**D01 — Estate inventory:** promote a new **34-row dated register** only following owner/Director review. Add `Hybrismannen/formflode-com` as **Tier B candidate**. Preserve historical 31 and 33 baselines, source-sha provenance and exact distinctions among GitHub Projects, FFOS ProjectHub and Lovable project. Retain 13 Wiki feature flags as flags, not publication evidence.

**D02 — User-guides and entry paths:** Index site `README.md`, `docs/ARCHITECTURE.md`, `docs/OPERATIONS.md`, `docs/RELEASE-GATES.md`, existing FFC website/PPS source Issue and FFOS Drive runbook. Revise prior entries wrongly calling FFOS #51/#53, FFC #43, FF-Spatial #42 unmerged. Publish source-controlled *status pointers*, not another copy of accepted or proposed policy. Existing missing root READMEs for `Hy` and `pius-pwe` remain on old draft PRs only.

**D03 — Documentation provenance:** Introduce mandatory **six-category source state**: proposed, merged-source, code/test-verified, externally connected, Director-accepted, deployed/published. None is interchangeable. Product-specific guide provenance must identify canonical owner (FFC Corpus vs public site vs FFOS ProjectHub vs GitHub Projects V2 vs Drive provider). Treat scheduled dashboard or passive DevOps-hook updates as time-stamped operational signals, not automatic release authority. Apply exact-object Director approval to any existing Drive-document mutation.

**D04 — Discrepancy verification:** Source-owner review all seven WP01 draft PRs and whether they conflict with the 18 Nov source. Confirm no old website repo link survives as canonical. Pius PWE security Issue #7 remains open. Test 34 repo root routes and access using relevant roles; plain source-path existence ≠ usable public page. Document stale website release-gates language vs later Google branding and upload integration evidence without claiming a successful transfer.

## WP02 — Native GitHub Projects and source-owned operating integration (D05–D09)

**D05 — Project choices:** 34 decisions; **no additional board** for the new website (0 native Issues, no independent backlog), Ideburen or Texts-n-Lyrics. FFC website P12 source Issue #47 already has a native Estate link. Revisit only if owner identifies distinct workstream and source-Issue mandate.

**D06 — Current implementation:** Retain private domain Projects: Opal 16, Politent 18, CareerHub 13, **Estate 25**. Reconcile v1.1 old 24-item snapshot to 25 by exact FFC #47. Record Auto-close OFF for all four; Estate auto-subissue intake ON for selective-risk review.

**D07 — Identity contract:** Maintain four independent types: (i) GitHub Estate work-order `FF-GH-WO-002`, (ii) GitHub native source Issue, (iii) **FFOS ProjectHub** governed internal Project object, and (iv) FFOS data registry typed `work_order_id / asset_version_id`. The Lovable editor's project identity is a fifth unrelated identity, not a GitHub Projects V2 Item. **No ID conflation or unapproved cross-store state sync.**

**D08 — User guide:** Navigate `original source Issue → GitHub dedicated board / Estate decision projection` for work oversight. Navigate `FFC method / FFOS ProjectHub / data asset evidence / FF-Spatial product` through their own source-controlled technical guides when the user needs domain content or actual files. Label available vs not deployed explicitly. New Form & Flöde website user guide is its own repo, not FFC's source law.

**D09 — Added negative tests:** no false ProjectHub-GitHub Project equivalence; source/Project cross-owner permission; fake asset-version evidence; missing RLS or DB admission; Drive mutation without exact human approval; GitHub 502 replay duplicate; public website policy-route release with no readback; new DevOps passive hook mistaken for active runtime; restore/ACL/independent user tasks remain HOLD. Do not reset already accepted ProjectHub internal baseline to `not released` merely to preserve older GitHub WO-002 HOLDs.

## WP03 — Selective Wiki, independent usability and handover (D10–D15)

**D10–D12:** Re-evaluate 34 repos and unchanged **13 Wiki feature flags**. Opal remains source-governed native Wiki candidate; Texts-n-Lyrics has a source-controlled Atlas and conditional publish workflow, but native Wiki publication/author rights still require separate proof. Website, FFOS, Ideburen and FFC use existing source-controlled docs instead of duplicating them as native Wikis.

**D13 — Practical tasks:** director/operator finds source Issue and its true authority, selects correct product Project (GitHub board vs internal ProjectHub vs Lovable), reads an appropriate guide, checks one real evidence/release path, respects private access, and handles a failed link/denied action. Require source-based privacy and legal-route tasks for new website, **no** unauthorised Drive modifications, and source-vs-proposal classification of assets.

**D14–D15 — Final handover and evidence:** One director entry directory that shows 34-repo as-of snapshot, GitHub boards, accepted internal ProjectHub, API ledger, asset registry, FFC provenance, website, Drive governance and limited publication status. Keep independent source-owner, accessibility, Wiki publisher, ACL, recovery, and CDX/AMA/HARP gates. Final Director DG-03 is not inherited from earlier WO-001 DG-03.

## Pending changes and gates

- [WO-002 WP01 PR #49](https://github.com/Motherpher/FFOS/pull/49) and six source-owned PRs remain open/DRAFT. **DG-01 PENDING**.
- [WO-002 WP02 PR #54](https://github.com/Motherpher/FFOS/pull/54), [Opal #17](https://github.com/Hybrismannen/Opal-Sense-I/pull/17), [Politent #25](https://github.com/Motherpher/Politent/pull/25) remain open/DRAFT. **DG-02 PENDING**.
- This [WO-002 reconciliation PR #55](https://github.com/Motherpher/FFOS/pull/55) remains open/DRAFT and must be checked at exact head against 18 Nov `main` before acceptance/merge.
- Prior [WO-001 WP04 DG-04](https://github.com/Motherpher/FFOS/issues/46) final HOLD on T34–T37/T42/T44/T46 remains independent.
- **WO-002 WP03 NOT STARTED.** No native Wiki publication or Director DG-03 recorded.
- [FFOS #52](https://github.com/Motherpher/FFOS/pull/52) Bruno CLI bounded runner still OPEN/DRAFT; [FFOS #83](https://github.com/Motherpher/FFOS/pull/83) registry role-scoped RLS still OPEN; [FFOS AMA #34](https://github.com/Motherpher/FFOS/pull/34) remains OPEN/DRAFT.
- Exact live Drive OAuth/file write, external access, licensing/HARP review and user-task success remain unproven in this read-only repository scan.

## Reconciliation disposition

**Recommended:** accept **only** a factual v1.2 *scope review candidate*: 34 rows, differentiated merged/accepted/connected/deployed states, same 3 WP structure, no new GitHub Projects or Wikis. **Not** a self-approved DG, merge, FFC Corpus amendment, database migration, new Drive object, public website release, or production runtime activation.

**Action taken by this rescan:** GitHub source-read plus additive review documentation only, preserving the 16 Nov v1.1 history. Separate Director approval is required to promote this update from a draft proposal into the accepted operating baseline.
