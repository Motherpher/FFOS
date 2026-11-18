# FF-GH-WO-002 — Current 34-Repository Estate Register v1.2

**Reconciled:** 2026-11-18 · **Status:** verified source inventory / proposed WO-002 change; not accepted by Director.  
**Data:** [Source-pinned 34-repository JSON snapshot](ESTATE-REGISTER-34-v1.2.json) · [Scope/revision](WORKORDER-RESCAN-v1.2.md) · [Source gates](ASSURANCE-AND-DECISION-DELTA-v1.2.md).  
**Historical records:** [16 November v1.1 — 33 repositories](../wo002-20261116/CURRENT-ESTATE-REGISTER-33-v1.1.md). 3 November original 31-repository records remain unchanged.

## Verified estate scope

| Indicator | 3 Nov | 16 Nov | 18 Nov | Interpretation |
|---|---:|---:|---:|---|
| Visible repos | 31 | 33 | **34** | Connected identity: Motherpher **14**, Hybrismannen **20** |
| Current enabled Wiki feature flags | prior conflicting 11/12 | 13 | **13** | Flags only; does **not** prove native Wiki Home exists or is accessible |
| Formally linked source repositories to GitHub Projects V2 | 3 | 6 | **6** | Original estate FFOS/FFC/GreenBell plus Opal/Politent/CareerHub |
| Central Estate Portfolio Items | 22 | 24 | **25** | Additional original FFC source Issue [#47](https://github.com/Motherpher/form-flode/issues/47), website/PPS adoption |
| Dedicated domain Project Items | 0 | 47 | **47** | Opal 16, Politent 18, CareerHub 13; original Issues, not copies |
| Source main SHA differences from 16 November record | — | — | **32 of 34** | Many optional DevOps hook distribution or generated dashboards; not automatically substantive releases |
| Missing root README on `main` | 2 | 2 | **2** | `Hy` and `pius-pwe`; review PRs still open |
| WO-002 DG-01 / DG-02 | Pending / future | Pending / pending | **Pending / pending** | Native Projects existing does not certify WP02 DG-02 |

## New in v1.2: the official website repository

**[Hybrismannen/formflode-com](https://github.com/Hybrismannen/formflode-com)** — private GitHub repository, source-controlled React/TypeScript/Vite website connected to its existing [Lovable editor](https://lovable.dev/projects/6edf5520-c3e9-4ec1-8efe-6ba63b33ed33) and public `formflode.com` domain.

- **Canonical source** for the Form & Flöde website, explicitly distinct from the FFC Corpus `Motherpher/form-flode` and FFOS cloud integration repository.
- **Source navigation:** [website README](https://github.com/Hybrismannen/formflode-com/blob/main/README.md), [Operations](https://github.com/Hybrismannen/formflode-com/blob/main/docs/OPERATIONS.md), [Architecture](https://github.com/Hybrismannen/formflode-com/blob/main/docs/ARCHITECTURE.md), [Release Gates](https://github.com/Hybrismannen/formflode-com/blob/main/docs/RELEASE-GATES.md).
- **Source evidence:** current `main` commit `2ed5ba6ba4e3a332b4a1307a1f1adc4dd938a600`; private repo; 0 OPEN native Issues; no Projects V2 association; Wiki feature disabled.
- **Proposed tier:** B (live-facing product/source and specialised release/governance), subject to source owner confirmation.
- **Project decision:** **NO NEW GitHub Project**. Its Lovable project is **not** GitHub Projects V2, and its release process has not established a new GitHub Issue backlog that justifies a second board. Use existing [FFC P12/source Issue #47](https://github.com/Motherpher/form-flode/issues/47) linked to the central Estate Portfolio.
- **Wiki decision:** no native Wiki required; use the existing version-controlled website docs and applicable FFC-PPS publication provenance. Do not treat code/route existence as the same as public URL availability.
- **Critical boundary:** Existing public site is referenced in source; the `/privacy` and `/terms` routes remain source-present but must pass independent exact-publication readback before a public release claim. The old bootstrap `form-flode-site` repository is explicitly no longer the canonical source and must not be recreated.
- **Owner split:** FFC identity/public provenance; this repo website source; FFOS Drive/OAuth/cloud; CDX candidate anchor; Lovable editor/actual publication. A successful site build is not Director publication authority.

## Full current inventory

| Repository | Tier | Visibility | OPEN Issues | Linked Projects V2 | Wiki flag | Main commit |
|---|:---:|---|---:|---:|:---:|---|
| [Hybrismannen/Hy](https://github.com/Hybrismannen/Hy) | D | public | 0 | 0 | On | 1ab9cba0ed |
| [Hybrismannen/pius-pwe](https://github.com/Hybrismannen/pius-pwe) | B | private | 3 | 0 | Off | dca51e1f5a |
| [Hybrismannen/livicity-cwvs-reference](https://github.com/Hybrismannen/livicity-cwvs-reference) | C | public | 0 | 0 | On | 92682cea5e |
| [Hybrismannen/nsliengine](https://github.com/Hybrismannen/nsliengine) | B | private | 0 | 0 | Off | dfa746989f |
| [Hybrismannen/pius-universe](https://github.com/Hybrismannen/pius-universe) | A | private | 4 | 0 | Off | e91571b477 |
| [Hybrismannen/udl-twin](https://github.com/Hybrismannen/udl-twin) | B | private | 0 | 0 | Off | 86ca9fbb0b |
| [Hybrismannen/pius-codex-5](https://github.com/Hybrismannen/pius-codex-5) | D | private | 1 | 0 | Off | 90be571ea6 |
| [Hybrismannen/pius-lifetime-audit-2026](https://github.com/Hybrismannen/pius-lifetime-audit-2026) | D | private | 0 | 0 | Off | 9795ba16d3 |
| [Hybrismannen/green-bell-statsvault](https://github.com/Hybrismannen/green-bell-statsvault) | B | private | 2 | 0 | Off | 6f264fe13f |
| [Hybrismannen/form-flode-dna](https://github.com/Hybrismannen/form-flode-dna) | C | public | 1 | 0 | On | 0e83c5ab46 |
| [Hybrismannen/RFSU-godex](https://github.com/Hybrismannen/RFSU-godex) | D | public | 0 | 0 | On | 239fd989e5 |
| [Hybrismannen/RFSU-godex-FF](https://github.com/Hybrismannen/RFSU-godex-FF) | C | private | 0 | 0 | Off | 510b2f2b36 |
| [Hybrismannen/Digital-Apartheid](https://github.com/Hybrismannen/Digital-Apartheid) | C | private | 4 | 0 | Off | f1c726e79e |
| [Hybrismannen/NSLI](https://github.com/Hybrismannen/NSLI) | B | private | 0 | 0 | Off | 24de4f74f5 |
| [Hybrismannen/metoyo](https://github.com/Hybrismannen/metoyo) | C | public | 0 | 0 | On | 69911e1ac6 |
| [Hybrismannen/Conductellence-](https://github.com/Hybrismannen/Conductellence-) | A | public | 3 | 0 | Off | 733197849e |
| [Hybrismannen/Barnombudet](https://github.com/Hybrismannen/Barnombudet) | B | private | 0 | 0 | Off | 075347fcb1 |
| [Hybrismannen/Opal-Sense-I](https://github.com/Hybrismannen/Opal-Sense-I) | B | public | 16 | 1 | On | eff96772a4 |
| [Motherpher/form-flode](https://github.com/Motherpher/form-flode) | A | private | 3 | 1 | Off | aae0c570be |
| [Motherpher/wpb](https://github.com/Motherpher/wpb) | C | public | 5 | 0 | On | 86c2c10bb6 |
| [Motherpher/Gracey](https://github.com/Motherpher/Gracey) | D | public | 2 | 0 | On | 5e21b89ea4 |
| [Motherpher/CareerHubZero](https://github.com/Motherpher/CareerHubZero) | B | public | 13 | 1 | Off | 5375a96555 |
| [Motherpher/CareerHub-LinusF](https://github.com/Motherpher/CareerHub-LinusF) | D | public | 0 | 0 | Off | 6534963e83 |
| [Motherpher/Politent](https://github.com/Motherpher/Politent) | B | public | 18 | 1 | On | 020ef36e51 |
| [Motherpher/FF-Spatial](https://github.com/Motherpher/FF-Spatial) | B | private | 0 | 0 | Off | 4e8b3ca3af |
| [Motherpher/BDNA](https://github.com/Motherpher/BDNA) | B | public | 2 | 0 | On | fe052511c9 |
| [Motherpher/FFOS](https://github.com/Motherpher/FFOS) | A | public | 19 | 1 | Off | eaddcc44c5 |
| [Motherpher/MusicGenea](https://github.com/Motherpher/MusicGenea) | D | public | 0 | 0 | On | 51cb4aa8b9 |
| [Motherpher/Re-Eco](https://github.com/Motherpher/Re-Eco) | B | private | 0 | 0 | On | dd15ed554b |
| [Motherpher/GreenBell](https://github.com/Motherpher/GreenBell) | B | private | 10 | 1 | Off | 7671ac1743 |
| [Motherpher/Vitalitet](https://github.com/Motherpher/Vitalitet) | C | private | 0 | 0 | Off | e117922206 |
| [Motherpher/Ideburen](https://github.com/Motherpher/Ideburen) | B | public | 0 | 0 | Off | 2f61d8bedb |
| [Hybrismannen/Texts-n-Lyrics](https://github.com/Hybrismannen/Texts-n-Lyrics) | C | public | 0 | 0 | On | c2111016b4 |
| [Hybrismannen/formflode-com](https://github.com/Hybrismannen/formflode-com) | B — CANDIDATE | private | 0 | 0 | Off | 2ed5ba6ba4 |

## Change classification

**Repository SHA drift is not equal to capability drift.** Most source HEAD changes affecting previously stable repositories were an optional FFOS DevOps 1.1 discovery hook rollout, which should not be interpreted as runtime adoption or automatic sync. Source-specific material changes additionally include:
- [FFOS](https://github.com/Motherpher/FFOS) main: Bruno definitions and asset registry source, ProjectHub native accepted internal baseline, Drive policies and subsequent OAuth/resumable adapter fixes.
- [FFC](https://github.com/Motherpher/form-flode) main: proposed FFC-DATA documentation merged and accepted ProjectHub v0.4 projection.
- [FF-Spatial](https://github.com/Motherpher/FF-Spatial) main: spatial metadata catalogue and Drive create-only safeguards; real geodata/QGIS verification still separate.
- [Conductellence](https://github.com/Hybrismannen/Conductellence-) main: Drive external-effect proposals/evidence; actual source policy candidate explicitly marks `CANDIDATE_NOT_ACTIVE`.
- [Website](https://github.com/Hybrismannen/formflode-com): new, canonical Lovable-synced site repo.
- [UDL Twin](https://github.com/Hybrismannen/udl-twin), [StatsVault](https://github.com/Hybrismannen/green-bell-statsvault), [Barnombudet](https://github.com/Hybrismannen/Barnombudet), [RFSU internal](https://github.com/Hybrismannen/RFSU-godex-FF): routine metadata/operational dashboard refreshes.

## Limits

The register is complete within the **connected GitHub identity's currently visible** 34 repos, not all conceivable repos. It records present native source metadata and current exact main SHAs, **not** independent usability, licence audits, published Wiki identities, all public website routes or real FFOS/GDrive execution. No secrets, CVs, child/client records, private data assets or source attachments were exported here.

**This is a proposed v1.2 WO-002 scope update only.** No merge, Wiki, Project, Drive file, source issue state, runtime, release or Director acceptance is authorised by a current inventory.
