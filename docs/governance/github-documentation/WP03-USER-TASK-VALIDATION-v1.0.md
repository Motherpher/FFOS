# WP03 — Operator and Evaluator User-Task Validation Protocol v1.0

**ID:** FF-GH-WP03-D23 · **Status:** TEST PLAN / NOT INDEPENDENTLY RUN  
**Date:** 2026-11-03. Scope: FFOS operator guide and UDL Twin evaluator guide proposed on separate review branches.

## 1. Test design

Separate **source inspection** from **real user-task validation**. A clickable link and a plausible command do not establish a successful human/operator journey. Independent testing must be performed on the intended access level, by someone other than the documentation author where possible.

For each test, record: tester role, environment, date, repository/branch/commit, source version, beginning state, task, actual actions, expected outcome, observed outcome, time taken, blockers, evidence references and PASS/PARTIAL/FAIL/HOLD.

**Do not use real participant or client-sensitive data in testing.**

## 2. FFOS operator validation — test F-1

**User role:** Human Director or separately authorised operator.  
**Goal:** Locate the current estate work and correctly identify whether a candidate release is accepted.

1. From the FFOS root README, open the **FFOS Operator Manual**.
2. Find the **Motherpher Estate Portfolio** and open the private Director Decisions view.
3. Locate [AMA-FIN-05](https://github.com/Motherpher/FFOS/issues/41).
4. Find the relevant prerequisite [AMA-FIN-04](https://github.com/Motherpher/FFOS/issues/40) and [AMA-M7-A](https://github.com/Motherpher/FFOS/issues/42).
5. Distinguish GitHub status, technical tests and required Director approval.
6. Locate the [DG-02 precedent](https://github.com/Motherpher/FFOS/issues/43) and explain why its bounded acceptance does not approve AMA v1.0.
7. State the current next action without attempting a release or modifying work.

**Expected outcome:** Operator reports an **open dependent AMA release gate**, not a completed release or production agent. Project navigation and source references are comprehensible.

**Result:** NOT YET TESTED by independent operator; source and link inspection passed only.

## 3. FFOS operator validation — test F-2

**User role:** Technical maintainer.  
**Goal:** Diagnose and escalate an unverified CDX runtime binding.

1. Read FFOS Operator Manual §1 and §6–8.
2. Open [CDX runtime integration blocker](https://github.com/Hybrismannen/Conductellence-/issues/7).
3. Explain why `.cdx/anchor.json` or green CI alone does not establish runtime enforcement.
4. Identify the evidence required for a valid `VERIFIED_RUNTIME_BOUND` decision.
5. Create **no** runtime claim, mandate, permission or code change during testing.

**Expected outcome:** Maintainer lists policy-context pin, fail-closed pre-effect enforcement, SPETL evidence and allow/deny/policy-unavailable tests.

**Result:** NOT YET independently tested.

## 4. UDL evaluator validation — test U-1

**User role:** Evaluation practitioner with an authorised account and synthetic demonstration Project.  
**Goal:** Understand the expected build-to-evaluation path without misreading documentation as full runtime compliance.

1. From UDL repository README, open the evaluator guide and the actual application.
2. Confirm available navigation labels **Hem**, **Bygg**, **Kör**, **Utvärdera**, **Lär**, **Guide** against actual signed-in UI.
3. Identify the Project, DesignVersion and Run prerequisites described under **Bygg**.
4. Identify which operations really succeed in the test environment; capture error messages verbatim for failures.
5. Explain the difference between `BROWNFIELD_OPERATIONAL` and `COMPLIANT` using S29.
6. Do not claim a command ran merely because source code declares it.

**Expected outcome:** Clear differentiation between documented workflow and observed behaviour, with source and actual UI evidence.

**Result:** SOURCE ROUTE INSPECTED; authenticated/live UI test NOT YET RUN.

## 5. UDL evaluator validation — test U-2

**User role:** Evaluator or methodological reviewer.  
**Goal:** Interpret a dosage-gradient table and detect a privacy or causal-inference mistake.

1. Read [fictional exposure example](https://github.com/Hybrismannen/udl-twin/blob/main/docs/user-guide/EXAMPLE-EXPOSURE-TO-LEARNING.md) **after merge**, or its review-branch equivalent.
2. State what the exposure denominator means and why five missing paired observations are not zeros.
3. Distinguish association from causal effect, and identify plausible confounding/selection.
4. Assess whether small-N disclosure is determined after slicing, without assuming `SMALL_N=5` is canonical.
5. Explain how an authorised next DesignVersion differs from rewriting the original Run.

**Expected outcome:** User can articulate the methodological limits and source-linked safeguards in S15/S20.

**Result:** NOT YET tested with an independent reviewer.

## 6. Evidence and decision rules

| Check | PASS when | Current state |
|---|---|---|
| Markdown source links | All relative link target paths resolve in both review branches | PASS (30 distinct targets; GitHub GraphQL object verification 2026-11-03) |
| Public/private access | No private GitHub data is exposed in an unauthorised publication | SOURCE INSPECTION PASS; role-specific testing pending |
| Real interface steps | Tester can perform claimed actions in authenticated, identified environment | NOT TESTED |
| Methodological accuracy | Independent reviewer confirms S15/S20 claims and caveats | SOURCE CHECKED; independent review pending |
| Operator comprehension | User can complete F-1/F-2 and report actual status correctly | NOT TESTED |
| Reconciliation and upkeep | Changes are on source-owned reviewed branches with discrepancies reported | IMPLEMENTED AS PR PROCESS; merge pending |

### Output of independent test

Record one case per tester with PASS/PARTIAL/FAIL and exact evidence links. If any operator action reveals contradiction between guide and runtime, **HOLD** the relevant claim and repair the guide under source-controlled review.

**Do not convert NOT TESTED into PASS.** The Director may accept the bounded documentation pilot with explicit limits at DG-03 or require verification before acceptance; the acceptance scope must be explicit.
