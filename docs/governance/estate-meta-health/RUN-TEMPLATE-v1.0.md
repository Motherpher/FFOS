# Estate Meta-Health — Run Record Template v1.0

> Duplicate under `runs/YYYY-MM-DD-<scope>/REPORT.md` only when a real review is initiated. Do not assert a recurring check was run merely because the template exists.

| Header | Value |
| --- | --- |
| Run ID | EMH-YYYYMMDD-### |
| Initiator / human decision owner | |
| Mode | SNAPSHOT / LIGHT / FULL / INCIDENT |
| Date and timezone | |
| Trigger and purpose | |
| Scope (owners/repositories/products) | |
| Installation/access coverage and exclusions | |
| Prior baseline/reference | |
| Source/head refs as-of | |
| Applicable governance | |
| Evidence methods and limitations | |

## One-paragraph diagnosis

What changed in the **forms** (institutions, sources, policies, systems, access) and **flows** (user tasks, data, decisions, implementation, publication, recovery)? What is the meaningful consequence?

## Evidence ledger

| ID | Dimension H1–H9 | Source ref + observed time | Evidence state (OBSERVED / SOURCE-REPORTED / DERIVED / PROPOSED / UNKNOWN) | What is different? | User/operational impact | Severity | Owner / action / decision gate | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| EMH-F001 | | | | | | | | |

## Actual task tests

| Actor / access role | Task | Tested environment + ref | Outcome PASS / PARTIAL / HOLD / NOT_TESTED | Evidence / next verification |
| --- | --- | --- | --- | --- |
| | | | | |

## Findings and required routing

Describe any CRITICAL/HIGH finding in prose with source links, no sensitive value. **First look for an existing issue/WP.** If there is none, propose a narrowly scoped source-owned Issue with owner, proof and safe next action.

## Decision record

- **Health report disposition (not policy authority):** PASS_WITH_LIMITATIONS / ACTION_REQUIRED / HOLD / INCOMPLETE_ACCESS
- **Human decision actually received:** (source URI or NOT_RECEIVED)
- **Changes actually performed:** (exact PR/commit/provider receipt or NONE)
- **Explicit non-effects and forbidden claims:**
- **Unverified / inaccessible:**
- **Next review:** conditional event or Director-selected date (not an automation)
- **Learning:** what simplified the process, what created unnecessary friction, what should change next time?

## Exit checks

- [ ] Source refs, as-of date and audience/privacy verified.
- [ ] No generated fake runtime/Wiki/Drive/acceptance claims.
- [ ] Historical baseline preserved.
- [ ] Findings routed to canonical owner with explicit authority.
- [ ] Human review distinguished from GitHub CI/Project/status.
- [ ] No unnecessary new repo/Project/WP/agent/scheduler.
