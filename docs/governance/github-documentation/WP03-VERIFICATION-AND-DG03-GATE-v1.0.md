# WP03 — Documentation and Wiki Pilot Verification / DG-03 Gate

**ID:** FF-GH-WP03-VER-001 · **Status:** DG-03 DIRECTOR ACCEPTED (BOUNDED) — merges authorised subject to final verification; residual usability and CI evidence incomplete  
**Date:** 2026-11-03 · **Work order:** FF-GH-WO-001 WP03  
**Review surfaces:** FFOS `docs/wp03-estate-operator-guide-20261103` and UDL Twin `docs/wp03-udl-user-guide-20261103`.

## 1. Delivery register

| Deliverable | Review-branch location | State |
|---|---|---|
| D17 — Documentation taxonomy | FFOS `docs/governance/github-documentation/WP03-DOCUMENTATION-TAXONOMY-AND-PROVENANCE-v1.0.md` | SOURCE-CONTROLLED CANDIDATE |
| D18 — Wiki suitability register | FFOS `docs/governance/github-documentation/WP03-WIKI-SUITABILITY-REGISTER-v1.0.md` | SOURCE-CONTROLLED CANDIDATE |
| D19 — Provenance/synchronisation contract | Combined with D17 | SOURCE-CONTROLLED CANDIDATE |
| D20 — FFOS operator manual | FFOS `docs/operator/FFOS-OPERATOR-MANUAL-v1.0.md` | SOURCE-CONTROLLED CANDIDATE |
| D21 — UDL Twin evaluator guide | UDL `docs/user-guide/UDL-TWIN-EVALUATOR-GUIDE-v1.0.md` | SOURCE-CONTROLLED CANDIDATE |
| D22 — Documentation navigation | Combined D17 + both README entry-point changes | SOURCE-CONTROLLED CANDIDATE |
| D23 — Usability report | `WP03-USER-TASK-VALIDATION-v1.0.md` | TEST PLAN; human cases pending |

**Additional:** UDL `EXAMPLE-EXPOSURE-TO-LEARNING.md` fictional pedagogical example.

## 2. Material platform finding

FFOS and UDL Twin are private repositories, and GitHub native Wikis are unavailable for private repositories on GitHub Free. Native Wikis are technically separate repositories and would create a secondary, less safely governed source surface here. Under the Director's instruction to execute without unnecessary upgrades, both pilots use source-controlled guide directories. **No Wiki has been enabled, created or populated.** A later explicit upgrade or publication mandate would be needed for any native private Wiki.

## 3. WP03 acceptance test matrix

| Test | Current finding | Limit |
|---|---|---|
| T21 — permissions and access | **PASS for review-branch scope** | Guides remain in private source repos; PRs must be reviewed before merge |
| T22 — canonical source authority retained | **PASS (source design)** | Manuals distinguish interpretive guidance from normative documents |
| T23 — substantive page source links | **PASS** | Manual/index pages link to owner, Blueprint and specific contracts; 30 distinct relative target paths checked via GitHub GraphQL |
| T24 — verified functionality claims | **PARTIAL** | Source route / implementation inspection performed; authenticated FFOS and UDL runtime tasks not independently tested |
| T25 — private material/publication | **PASS within author scope** | No credentials or sensitive personal data intentionally introduced; independent rights/privacy review still required |
| T26 — navigation | **PASS for source targets** | 30 distinct internal targets exist on named review branches; UI tasks not independently tested |
| T27 — representative user tasks | **HOLD** | F-1, F-2, U-1, U-2 have written scripts but lack independent tester outcomes |
| T28 — source-change reconciliation | **PASS (defined procedure)** | D17 source-version pointers, discrepancy escalation, review on events and PR workflow |
| T29 — avoid duplicate Wiki | **PASS** | No canonical documents were copied as alternative Wiki authority; no native Wiki configured |
| T30 — no-Wiki decisions | **PASS** | 31 repository choices with reasoned retain/optional/defer/avoid/pilot distinctions in D18 |

**Scope clarification:** PASS for design/source inspection does not establish live runtime usability, comprehensive access penetration testing or accepted publication.

## 4. Defect and discrepancy handling

- Missing/incorrect relative file path: fix on review branch, rerun the internal path check.
- Unsupported or exaggerated runtime claim: correct the guide, link exact source and user/CI evidence, and if necessary mark the step unavailable.
- Normative contradiction: **HOLD**; route to the owning source rather than changing canonical rules from the guide.
- Source status changes while the PR is open: reconcile the manual against the new main commit before merge.
- User task failure: capture the user environment and actual steps, fix instructions or record the runtime issue separately.

## 5. Director decision DG-03

**Proposed:** Accept both **source-controlled documentation pilots** as the chosen medium *instead of native private Wikis*, subject to independent user-task validation and final PR review; or HOLD until validation is complete. Do not treat the creation of a branch or PR as Director acceptance.

A DG-03 acceptance must explicitly state what it accepts, identify any deferred tasks, and identify whether PR merge is authorised. **WP04 SHALL NOT START** from this document alone.

**Decision:** **ACCEPTED (BOUNDED)** on 2026-11-03 — [Director source decision](https://github.com/Motherpher/FFOS/issues/45#issuecomment-6599403434). Merging PR #44 and UDL PR #26 is expressly authorised only after final verification. No WP04 mandate is granted.

## 6. Submitted PR and source attestation (2026-11-03)

- **FFOS:** [PR #44](https://github.com/Motherpher/FFOS/pull/44) — `docs/wp03-estate-operator-guide-20261103` → `main`; initial review HEAD `e975a93e8d7d80d5ca2463a40a90a8c83a2acc35`, base SHA `76374e2a45f4195ffc443df7ba716eb8284acaeb`; **7 changed files**; GitHub reported mergeable at inspection.
- **UDL Twin:** [PR #26](https://github.com/Hybrismannen/udl-twin/pull/26) — `docs/wp03-udl-user-guide-20261103` → `main`; initial review HEAD `4ff3dcda3ba9b7bb942530a4ab896e64e8be80ef`, base SHA `438be5505f4169f80671dce9e64e9ea047511875`; **4 changed files**; reported mergeable at inspection.
- **Source link test:** 30 distinct relative path targets resolved against the two exact source branches through GitHub GraphQL `repository.object(expression: branch:path)`. This validates target existence, not anchor rendering, runtime behaviour, or permissions of a distinct user.
- **CI:** Head commit check-runs endpoint returned **0 visible checks** in both repositories at inspection; **NO CI PASS IS CLAIMED**. Recheck when any CI runs complete.
- **Review:** PRs are unmerged. Documentation source/PR head must be rechecked immediately before DG-03 acceptance and merge.
- **Director gate:** [DG-03 Issue #45](https://github.com/Motherpher/FFOS/issues/45) has an [accepted bounded Director decision](https://github.com/Motherpher/FFOS/issues/45#issuecomment-6599403434), with PR merges conditional on final verification. Independent real-user tests and actual CI acceptance remain deferred obligations.

## 7. Pre-merge final verification note (2026-11-03)

- FFOS PR #44: **mergeable** (GitHub `mergeable=true`), review-head initially `1d606be9d547dbd5e4d4a690fb8c506d5acbac98`, only the seven approved documentation/README files. `main` branch reports **no enforced required status checks** at verification.
- **External non-blocking CI/Deployment exception:** FFOS head's combined commit status is **failure** solely because external `Vercel` reports **`Account is blocked.`**. This is **NOT a PASS**, is unrelated to the documentation file changes as observed, and must not be described as functioning deployment. Check suite items were queued/without conclusions. Do not bypass any *required* failing checks if they later become enforceable.
- UDL Twin PR #26: mergeable; only four approved documentation/README paths. A newer `main` commit altered `docs/metadata-dashboard/data/dashboard-data.json` and `repository-state.json`, not normative Blueprint or guide targets. GitHub reports **no enforced required checks**; status pending with zero combined statuses and queued check suites. No CI PASS claimed.
- DG-03 is **accepted only for the bounded documentation pilots**. Do not infer live authenticated UI verification, full privacy assurance, runtime compliance, or authority over WP04.

**Post-merge evidence must be appended to the source GitHub Issue [#45](https://github.com/Motherpher/FFOS/issues/45).** This static document retains the *pre-merge* evidence checkpoint; it is not automatically a live state monitor.
