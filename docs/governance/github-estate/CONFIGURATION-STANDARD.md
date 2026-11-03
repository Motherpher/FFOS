# WP04 Reusable Repository Configuration Standard v1.0

**Status:** WP04 REVIEW CANDIDATE — not DG-04 accepted. **Owner:** FFOS coordination; per-repository maintainers retain local authority. **Date:** 2026-11-03.

## 1. Objective

Provide a small, reusable GitHub operating grammar for the estate, without rewriting domain governance, PR rules or canonical lifecycle. GitHub Projects is an operational projection, not a decision-maker. A repository can retain its stronger local conventions.

## 2. Adoption levels

- **Tier A (four core systems):** approved Issue/PR and evidence templates, cross-repo links, clear release and decision gates; still no mandate for unreviewed automation.
- **Tier B (thirteen active systems):** selective work-package and defect templates, product-specific sources retained. No automatic intake of every Issue.
- **Tier C (seven research/delivery):** source integrity, IP, confidentiality and publication gates first; minimal administrative overhead.
- **Tier D (seven derivative/history):** preserve references and accepted history; avoid creating a new backlog or Wiki.
- **No repository changes by register alone.** Owners must approve local adoption PRs and exact paths.

[Complete adoption register](ADOPTION-REGISTER-v1.md) · [machine-readable classification](data/estate-adoption-register-v1.json).

## 3. Reusable configuration assets

Reusable master templates are in [templates](templates/). The present **FFOS-only local implementation candidate** additionally stages copies at `.github/ISSUE_TEMPLATE/estate-work-package.yml`, `.github/ISSUE_TEMPLATE/estate-governance-decision.yml` and `.github/PULL_REQUEST_TEMPLATE.md` on [WP04 draft PR #47](https://github.com/Motherpher/FFOS/pull/47). These will only become active if their local PR is merged after acceptance; no templates have been installed in other repositories. Further adoption requires separate owner-reviewed PRs.

1. [Work-package Issue Form](templates/ISSUE_FORM_WORKPACKAGE.yml): objective, source, scope, dependencies, output, acceptance and evidence.
2. [Director / governance decision Issue Form](templates/ISSUE_FORM_GOVERNANCE.yml): mandate, authority, effect, risks, decision and proof.
3. [Pull Request review template](templates/PULL_REQUEST_TEMPLATE.md): exact changed files, rationale, tests, source/canonical impact, approval, rollback.
4. [Common label dictionary](templates/labels.json): additive semantics; do **not** delete, rename or replace existing domain labels automatically.

## 4. Mapping to estate Project fields

| GitHub project attribute | What it means | What it cannot do |
|---|---|---|
| `Status` | GitHub's planning state | Canonical acceptance or approval |
| `Work Stage` | Intake/Active/Blocked/Review/Verification/Director Decision/Accepted | Source Issue state or runtime deployment |
| `Programme` | Portfolio grouping | Canonical domain ownership |
| `Work Type` | Implementation, Research, Audit, Governance etc. | Source-based permission |
| `Priority` | Explicitly sourced priority where provided | Invent priority for unranked issues |
| `Authority Gate` | Projection of independent decision state | Grant a mandate by moving a card |
| `Canonical Object ID` | Existing immutable ID or source-defined WP code | Silently renumber history |
| `Evidence Reference` | Exact source Issue, commit, report or decision URL | Substitute for evidence content and result |
| `Dependency Reference` | Source link to upstream requirement | Automatically enforce the dependency |

**Automations:** Native Auto-close Issue was verified **OFF** in the private portfolio; leave OFF. Item closed/PR merged can move ordinary Status but must never promote an authority state. No cross-owner token is authorised for estate-wide writes.

## 5. Label dictionary and stewardship

Use only existing labels unless local owner agrees to add them. The dictionary supports:
- `work:implementation`, `work:governance`, `work:audit`, `work:research`, `work:documentation`;
- `gate:director`, `gate:evidence`, `state:blocked`;
- `priority:P0`…`priority:P3` **only** when evidence justifies them.

**Issue form values do not replace existing local canonical IDs.** For example, OSI already uses `priority:P0` and desk-specific labels; continue using its native schema.

## 6. Acceptance before local rollout

For each target repository, verify: exact owner/repo access; branch rules; privacy; template compatibility; existing labels and issue forms; source and canonical path; change diff; feature availability; local maintainer approval; no unauthorised auto-close; documented rollback to prior file revision.

Local PR must declare **what is optional**, exactly what is mandatory under the repository's source policy, and why the template solves a real use case.

## 7. Reversal

Templates are file-only changes. Removal/reversion must use a reviewed PR, preserving issue history and IDs. Previously entered Issues remain native source objects; labels/project membership can be adjusted without rewriting source evidence. No automated deletion, broad label replacement, issue closure or migration is permitted.

**DG-04 remains outstanding.**
