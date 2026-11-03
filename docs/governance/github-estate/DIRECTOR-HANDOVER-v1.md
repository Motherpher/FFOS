# WP04 D33 — Director Handover: GitHub Estate Operations

**Date:** 2026-11-03 · **Status:** DRAFT DIRECTOR HANDOVER — DG-04 pending  
**Executive owner:** Human Director · **Coordination:** FFOS · **Source:** [WP04 Work Order Issue #46](https://github.com/Motherpher/FFOS/issues/46).

## 1. What the estate now contains

- [Motherpher Estate Portfolio #2](https://github.com/orgs/Motherpher/projects/2) — **private** interactive GitHub Project with **22 selected linked native Issues**, including 13 additions under WP04, across 12 actual repositories. This is a work-planning projection, not a canonical system.
- [Estate Adoption Register](ADOPTION-REGISTER-v1.md) — all **31 accessible** repositories, with explicit Tier A/B/C/D, visibility and feature suitability; not every registered repository is active in the Project.
- [Estate Dashboard](ESTATE-DASHBOARD.md) — source-backed point-in-time reporting, Project fields and Director/risk queues.
- [Repository metadata snapshots](data/) — dated REST metadata, private Project fields, and adoption classifications.
- [Configuration standard](CONFIGURATION-STANDARD.md) and [templates](templates/) — optional reusable forms, not imposed across the estate.
- [Sync contract](PROJECT-SYNCHRONISATION-CONTRACT-v1.md) and [FFOS/CDX proposed integration](FFOS-CDX-INTEGRATION-SPEC-v1.md) — rigorous lifecycle and effect-gate boundaries.
- [Read-only reconciler](../../../tools/estate/reconcile.py) and [regression tests](../../../tests/test_estate_reconcile.py) — detect duplicates and unsourced acceptance in dated snapshots. **Not a live sync agent.**
- [Maintenance playbook](OPERATIONS-PLAYBOOK-v1.md) and [DG-04 assurance matrix](VERIFICATION-DG04-v1.md).

## 2. Five Director questions answered

**What exists?** The 31-repo adoption register names the owner, private/public state, canonical boundary and selective adoption decision. Repository history remains at each original owner.

**What is happening?** The Project's current source-linked Issues, Work Stage, Priority (when source-defined) and Programme fields; its [Estate Overview](https://github.com/orgs/Motherpher/projects/2) and programme views. At capture, 22 items / 12 repositories; this is NOT all estate work.

**What needs a decision?** Open the Project's **Director Decisions**, then the original Issue/decision record. Do not decide from a card alone. WP04 DG-04 is held for independent assurance.

**What can be trusted?** Source repository identity, exact GitHub Issue and PR links, DG-02/DG-03 acceptance comments, captured GraphQL/REST fields and bounded regression tests. A PASS on an offline fixture does not prove product runtime or all credentials/permissions.

**How is it operated?** Follow [Operations Playbook](OPERATIONS-PLAYBOOK-v1.md) and [FFOS Operator Manual](../operator/FFOS-OPERATOR-MANUAL-v1.0.md). Add existing Issues selectively, verify ownership, preserve IDs, attach source decisions and reconcile Project projections.

## 3. Open the principal navigation surfaces

| Purpose | Link / instruction |
|---|---|
| Estate portfolio | [GitHub Project](https://github.com/orgs/Motherpher/projects/2) (requires authorised account) |
| Current programme control | [WP04 Issue #46](https://github.com/Motherpher/FFOS/issues/46) |
| WP04 review branch / changes | [PR #47](https://github.com/Motherpher/FFOS/pull/47) (draft; not merged) |
| Previous Director gate DG-02 | [WP02 accepted decision](https://github.com/Motherpher/FFOS/issues/43#issuecomment-6591480963) |
| Previous Director gate DG-03 | [WP03 accepted decision](https://github.com/Motherpher/FFOS/issues/45#issuecomment-6599403434) |
| FFOS operator instructions | [Operator manual](https://github.com/Motherpher/FFOS/blob/main/docs/operator/FFOS-OPERATOR-MANUAL-v1.0.md) |
| UDL evaluator instructions | [UDL Twin guide](https://github.com/Hybrismannen/udl-twin/blob/main/docs/user-guide/UDL-TWIN-EVALUATOR-GUIDE-v1.0.md) |
| CDX constitutional authority | [Conductellence](https://github.com/Hybrismannen/Conductellence-) |
| FFC Corpus authority | [Form & Flöde Corpus](https://github.com/Motherpher/form-flode) |
| Pius development | [Pius Universe](https://github.com/Hybrismannen/pius-universe) |

## 4. Use the portfolio without accidental authority

1. Select a view that matches the question: current work, blockers, verification, decisions, Products & Platforms, Research & Delivery.
2. Open the **source Issue** and inspect its current objective, source version, evidence and dependencies.
3. Review the exact authority requirement; do not treat Project `Status: Done` or source Issue closure as Director acceptance.
4. If a competent Director decision is recorded and read back, set `Work Stage = Accepted` and `Authority Gate = Approved (Source Recorded)` with the precise source URL.
5. Keep `Auto-close issue` OFF. Do not change branch rules or project visibility to make the dashboard easier to browse.
6. For blocked source tasks, preserve the blocker and actual missing evidence in original Issues; update the Project only as an explanatory projection.

## 5. Offline assurance (after permitted check-out)

```sh
python3 -m unittest discover -s tests -p test_estate_reconcile.py -v
python3 tools/estate/reconcile.py \
  --adoption docs/governance/github-estate/data/estate-adoption-register-v1.json \
  --project docs/governance/github-estate/data/portfolio-snapshot-2026-11-03.json \
  --output /tmp/ff-gh-wp04-assurance.json
```

The code runs without network access or GitHub write permissions and returns `PASS`, `PASS_WITH_WARNINGS`, or `HOLD` against **dated** snapshots. It produces no updated live data. To claim freshness, take a new authenticated Project export and run the same checks. Do not commit a personal token; secrets require a separately authorised credential and protection scheme.

## 6. Operational status (exact)

| Capability | Status |
|---|---|
| Private cross-owner Project V2 | **FUNCTIONAL** for manual native Issue linking and read-back |
| 31-repo source register | **DELIVERED as review-branch data** |
| Selective multi-programme Project intake | **EXECUTED**; 13 new native Issue links |
| Programme-specific Project views | **CREATED**, filter rendering still subject to validation |
| Read-only snapshot integrity assurance | **AUTOMATED on GitHub Actions** for committed inputs; independent check results must be read at final PR head |
| Recurrent live portfolio refresh | **NOT CONNECTED** |
| Automatic cross-owner writes | **NOT IMPLEMENTED / NOT AUTHORISED** |
| FFOS↔CDX real runtime effect enforcement | **NOT VERIFIED / OUT OF SCOPE** |
| Pius runtime binding | **RESERVED** |
| Whole-Project restore test | **NOT TESTED** |
| Independent F-1/F-2/U-1/U-2 user tests | **NOT TESTED** |
| Final Director DG-04 acceptance | **PENDING** |

## 7. Blocking conditions and next decision

- Independently verify that Project fields, source links and private ACL work for appropriate roles.
- Review Project recovery and least-privilege credentials before any recurring integration.
- Resolve or explicitly scope external Vercel failures and other source-owned release checks.
- Establish owner-level agreement before distributing Issue/PR templates into 31 repositories.
- Obtain an independent technical assurance and Director DG-04 decision before merging the WP04 review PR.

**No work-package document can grant authority to bypass mandatory CDX, AMA, FFC, Pius, source/repository or human acceptance.**

**This handover is a usable management map, not a certificate that the entire estate is operationally automated.**
