# D07 — Cross-Project Operating Model and Source-Authority Contract

**WP:** FF-GH-WO-002/WP02 · **Date:** 2026-11-03 · **State:** Adopted as bounded implementation specification; Director DG-02 final assurance pending.  
**Inputs:** [D05 31-repository Project decisions](D05-ESTABLISHMENT-DECISIONS-v1.md), [D06 implementation](D06-DOMAIN-PROJECT-IMPLEMENTATION-v1.md), [D09 verification](D09-ASSURANCE-RECOVERY-DG02-v1.md).

## 1. Operating topology

```text
                     HUMAN DIRECTOR
         (source-recorded mandate and decision)
                          |
             PRIVATE ESTATE PORTFOLIO #2
       cross-domain blockers / selected original Issues
               /                         \
  governance WP01 #48               governance WP02 #50
            |
            +-- source-linked Opal #13, #16
            +-- source-linked Politent #19, #20
            +-- source-linked CareerHub #39, #53
            +-- source-linked GreenBell #4, #7
            +-- other selective estate exceptions
              (not the entire domain backlogs)

     SOURCE REPOSITORIES                  DOMAIN PROJECTS
 Hybrismannen/Opal-Sense-I    ---> The Opal (personal #2; 16 Items)
 Motherpher/Politent         ---> Politent (org #3; 18 Items)
 Motherpher/CareerHubZero    ---> CareerHub (org #4; 13 Items)
 Motherpher/GreenBell        ---> Estate Portfolio only
```

These are **distinct operational views of original native GitHub Issues**, not copied canonical tasks or a distributed runtime. The main Estate Portfolio predates this work order and remains the enterprise-wide/cross-domain projection. The three new Projects are domain-lifecycle working surfaces.

## 2. Authority and data model

| Object | Authority | Project handling |
|---|---|---|
| Source Issue / PR | Owning repository and approved changes | Preserve native ID, number, body, state, links and review |
| Work-package identity | Source programme and approved issue ledger | Use original WP number; never renumber from board location |
| Local application or model | Its canonical source and validated release evidence | Project can **reference**, not declare, technical readiness |
| Project V2 Item | Derived planning representation of source object | Custom categories can differ by board; source ID remains same |
| Director acceptance | Competent human source decision | `Approved (Source Recorded)` only after reading actual authoritative decision |
| CDX/AMA/Pius/FFC governance | Their own canonical policies and effect boundaries | Projects neither bypass nor activate runtime permissions |
| Wiki / guide | Approved editorial or repository source | Separate WO-002 WP03 Wiki publication and user tasks |

**Source of truth rule:** When a Project card and original Issue disagree, read the Issue and its commit/evidence first, log discrepancy and correct the *Project projection* only under authority. Do not rewrite source to match an attractive board.

## 3. Three operating layers

**Layer A — source work:** every task starts as its existing native Issue or PR; maintain its original acceptance conditions, dependencies, author/assignee and evidence. A new original Issue is created only in its proper source repository when a genuinely new task exists.

**Layer B — dedicated domain Project:** represent the domain's relevant existing native Issues. Use domain-appropriate fields (Opal desk/priority/editorial phase; Politent workstream/validation; CareerHub product lane/verification). Custom Project fields are *not synchronised* to the Estate Portfolio and can be legitimately different representations. Manual recategorisation requires a reason/source; approval indicators require source evidence.

**Layer C — Estate Portfolio:** represent only work relevant to cross-domain visibility, explicit human decisions, shared blockers, releases requiring oversight or reconciled dependencies. It is **not** a duplicate of all 47 domain Items. At WP02, the programme [WP01 Issue #48](https://github.com/Motherpher/FFOS/issues/48) and [WP02 Issue #50](https://github.com/Motherpher/FFOS/issues/50) were added as native source links, the former **Verification/Pending Verification**, the latter **Active/Pending Verification**. The older [WP04 snapshot](../../github-estate/data/portfolio-snapshot-2026-11-03.json) remains a dated 22-item historical capture; it must not be labelled the current live count.

## 4. Admission and duplicate prevention

1. Read the original repository, Issue number, state, label and scope.
2. Check whether the native Issue is already present in the selected Project. One source Issue may appear in two *different* Projects without duplication.
3. Link the **existing Issue URL/native Issue ID**, not a Project draft or a new Issue clone.
4. On uncertain API response, **read back before retrying**. Gateway errors can mask applied writes (see D06 duplicate-create incident).
5. Use source-backed Desk, Priority, Research Stream or Product Lane values. For absent evidence/approval, leave the Project field blank or `Pending Verification` rather than creating a fictitious PASS.
6. Do not use Project Status or a manual `Done` setting as Director or release acceptance.
7. Record any discrepancy in the [WP02 source Issue](https://github.com/Motherpher/FFOS/issues/50) or original domain Issue. Verify before correcting.

## 5. Work progression and evidence

**Intake → domain work → source verification → domain release/decision → portfolio projection.**

A view is **operationally complete** only if its source Issues contain the relevant completion evidence and the competent source accepts it. A Project can show a task complete in a personal planning context without authorising deployment, publishing or other external effects.

**Opal:** a source `phase:backlog` label may populate Backlog; Published needs original publication evidence and rights review. Wiki remains unactivated, not automatically accepted with a Project.

**Politent:** a WP3.x Issue may be classified Spatial & GIS without validated model estimates; a WP4.5 release card cannot certify scientific validity, independent code review or deployed GIS without source proof.

**CareerHub:** product lane and user Help may be described as code/workflow; any cross-profile compatibility/release claim requires source evidence and actual testing. No personal candidate records, CVs or protected profile data belong in a cross-domain Project description.

## 6. Permissions, visibility, automation

- All three new domain Projects are **PRIVATE**, even where the source repository is public. A linked public Issue does **not** grant others Project access.
- The exact same-owner repository is formally linked to each domain Project; no false owner transfer, fork or source rewrite occurred.
- The unsafe default native **Auto-close issue** workflow has been removed from the three new boards; automatic sub-Issue addition has been removed from Opal/Politent. Other native Project workflows may remain and must be audited before changing lifecycle/status defaults.
- The existing Estate Portfolio's Auto-close was previously disabled and remains under its separate governance.
- **No scheduled/live autonomous sync worker exists.** Only authorised interactive GitHub Project edits and read-only snapshot export/reconciliation are in scope. Rate limits, API errors and connection permissions require HOLD/fail-closed behaviour before consequential effects.

## 7. Review cadence and reconciliation procedure

**Proposed manual cadence, not an enabled reminder:** weekly Project triage; source owner/release review on relevant PR merges and decisions; at least monthly access/visibility review by an authorised administrator.

At each inspection:
- Verify original source URL/state and domain/estate Project membership.
- Check custom fields against *current* source labels or Issue scope.
- Review currently blocked Issues, unverified publication/model/production gates and human decision references.
- Check whether GitHub Project automation was changed after setup.
- Preserve a fresh dated snapshot; make no live-monitoring claim from an old one.

## 8. Change, rollback and escalation

Project-only fields/views/selected Items may be reconstructed from native source IDs and [dated snapshot](data/domain-project-snapshot-2026-11-03.json), but **full metadata/role/automation disaster recovery has NOT been independently tested**. Do not delete a live Project merely to demonstrate recovery.

If an incorrect native Issue is added, verify source identity, document discrepancy and remove only that Project item with scoped authorisation; the original Issue must remain intact.

If duplicate Projects arise after failed API mutation, enumerate the owner Projects and verify which are empty, newly created and unattached before removing those exact duplicates. This particular rollback was executed successfully during WP02 but **does not** prove full estate backup/restore.

**Human gate:** Director DG-02 final acceptance still pending, and WO-002 WP01 DG-01 and prior WP04 DG-04 remain unaccepted in full scope.
