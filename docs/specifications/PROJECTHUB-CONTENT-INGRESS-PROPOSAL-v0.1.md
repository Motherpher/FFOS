# ProjectHub — Micro-box and Project Template Content Ingress Proposal v0.1

**State:** DOCUMENTED CONTENT RELATION + IMPLEMENTED READ-ONLY INTERNAL CATALOG CANDIDATE — NOT PUBLIC, NOT DEPLOYED, NOT AN INGESTION CONTRACT
**Date:** 2026-11-19
**Source owner:** FFC (`Motherpher/form-flode`) for external text/content and DNA-Box object grammar.
**Operating-system owner:** FFOS for ProjectHub service, rights, linked artifacts, governance and lifecycle.

## Goal

Allow Form & Flöde to offer small familiar external writing formats and proportionate project templates, while ProjectHub may **optionally** reference the resulting user-provided material. This must not create a parallel database, compulsory FF methodology or duplicate DNA-Box contents.

## Versioned content source (FFC v30.19.6; developmental text, merged to FFC main)

- [FFC Project content kit](https://github.com/Motherpher/form-flode/blob/main/15-innovation/project-content-kit/README.md) — developmental entry point.
- [Micro-box Core Swedish text originals](https://github.com/Motherpher/form-flode/blob/main/15-innovation/project-content-kit/micro-box-core-v0.1.md) — A Frågeställning; B Synopsis; C Idéram; D Mikroprojekt; shared F&F introduction.
- [Project template sizes](https://github.com/Motherpher/form-flode/blob/main/15-innovation/project-content-kit/project-template-sizes-v0.1.md) — Mikro / Liten / Mellan / Stor outlines, not yet a stabilized full template.
- [Relations and ingress](https://github.com/Motherpher/form-flode/blob/main/15-innovation/project-content-kit/relations-and-ingress-v0.1.md) — medium-strength information integration, separate functions.

FFC main now contains the content package as **developmental Corpus material**, first recorded at FFC v30.19.6 (2026-11-19; merge commit `51e3ac6224621abf9fb112415e51ce5e9e51931b`). The text is **not** a published/licensed public template or approved canonical project methodology. Preserve the exact FFC source and version rather than copying it into FFOS.

## Relation to canonical ProjectHub v0.4

The existing [ProjectHub Contract v0.4](PROJECTHUB-CONTRACT-v0.4.md) controls all ProjectHub state and authority. No existing lifecycle transition, methodology profile, gate or PH data-class ceiling is altered.

| Proposed external content | Existing ProjectHub mechanism | Admission rule |
|---|---|---|
| Frågeställning, Synopsis, Idéram | Source reference / `LinkedArtifact` | May remain completely outside ProjectHub; submitted sources are NOT automatically projects |
| Mikroprojekt | Candidate `ProjectIngress` with `ProjectCore` and Work drafts | Explicit owner, mandate, purpose, scope, provenance, data class, methodology and project creation authority |
| Liten / Mellan / Stor project plan | `LinkedArtifact` + reviewed mapping to `ProjectCore` and eight `ProjectField` dimensions | Document completeness does not imply North Star or project approval |
| Optional FFC DNA-Box | External/selected method/component source reference | No DNA mandatory for `PROJECT_NATIVE`; no FFC canonical DNA mutation from ProjectHub |
| Public PDF / website material | FFC Public Provenance / publication export under proper owner | Public content is not a project, dataset or user-provided upload by default |

`FULL_FF | CONFIGURED | PROJECT_NATIVE` remain the methodology profiles. A Micro-box is a content genre, **not** a new fourth profile.

ProjectHub relationship scopes `OWNED | SHARED_REFERENCE | EXTERNAL_REFERENCE` and LinkedArtifact sync classes `REFERENCE | DERIVED | WORKING | BIDIRECTIONAL_REVIEW | CANONICAL_EXTERNAL` retain their v0.4 meanings. For a user-provided unapproved file the default conceptual behavior is **reference and review first**, never automatic bidirectional rewriting.

## Smallest implementation slice — current source state and remaining work

1. **Implemented for internal review:** `modules/projecthub/src/content-catalog.ts` defines a read-only catalog of seven IDs with FFC source paths, content maturity, size and publication false/ingress flags. No duplicated template text or independent data store.
2. **Implemented as a non-public internal UI candidate:** `apps/web/app/(protected)/projecthub/templates/page.tsx` with a route from ProjectHub home. It displays status and description only. **Public downloading remains disallowed** until FFC Public Provenance Gate and Affinity publication approval.
3. **Not implemented:** optional user-authorized source attach; data class, rights, canonicality, owner and version must be governed when developed.
4. **Partly implemented as pure advisory logic only:** `assessContentRouting` distinguishes source-only formats and project-ingress candidates, always returns `createProject:false`, `createDna:false` and `requiresHumanReview:true`. No source upload, extraction proposal, ProjectIngress or canonical admission is executed.
5. **No DNA mutation:** optional conditional reference only where appropriate; actual binding/review workflow remains unimplemented.
6. **Source tests introduced:** `modules/projecthub/tests/content-catalog.test.ts` covers seven IDs, shared microproject source, no automatic ingress, unknown IDs fail-closed, no methodology alteration and defensive metadata copies. More comprehensive authorization and real upload/ingress tests await an explicitly authorized runtime feature.
7. Existing ProjectHub test suite continues to verify `PROJECT_NATIVE` can operate without any FFC/Pius requirement. GitHub Actions ProjectHub DevOps and authenticated Next.js HTTP acceptance checks passed on PR branch before production deployment.

**Boundary:** A protected read-only internal UI and catalog exist in source. No external/public UI, write API, database schema, cloud storage, website publication, provider write, project data migration or runtime activation is introduced. The write gate and PH-D0–D5 constraints remain unchanged.

## Operational guardrails

- Respect PH-D0–PH-D3 first-release ceilings, PH-D4/PH-D5 fail closed.
- Do not ingest personal/participant material into public content or the FFC general Corpus by default.
- No autonomous A5 redesign, no A4 publication or contractual effect.
- Preserve source-specific rights, client confidentiality and FFC canonicality. Material from a client's Micro-box is not automatically FFC case evidence.
- Avoid representing simple genres such as concept note or synopsis as exclusive F&F inventions.
- Use existing `ProjectIngress`, `ProjectCore`, `ProjectField` and `LinkedArtifact`; create new data objects only after explicit fit assessment, approval and tests.

## Release status / next conditions

- FFC: content kit **merged on main at FFC v30.19.6 as DEVELOPMENTAL content**, not a new canonical method or public release.
- FFOS: existing ProjectHub internal native baseline; restricted DB role exists, but application runtime not deployed / admitted (see [module state](../../modules/projecthub/README.md)).
- This file: **source-bound documentation of a read-only candidate and its tests**. It cannot upgrade ProjectHub production deployment, project creation authority or public publication status.

Next: confirm FFC content and rights, test small/complex scenarios, decide whether any FFOS UX/runtime modification is justified, then route implementation under existing ProjectHub/CDX/Director governance.
