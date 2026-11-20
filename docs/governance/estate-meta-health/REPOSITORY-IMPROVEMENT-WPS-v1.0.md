# EMH-REPO-001 — Six Work Packages for Estatewide Repository Readiness

**Version:** 1.0 · **Date:** 2026-11-20 · **Programme Issue:** [FFOS #125](https://github.com/Motherpher/FFOS/issues/125) · **Parent:** [Estate Meta-Health #123](https://github.com/Motherpher/FFOS/issues/123) · **Status:** DIRECTOR REQUESTED WORK-PACKAGE DESIGN / SOURCE REVIEW; no actual 35-repository correction or programme acceptance asserted.  
**Scope:** 35 currently visible connected repositories (21 Hybrismannen, 14 Motherpher); subject to a new bounded WP01 verification.  
**Authoritative method pending merge:** [EMH protocol](PROTOCOL-v1.0.md) in [draft PR #124](https://github.com/Motherpher/FFOS/pull/124).

## 0. Aim and definition of fit-for-purpose

Make every estate repository **safe, navigable, source-accurate, maintainable and appropriately operational for its actual purpose**. Readiness is *context dependent*, not a single estate maturity percentage. Avoid upgrading archival, private, experimental and active deployment repositories to the same technical specification.

### Fit-for-purpose repository contract (minimum decision questions)

**F1 Identity:** Is the repository's purpose, canonical owner, public/private role and relation to adjacent systems truthful and discoverable?  
**F2 Authority:** Does it distinguish governing source/accepted version from proposals, generated projections and historical artefacts?  
**F3 Reader entry:** Can the intended audience understand what exists, how to navigate, where to start and what not to assume?  
**F4 Safety:** Are material credential, confidentiality, rights and permissions risks absent or explicitly contained with accountable owner?  
**F5 Operability:** For actual programs/services/data workflows, can an authorised operator build, test, run and recover within real supported boundaries? **N/A for archival/static material when appropriate.**  
**F6 Evidence:** Are significant release/runtime/publication claims anchored to dated source, tests or independent provider readback, with unknowns visible?  
**F7 Maintenance:** Are update paths, owner, known holds and repair route comprehensible, without imposing excessive process?

These are *review questions*, not new unconditional gates on historical repositories.

### Dispositions

- **READY — SCOPE-LIMITED:** all applicable F1–F7 questions verified for the specific stated role; no unresolved critical issue for that role.
- **READY WITH EXCEPTIONS:** actual use is safe within explicitly documented limitations; non-applicable or blocked optional capabilities not represented as released.
- **ACTION REQUIRED:** owner-confirmed substantive correction necessary.
- **HOLD / CONTAIN:** actual or credible consequential security, privacy, rights, authority or production exposure; source-owned risk action required.
- **NOT VERIFIED / ACCESS HOLD:** inspection incomplete, cannot certify readiness.
- **ARCHIVE — PRESERVE:** correctly preserved historical record with adequate provenance and reader orientation; no runtime or Wiki burden.

No manufactured PASS based on the existence of a README, green CI, a GitHub Wiki feature flag or a GitHub Project status.

## 1. Programme design and sequencing

```text
DIRECTOR MANDATE + EMH #125
          |
          v
WP01  Current source/owner inventory + 35-row applicability ledger
   |--------------------------|
   v                          v
WP02  Authority, safety,   WP03  Knowledge and reader path
      privacy and rights         (links existing WO-002)
   |                          |
   +------------+-------------+
                v
WP04  Technical operability / integration (only where applicable)
                |
                v
WP05  Prioritised source-owned corrective changes
                |
                v
WP06  Independent checks, residual holds, closeout and future EMH baseline
```

**Parallelism:** WP02 urgent risk triage begins immediately when evidence exists and must not await full WP01 inventory. WP03 source audit and WP04 bounded technical validation may run in parallel after source/authority paths are known. WP05 can begin on already verified critical issues; no synthetic gate prevents emergency containment under actual policy. WP06 final synthesis depends on source corrections and independent checks.

**Efficiency:** Reuse original source Issues, source PRs and WO-002 deliverables. One central programme Issue, a workpackage design, one per-repo ledger and a closure report are sufficient; do not create 35 empty issues, six new GitHub Projects, agents or required universal workflows.

## WP01 — Inventory, identity, applicability and baseline

**Purpose:** establish exact as-of source truth before distributing work across repositories. **Dimensions:** H1, H2, H3, H9. **Mode:** EMH FULL inventory component; read-first.

**Activities**
1. Re-enumerate both currently connected owners and accessible installations; record 35 as historical starting count, not an immutable target. Resolve additions/deletions/transfers/archived repos.
2. Pin each canonical repo, default branch SHA, visibility, purpose, operational/archival state, source owner or UNASSIGNED, adjacent repo links, intended audience, existing Issues/PRs, documented releases, Wiki flag versus confirmed remote Wiki publication and application runtime status.
3. Assign a fit-for-purpose profile (CORE-GOVERNANCE, ACTIVE-SOFTWARE, DATA/RESEARCH, PUBLIC-REFERENCE, PRIVATE-CLIENT/PROFILE, HISTORICAL/ARCHIVE, CONCEPT/EXPERIMENTAL). Multiple roles can coexist, but state principal role.
4. Inspect root entry and *source directory* before asserting missing guides; note cross-owner/private-access limitations and the inherited 20 Nov partial review.
5. For every F1–F7 record APPLICABLE / N/A / NOT_TESTED with source evidence and actual corrective candidate. Reuse [35-repository coverage](REPOSITORY-ACTION-REGISTER-v1.0.md).

**Deliverables:** D01 dated canonical estate register including SHA/provenance and access; D02 per-repository purpose/applicability/ownership sheet; D03 risk/dependency and reused-Issue map; D04 review findings and exact exceptions.

**Exit:** all accessible repos inventoried or listed ACCESS_HOLD, every row has a context-specific proposed posture and no unverified capability is labelled completed. Director acceptance of scope/priority remains separate.

## WP02 — Canonical authority, security, privacy and rights

**Purpose:** eliminate or properly contain risk arising from cross-owner confusion, unsafe sources, permissions and publication rights. **Dimensions:** H2, H5, H6, H7. **Start:** urgent issues independently triaged at once.

**Activities**
1. Verify constitutional/operational boundaries CDX–FFC–FFOS–Pius/AMA and the actual repository truth (defined vs implemented vs runtime-accepted). Do not import instructions from a draft or target architecture as enforceable runtime authority.
2. Review high-severity owner evidence: `Hybrismannen/pius-pwe#7` potentially exposed provider credential and RTF wrappers; security owner to revoke/rotate and validate safe backend boundary when applicable; DO NOT copy secret or self-rotate.
3. Check private/client/personal repositories (Barnombudet, RFSU internal, CareerHub profiles, WPB and others): visibility, data classification, exposed metadata, links, exports, generated dashboards and authorised collaborators; review only with permitted access, do not publish private findings.
4. Verify Barnskoj's recorded `readiness=BLOCKED`, remote Wiki not confirmed, and 526 image-source/provenance requirements; no copyrighted franchise image or activity publication without appropriate owner rights gates.
5. Check external academic/archival content, public product imagery, research citations, and website legal/publication statements to the extent relevant; rights not determined by feature flags or raw source URLs.
6. Identify cross-system IDs and authority boundaries: GitHub Issues/Projects V2, FFOS ProjectHub, asset/work-order IDs, source Wiki, native Wiki, Lovable and Drive remain distinct.
7. Log containment, source owner, severity, exact corrective control and verification—not a blanket security certification.

**Deliverables:** D05 verified authority/risk boundary matrix; D06 critical/high findings and safe owner routing; D07 privacy/rights and publication gate register; D08 source-controlled risk-disposition summary (redacted where needed).

**Exit:** each material risk has confirmed remediation and test, narrowly contained HOLD, or source-owner escalation; no live or public consequence made without source authority. An unresolved exposed credential **does not block documenting unrelated archives**, but prevents declaring the affected capability safe.

## WP03 — Documentation, knowledge and Wiki access

**Purpose:** each repository has appropriate, maintainable reader/operator entry points. **Dimensions:** H3, H8, H9. **Dependency:** reuse [WO-002 #48](https://github.com/Motherpher/FFOS/issues/48) and its pending DG-01/DG-02; **WO-002 WP03 is NOT implicitly started**.

**Activities**
1. Validate root README/default entry for all scoped repos, prioritise missing `Hy` and `pius-pwe`, and replace unhelpful placeholder `nsliengine` README through source-owner review.
2. Adopt minimal reader grammar where useful: What / audience / state / start / canonical reference / operation or guide / known holds / correction route. Archival repositories get concise provenance paths, not unnecessary tutorials.
3. Maintain source-controlled operating guides for FFOS, UDL Twin, CareerHubZero, FF-Spatial, Pius Universe/DevOps, GreenBell/StatsVault, CDX etc; update outdated operational claims only after source/runtime evidence.
4. Evaluate *selective* Wiki/atlas cases: Opal seed (existing dedicated Issue #13), Texts-n-Lyrics source atlas, Barnskoj source Wiki but rights/publication BLOCKED. Native Wiki feature flag ≠ populated or published Wiki. Confirm independent remote SHA or explicitly UNKNOWN.
5. Produce a source-linked Estate Knowledge Directory of identity, README, reader guide, canonical owner, Wiki source/live status, audience, privacy, last verified and maintainer. This is documentation metadata; no database or autonomous sync.
6. Perform representative public/private reader tasks and crosslink checks, with honest access limitations.

**Deliverables:** D09 source-aware entry-point remediation map; D10 README/guide improvement PR set where owners authorise; D11 Wiki suitability & remote verification ledger (or no-Wiki rationale); D12 knowledge directory and user-task results.

**Exit:** every accessible repository has a suitable verified reader start or a specific exception; no false published Wiki, public site, operation or release claim; no duplicate canonical policy. Existing WO-002 DG gates remain independent.

## WP04 — Operability, reliability, integration and recovery

**Purpose:** actual technical products, analytical pipelines and runtime connections are appropriately reproducible and supportable—not demand runtime compliance from concept archives. **Dimensions:** H4, H6, H7.

**Activities**
1. Profile repositories into live product / working prototype / infrastructure / data pipeline / static reference / archive. Verify only applicable build, test, lint, CI, dependency lock, supported execution and release posture.
2. Validate source/API boundaries for FFOS ProjectHub and data asset registry, FF-Spatial cloud work, FFC website/Lovable, CDX and Pius, CareerHub body/profile split, GreenBell/StatsVault, UDL Twin, Ideburen and domain systems; mark accepted internal baseline versus deployed host/read/write separately.
3. Review credentials/roles/TLS, restricted GitHub Actions environments, failure paths, idempotence/retry, immutable data and RLS, and cross-owner APIs **without executing consequential effects by default**.
4. Confirm backup/recovery/rollback capability and storage durability where actual state exists. A bounded GitHub Actions pilot, remote R/QGIS draft, or short-lived artifact is not complete durable infrastructure.
5. Verify live service/website endpoint and authoritative release only with permitted real user credentials and readback; otherwise record NOT_TESTED, not FAIL.
6. Route actual defects into existing product workorders. No mandatory new GitHub CI or DevOps hook on history.

**Deliverables:** D13 applicable technical readiness matrix and evidence; D14 integration/dependency diagram and boundary register; D15 reproducibility/recovery risk ledger; D16 source-owned correction candidates.

**Exit:** every ACTIVE-SOFTWARE/technical repository has actual test/recovery proof at the claimed scope, or an explicit truthful hold; N/A preserves archives from invented deployment duties.

## WP05 — Repository-owned correction execution

**Purpose:** perform only evidenced, authorised and worthwhile improvements, prioritised by risk and user-operational value. **Dimensions:** all H1–H9.

**Activities**
1. Use WP01–WP04 source-backed findings to create a ranked remediation queue; first reuse current Issues/PRs and record when no extra change is justified.
2. Group correction by owning repo and **dependency seam**, not by a blanket 35-repo automated change. Never alter canonical laws, source ownership, private permissions, credential state, rights or live effects merely to reach a programme metric.
3. For each approved correction: owner, smallest change, acceptance tests, rollback if material, exact-source references, target branch, and required Director/CDX/release gate; choose FFOS DevOps OM 1.1 only if separately offered/accepted for newly initiated substantial development.
4. Repair P0 owner-verified security/authority and unsafe release claims; then P1 access/reader and operational bottlenecks; then optional P2 usability enhancements. Blockers remain tracked by source owners.
5. Verify merged PR code, provider readback and user impact separately. Preserve historical evidence and unaccepted proposals.

**Deliverables:** D17 source-owned remediation and dependency plan; D18 scoped corrective PRs/Issues linked to actual owner; D19 independent correction receipts; D20 residual HOLD/exception ledger.

**Exit:** every approved change either verified in its exact intended scope or recorded blocked/deferred with owner and reason; no inflated claim that all repos were modified or all runtime work finished.

## WP06 — Verification, acceptance and future health continuity

**Purpose:** determine whether the programme improved estate coherence and preserve a repeatable maintenance baseline. **Dimensions:** H1–H9.

**Activities**
1. Re-enumerate current estate and compare to WP01; account for any new repositories after the 35-repo initial scope.
2. Independently test a representative, risk-weighted set of reader/operator workflows: find canonical source, open intended guide, locate real Issue, distinguish proposal/merged/runtime, observe permitted access denial, reproduce safe read-only technical job and identify recovery route.
3. Repeat source-verified checks for original high/critical blockers; require owner-specific evidence before downgrading a HOLD.
4. For every repository report exact disposition `READY — SCOPE-LIMITED`, `READY WITH EXCEPTIONS`, `ACTION REQUIRED`, `HOLD`, `NOT VERIFIED`, or `ARCHIVE — PRESERVE`; don't aggregate unknown into PASS.
5. Produce evidence-based before/after patterns: ownership resolution, dead links corrected, stale claims repaired, independently verifiable task success, time-to-find and unresolved critical risk. No numeric performance thresholds until comparable baseline exists.
6. Deliver a reader-facing estate directory and handover to the manual/event-based EMH LIGHT/FULL routine without spawning a new agent, cron or Project.
7. Director decides the acceptance scope and residual risk; preserve WO-002 DG-01/DG-02 and WO-001 DG-04 separately.

**Deliverables:** D21 verified current estate disposition register; D22 independent user/operator task receipts; D23 corrected cross-system source/flow map; D24 final programme report with residual risk, owner routing and next review triggers.

**Exit:** each originally scoped and subsequently added repo is accounted for or explicitly ACCESS_HOLD, every consequential finding is routed, final evidence is reviewable and Director decision logged. Programme can close **with named residual exceptions**; it cannot certify their unresolved capabilities.

## 2. Programme prioritisation and decision logic

**P0 Immediate / source-owner critical:** credential/privacy/rights exposure, unapproved live effect, authority drift creating unsafe actions, false production claims.  
**P1 Coherence-critical:** lost source identity, broken operator entry, unrecoverable critical workflows, missing evidence for a repeatedly used integration.  
**P2 Value-improving:** clearer reader paths, fewer duplicate sources, verified selective Wiki publishing, reduced manual friction.  
**P3 Optional:** cosmetic alignment, nonessential Wiki or Project expansion, bulk formatting; avoid if no user benefit.

**Order of operations:** verify before broad corrective work, except credible urgent safety containment. Value and severity are not measured by number of commits or readme length.

## 3. Source alignment and no-retrofit law

- [Standing EMH #123](https://github.com/Motherpher/FFOS/issues/123) establishes the *routine*, while [EMH-REPO-001 #125](https://github.com/Motherpher/FFOS/issues/125) governs this one-time bounded improvement campaign.
- [WO-002 #48](https://github.com/Motherpher/FFOS/issues/48) still owns three specific GitHub documentation/Projects/Wiki WPs. EMH-WP03 **coordinates** and consumes their verified outputs; it does not accept or execute WO-002 WP03 without its existing authority.
- [FFOS DevOps OM 1.1](../../operations/devops/README.md) remains an optional methodology for new substantial development and is not a mandatory estate template.
- CDX, FFC, Pius/HCC, AMA and domain source keep distinct powers. No GitHub Project board status or health metric substitutes a human decision.
- An old archive with correct provenance and a concise README can be **complete** without Wiki, runtime, active Issues or CI.
- All outputs prepared here are **proposal/implementation review**, never evidence that the 35 repositories have already been remediated.

## 4. Immediate execution candidates

1. **WP01 current inventory and applicability matrix**, plus exact main SHA and new repo count.
2. **WP02 urgent safety case** `Hybrismannen/pius-pwe#7`, Barnskoj rights gate, ProjectHub runtime/status boundary and private workspaces.
3. **WP03 existing WO-002** review PR #55 + parent source PRs; repair missing roots and placeholder README in source-owned review paths.
4. **WP04 risk-first technical checks** for current runtime/data systems; do not spin up service or mutate provider.
5. **WP05** only after source owner clearance for each corrective PR.
6. **WP06** after meaningful fixes and independent exact-source checks.

**Next practical command:** `Execute EMH-REPO-001 WP01` (once the programme source is reviewed/accepted); urgent source-owner safety response can proceed separately when authorised.
