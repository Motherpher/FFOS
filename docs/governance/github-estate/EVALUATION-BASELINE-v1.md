# WP04 D30 — Estate Operational Measurement and Evaluation Baseline

**Date:** 2026-11-03 · **Status:** SOURCE-BACKED BASELINE, not proof of improvement · **Owner:** FFOS estate coordination  
**Authoritative inputs:** [31-repo adoption register](data/estate-adoption-register-v1.json); [22-item Projects V2 snapshot](data/portfolio-snapshot-2026-11-03.json); [DG-02 source acceptance](https://github.com/Motherpher/FFOS/issues/43); [DG-03 source acceptance](https://github.com/Motherpher/FFOS/issues/45).

## 1. Measurement doctrine

Always state the population, grain, source, capture date, definition and failure modes. GitHub issue counts are not work completed, and a Project Work Stage cannot prove runtime functionality. **This programme has no prior measured time/cost baseline and therefore no supported efficiency or savings claim.**

## 2. Observed point-in-time baseline

| Measure | Baseline | Definition / limitation |
|---|---:|---|
| Discoverable accessible repositories | **31** | 18 Hybrismannen + 13 Motherpher, selected app installation coverage |
| Register coverage of accessible scope | **31/31 (100%)** | Each accessible repo has Tier A/B/C/D and a proposed adoption treatment; **not** locally accepted rollout |
| Proposed Tier A/B/C/D | **4 / 13 / 7 / 7** | Coordination classifications, not system maturity |
| Repository visibility | **17 private / 14 public** | GitHub REST metadata at date; can change |
| Linked Project items | **22** | 22 existing source Issues, each linked to private Project; not a complete backlog |
| Linked source repositories | **12** | Number of distinct owner/repo names among 22 Project items |
| Source Issue state OPEN | **22/22** | Native Issue state in captured Project; no assumption about acceptance |
| Project Work Stage Blocked | **7** | Current operational projections, not distinct external failures |
| Project Work Stage Intake | **11** | New/selective intake plus existing items |
| Project Work Stage Verification | **2** | Operational queue, including WP04 after technical candidate verification |
| Project Work Stage Accepted | **2** | DG-02 and DG-03 source-supported decision projections |
| Project Work Stage Active | **0** | No items at Active in refreshed snapshot; this is an observed count, not a fabricated zero |
| Authority Gate Approved (Source Recorded) | **2** | DG-02/DG-03; source decision links must verify |
| Authority Gate Require Human | **2** | Project requests needing source-competent decision |
| Authority Gate Pending Verification | **17** | Work with evidence not yet accepted |
| Authority Gate Not Required | **1** | Source-level projection, not blanket waiver |
| Auto-close issue | **OFF** | GitHub Projects workflow flag in source snapshot |
| WP03 independent user tests | **NOT MEASURED AS COMPLETE** | F-1/F-2/U-1/U-2 remain untested, not 0% success |
| Cross-owner recurring sync | **NOT CONNECTED** | Manual authorised intake and offline reconciliation only |
| Incident rate / time-to-resolution | **NOT MEASURED** | No historical comparable event dataset |
| Operator effort / status-reconciliation time | **NOT MEASURED** | Must run controlled before/after task tests |
| CI / deployment readiness | **NOT A PORTFOLIO METRIC** | Source repo and actual deployment evidence required |

## 3. Measures and denominators for future monitoring

### A. Scope and adoption

`Registration coverage = valid registered accessible repos / all accessible repos independently enumerated at capture date`. This is a scope-management KPI, not proof of owner acceptance.

`Enabled feature share = repositories with verified feature flag on / checked repositories`. Distinguish feature **enabled** from actually **used**.

`Project-linked repo reach = distinct source repositories represented in Project / accessible repos`. At this snapshot: 12/31; not a programme performance target and not necessarily desirable to reach 100%.

### B. Traceability and governance

`Source URL integrity = unique valid native Issue URLs / represented source items`. Must test uniqueness and exact ownership.

`Accepted work with decision evidence = items whose Work Stage is Accepted with an independently verifiable source decision / items marked Accepted`. Source decision must be re-read, not inferred from a URL string alone.

`Source/project divergence = verified contradictory projections / checked items`. Require a reconciliation sample and current original Issue.

`Permission boundary violations = confirmed privacy/authority exposure events`. Do not present "0" unless a complete relevant inspection was carried out.

### C. Technical reliability and operational benefit

`Offline reconciliation reliability = successful complete deterministic runs / attempted runs on defined inputs`. Report test cases and limitations.

`Live sync success = eligible committed read/projection events that succeeded / eligible attempted events`. **NOT MEASURED** until live integration with delivery logs exists.

`Blocker recognition time`, `decision navigation time`, `manual reporting time`: run comparable operator tasks, keep scenarios and assessors consistent; record median and variation. Do not assert time savings without both baseline and follow-up.

`Template maintenance cost`: reviewed PRs/changes and operator time; avoid optimizing raw administrative event counts.

`Documentation task success`: pass/fail against published F-1/F-2/U-1/U-2 scripts under authorised user conditions; currently pending.

### D. Programme outcome

The principal outcome is **fewer unsupported lifecycle claims and faster inspectable work/decision routing** without compromising domain authority. A visually compelling dashboard, many Project cards or a high number of issues closed are not success metrics in themselves.

## 4. Evidence and freshness

- Source captures have the explicit date 2026-11-03 and each Project Issue carries `source_updated_at`.
- Do not equate an old snapshot with fresh GitHub state.
- Recreate the snapshot with an authenticated read and check scope, then run `tools/estate/reconcile.py`. Do not fabricate missing attempts or time series.
- Data may include private repo titles/metadata: keep the snapshot and report in the private FFOS repository.

## 5. Evaluation study before DG-04

At minimum:
1. Test two authorised operators performing F-1/F-2 equivalent navigation, capturing their actual task outcomes and timestamps.
2. Reconcile native state of a defined subset of cross-owner sources and their Project status.
3. Exercise repeated-event/idempotency in a controlled test without source modification.
4. Validate privacy/access under a nonprivileged GitHub identity.
5. Preserve written independent technical assurance and Director decision.
6. Compare against an earlier measured baseline before claiming efficiency gain.

**Conclusion:** Quantitative baseline exists; **effectiveness and value-added are NOT YET MEASURED**.
