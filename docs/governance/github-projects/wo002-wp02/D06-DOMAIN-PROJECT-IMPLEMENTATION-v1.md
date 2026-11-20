# D06 — Domain Project Implementation Ledger

**Record:** FF-GH-WO-002-WP02-D06 · **Date:** 2026-11-03 · **Status:** Implemented and source-checked; **DG-02 not accepted**.  
**Source:** [Work Issue #50](https://github.com/Motherpher/FFOS/issues/50) · [Exact native Project snapshot](data/domain-project-snapshot-2026-11-03.json) · [D05 decisions](D05-ESTABLISHMENT-DECISIONS-v1.md).

## Implemented native Project inventory

| Domain / owner | Native board | Linked original Issues | Views | Classification | Source / authority |
|---|---|---:|---:|---|---|
| Opal / Hybrismannen | [Editorial & Archive Operations](https://github.com/users/Hybrismannen/projects/2) | **16** | **4** | 16 sourced priority labels; 14 source desk labels; 2 explicit `phase:backlog` labels | [Opal Issues](https://github.com/Hybrismannen/Opal-Sense-I/issues), [PROJECT_CONFIG.json](https://github.com/Hybrismannen/Opal-Sense-I/blob/main/docs/PROJECT_CONFIG.json) |
| Politent / Motherpher | [Research, Models & Release](https://github.com/orgs/Motherpher/projects/3) | **18** | **6** | 3 Data & Sources; 5 Behavioural Models; 6 Spatial & GIS; 2 Temporal Reconstruction; 2 Validation & Release | [Politent Issues](https://github.com/Motherpher/Politent/issues) |
| CareerHub / Motherpher | [Product & Profile Fleet](https://github.com/orgs/Motherpher/projects/4) | **13** | **6** | 3 Core Engine; 2 Search & Geography; 2 Analysis & HRDM; 1 Applications & Outcomes; 3 Profiles & UX; 2 Help & Release | [CareerHubZero Issues](https://github.com/Motherpher/CareerHubZero/issues) |
| **Total** | **3 new PRIVATE Projects** | **47 native Issues** | **16** | Only source-supported categorisations | No copied Issues, release decision or user profiles |

All 47 items were read back with **47 unique native source node IDs**, correct repository ownership, unchanged state **OPEN**, and a one-to-one original Issue reference within each domain board. Original Issues continue to exist in the source repositories; items here are noncanonical projections.

## Opal — implementation against the existing source configuration

[Opal's original `docs/PROJECT_CONFIG.json`](https://github.com/Hybrismannen/Opal-Sense-I/blob/main/docs/PROJECT_CONFIG.json) specified a user-scoped GitHub Projects V2 board, editorial work stages, thematic desks, evidence, priority, review date and four operational views.

**Actual fields:** `Editorial Phase` (Backlog, Sourcing, Researching, Fact-check, Drafting, Editing, Published); `Desk` (seven source-defined desks); `Priority` (P0–P3); `Evidence` (Unverified, Partially sourced, Source verified, Reviewed); `Next Review`; plus `Evidence Reference` and `Authority Gate` to separate planning from approval.

**Views:** Editorial Kanban (board), Research Desk (Reading Room filter), Evidence Review (table), Publication Roadmap (roadmap with no invented dates). Data assignments were taken only from actual native Issue labels. **Fourteen** editorial phase values remain blank because their source Issues did not establish a specific current phase. No `Published`, `Reviewed` or approval field was filled from assumption.

The [Opal Wiki Issue #13](https://github.com/Hybrismannen/Opal-Sense-I/issues/13) remains a separate WO-002 WP03 concern. Creating a Project did not publish the Wiki or start GitHub Pages.

## Politent — implementation

**Actual fields:** `Research Stream`, `Validation`, `Authority Gate`, `Evidence Reference`, `Next Review`. Data/behavioural/spatial/temporal/release categories were derived from the exact WP1.x–WP4.x titles; they are a navigational organisation of the source, not statistical validation.

**Views:** Research Workstreams (main board); Data & Sources; Behavioural Models; Spatial & GIS; Temporal & Backtesting; Release & Assurance. The last five views have native single-select source classification filters. The current model estimates, source credibility, QGIS processing and external release are **not** certified by their Project membership.

## CareerHub — implementation

**Actual fields:** `Product Lane`, `Verification`, `Authority Gate`, `Evidence Reference`, `Next Review`. Lanes reflect the native CareerHub Issues for engine/search/geography, HRDM analysis, applications/outcomes, protected profiles/UX and Help/release.

**Views:** Product Board; Core Engine; Search & Geography; Analysis & HRDM; Profiles & UX; Release Readiness. The release view filters `Help & Release`, not a claimed delivered release.

The CareerHub private profile evidence, career data, identity and preferences stay in their owning profile systems; **no personal career records were added to GitHub Projects**. A source Issue's existing title is not a statement that its product capability passed tests.

## GitHub automation and privacy

Each Project remained **PRIVATE** on independent read-back, linked only to its correct owning repository in the native Projects tab. GitHub's default `Auto-close issue` workflow was initially ON and then **deleted from the newly created Projects**. Opal and Politent also had default automatic sub-Issue intake removed. In a subsequent authoritative GraphQL read-back, **no Auto-close or Auto-add sub-Issue workflow remained** in those boards. Other default native workflows may remain enabled and require operational awareness; do not use Project Status or issue closure as competent acceptance.

No source Issue, repository branch rule, permissions, deployment, CDX/Pius/AMA runtime, integration credential or release was modified by the board/field/intake setup.

## Creation/replay incident — corrected

During initial `createProjectV2`, the GitHub GraphQL gateway returned HTTP 502 although some writes were applied. Read-back found four **empty, private, unlinked, same-turn duplicates**: Hybrismannen Opal Projects #3/#4 and Motherpher Politent Projects #5/#7. Both owners' Project inventories were checked and the exact duplicates were removed with `deleteProjectV2`. Re-read verified only intended Opal #2, Politent #3 and CareerHub #4 remained. **No original source Issue or existing Project was deleted.**

**Recovery learning:** When a create/mutation returns a gateway error, do not blindly replay. Enumerate native owner Projects first, reconcile IDs and effects, then selectively repair/rollback.

## Verification distinction

The exact [JSON snapshot](data/domain-project-snapshot-2026-11-03.json) proves the observed state at capture. GitHub view-specific REST calls confirmed the filtered groups' expected Issue populations, with some responses returning only truncated previews; count evidence was resolved using structured array metadata where available. This is a **source and configuration test**, not an independently signed-in usability, full ACL or full disaster-recovery test.

**DG-02 final operational acceptance remains outstanding**, as do prior DG-01/DG-04 and applicable external runtime constraints.
