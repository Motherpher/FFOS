# D09 — Independent Verification Plan, Recovery and Director DG-02 Gate

**Record:** FF-GH-WO-002-WP02-D09 · **Date:** 2026-11-03 · **State:** VERIFIED BOUNDED IMPLEMENTATION / FULL INDEPENDENT ASSURANCE PENDING.  
**Source Issue:** [FFOS #50](https://github.com/Motherpher/FFOS/issues/50) · **Source snapshot:** [47 native source-linked Issues](data/domain-project-snapshot-2026-11-03.json).  
**Governance:** WO-002 WP01 DG-01 not yet accepted. Earlier WO-001 WP04 DG-04 remains HOLD, including T34–T37, T42, T44 and T46. Direct Director execution of WP02 does not retroactively close either gate.

## 1. Audit principles

A `PASS` is restricted to the actual observation described. Source-file presence and GitHub metadata do not prove independent user success, GitHub app scopes for another identity, production deployment, scientific validity, distributed event processing, publication rights or whole-Project recovery.

Evidence must be traceable to exact GitHub source Issue/PR, native Project/item IDs, source revisions or a dated authenticated read. **The source repository remains authoritative; board state is an operational projection.**

## 2. WP02 verification matrix

| Test | Requirement | Evidence | Status |
|---|---|---|---|
| V01 — no unnecessary Project creation | Exactly 3 justified domain boards, one per selected source, conditional GreenBell NO-GO | Read-back of Hybrismannen and Motherpher Projects V2 inventories; [D05](D05-ESTABLISHMENT-DECISIONS-v1.md) | **PASS** |
| V02 — creation error recovery | Gateway error must not leave duplicate workspaces | 4 same-turn empty/unattached duplicate Projects identified and removed; native owner inventory read back | **PASS for duplicate cleanup only** |
| V03 — Project privacy | Each of 3 new boards private | Authenticated GraphQL `ProjectV2.public=false` for Opal #2, Politent #3, CareerHub #4 | **PASS at account level** |
| V04 — exact ownership and association | Each board linked to its intended repository | `repositories.nodes.nameWithOwner` matches each original repo | **PASS** |
| V05 — native source IDs | No copies/drafts substitute for actual Issues | 16 + 18 + 13 Project Items; 47 unique source node IDs within boards | **PASS** |
| V06 — source integrity | Native Issues stay in original repo, unchanged OPEN state | All 47 sources `state=OPEN`, correct repository; no Issue closure/set-state operation used | **PASS at capture** |
| V07 — Opal source-defined fields | Exact editorial field names/options; priorities/desks from labels | Source `PROJECT_CONFIG.json`; 16 priorities, 14 desks, 2 explicit Backlog phase labels | **PASS for classification**, not content quality |
| V08 — Politent workstream classification | Group original WPs by evidenced topic | 18 original WP Issue titles into Data 3 / Behaviour 5 / Spatial 6 / Temporal 2 / Release 2 | **PASS for grouping**, not model validation |
| V09 — CareerHub product-lane classification | Distinct engine/search/HRDM/UX/release | 13 original Issue titles mapped to source-specific product lanes | **PASS for grouping**, not product runtime |
| V10 — saved views and filters | 4 Opal, 6 Politent, 6 CareerHub views | GraphQL native view metadata, REST view-item population samples/array metadata, saved `filter` strings | **PASS for source-backed view configuration**; independent UI test pending |
| V11 — no native auto-close | No new board should close original Issue when a card changes | Exact `Auto-close issue` workflows **deleted** from all three new Projects, no longer found on read-back | **PASS at capture** |
| V12 — no unbounded child admission | No automatic sub-Issue mass intake | Default `Auto-add sub-issues to project` deleted on Opal/Politent and absent afterward | **PASS at capture** |
| V13 — central oversight integration | Existing Estate Portfolio preserved and includes original control Issues | Estate Portfolio: 24 unique source Issues, all OPEN, private; WP01 #48 Verification / WP02 #50 Active, both Pending Verification; Auto-close OFF | **PASS** |
| V14 — no manufactured acceptance | No Director, publication, method validation or release PASS inferred | Project `Authority Gate`, `Evidence`, `Validation`, `Verification` only populated if actual source supports; no Approved/Released values set | **PASS for WP02 writes** |
| V15 — external roles/permissions | Project usable by intended different identities without visibility leaks | Current connection controls only; no nonprivileged identity or separate role audit | **HOLD** |
| V16 — source maintainer endorsement | Actual repository owner signs off domain Project setup, publication/navigation, any local README edits | Same account ADMIN permission observed; explicit separate maintainer review not obtained | **PARTIAL** |
| V17 — whole-Project restore | Reconstruct Project fields/views/workflows/membership/access/decisions from source | Dated [JSON snapshot](data/domain-project-snapshot-2026-11-03.json) exists; full non-destructive restore in isolated board not attempted | **HOLD** |
| V18 — parallel/concurrent retries | Remote API creation handles ambiguous 502/replay/idempotency | Actual 502 triggered duplicate creation; manual cleanup succeeded; no durable operation-level idempotency key/worker | **PARTIAL / design defect recorded** |
| V19 — cross-owner live sync and CDX | No unapproved write worker/bindings | Only manual GitHub native writes and read-only snapshots; no new tokens or effect endpoints | **NOT IMPLEMENTED / NOT AUTHORISED** |
| V20 — practical use | Director/operator completes view, source evidence and decision tasks | Guides drafted; no independent authorised users performed full scenarios | **HOLD** |
| V21 — no unrelated repo changes | No production software, branch rules, Wiki publication or credential changes | GitHub native Projects only, plus documentation branch/review PRs; no runtime source modified | **PASS for scoped writes** |
| V22 — final Director acceptance | DG-02 competent decision on actual evidence and limitations | [WP02 Issue #50](https://github.com/Motherpher/FFOS/issues/50) remains open, approval pending | **HOLD** |

## 3. Source view-count evidence and limitations

The following exact saved views were created and observed:

- **Opal:** Editorial Kanban 16; Research Desk 2; Evidence Review 16; Publication Roadmap 16.
- **Politent:** Research Workstreams 18; Data & Sources 3; Behavioural Models 5; Spatial & GIS 6; Temporal & Backtesting 2; Release & Assurance 2.
- **CareerHub:** Product Board 13; Core Engine 3; Search & Geography 2; Analysis & HRDM 2; Profiles & UX 3; Release Readiness 2.

View-item REST responses sometimes display a truncated three-item preview and intermittently omit their structured `items.length` metadata in batch mode. The counts above were cross-checked using actual returned array lengths where available, small untruncated previews for two-/three-item views and direct individual read-backs of larger exceptions. This proves **saved view data/filters**, not visual UI usability by each intended role.

## 4. Creation incident and postmortem

**Observed event:** A GitHub GraphQL `createProjectV2` request resulted in an HTTP **502** gateway response while creation side-effects proceeded. A separate account Project enumeration discovered three Opal and three Politent boards rather than one, and one CareerHub board.

**Impact:** Four extra *newly created, empty, private, unassociated* boards; no source Issue copied/closed, no existing Project deleted.

**Recovery actually performed:** Verified these four duplicates had zero Items and zero repo associations, then deleted exact native IDs for Hybrismannen Opal #3/#4 and Motherpher Politent #5/#7. Subsequent read-back confirmed one intended domain Project each, existing older Projects intact.

**Root-cause statement:** The 502 and repeated effects establish an *ambiguous successful write/replay* failure class; the precise upstream retry mechanism is **NOT VERIFIED**. Do not claim to know it without service logs.

**Mandatory next design improvement:** Before retrying a create, first re-read owner Projects and source identities. Use stable operation-intent records, no blind duplicate create, and explicit compensation/rollback for only new confirmed empty resources. Distributed concurrency/credential safety remains untested.

## 5. Recovery playbook (not a tested full restore)

**Safe first response:** Stop unsafe Project transitions, preserve source Issues and their exact IDs, take a fresh authorised snapshot, read current native Project fields/views/workflows, and compare to [the dated 2026-11-03 export](data/domain-project-snapshot-2026-11-03.json).

**Non-destructive reconstruction proposal:**
1. Capture user/organisation owner, Project ID/number, visibility and source repository associations.
2. Enumerate exact native Issue IDs and native source state; do not create duplicate Issues or drafts.
3. Enumerate custom fields, valid options, view layouts/filters and native workflow state.
4. For a replacement board only with authorised owner/Director permission, rebuild fields/views from the versioned contract and link exact original Issues. **Never set approval from snapshot alone.**
5. Validate in an isolated nonproduction Project with another competent reviewer: matching source IDs, privacy, role access, workflows, field values and view counts.
6. Compare restore to original and log any field/view/ACL metadata that cannot be recovered.
7. Seek source-owned approval for cutover, then retire any obsolete board through a separately reviewed action.

**Current recovery status:** The incident's empty-duplicate rollback was tested; **full project reconstruction including ACL and workflows was not**. Hence V17 HOLD.

## 6. Privacy and rights

All three new Projects are PRIVATE despite Opal, Politent and CareerHub source Issues being public. Their source Issue titles, labels and links are represented, but no separate protected profiles, client/child data, API keys or personal CV files were deliberately copied into Project fields.

This limited observation is **not** a full negative assurance for private/source disclosure under other identity types. Project invitations, share links and team scopes require separate authorised access tests.

## 7. Director DG-02 disposition options

**A. Bounded acceptance:** Director accepts the existing three private Projects, 47 source-preserving Issue associations, their 16 saved views, selected fields, security workflow deletion and versioned D05–D09 evidence **without** accepting V15–V20, full recovery, autonomous sync, deployment or normative/production claims. Local source README PRs can be authorised for merge after exact-head checks.

**B. HOLD:** Maintain the live Projects as private controlled pilots, keep source Issue statuses unchanged, and require independent permission, usability, creation-retry/recovery and owner review before acceptance/merge.

**C. Revision:** Adjust scope (for example, filter semantics or one domain's Project privacy) through another source-backed work-order update; do not fabricate an acceptance.

**Current:** WP02 IMPLEMENTATION PRESENT, **DG-02 NOT ACCEPTED**. WO-002 WP01 DG-01 and earlier FF-GH-WP04 DG-04 remain distinct HOLD gates. WO-002 WP03 NOT STARTED.
