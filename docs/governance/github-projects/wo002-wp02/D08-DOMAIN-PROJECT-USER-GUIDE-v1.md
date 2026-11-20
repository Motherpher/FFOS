# D08 — Using the Estate and Domain GitHub Projects

**Guide:** FF-GH-WO-002/WP02 · **Audience:** Director, authorised operators, source repository maintainers. **Verified:** source-linked Projects V2 views and native Issue membership on 2026-11-03. **Not verified:** independent alternate-account usability or complete recovery.  
**Start:** [Central Estate Portfolio](https://github.com/orgs/Motherpher/projects/2) · [D05 decisions](D05-ESTABLISHMENT-DECISIONS-v1.md) · [D06 actual boards](D06-DOMAIN-PROJECT-IMPLEMENTATION-v1.md).

## 1. The first decision: which Project?

| Your question | Open | Purpose |
|---|---|---|
| What is happening across the whole estate? | [Estate Portfolio](https://github.com/orgs/Motherpher/projects/2) | Cross-programme Decisions, Risks, Verification and selected original source Issues |
| What is the editorial production and evidence status? | [The Opal](https://github.com/users/Hybrismannen/projects/2) | Editorial desks, priority, sourcing, publication pipeline |
| What is developing in Politent's methods and GIS? | [Politent](https://github.com/orgs/Motherpher/projects/3) | Distinct source data, models, spatial, temporal and release work |
| How is CareerHub's engine and profile fleet progressing? | [CareerHub](https://github.com/orgs/Motherpher/projects/4) | Engine/search/HRDM, UX, help, releases |
| What about the Green Bell company? | [Estate Portfolio](https://github.com/orgs/Motherpher/projects/2) plus [GreenBell native Issues](https://github.com/Motherpher/GreenBell/issues) | No redundant company Project was established |

**GitHub access:** The three domain Projects are private. Even when a linked Issue belongs to a public repository, the Project board is available only to authorised GitHub identities. A repository's Projects tab should show its linked board to authorised users.

## 2. How to use any domain Project

1. Open the domain Project from its link above or its source repository's **Projects** tab.
2. Select the main board to see the full selected native Issue population.
3. Switch to a filtered view for the relevant desk/workstream/field.
4. Select a card and open its **original source Issue**, not a copied task.
5. Read the original Issue objective, native labels, current state, dependencies, linked PRs, source tests and actual decisions.
6. Change only Project fields justified by that original Issue. Do **not** use `Published`, `Reviewed`, `Release Evidence Recorded` or `Approved (Source Recorded)` without specific verified source evidence.
7. When an Issue matters across programmes, link that same native Issue into the Estate Portfolio; avoid creating a duplicate Issue.
8. For a blocker or decision, add the evidence/authority reference to the original Issue and relevant noncanonical Project field.
9. When documentation and Project state disagree, preserve source truth, record a discrepancy and correct the derived view after review.

**Status and authority:** Native `Status` reflects planning. A Project card showing `Done` does not prove publication, operational deployment, accepted model, source Issue closure or Director sign-off. Auto-close Issue has been removed from the three new Projects; source Issue state still requires its own controlled process.

## 3. The Opal — Editor / Researcher workflow

**Main board:** [Editorial Kanban](https://github.com/users/Hybrismannen/projects/2/views/1) — all 16 current original Issues, organised by current GitHub planning status.

**Research Desk:** [View #2](https://github.com/users/Hybrismannen/projects/2/views/2) — native Issues with `Desk = Reading Room`. The other desks remain accessible from the full board.

**Evidence Review:** [View #3](https://github.com/users/Hybrismannen/projects/2/views/3) — unfiltered working surface for evidence and fact-check inspection. Blank `Evidence` means no Project projection was recorded; it is not a PASS.

**Publication Roadmap:** [View #4](https://github.com/users/Hybrismannen/projects/2/views/4) — roadmap layout. **No publication dates were manufactured.** Supply dates only when authorised editorial source work establishes them.

Available source-defined fields: `Editorial Phase` (Backlog → Sourcing → Researching → Fact-check → Drafting → Editing → Published), `Desk` (7 thematic desks), `Priority` (P0–P3), `Evidence`, `Next Review`, `Evidence Reference`, `Authority Gate`.

Priority and desks were seeded from native labels. Only two source Issues had an explicit `phase:backlog` label, so **14 phase fields remain unset** pending an actual source review. A Wiki tab may be enabled on the repository, but native Wiki publishing is a **separate** WO-002 WP03 activity.

For editorial governance and references, use [Opal source Issues](https://github.com/Hybrismannen/Opal-Sense-I/issues), [editorial operations](https://github.com/Hybrismannen/Opal-Sense-I/blob/main/docs/EDITORIAL_OPERATIONS.md) and [standards](https://github.com/Hybrismannen/Opal-Sense-I/blob/main/docs/EDITORIAL_STANDARDS.md).

## 4. Politent — Research / Modelling workflow

**Main board:** [Research Workstreams](https://github.com/orgs/Motherpher/projects/3/views/1) — all 18 native Issues, titles and WP identifiers from source.

**Filtered views:**
- [Data & Sources](https://github.com/orgs/Motherpher/projects/3/views/2): 3 source-linked Issues
- [Behavioural Models](https://github.com/orgs/Motherpher/projects/3/views/3): 5
- [Spatial & GIS](https://github.com/orgs/Motherpher/projects/3/views/4): 6
- [Temporal & Backtesting](https://github.com/orgs/Motherpher/projects/3/views/5): 2
- [Release & Assurance](https://github.com/orgs/Motherpher/projects/3/views/6): 2

The `Research Stream` field classifies what kind of work the WP describes. It is not the current model's validated status. `Validation` and `Authority Gate` remain independent: only source evidence and competent review can justify a change. A WP4.4 GIS export or WP4.5 release item being present does not prove operational readiness.

Use [canonical Politent source](https://github.com/Motherpher/Politent) and its methodology/validation docs for scientific assertions.

## 5. CareerHub — Product and Fleet workflow

**Main board:** [Product Board](https://github.com/orgs/Motherpher/projects/4/views/1) — 13 original software-body and fleet Issues.

**Filtered views:**
- [Core Engine](https://github.com/orgs/Motherpher/projects/4/views/2): 3
- [Search & Geography](https://github.com/orgs/Motherpher/projects/4/views/3): 2
- [Analysis & HRDM](https://github.com/orgs/Motherpher/projects/4/views/4): 2
- [Profiles & UX](https://github.com/orgs/Motherpher/projects/4/views/5): 3
- [Release Readiness](https://github.com/orgs/Motherpher/projects/4/views/6): 2 source Issues in the `Help & Release` product lane

An Applications & Outcomes source Issue (1) is present in the full board but is not artificially combined into an unrelated filtered lane. The `Product Lane`, `Verification` and `Authority Gate` fields must be interpreted independently.

**User guide is separate from this Project:** the current in-app Help source is [CareerHubZero Help](https://github.com/Motherpher/CareerHubZero/blob/main/web-shell/site/app/help/page.tsx); a source-controlled [standalone user guide is on draft PR #59](https://github.com/Motherpher/CareerHubZero/pull/59). This Project tracks building and validating the software; it is not a place to store individuals' CVs, personal source documents or applicant profiles.

## 6. Director acceptance, verification and release

A Director asks: **What actually needs human authority?** Open the Estate Portfolio's Director Decisions view and read the owning source Issue. The proper sequence is:

`Source work and test → evidence/provenance → independent verification as required → competent human decision in source → read-back → Project Authority Gate projection`.

No Project view or `Status: Done` button can grant a mandate or amend CDX/Pius/FFC governance. WO-002 WP02 DG-02 acceptance is not implied by the creation of the three Projects. WO-002 WP01 DG-01 and WO-001 WP04 DG-04 remain separate, unresolved source gates.

## 7. Troubleshooting and safe recovery

| Problem | Action |
|---|---|
| Project not visible | Confirm signed-in account access. Project is private; a public Issue URL is not board permission. |
| Wrong/duplicate card | Verify native source Issue ID, original repository and Project membership; preserve original Issue and remove only erroneous Project item when authorised. |
| Missing category | Check original source title/labels; leave blank if the classification cannot be supported. |
| "Done" but unverified source | Do not infer acceptance. Open source Issue/PR, reconcile state and record discrepancy. |
| Empty filtered view | Check the saved filter and whether the field has a verified value, not just the Issue's title. |
| Publication roadmap has no dates | Normal until source-supplied target dates are present. |
| Native Project metadata unexpectedly changes | Take an authorised fresh snapshot, stop unsafe automations, compare with dated export and escalate. |
| API creation returns gateway error | **Read back before retrying**; this WP had successfully rolled back accidental duplicate empty boards. |
| Product release/analytics not working | Escalate in owning application repository; GitHub Project membership is not a runtime test. |

## 8. Maintainer verification and limitations

These instructions are grounded in authenticated GitHub Projects V2 native state and original Issue links on 2026-11-03. **No nonprivileged signed-in user test or whole-Project restore exercise has been conducted**, and the guide is not a production-service operations certificate. Project and repository owner rights require independent review before expanding permissions or automatic cross-owner writing.

**Source records:** [D06 implementation](D06-DOMAIN-PROJECT-IMPLEMENTATION-v1.md), [D07 integration](D07-CROSS-PROJECT-OPERATIONS-v1.md), [D09 assurance](D09-ASSURANCE-RECOVERY-DG02-v1.md).
