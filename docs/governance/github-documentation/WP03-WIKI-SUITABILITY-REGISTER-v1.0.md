# WP03 — Wiki and Documentation Suitability Register v1.0

**ID:** FF-GH-WP03-D18 · **Current decision:** DG-03 bounded documentation pilots ACCEPTED; [Director source record](https://github.com/Motherpher/FFOS/issues/45#issuecomment-6599403434). Native Wiki choices remain selective and require independent publication authority.  
**Baseline:** WP01 2026-11-02 verified feature inventory (31 discoverable repositories; 11 public Wiki flags enabled, none confirmed populated).  
**Reconciled:** 2026-11-03. **Evidence:** [WP01 decision matrix](https://github.com/Motherpher/FFOS) (external audit package), sampled READMEs and canonical repository structures.

## How decisions are made

Every repository is assessed by intended audience, need for task-based help, current canonical documentation, confidentiality, contribution model, expected updating burden and plan entitlement. **Wiki recommended** never means **Wiki activated**. A repository README can link a source-controlled guide instead. Only the owning repository can promote its guide or Wiki to an accepted publication surface.

**Decision vocabulary:** PILOT GUIDE / OPTIONAL GUIDE / KEEP EXISTING / WIKI CANDIDATE / DEFER / AVOID DUPLICATION / CONDITIONAL PRIVATE PLAN.

| Repository | Intended knowledge surface | Decision and rationale |
| --- | --- | --- |
| `Hybrismannen/Hy` | README / lightweight documentation | DEFER Wiki: no active reader need established; avoid overhead. |
| `Hybrismannen/pius-pwe` | Repository operator guide | OPTIONAL GUIDE: operational complexity merits help; private Wiki subject to plan. |
| `Hybrismannen/livicity-cwvs-reference` | Public method/reference files | KEEP EXISTING: Wiki only after a verified reference-librarian user need. |
| `Hybrismannen/nsliengine` | Repository README / documented operating procedures | OPTIONAL GUIDE: clarify technical entry; private Wiki not justified now. |
| `Hybrismannen/pius-universe` | Governed source and explanatory programme guide | OPTIONAL GUIDE; avoid a competing Pius Codex and status claims; private Wiki plan constraint. |
| `Hybrismannen/udl-twin` | `docs/user-guide/` alongside Blueprint and cockpit | **PILOT GUIDE**: authenticated user tasks and complex evaluation system; private native Wiki currently unavailable under Free. |
| `Hybrismannen/pius-codex-5` | Historical canonical document source | AVOID DUPLICATION: preserve historical Codex and provenance; not a live Wiki. |
| `Hybrismannen/pius-lifetime-audit-2026` | Historical audit records | AVOID DUPLICATION: evidentiary lineage must not be rewritten in Wiki. |
| `Hybrismannen/green-bell-statsvault` | Product source and generated metadata dashboard | OPTIONAL GUIDE: only practical product workflows; preserve canonical product source. |
| `Hybrismannen/form-flode-dna` | Public identity/concept reference | KEEP EXISTING: only a reader-oriented public explainer if maintenance is available. |
| `Hybrismannen/RFSU-godex` | Public archival bid/proposal page | AVOID DUPLICATION: assignment not awarded; preserve historical publication and attribution. |
| `Hybrismannen/RFSU-godex-FF` | Private historic internal project control | AVOID DUPLICATION: private client/bid evidence; no parallel Wiki. |
| `Hybrismannen/Digital-Apartheid` | Research source and citations | OPTIONAL GUIDE: reading guide subject to review; protect research provenance. |
| `Hybrismannen/NSLI` | Technical/method source | OPTIONAL GUIDE only after user tasks and status clarified. |
| `Hybrismannen/metoyo` | Public documentation/reference | KEEP EXISTING: first verify actual reader needs and provenance. |
| `Hybrismannen/Conductellence-` | Constitutional law and explanatory navigation | OPTIONAL GUIDE: never mirror policy shards or runtime enforcement source into a Wiki. |
| `Hybrismannen/Barnombudet` | Private organisation research/product records | CONDITIONAL PRIVATE PLAN; guide only with data-protection and authority approval. |
| `Hybrismannen/Opal-Sense-I` | Editorial desk reference library | **WIKI CANDIDATE**: 12 pre-seeded guide pages and separate editorial Issue #13 already exist; reconcile and initialise under its own controlled work order, not WP03 pilots. |
| `Motherpher/form-flode` | Governed FFC Corpus | AVOID DUPLICATION: no second canonical Corpus, versioned object grammar remains owner. |
| `Motherpher/wpb` | Public bibliography/source archive | OPTIONAL GUIDE: preserve archival research provenance and approved subject attribution. |
| `Motherpher/Gracey` | Public CareerHub profile | KEEP EXISTING: central CareerHubZero owns shared product logic; profile Wiki likely redundant. |
| `Motherpher/CareerHubZero` | Shared software implementation and operator guide | OPTIONAL GUIDE: future practical central-body help; no duplication in profiles. |
| `Motherpher/CareerHub-LinusF` | Individual CareerHub profile | KEEP EXISTING: no separate personal Wiki without independent need. |
| `Motherpher/Politent` | Public analytical/GIS architecture | OPTIONAL GUIDE: applied methodology/assumptions; source code and validated models stay canonical. |
| `Motherpher/FF-Spatial` | QGIS workflow/technical guide | OPTIONAL GUIDE; private plan and product readiness to be verified before claiming automation. |
| `Motherpher/BDNA` | Public Blackprint/versioned documentation | KEEP EXISTING: selective reader glossary only; don't reauthor governed foundation. |
| `Motherpher/FFOS` | `docs/operator/` linked to current technical documentation | **PILOT GUIDE**: operator entry and status interpretation needed; no fake runtime or private native Wiki at current plan. |
| `Motherpher/MusicGenea` | Minimal README | DEFER Wiki until project purpose and scope become substantive. |
| `Motherpher/Re-Eco` | Existing dashboard and source records | KEEP EXISTING: use linked dashboard instead of parallel manual when sufficient. |
| `Motherpher/GreenBell` | Governed venture/company source | OPTIONAL GUIDE: onboarding and strategic operation, not alternative source of company decisions. |
| `Motherpher/Vitalitet` | Existing venture/research files | DEFER: first establish current users and operational status; private Wiki conditional. |

## Pilot decisions and exceptions

### FFOS operator pilot — GO as version-controlled documentation

1. The repo is private and the GitHub Wiki feature was disabled in the WP01 snapshot.
2. GitHub Free does not provide native Wikis for private repositories; an upgrade is an independent financial/administrative decision.
3. The current FFOS architecture already defines `docs/` as a documentation surface; a review-branch guide there has clear Git provenance and PR review.
4. **Therefore use `docs/operator/`**, with Wiki-ready sections and explicit source links. No duplicated AMA/Agent Stable law and no production claims.

### UDL Twin user-guide pilot — GO as version-controlled documentation

1. The repo is private and its Wiki feature disabled.
2. Its normative B1.2.0-DRAFT Blueprint is source-controlled; users need interpretive explanations, not a second Blueprint.
3. The application is a brownfield operational surface; source and status must be separated.
4. **Therefore use `docs/user-guide/`**, with tasks mapped to actual UI routes and checks before claiming live-screen compatibility.

### Opal Sense I — WIKI CANDIDATE, NOT SILENTLY ACTIVATED

The public repository already has `docs/wiki-seed/` and a dedicated Issue [#13](https://github.com/Hybrismannen/Opal-Sense-I/issues/13) plus editorial Project configuration. Its possible native Wiki should be activated only under that specific editorial acceptance mandate and after source/rights verification; do not create a duplicate WP03 initiative.

## Platform and publication considerations

- GitHub's Wiki is a **separate Git repository** with independent commit history; do not use it as normative source storage.
- Public Wiki availability under GitHub Free does **not** imply contribution rights or publication permission.
- Private Wiki availability requires qualifying GitHub Pro/Team/Enterprise access; do not assume organisational subscription settings from a repository's feature flag alone.
- Wikis are not reliable substitutes for public discoverability and indexing. A public site/Pages may be more appropriate, subject to rights and publisher approval.
- Privacy and rights gates apply to all guide materials, filenames, diagrams, metadata and exports.
- Enabling any Wiki does not establish a right to republish FFC, Pius, external client or licensed content.

**Primary platform sources:** [GitHub Docs — About wikis](https://docs.github.com/en/communities/documenting-your-project-with-wikis/about-wikis); [GitHub Docs — GitHub's plans](https://docs.github.com/en/get-started/learning-about-github/githubs-plans).

## DG-03 proposed acceptance questions

1. Do the two **version-controlled** pilots satisfy the practical documentation need without upgrading?
2. Are the guides source-accurate, adequately navigable and safe for the intended audience?
3. Are other repository Wiki decisions appropriately selective and bounded?
4. Is independent user testing complete or explicitly deferred?
5. Do reviewed PRs merit merge into their respective canonical repositories?

**This register records suitability, not publication, runtime certification, or permission changes.** DG-03 approved source-controlled FFOS and UDL pilot guides; it did NOT automatically activate any native Wiki.
