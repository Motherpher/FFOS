# FF-GH-WO-002 — Assurance & Acceptance Delta, 2026-11-16

**Document status:** NEW REVIEW CANDIDATE. Does NOT supersede WO-002 [WP01 D04](https://github.com/Motherpher/FFOS/pull/49), [WP02 D09](https://github.com/Motherpher/FFOS/pull/54), or prior [DG-04](https://github.com/Motherpher/FFOS/issues/46) accepted/held scopes.

## Current operational/decision read-back

| Control | Evidence observed | Result | Implication |
|---|---|---|---|
| A01 — baseline population | Authenticated listing 14 Motherpher + 19 Hybrismannen; 33 direct repository GraphQL reads | **PASS** within connected identity visibility | New current register, preserve old 31 history |
| A02 — new-source disposition | Ideburen and Texts-n-Lyrics `main` README/tree/source docs checked | **PASS** for classification evidence | D01/D05/D10 update; explicit owner approval pending |
| A03 — Wiki status | 13 `hasWikiEnabled` flags from GraphQL; native Wiki Home was not independently opened | **FEATURE PASS / PUBLICATION NOT VERIFIED** | Do not claim 13 published Wikis |
| A04 — current Project scope | GitHub owner Projects V2: Opal user #2 16, Politent org #3 18, CareerHub org #4 13, Estate org #2 24 | **PASS for board count** | Existing domain boards remain; no new GreenBell, Ideburen or Texts board |
| A05 — source issue baseline | Ideburen and Texts both 0 open native Issues, 0 linked Projects V2 | **PASS at capture** | No artificial Project backlog |
| A06 — FFOS source status | Main at `54d4fafcfc4577c2299243346d7dd17e0c0ffef9`: Bruno docs/ADR added; #51, #52, #53 unmerged | **PASS for staging/status** | Do not describe Bruno/asset workflow as live |
| A07 — cross-repo proposals | FFC #43 / FF-Spatial #42 still draft and not merged | **PASS for source status** | Proposed data asset/lineage principles not canonical |
| A08 — WO-002 WP01 | FFOS #49 and six local README/guide PRs still draft/unmerged, DG-01 pending | **HOLD** | Recheck latest HEAD/main and source owner approvals before merge |
| A09 — WO-002 WP02 | FFOS #54, Opal #17, Politent #25 still draft/unmerged; dedicated Projects remain created | **IMPLEMENTED / DG-02 HOLD** | No self-acceptance |
| A10 — WO-002 WP03 | No source WP03 execution or DG-03-WO002 decision recorded; Opal and Texts wiki source != published native Wiki | **NOT STARTED / NOT TESTED** | Preserve rights and publication gates |
| A11 — older WP04 assurance | FFOS #46 final DG-04 HOLD with T34–T37, T42, T44, T46 | **HOLD** | Not waived by newer work |
| A12 — automated data workflow | FFOS #51 static checks, #52 mocked local runner, #53 offline registry; FFC/FF-Spatial proposed code; Ideburen no live authenticated AFR fetch | **PARTIAL / NOT LIVE** | Do not imply source API→R→QGIS→ChatGPT end-to-end |
| A13 — Project↔data work-order identity | New explicit identity crosswalk documented in v1.1 but not approved/implemented | **DRAFT CONTRACT** | No automatic write, Issue/asset promotion, or ID conflation |
| A14 — recovery and other-user ACL | Existing 502 duplicate-board rollback proven, but complete restore/permissions/role usability not run | **HOLD** | Keep full D09/T34/T35/T42/T46 gates |
| A15 — secrets, copyright and disclosure | No new secret values included in this reconciliation; independent full source/rights tests not performed | **PARTIAL** | Pius PWE private security blocker and new public literary/data rights reviews remain separate |

## Merge and conflict control

**Do not merge the new reconciliation PR over or ahead of source-owner review by implication.** The existing old-scope drafts must be evaluated against their current `main`, not against the source snapshot date:
- [WO-002 WP01 FFOS #49](https://github.com/Motherpher/FFOS/pull/49) and six related [D02](https://github.com/Motherpher/FFOS/blob/docs/wo002-wp01-estate-navigation-20261103/docs/governance/github-documentation/wo002-wp01/D02-DOCUMENTATION-CHANGE-LEDGER-v1.md) drafts.
- [WO-002 WP02 FFOS #54](https://github.com/Motherpher/FFOS/pull/54), [Opal #17](https://github.com/Hybrismannen/Opal-Sense-I/pull/17), [Politent #25](https://github.com/Motherpher/Politent/pull/25).
- [Bruno #51](https://github.com/Motherpher/FFOS/pull/51), [integration #52](https://github.com/Motherpher/FFOS/pull/52), [assets #53](https://github.com/Motherpher/FFOS/pull/53), [FFC #43](https://github.com/Motherpher/form-flode/pull/43), [FF-Spatial #42](https://github.com/Motherpher/FF-Spatial/pull/42) require independent Director/architecture checks.

**Gate protocol before any merger:** re-read exact PR head → compare latest base → inspect source/schema/API and content/provenance → validate links/tests → review confidentiality/rights → record appropriate source-owner/Director decision → merge only approved scope → verify merged commit and operational state. A CI success alone proves only the tests actually run.

## New test additions (do not create WPs)

**Within WP01**
- R01 — all 33 source links/README entry paths, checked against latest Git trees; older 31 file paths must be refreshed where source changed.
- R02 — stale claims such as "Projects not activated" or "WP02 not started" corrected in actual review drafts.
- R03 — operator guide distinguishes provider API definitions on main, #51 proposed collection, #52 proposed runner, #53 proposed asset registry, and actual live authorisation.
- R04 — generated dashboards contain an as-of timestamp and do not claim independent live telemetry.

**Within WP02**
- R05 — Project Item/source Issue IDs cannot be confused with FFOS typed `work_order_id` or asset-version IDs; negative test for same-title/different-owner objects.
- R06 — no asset row or project card triggers an external provider fetch, billing, rewrite, permission change or publication without explicit mandate.
- R07 — source selected work and domain rights remain local; no CVs, third-party lyric copies, client/child data, API keys or unlicensed datasets are copied into Project fields.
- R08 — API ambiguity/502 retry performs read-back before create; exact ID rollback is limited to same-operation empty duplicates.
- R09 — dated Project snapshot is separate from live status, and complete source/metadata restoration remains independently exercised.

**Within WP03**
- R10 — Opal Wiki content rights, native initialisation, source links and editorial approval.
- R11 — Texts-n-Lyrics source-to-native-Wiki publish check: actual GitHub action result, current Home revision, link correctness, licence/author permission, no silent republication.
- R12 — at least one nonprivileged representative user finds the correct guide and authoritative source for Ideburen and Texts-n-Lyrics, with error/disclosure handling.
- R13 — human distinguishes model/proposed asset references from real accessible datasets, verified GIS, qualified publication and current approved documentation.
- R14 — final register and directory treat 33 as dated scope; future additions trigger delta review rather than fixed-number assumptions.

## Explicit decision gates

| Gate | Status | Required authority/action |
|---|---|---|
| **WO-002 DG-01** | Pending | Review and scope-accept WP01 D01–D04/source PRs; update latest 33-repo supplement |
| **WO-002 DG-02** | Pending | Review bounded three-board setup plus added identity/asset separation and independent ACL/recovery limits |
| **WO-002 DG-03 final** | Not started | Complete selected Wiki/guide publication tests, owner rights, user tasks and final report |
| **WO-001 DG-04 final** | HOLD | Preserve T34–T37, T42, T44, T46; independent from WO-002 |
| **FFC/FFOS asset-first and Bruno architecture** | Proposal/staging | Separate Director decision and tested runtime contract; not accepted here |
| **Pius PWE security** | Independent HOLD | Credential rotation/source repair and independent testing on owning repository |

**Recommended Director disposition on this document:** accept it as a dated factual *reconciliation proposal* only if satisfied; do not infer acceptance of the underlying independent WPs, contracts, migrations, Wikis, tools, or external operations.
