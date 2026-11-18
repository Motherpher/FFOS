# D02 — Source Repository Documentation Change Ledger

**Work order:** FF-GH-WO-002 / WP01 · **As-of:** 2026-11-03 · **Status:** BOUNDED DRAFT PULL REQUESTS; NO MERGE OR OWNER ACCEPTANCE IMPLIED.

## Scope and purpose

Repair actual navigation gaps while respecting canonical source authority, existing publication/rights, and ongoing work. The 31-repository inventory is in [D01](ESTATE-NAVIGATION-REGISTER-v1.md); not every repository needs a code or Wiki change.

## Change ledger

| Repository | PR / branch | Files | Change | State |
|---|---|---|---|---|
| [Motherpher/FFOS](https://github.com/Motherpher/FFOS) | [PR #49](https://github.com/Motherpher/FFOS/pull/49) · `docs/wo002-wp01-estate-navigation-20261103` | README; WP04 estate README, handover, configuration, DG-04 audit; WP03 Wiki register; new D01–D04 | Reconcile verified WP04 merge vs DG-04 HOLD and publish navigation source register | DRAFT / OPEN; DG-01 pending |
| [Hybrismannen/Hy](https://github.com/Hybrismannen/Hy) | [PR #4](https://github.com/Hybrismannen/Hy/pull/4) | `README.md` | Neutral source/governance navigation; product role explicitly unknown | DRAFT / OPEN |
| [Hybrismannen/pius-pwe](https://github.com/Hybrismannen/pius-pwe) | [PR #8](https://github.com/Hybrismannen/pius-pwe/pull/8) | `README.md` | Pius PWE source entry, Vercel blocker and security/source-format limitations | DRAFT / OPEN; **independent security HOLD** |
| [Hybrismannen/Barnombudet](https://github.com/Hybrismannen/Barnombudet) | [PR #1](https://github.com/Hybrismannen/Barnombudet/pull/1) | `README.md` | Expose source-controlled Swedish manual alongside app manual | DRAFT / OPEN |
| [Motherpher/GreenBell](https://github.com/Motherpher/GreenBell) | [PR #14](https://github.com/Motherpher/GreenBell/pull/14) | `README.md` | Company operations, research, StatsVault technical owner and native Issues | DRAFT / OPEN |
| [Hybrismannen/green-bell-statsvault](https://github.com/Hybrismannen/green-bell-statsvault) | [PR #16](https://github.com/Hybrismannen/green-bell-statsvault/pull/16) | `README.md` | Product operations and dual dashboard navigation | DRAFT / OPEN |
| [Motherpher/CareerHubZero](https://github.com/Motherpher/CareerHubZero) | [PR #59](https://github.com/Motherpher/CareerHubZero/pull/59) | `README.md`, `docs/USER-GUIDE.md` | Source-linked Profile → Search → Analyse → Apply → Track / Help guide | DRAFT / OPEN |

**Other primary repos confirmed navigable from current root source, so no redundant changes:** UDL Twin (User & Evaluator Guide), Conductellence (CDX System Guide), Pius Universe (Pius 6 DevOps Galaxy and Codex source), FF-Spatial (QGIS integration), Opal-Sense-I (editorial operations and Wiki seed).

**FFC local README is NOT rewritten in WP01:** the FFC Corpus uses its own governed content/version protocol; a proposed navigation change may entail accepted Corpus versioning. Its existing [FFC-side operating manual](https://github.com/Motherpher/form-flode/blob/main/17-ffos/OPERATING-MANUAL.md) is linked in the private FFOS navigation directory without imposing unreviewed FFC source changes.

## Source/rights and lifecycle boundaries

- These PRs are **not merged**. Draft means review candidate, not Director acceptance or deployment.
- Owner/source-aware approvals and any branch checks are required before source-local merge; if denied, preserve documentation disposition and rationale.
- The two missing root READMEs are staged, but not present on their original `main` yet. Do not update D01 baseline counts until actual merge is verified.
- Opal native Wiki publication is expressly reserved for WO-002 WP03.
- Dedicated domain Projects are expressly reserved for WO-002 WP02.
- No issue state, release, agent, production runtime, repository visibility, token, Wiki or cross-owner automation was modified by these documentation branches.

## Security exception discovered

[Private Pius PWE security Issue #7](https://github.com/Hybrismannen/pius-pwe/issues/7) documents a hard-coded provider credential and RTF-wrapped JavaScript/JSX files. The credential value is deliberately not included in any work-order document. **Validity and compromise are unknown.** This requires separate credential rotation/remediation and build tests; a README PR cannot resolve or accept it.

## Navigation verification

At the six draft PR head revisions, **47 relative Markdown links across seven changed files** resolved against each repository's exact Git tree; **zero missing paths**. This proves source existence only, not live app usability, current deployment, contributor permissions or actual link anchor rendering.

## Acceptance boundary

Each PR needs local owner review, relevant CI/rights checks and explicit, source-recorded merge authority. DG-01 may accept the **bounded preparation** with limitations only if the Director states it; full WP01 completion cannot be claimed while source PRs are unmerged or user tests are deferred.
