# WP03 — Estate Documentation Taxonomy, Provenance and Navigation Standard v1.0

**Document ID:** FF-GH-WP03-D17-D19-D22  
**Status:** IMPLEMENTATION CANDIDATE / proposed via pull request; not a constitutional rule until accepted at DG-03  
**Date:** 2026-11-03 · **Work order:** FF-GH-WO-001 / WP03  
**Owner:** FFOS estate documentation coordination; domain repositories retain local source authority.

## 1. Purpose

Create a consistent method for finding, understanding and using the estate's GitHub-based systems **without relocating canonical knowledge or equating documentation with deployed functionality**. Use a source-linked operator guide where actionable instructions are needed; prefer existing source READMEs, generated dashboards or public websites where they already solve the need.

**Fundamental rule:** One canonical source per concept; a guide or Wiki is an explanatory projection. Documentation must never create mandate, widen permissions, certify implementation or replace a domain's normative specification.

## 2. Documentation taxonomy and ownership

| Content | Preferred primary surface | Authority / constraints |
| --- | --- | --- |
| Start here, project identity and status | Repository `README.md` | Entry point; source links, not duplicated specification |
| Normative architecture and constitutional doctrine | Versioned canonical repository documents | Owner's existing version / change-control law |
| Technical implementation / API contract | Versioned code and specifications | Reviewed, testable, exact source revision |
| Work package / planning / blocker | Existing GitHub Issue and linked Project | Planning state is not acceptance |
| Decision / approval / verification | Canonical decision and evidence record | Actor, mandate, timestamp, precise referenced object |
| Operator steps and troubleshooting | Version-controlled `docs/operator/` or `docs/user-guide/` | Source-linked, verified for current version |
| Reader glossary and practical examples | Guide or controlled Wiki where supported | Explain, never silently redefine |
| Public-facing overview | Approved site / publication surface | Public provenance and rights gate |
| Machine-generated metadata dashboard | Existing generated dashboard | Projection with freshness and origin |
| Historic design, superseded source | Archive / original Git history | Label supersession and preserve provenance |
| Community discussion | GitHub Discussions where audience justifies it | Neither an issue nor approval substitute |

Not every repository needs each category. Avoid a Wiki when a focused README plus user-guide file is simpler.

## 3. Page contract

Every substantive operator or Wiki-ready page shall declare:

1. **ID and title:** distinguish document identity from any canonical object.
2. **Role / audience:** who may rely on it and for what.
3. **Status:** PROPOSED, IMPLEMENTATION CANDIDATE, VERIFIED GUIDE, STALE, SUPERSEDED, or ARCHIVED. The documentation state is not the product runtime state.
4. **Source ownership:** repository; relevant file paths; exact revision or link to a pinned commit where needed.
5. **Verified functions versus planned architecture:** positive evidence for each actual command or route.
6. **Date of source reconciliation** and responsible reviewer.
7. **Privacy, licensing, publication and access class.**
8. **Discrepancy channel:** source Issue / governed change request.
9. **Decision / acceptance reference** where external use requires approval.

Where a source is only a design or a previous historical report, say so explicitly.

## 4. Source-reconciliation procedure

`CANONICAL SOURCE → source version/commit → interpretive guide → links / examples → validation → publication/review`

- Identify the **owning** repository and document. Do not infer ownership from the location of a copied excerpt.
- Inspect the latest authority and the actual available implementation separately.
- Date and attribute all mutable factual claims; preserve original source identity and version.
- Treat conflicting source claims as OPEN discrepancies until precedence is established by their existing governance.
- After a normative or product change, open a guide-reconciliation task; update the guide only after verifying its claims against source and, for practical instructions, observable behaviour.
- Never use a website's availability or a repository's `LOCKED` architecture marker to claim full runtime conformance.
- HARP / Appendix O source-checking applies where Pius governance requires it; no unverified external source shall be presented as authoritative.
- For a newly created Wiki, copy only approved **guide** material, carry source pointers and a reconciliation marker; do not mirror a constitution.

## 5. User navigation grammar

`README → Start Here → task-based guide → source contract → issue/PR → evidence → relevant decision / current status`.

For each repository, show **two distinct entrances** where useful: *Use the system* (practical guide) and *Develop / govern the system* (canonical sources and work packages).

Use explicit language for links: "Read source" for authority, "Open guide" for instruction, "Open current status" for evidence, and "Open project work" for planning. Never use "Launch" for staged, reserved or unverified functionality.

### FFOS navigation

- Technical current-state and ownership: [FFOS README](../../../README.md).
- Architecture and hierarchy: [Authority topology](../../architecture/FFOS-ESTATE-AUTHORITY-TOPOLOGY.md).
- Agent Stable and AMA: [Agent Stable](../../../agent-stable/README.md), [AMA](../../../agent-stable/ama/README.md).
- Operator instructions: [FFOS Operator Start](../../operator/README.md).
- Active estate management projection: [Private Motherpher Estate Portfolio](https://github.com/orgs/Motherpher/projects/2).
- Evidence and approval: [WP02 pilot record](https://github.com/Motherpher/FFOS/issues/43).

### UDL Twin navigation

- User entry: [UDL Twin User Guide](https://github.com/Hybrismannen/udl-twin/blob/main/docs/user-guide/README.md) **only after the guide PR is merged**.
- Technical current-state: [UDL Twin README](https://github.com/Hybrismannen/udl-twin).
- Blueprint status: [Iterative Blueprint](https://github.com/Hybrismannen/udl-twin/blob/main/docs/architecture/B1.0/README.md).
- Development telemetry: [Metadata Cockpit](https://github.com/Hybrismannen/udl-twin/blob/main/docs/metadata-dashboard/README.md).

## 6. Wiki decision criteria

Adopt a native Wiki only where all of the following hold: (a) real reader/user tasks would benefit; (b) the feature is available for the repository and subscription; (c) access and publication are safe; (d) there is an accountable maintainer and a reconciliation process; (e) it would not duplicate the canonical repository.

**Platform constraint at WP03:** GitHub Free does not support private-repository Wikis; Pro/Team or eligible higher plans do. Both selected pilots are private and their Wiki feature is currently disabled. Neither requires a paid upgrade to create useful documentation. Official source: [GitHub — About Wikis](https://docs.github.com/en/communities/documenting-your-project-with-wikis/about-wikis) and [GitHub's plans](https://docs.github.com/en/get-started/learning-about-github/githubs-plans).

## 7. Publication and review controls

- Draft or implementation-candidate guides in **review branches** and Pull Requests; do not change `main` until the correct gate is accepted.
- Public guides must be checked for rights, sensitive information and client/organizational attribution; follow FFC Public Provenance where applicable.
- The Director must approve consequential changes to source authority; technical documentation review does not imply source acceptance.
- An independently tested user task is preferred before claiming a guide is usable.
- Review at source release, major changed route/contract, exposure/security change, or reported divergence; scheduled intervals may supplement, never replace event-based review.

## 8. WP03 acceptance checklist

- [ ] Taxonomy coherent with existing source authority.
- [ ] Pilot guides accurately describe current functionality and reserved boundaries.
- [ ] Links resolve from actual repository-root-relative locations.
- [ ] No sensitive information or secrets in documentation.
- [ ] User steps tested with actual intended operator or honestly held as pending.
- [ ] Wiki suitability decisions and plan constraints recorded for all accessible repositories.
- [ ] Source-version reconciliation established.
- [ ] Director DG-03 acceptance recorded before claiming pilot complete.

**References:** FF-GH-WO-001 WP03; WP01 D03/D06; FFOS repository structure; UDL Twin B1.2.0-DRAFT Blueprint and S29; GitHub official Wiki and plan documentation. This document is an explanatory estate-level control proposal, not an amendment to CDX, AMA, FFC or Pius.
