# FF-GH-WO-002 — Estatewide Workorder Delta v1.3 (20 November 2026)

**Status:** REVIEW CANDIDATE / NOT DIRECTOR ACCEPTED. Additive delta to 18 November v1.2 in draft PR #55, not a replacement for historical 31-, 33- or 34-repository snapshots. **Master:** Motherpher/FFOS Issue #48. **Authority:** Human Director; existing source ownership and DG gates.

## 1. New evidence since 18 November

1. **35 connected repositories** (Hybrismannen 21, Motherpher 14), compared with 34 on 18 November and 31 on 3 November. New repository **Hybrismannen/Barnskoj**. Connected listing proves scope, not completeness of permissions/independent accessibility. Its README links research, designs, 3 SVG activity prototypes and a dedicated `wiki-src/` source tree; it explicitly states **zero published activities** and a **BLOCKED** wiki/rights pre-gate. No native Wiki publication is evidenced. Do **not** interpret its source-controlled Wiki files as a published GitHub Wiki. Existing 13 Wiki feature-flag count from the 18 Nov register is historical until rechecked across 35 repos; do not silently replace with 14.
2. **ProjectHub production advances beyond internal v0.4 baseline:** FFOS #102 is the separate L3 activation workorder. FFOS PRs #107–#120 document private six-table RLS schema, scoped read and write infrastructure and bounded tests. PR #115 reports a Director-approved successful live restricted database **read** canary, while #117 records synthetic authenticated HTTP integration PASS and production HTTP test awaiting Director approval. These narrower results supersede a blanket claim that no live ProjectHub connection has been tested. They **do not** establish durable deployed hosting, production write acceptance, general availability or portfolio-wide enumeration.
3. **Writer frontier, not writer activation:** PR #120 binds a source-gated write candidate and a protected rollback-only canary. PR #121 records (from live-database evidence) the `ffos_projecthub_writer_login` principal with `LOGIN=false`, `INHERIT=false`, `BYPASSRLS=false`, restricted membership and no direct ProjectHub table SELECT/INSERT. Write admission remains `NOT_ACCEPTED`; host remains `NOT_DEPLOYED`; PH-D4/provider writes remain `NOT_ADMITTED`. PR #121 is a source review candidate, not approval or permission to enable the principal.
4. **Cloud migration evidence:** FFOS Issue #69 reports successful GitHub Actions Kolada and FF-Spatial headless GDAL pilot runs, but durable object storage, cross-repo dispatch, remote R/Python and production operation remain outstanding. Do not continue to describe the *entire* estate as only Mac-local; do not treat pilots as estatewide runtime migration completion.
5. **Security carry-forward:** Hybrismannen/pius-pwe Issue #7 documents possible embedded provider credential and malformed RTF-wrapped source. Security remediation is a separate authorisation; WO-002 documentation cannot claim the credential was rotated or production safe.

## 2. Mandatory revisions within the existing three WPs

| Requirement | Revised scope / acceptance criterion | Decision |
| --- | --- | --- |
| **WP01 D01** | Add Barnskoj as 35th repo to dated inventory with own canonical README and controlled rights/wiki status; preserve 31/33/34 snapshots. Pin repository identity, provenance, access and release state. | AMEND |
| **WP01 D02** | Link Barnskoj README, wiki-src/Home.md, rights/README.md, production/RELEASE_GATE.md, and its source-level DevOps docs. Refresh ProjectHub navigation to #102/#110/#115/#117/#120/#121. | AMEND |
| **WP01 D03** | Keep evidence classes distinct: proposed / merged source / CI-test verified / live connected and bounded read tested / Director-accepted within exact scope / deployed. A live read receipt is not a production write or release. | AMEND |
| **WP01 D04** | Confirm v1.3 vs exact current repo heads and independently verify ProjectHub protected canary outcomes before user-facing assertions; classify PR #121 as review candidate until separately verified merged. Check PWE security hold. | AMEND |
| **WP02 D05** | Assess Barnskoj for selective GitHub Projects suitability, but no extra board merely from repo creation. Its native backlog is not evidenced by repository search results; independent source Issue review needed. | AMEND / NO CREATE |
| **WP02 D06** | Retain historical verified private boards (Opal 16, Politent 18, CareerHub 13; Estate 25 as of 18 Nov) until live Project reads reconfirm counts. No automatic adjustment from 35 repos. | PRESERVE |
| **WP02 D07** | Distinguish GitHub Projects V2, internal ProjectHub, asset registry, Lovable project and Barnskoj's source-controlled Wiki publishing pipeline. Cross-system link is navigation, never implicit state synchronization. | AMEND |
| **WP02 D08** | Display actual ProjectHub statuses: accepted internal v0.4; some live restricted read tests completed; protected production HTTP test pending; write admission/host not deployed. | AMEND |
| **WP02 D09** | Add tests for false deployed claims, forbidden writer LOGIN, unaccepted write admission, rollback-only canary residue, wiki rights-block bypass and confusion of source Wiki with publication. | AMEND |
| **WP03 D10–D12** | Include Barnskoj in Wiki suitability evaluation. Its `wiki-src/` is explicitly BLOCKED by source's rights/provenance gate; no Wiki publish or reuse of protected figures without source-owner legal rights approval. | AMEND / HOLD PUBLICATION |
| **WP03 D13** | Add user test: navigate Barnskoj Wiki source, identify blocking rights gate, and distinguish 3 prototypes from zero published activities; distinguish successful bounded ProjectHub read from unavailable hosted writer. | AMEND |
| **WP03 D14–D15** | A 35-repo source-linked handover with exact product boundaries, release gates, privacy, security and scope-specific evidence. No inference of Director DG approval. | AMEND |

## 3. Non-changing decisions

- **Three WPs only.** Do not add a fourth WP, broad native Wiki rollout or one GitHub Project per repository.
- **WO-002 DG-01 and DG-02 remain PENDING; WP03 NOT STARTED.** Prior WO-001 DG-04 remains HOLD. No Director approval is inferred from this file, PR status, merged code or project board field.
- Preserve four native GitHub board identities; never conflate GitHub native Issue IDs with ProjectHub internal IDs or typed FFOS data-asset/work-order identifiers.
- No credentials, permissions, schema migration, cross-owner automation, Drive mutations, Wiki publication, PR merge or deployment authorised by this read-only reconciliation.

## 4. Exact-source follow-up and release gate

Before proposed v1.3 replaces current v1.2 review language: independently inspect **35 current repository heads**, refresh machine-readable register and native GitHub Project/Wiki API counts, pin exact PR merge states for ProjectHub #115–#121, validate protected canary receipt(s) and verify source-owner documentation links and Barnskoj's rights gate. Then request Director's **DG-01 and DG-02 separately**, with source-owner approvals. WP03 only on separate execution instruction and required gates.

**Evidence links:** [master #48](https://github.com/Motherpher/FFOS/issues/48); [reconciliation PR #55](https://github.com/Motherpher/FFOS/pull/55); [Barnskoj README](https://github.com/Hybrismannen/Barnskoj/blob/main/README.md); [ProjectHub #102](https://github.com/Motherpher/FFOS/issues/102); [read canary #115](https://github.com/Motherpher/FFOS/pull/115); [HTTP integration #117](https://github.com/Motherpher/FFOS/pull/117); [writer binding #120](https://github.com/Motherpher/FFOS/pull/120); [writer principal #121](https://github.com/Motherpher/FFOS/pull/121); [remote runtime #69](https://github.com/Motherpher/FFOS/issues/69); [PWE security #7](https://github.com/Hybrismannen/pius-pwe/issues/7).
