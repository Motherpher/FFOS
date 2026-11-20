# FF-GH-WO-002 — Estate Wiki & Knowledge Architecture Review v1.0

**Date:** 2026-11-20. **Estate:** 35 connected repositories (21 Hybrismannen, 14 Motherpher). **State:** evidence-backed review candidate, NOT a Director acceptance or publishing mandate. **Related:** WO-002 Issue #48 and draft reconciliation PR #55.

## Executive decision

The estate should **not** adopt GitHub Wikis indiscriminately. Establish three separate functions:
1. **Canonical truth**: source-controlled policies, schemas, data, code, rights, approvals, architecture and audit records; writable only under source owner's existing governance.
2. **Versioned guides**: human-facing how-to, onboarding, task paths, FAQ and troubleshooting from the owning repository's `docs/` (or other existing approved path); reviewed through PRs and source revision.
3. **Exploratory Wiki/atlas**: appropriate for browsable public reference knowledge, indices, thematic connections and editorial learning, with source-controlled drafts, generated outputs and documented rights.
An optional **estate knowledge entry index** is a directory of links and freshness, not a duplicate corpus, data store, autonomous sync or fifth management platform.

## Evidence and limitations

- Reviewed the source-owned README.md on 33 of 35 current repositories; root README is absent on `Hy` and `pius-pwe` in the connected default-branch fetch. Reviewed direct sources for FFOS operator guide, UDL user guide, Opal Wiki seed, Texts-n-Lyrics Wiki source, Barnskoj Wiki source/pre-WP status and Barnskoj publishing instructions. Historical FFOS WP03 Wiki Suitability v1.0 and WO-002 18 Nov 34-repo register consulted.
- 18 Nov register had **13 enabled Wiki feature flags** among 34 repositories, **not** independently confirmed Wiki publication. This review did **not** obtain current live native Wiki feature/API/remote git publication inventory for all 35. Do not count 13 as currently published or assert a new 35-repository feature count.
- Root README existence alone is not a full documentary tree audit. Proposed categories are suitability determinations, not verification that every guide exists or that a native Wiki is populated.
- GitHub Projects V2, FFOS ProjectHub, source wiki folder, native Wiki Git repository, published website and canonical data registry are different systems; no implicit source or approval sync.

## Full 35-repository recommendation matrix

Codes: **W1** selective Wiki priority; **W2** conditional Wiki only after reader demand/publication rights; **G** practical versioned guide; **C** canonical source navigation only; **A** archive/history only; **D** defer/minimal. Multiple codes mean complementary functions, not two sources of truth.

| Repository | Proposed | Useful change, not automatic effect |
| --- | --- | --- |
| Hybrismannen/Hy | D | Draft root README on existing review PR; no native Wiki. |
| Hybrismannen/pius-pwe | G, HOLD | Source-owned safe operator README, runtime/security warning; no Wiki until credential Issue #7 resolved. |
| Hybrismannen/livicity-cwvs-reference | G | Brief public reference walkthrough with worked synthetic example, schema and human review; Wiki only on demonstrated public readership. |
| Hybrismannen/nsliengine | G | Replace generic Lovable placeholder README, explain source/runtime/operation; no Wiki. |
| Hybrismannen/pius-universe | G, C | Reader portal for Pius 6, DevOps Galaxy, activation and evidence; keep Codex/constitution normative in source. |
| Hybrismannen/udl-twin | G | Retain accepted `docs/user-guide/`; refresh against app route evidence and privacy, not a second native Wiki. |
| Hybrismannen/pius-codex-5 | A, C | Historical immutable lineage index only; no replacement Codex Wiki. |
| Hybrismannen/pius-lifetime-audit-2026 | A, C | Transition/evidence pathway with audit provenance; no mutable wiki as audit record. |
| Hybrismannen/green-bell-statsvault | G | Workflow-oriented product usage and data provenance; company canon remains GreenBell. |
| Hybrismannen/form-flode-dna | G | Practical design-reference browsing/glossary and application examples; preserve source→principle→applied rule trace. |
| Hybrismannen/RFSU-godex | A | Preserve public historical bid; no new Wiki / false current commission. |
| Hybrismannen/RFSU-godex-FF | A, C | Private internal project/historical control only; no Wiki republication. |
| Hybrismannen/Digital-Apartheid | G, C | Reader's map to claims and evidence state; no mutable parallel manuscript or references. |
| Hybrismannen/NSLI | G, C | Worked technical/artistic operator examples; NSLI normative production rules remain canonical. |
| Hybrismannen/metoyo | G | Narrative/user orientation where necessary; no new Wiki until user journey demands it. |
| Hybrismannen/Conductellence- | G, C | How-to by authorisation task, policy navigation, failure explanations; never mirror constitutional policy shards in Wiki. |
| Hybrismannen/Barnombudet | G, PRIVATE | Task-based internal onboarding only, approved audience and no participant/client data exposure. |
| Hybrismannen/Opal-Sense-I | W1 | Existing 12 seed pages and open dedicated Issue #13; conditional first native Wiki pilot after provenance/licence/editorial checks and remote publication verification. |
| Hybrismannen/Texts-n-Lyrics | W1/W2 | Strong source-controlled literary atlas; confirm reader/editor publication need and copyright before native mirror; derived Wiki never edits originals. |
| Hybrismannen/formflode-com | G, C | Website docs and public site navigation, not Wiki; website release/PPS checks independent. |
| Hybrismannen/Barnskoj | W1, BLOCKED | 29 source Wiki pages and publishing workflow exist; PRE_WP_STATUS says remote Wiki NOT VERIFIED, 526 image provenance requirements, zero confirmed; no Wiki/live publication claim or bypass. Rights gate source-owned. |
| Motherpher/form-flode | C, G | FFC Corpus source remains canonical; a small interpretive entry guide, not parallel FFC Wiki. |
| Motherpher/wpb | G/W2 | Portfolio source/archive reader path, optional literary/public bibliography Wiki only with privacy, source and author review. |
| Motherpher/Gracey | C, PRIVATE | Personal CareerHub profile; central CareerHubZero body guide is the proper shared authority. |
| Motherpher/CareerHubZero | G | One source-owned user/operator guide and onboarding; profile-specific private help only in profiles. |
| Motherpher/CareerHub-LinusF | C, PRIVATE | Profile-specific short start page; no separate Wiki and never publish personal records. |
| Motherpher/Politent | G/W2 | Interpretive model/method glossary and worked uncertainty example; actual validated model, code, schemas and claims remain canonical. |
| Motherpher/FF-Spatial | G | Task recipes for headless GIS, source/geometry/provenance and cloud limits; no Wiki without wider external user community. |
| Motherpher/BDNA | G, C | Reader's map to Blackprint mission/components/Asset Keys; do not rewrite controlled Blackprint and policies as Wiki law. |
| Motherpher/FFOS | G, C | Accepted bounded `docs/operator/`; update aging runtime boundaries and findability; no native Wiki for internal authoritative ops. |
| Motherpher/MusicGenea | D | README currently minimal; establish substantive use before building guide/Wiki. |
| Motherpher/Re-Eco | G | Keep README/dashboard/mobile start; small glossary linked to source where helpful, not duplicate status dashboard Wiki. |
| Motherpher/GreenBell | G, C | Company onboarding/product constellation and reader map; all strategic/metric decisions remain source-owned. |
| Motherpher/Vitalitet | G/W2 | Public explanatory conceptual glossary and examples may add value; theory/source versions remain canon. |
| Motherpher/Ideburen | G/W2 | Public source/dataset methodology, missingness and municipality navigation; Wiki only after validated release and privacy/licensing clearance. |

## Three priority candidates

**Opal**: Strongest immediately *actionable* editorial Wiki candidate (12 seed pages, public repo, dedicated Issue #13). This is not a claim it has been published. Use editor approval, attribution/licence gate and remote Wiki SHA receipt before marking LIVE.

**Texts-n-Lyrics**: Substantial 117-source literary/linguistic atlas already in `wiki/`. First test if a native GitHub Wiki actually improves reading over the existing source-linked atlas; retain 117 unique source texts/immutable originals and versioned generated statistics.

**Barnskoj**: 29 prepared `wiki-src/` pages, remote Wiki SHA null, `readiness=BLOCKED`, 526 original-image requirements and 0 confirmed. It is a **rights/publication pre-gate**, not a green-light for native Wiki. Do not copy franchise images or treat source references as reproduction licences. Its own proposed Wiki-first order remains bounded to its own source-controlled process.

## Useful changes to the workorder (keep same 3 WPs)

| Existing deliverable | Modification |
| --- | --- |
| WP01 D01 | Add **knowledge-surface classification** and published-state evidence to 35-row estate register: canonical owner, guide path, native Wiki flag (fresh read), native Wiki remote Home/SHA/access (independent check), rights, freshness, maintenance owner, audience and exact source revision. |
| WP01 D02 | Ensure every repo has a usable first entry path: what is this, what works today, how to start, where is canon, user guide, open problems, rights/privacy. Repair Hy/pius-pwe draft roots and nsliengine placeholder; avoid unsolicited replacement of substantive READMEs. |
| WP01 D03 | Institute **One Canonical Source / Many Bounded Reading Views**. Wiki generation must be unidirectional, authenticated to exact source version, and display evidence/rights/review date. Do not edit generated pages in place. |
| WP01 D04 | Use broken link checker, source→guide cross-reference checker, stale-claims detector and native Wiki remote verification; classify UNKNOWN vs NOT PUBLISHED. |
| WP02 D05–D06 | Wiki suitability alone never warrants a GitHub Project. Retain existing 4 boards; no one-board-per-Wiki pattern. |
| WP02 D07–D09 | A Project is for work ownership, backlog/gates and tasks; a Wiki for reader navigation/learning; an Issue for action/evidence. Add tests preventing wiki-page edits from changing canonical status or trigger deployments. |
| WP03 D10–D12 | Evaluate conditional native Wikis in order **Opal → Texts-n-Lyrics → Barnskoj only after source rights pre-gate**. Each with a no-Wiki alternative. |
| WP03 D13 | Task-test reader flows: find relevant page within 3 navigational decisions; check claim source and age; distinguish draft vs live; report a defect; deny unauthorised edit; navigate unavailable or blocked Wiki. |
| WP03 D14–D15 | Handover a source-owned **Estate Knowledge Directory** with link targets, statuses and owner, not copied knowledge and no claims of publication from feature flags. |

## Suggested minimal controlled knowledge object

```yaml
knowledge_surface_id: EST-KNOW-###
repository: owner/name
surface_type: canonical | guide | wiki_source | native_wiki | public_site
audience: public | internal | restricted
source_path: path/in/owning/repo
canonical_owner: owner/name
source_revision: exact_sha
editorial_state: proposed | reviewed | accepted
publication_state: not_published | unverified | verified
remote_publication_sha: null
rights_gate: hold | pending | passed | not_applicable
last_verified_utc: null
review_owner: unassigned
next_review_trigger: source_change | release | rights_change | manual
```

This proposed **metadata shape** is for estate documentation, not permission to create a new database table, ProjectHub object or CDX/AMA contract.

## Implementation priority

- **P0** — Correct stale/no-root navigation, explicit Wiki source-vs-remote publication state, Barnskoj blocked rights gate, PWE security hold and FFOS/UDL guide status drift.
- **P1** — Conditional Opal Wiki pilot and independent remote/readability tests; source-controlled knowledge directory; Texts-n-Lyrics reader testing.
- **P2** — Optional explanatory glossaries/atlas pages for Politent, Ideburen, Vitalitet and domain product guides only when readers demonstrate unmet needs.
- **No change** — Historical codices, audits, client records, canonical FFC/BDNA rules, personal profiles and unverified live systems must not be replicated into native Wikis.

## Release decision

This is a **read-only analytical review staged for source-owner/Director assessment**, not DG-01, DG-02 or DG-03 acceptance. No native Wiki, rights/licence approval, published site, GitHub Project, provider sync, secret, database or production runtime was changed by this review.
