# ProjectHub — Micro-box and Project Template Content Ingress Proposal v0.1

**State:** DOCUMENTATION PROPOSAL ONLY — NOT ADOPTED, NOT AN IMPLEMENTED/TESTED RUNTIME CONTRACT
**Date:** 2026-11-19
**Source owner:** FFC (`Motherpher/form-flode`) for external text/content and DNA-Box object grammar.
**Operating-system owner:** FFOS for ProjectHub service, rights, linked artifacts, governance and lifecycle.

## Goal

Allow Form & Flöde to offer small familiar external writing formats and proportionate project templates, while ProjectHub may **optionally** reference the resulting user-provided material. This must not create a parallel database, compulsory FF methodology or duplicate DNA-Box contents.

## Versioned content source (development branch, NOT merged to FFC main)

- [FFC Project content kit](https://github.com/Motherpher/form-flode/blob/content/projecthub-microbox-2026-11-19/15-innovation/project-content-kit/README.md) — developmental entry point.
- [Micro-box Core Swedish text originals](https://github.com/Motherpher/form-flode/blob/content/projecthub-microbox-2026-11-19/15-innovation/project-content-kit/micro-box-core-v0.1.md) — A Frågeställning; B Synopsis; C Idéram; D Mikroprojekt; shared F&F introduction.
- [Project template sizes](https://github.com/Motherpher/form-flode/blob/content/projecthub-microbox-2026-11-19/15-innovation/project-content-kit/project-template-sizes-v0.1.md) — Mikro / Liten / Mellan / Stor outlines, not yet a stabilized full template.
- [Relations and ingress](https://github.com/Motherpher/form-flode/blob/content/projecthub-microbox-2026-11-19/15-innovation/project-content-kit/relations-and-ingress-v0.1.md) — medium-strength information integration, separate functions.

When FFC review/merge/Corpus version occurs, replace branch pointers with their accepted canonical commit/version; do not silently present the development branch as a governed release.

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

## Suggested smallest future implementation slice (not done here)

1. Registry/list of available content templates by `templateId`, edition and FFC source reference; no duplicative data store.
2. Download/render approved versions **only after** FFC Public Provenance Gate and Affinity publication approval.
3. Optional user-authorized source attach; display data class, rights, canonicality, owner and version.
4. Explicit proposal to extract into a draft ProjectIngress; human-authorized admission.
5. Optional conditional DNA reference where appropriate; never automatic creation.
6. Verify permissions, provenance, duplicate handling, failure/unknown states and audit trace.
7. Test `PROJECT_NATIVE` can operate without any template, DNA or Pius obligation.

No API, schema, UI, cloud storage, website publication, provider write, project data migration or runtime activation is introduced by this document.

## Operational guardrails

- Respect PH-D0–PH-D3 first-release ceilings, PH-D4/PH-D5 fail closed.
- Do not ingest personal/participant material into public content or the FFC general Corpus by default.
- No autonomous A5 redesign, no A4 publication or contractual effect.
- Preserve source-specific rights, client confidentiality and FFC canonicality. Material from a client's Micro-box is not automatically FFC case evidence.
- Avoid representing simple genres such as concept note or synopsis as exclusive F&F inventions.
- Use existing `ProjectIngress`, `ProjectCore`, `ProjectField` and `LinkedArtifact`; create new data objects only after explicit fit assessment, approval and tests.

## Release status / next conditions

- FFC: developmental content staged for review (not merged as canon).
- FFOS: existing ProjectHub internal native baseline; restricted DB role exists, but application runtime not deployed / admitted (see [module state](../../modules/projecthub/README.md)).
- This file: **design/coordination note only**. It cannot upgrade ProjectHub's existing operational state.

Next: confirm FFC content and rights, test small/complex scenarios, decide whether any FFOS UX/runtime modification is justified, then route implementation under existing ProjectHub/CDX/Director governance.
