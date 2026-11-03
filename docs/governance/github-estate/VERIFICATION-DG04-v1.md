# FF-GH-WP04 — Independent Assurance and Director DG-04 Gate

**Record:** FF-GH-WP04-D32-VER-001  
**Date:** 2026-11-03 · **Status:** TECHNICAL IMPLEMENTATION CANDIDATE; DG-04 HOLD / NOT ACCEPTED  
**Source Work Order:** [FF-GH-WP04 Issue #46](https://github.com/Motherpher/FFOS/issues/46) · **Review PR:** [FFOS PR #47](https://github.com/Motherpher/FFOS/pull/47)

## 1. What was actually implemented

- Repository snapshots (authenticated REST) for **31 accessible** repos across Hybrismannen/Motherpher, stored as private dated JSON.
- Owner-aware Tier A/B/C/D adoption register, **31 entries**, with source authority, privacy and nonactivation guardrails.
- **13 selected existing** source Issues manually added to private Motherpher Project #2, expanding total linked Project items to **22** from **12 distinct repositories**; exact mappings and source rationale are retained in [D25 Project Adoption Ledger](PROJECT-ADOPTION-LEDGER-v1.md).
- Native work-item IDs and Issue URLs preserved; sources remain open, not duplicated or closed.
- Project classifications: Programme, Work Stage, Work Type, source IDs, selected source-given priorities/dependencies. No invented Director approval or production effect.
- Two additional selective Project views: Products & Platforms and Research & Delivery (filter behaviour to be separately validated).
- Private point-in-time Project snapshot and [snapshot dashboard](ESTATE-DASHBOARD.md), with denominators and no unmeasured cost/usage claims.
- Reusable Issue, PR and label candidate templates under `templates/` (not actively propagated across repositories).
- Standard-library, **offline read-only** snapshot reconciler and regression tests; bounded GitHub Actions workflow with `contents: read`. No cross-repo writer or extra credentials.
- [Synchronisation contract](PROJECT-SYNCHRONISATION-CONTRACT-v1.md), [FFOS/CDX proposed integration](FFOS-CDX-INTEGRATION-SPEC-v1.md), [evaluation baseline](EVALUATION-BASELINE-v1.md), [playbook](OPERATIONS-PLAYBOOK-v1.md), [Director handover](DIRECTOR-HANDOVER-v1.md).

## 2. Assurance test matrix (T31–T47)

**Meaning:** PASS = bounded condition evidenced. PARTIAL = a subset is verified, full condition not satisfied. HOLD = mandatory unresolved assurance. NOT TESTED = no supporting execution evidence. Source review is not independent verification.

| Test | Status | Verified evidence and limitation |
|---|---|---|
| T31 — approved implementation profile per repository | **PARTIAL** | 31/31 adoption classifications/source inventory; local maintainer acceptance and configuration per repository **not** obtained |
| T32 — eligible work links preserve identities | **PASS for selected 22** | Native source URLs/Issue node IDs preserved in Project, no duplicated/closed source; not exhaustive estate work-item inventory |
| T33 — historical repos not inadvertently activated | **PASS for current intake** | Tier D historical/derivative sources excluded from 13 new linked Issues; source repos not modified |
| T34 — cross-owner permissions | **PARTIAL** | Authenticated connector successfully linked Issues from both owners; wider delegated-principal, role-by-role and future service-token tests not done |
| T35 — private data not exposed | **PARTIAL** | Project private, snapshots in private FFOS, no secrets intentionally introduced; comprehensive independent access/rights/privacy test pending |
| T36 — automation idempotency | **PARTIAL** | Offline duplicate-source and state conflict tests passed; no live repeat-delivery or simultaneous cross-owner write worker exists |
| T37 — failure visibility/recovery | **PARTIAL** | Offline checker exits HOLD on unsafe evidence, reports warnings/blockers; live transport/error alerting and integration recovery not implemented |
| T38 — no project-manufactured approvals | **PASS for bounded pilot** | Work Stage/Authority Gate separated; Project native Auto-close OFF; accepted projections refer to source decisions DG02/DG03 |
| T39 — acceptance traceability | **PASS for two accepted pilot gates** | DG-02 Issue #43 and DG-03 Issue #45 explicitly verified; future acceptance needs independent checking |
| T40 — no agent authority expansion | **PASS for WP04 changes** | No agent registry, AMA, Pius runtime or CDX policy enforcement changes introduced |
| T41 — existing canonical data/dashboard source preserved | **PASS for WP04 changes** | FFOS review branch contains supplementary docs/code, existing generated domain dashboards left intact |
| T42 — Project/automation recovery without loss | **HOLD** | Only WP02 Project draft-item rollback proven; full Project recovery, scoped credential replacement and event replay not tested |
| T43 — export and source reconciliation | **PASS for dated snapshot** | 22 linked source URLs in exported Project JSON, 31 register records; live refresh and history not automated |
| T44 — operational docs match implementation | **PARTIAL** | Playbook and guides explicitly mark unimplemented stages; independent user task tests F-1/F-2/U-1/U-2 still outstanding |
| T45 — evaluation calculations supported | **PASS for baseline definitions** | 31 accessible repos; 22 Project Issues; 12 linked repositories; no fabricated effect or savings metrics |
| T46 — independent verification | **HOLD** | Implementing assistant/source inspection and GitHub Action tests are not an independent human reviewer |
| T47 — Director handover | **PARTIAL** | Handover document prepared; Director operational acceptance and usability assessment not performed |

**Summary:** Material evidence exists for a controlled **staged** rollout. DG-04 cannot honestly be marked fully accepted while T42 and T46 remain HOLD and live L1/L2 sync/permissions remain unverified.

## 3. CI and regression evidence

The read-only Actions workflow `.github/workflows/estate-snapshot-audit.yml` was observed running on the WP04 draft PR. At inspection, [run #41625480998](https://github.com/Motherpher/FFOS/actions/runs/41625480998) and [run #41625288018](https://github.com/Motherpher/FFOS/actions/runs/41625288018) reported **success** for Checkout, deterministic unit tests, local snapshot reconciliation, summary and artifact creation.

These **only test the committed snapshot and local invariants**; they do not show a live GitHub API sync, CDX effect enforcement or independent privacy review. Any subsequent PR head needs its own CI result read-back before merge.

## 4. Mandatory unresolved controls

- **Independent qualified reviewer / Director review (T46):** confirm governance and technical evidence against actual source revisions and UI.
- **Full Project recovery (T42):** rehearse metadata export/reconstruction non-destructively under authorised scope; verify approval source reconciliation and exact field/view restore.
- **Permissions/visibility (T34/T35):** test distinct nonprivileged user, cross-owner app scopes, read-only token/service identity and private metadata visibility.
- **Live recurring sync (T36/T37):** not implemented; needs a separately approved credential/effect boundary, idempotency conflict tests, rate-limit handling and CDX policy where relevant.
- **WP03 user testing (T44):** F-1/F-2/U-1/U-2 still NOT RUN; bounded DG-03 acceptance preserves those obligations.
- **External FFOS Vercel check:** historical `Account is blocked` is an external deployment impediment; never claim runtime/CI success for that check.
- **Local maintainer endorsements (T31):** no mass template/ruleset/permissions rollout was performed. Source repos remain responsible for their own adopted settings.

## 5. Director options at DG-04

**A — Accept bounded implementation and commission Stage 2 hardening:** explicitly approve the implemented Project intake, register, source documentation, offline audit and native views, while **retaining T34–T37/T42/T44/T46 as HOLD/PARTIAL** and prohibiting automatic cross-owner writes/production claims.

**B — HOLD DG-04 pending independent assurance:** do not merge PR #47 or expand the live automation. Commission owner/access/recovery/user tests and reconvene.

**C — Reject/reshape scope:** ask for corrective changes on the review branch; preserve current source Issues and rollback capability.

**Recommended disposition pending independent assurance:** **HOLD DG-04**. Review PR #47 as a candidate only; no merge, release or live integration is accepted by this document.

## 6. Evidence integrity / prior gates

Prior WP02/WP03 Director acceptances remain valid **only in their bounded scope**. Source-projected Project acceptance fields do not extend that scope. No source Issue was closed to claim WP04 completion.

**Decision status:** DG-04 **AWAITING DIRECTOR DISPOSITION; no self-acceptance.**

## 7. Additional observed actions and evidence (2026-11-03)

- **Native Project intake idempotency test:** authenticated GraphQL `addProjectV2ItemById` repeated on existing [WP04 Issue #46](https://github.com/Motherpher/FFOS/issues/46) returned its **original Project item node ID `PVTI_lADOE9niMs4Bp6f2zhFp9TM`**. A separate read-back confirmed 22 source Issues, **22 distinct source node IDs**, all Issue states OPEN, Project still private, Auto-close issue still OFF. This is evidence of **GitHub's native Project add behaviour**, not a distributed worker/effect-gate test. T36 remains PARTIAL.
- **Programme views:** added `Products & Platforms` (view #9) and `Research & Delivery` (view #10) to the private Project, with saved Programme filters; view items were retrieved through authenticated GitHub Project view API. Their presence does not imply any product acceptance.
- **Repository discoverability:** the Project is linked in the same-owner private `Motherpher/GreenBell` Projects tab, in addition to pre-existing `Motherpher/FFOS` and `Motherpher/form-flode` links. Public repositories were not formally linked to avoid unnecessary private-Project exposure risk.
- **FFOS local template adoption candidate:** two Issue Forms and one Pull Request template have been added **only on WP04 draft PR #47** under `.github/`; no default-branch/template deployment or cross-repository mass update has occurred. Local owner review and DG-04 approval remain required.
- **Source-linked dashboard:** 10 native views plus a dated [Project dashboard](ESTATE-DASHBOARD.md), with all 22 Projects items registered in an exact [snapshot](data/portfolio-snapshot-2026-11-03.json).
- **Documentation links:** repository-relative links across 11 WP04 Markdown pages were checked against the exact review-branch Git tree: **55 link occurrences, 22 distinct resolved targets, 0 missing**; this establishes file-path existence, not signed-in operator usability.
- **Automation:** GitHub Actions read-only assurance has reported successful earlier head runs, including [run 41625480998](https://github.com/Motherpher/FFOS/actions/runs/41625480998); recheck the final branch head before claiming current CI PASS. No live cross-owner sync is activated.

**DG-04 remains HOLD for full-scope acceptance** because this work has not satisfied independent verification, whole-Project recovery, role-specific privacy or recurrent runtime integration. A Director may later approve a bounded acceptance with all outstanding gates explicitly carried forward, but that decision is not presumed.
