# D04 — Verification, Discrepancy and DG-01 Director Decision Gate

**ID:** FF-GH-WO-002-WP01-D04 · **Date:** 2026-11-03 · **Status:** PRE-MERGE CANDIDATE / DG-01 PENDING.  
**Source:** [Work order Issue #48](https://github.com/Motherpher/FFOS/issues/48) · [D01 estate register](ESTATE-NAVIGATION-REGISTER-v1.md) · [D02 PR ledger](D02-DOCUMENTATION-CHANGE-LEDGER-v1.md) · [D03 standard](DOCUMENTATION-PROVENANCE-AND-MAINTENANCE-v1.md).

## 1. Findings and decisions

| ID | Finding / discrepancy | Evidence | WP01 disposition |
|---|---|---|---|
| F01 | FFOS README called WP04 an unaccepted implementation candidate after authorised merge | [Merged PR #47](https://github.com/Motherpher/FFOS/pull/47), [Director bounded approval](https://github.com/Motherpher/FFOS/issues/46#issuecomment-6602862060) | Corrected in FFOS WP01 review branch; **DG-04 full HOLD preserved** |
| F02 | Estate README and handover still called PR #47 draft/unmerged and FFOS Issue Forms staged | Source `main` + [verified merge commit](https://github.com/Motherpher/FFOS/commit/014b75b538f54e6141504d40aebad22d269ae4b0) | Corrected in reviewed bounded source diff |
| F03 | DG-04 assurance document was pre-merge historical report, without post-merge contextual header | [DG-04 source Issue #46](https://github.com/Motherpher/FFOS/issues/46) | Added non-destructive current-status header, retained historical audit and T34–T37/T42/T44/T46 |
| F04 | WP03 Wiki suitability register still declared DG-03 pending | [Director's DG-03 accepted comment](https://github.com/Motherpher/FFOS/issues/45#issuecomment-6599403434) | Corrected decision state without creating native Wiki or changing publication rights |
| F05 | Two repositories lacked a root README | Fresh tree SHA: `Hy`, `pius-pwe`; [D01](ESTATE-NAVIGATION-REGISTER-v1.md) | Two focused draft README PRs; not yet on main |
| F06 | Barnombudet, GreenBell, StatsVault root README did not directly expose the verified internal guide | Source root/guide paths | Three bounded root README PRs, no source-model changes |
| F07 | CareerHub had source-defined in-app Help but no source-linked standalone guide from root | `web-shell/site/app/help/`, root user contract | New `docs/USER-GUIDE.md` and root link in draft PR #59; no live end-to-end claim |
| F08 | Prior audit reported 12 Wiki flags, historic WP04 REST baseline reports 11; Re-Eco source claims differed between API read surfaces | Previous live GraphQL inspection vs WP04 REST snapshot and fresh REST `Re-Eco.has_wiki=false` | **DATA_CONFLICT / HOLD** until current GitHub API identity, user permission and native Wiki evidence are reconciled in WO-002 WP03. Do not publish or disable Wiki based on unverified count |
| F09 | FFC Corpus source requires version governance for accepted content | [FFC repository](https://github.com/Motherpher/form-flode), version protocol | NO LOCAL CHANGE under WP01; link to source-owned manual via FFOS, separate FFC version gate if local amendment is needed |
| F10 | Pius PWE source contains credential-like hard-coded provider secret and RTF-wrapped JS | [Private security Issue #7](https://github.com/Hybrismannen/pius-pwe/issues/7) | SECURITY HOLD and urgent separate remediation; WP01 never uses/publishes credential |
| F11 | Earlier source documentation and analysis implied complete user access/functional readiness in some cases | Bounded WP03 user tasks and WP04 T44/T46 unresolved | Explicit source-only vs deployed/independently tested states in D03; T44/T46 remain pending |

## 2. WP01 validation results

| Test | Evidence | Status |
|---|---|---|
| N01 — complete audited population | 31/31 authenticated `main` tree reads, none truncated | **PASS (scope-limited)** |
| N02 — source guide path presence | D01 register captures root and preferred guides with source tree SHA | **PASS for inventory**, not user usability |
| N03 — primary README remediation | 2 no-README repositories have drafted first entry PRs | **PARTIAL** — not merged/owner-accepted |
| N04 — current authoritative status drift | FFOS 6 focused files edited on review branch; source acceptance retained | **PARTIAL** — merge/read-back pending |
| N05 — local guide navigation PRs | Six source-local PRs open, file lists bounded to READMEs/one guide | **PASS for PR staging**, **HOLD for merge** |
| N06 — local relative-link targets | 47 relative targets at six exact source PR HEAD trees, zero unresolved | **PASS (path level)** |
| N07 — owner access and rights | Source repo read/write branch possible; different nonprivileged roles not tested | **PARTIAL / NOT TESTED** |
| N08 — run-time user tasks | F-1/F-2 and U-1/U-2, new CareerHub flow, Opal Wiki readers | **NOT TESTED** |
| N09 — documentation provenance | D03 source-owner/change triggers/status vocabulary; no canon changes | **PASS for draft design**, owner adoption pending |
| N10 — privacy and security | No credentials copied; private register remains in FFOS | **PARTIAL** — security Issue #7 and independent review outstanding |
| N11 — Project/Wiki non-expansion | WP01 made no native Wiki or domain Project creation | **PASS** |
| N12 — DG-01 Director disposition | No source decision yet | **HOLD** |

## 3. Material unresolved conditions

- **PIUS PWE credential/source integrity:** owner must rotate/revoke if active, investigate exposure, repair source files and test; no published provider key value in this document.
- **Source-owner reviews:** six local PRs plus the central FFOS PR cannot be called live/accepted simply because they are mergeable.
- **FFC versioning:** source-owned change-control before any amended Corpus content; no silent FFC mutation.
- **API Wiki feature discrepancy:** native publication, plan eligibility and rights are WO-002 WP03, not an excuse to turn on/disclose material in WP01.
- **Existing DG-04 final HOLD:** cross-owner permission T34/T35, live sync idempotency/recovery T36/T37, full Project recovery T42, practical user tests T44, independent review T46.
- **External FFOS Vercel failure:** `Account is blocked` was non-required for the prior docs merge and is not a deployed CI PASS.
- **Maintainer identities:** still UNASSIGNED until accountable owners verify; no invented names or mandate.
- **No user-task success data** from independent role-based manual review.

## 4. Director gate DG-01

**Proposed decision for future review:** Either:
- **ACCEPT BOUNDED WP01 PREPARATION** with source-local draft PRs and independent tests explicitly retained; separate local PR merge authorisations still required, **or**
- **HOLD** until source-owner reviews and independent user task testing/defects are completed, **or**
- Request bounded revisions to D01–D04.

A final completion declaration must specify which PRs were actually merged and verify their merge commits/README navigation in `main`. Do not start WO-002 WP02 from a report alone.

**DG-01:** PENDING DIRECTOR DISPOSITION.  
**WO-002 WP02 / WP03:** NOT STARTED.
