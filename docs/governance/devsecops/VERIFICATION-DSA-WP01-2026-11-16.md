# DSA-WP01 — Native main protection and negative merge-block verification

**Repository:** Motherpher/FFOS  
**Verification date:** 2026-11-16  
**Disposition:** `PARTIAL / HOLD` — native enforcement and negative CI-blocking verified; no independent Director release acceptance or positive-path evidence established  
**Ruleset:** [DevSecOps #27341443](https://github.com/Motherpher/FFOS/rules/27341443)  
**Tracked issue:** [#57](https://github.com/Motherpher/FFOS/issues/57)  
**Framework proposal:** [PR #56](https://github.com/Motherpher/FFOS/pull/56) — remains DRAFT, UNMERGED

## 1. Ruleset configuration verified live
GitHub's authenticated ruleset GET, effective rules-for-branch read and standard branch endpoint were independently re-read after configuration.

| Property | Exact observed state |
|---|---|
| `enforcement` | `active` |
| `conditions.ref_name.include` | `["~DEFAULT_BRANCH"]` (FFOS default branch = `main`) |
| `bypass_actors` | `[]`; `current_user_can_bypass: never` |
| `deletion` | Rule present |
| `non_fast_forward` | Rule present |
| `pull_request` | Rule present |
| `required_approving_review_count` | `0` — independent human review NOT enforced |
| `required_review_thread_resolution` | `true` |
| `required_status_checks` | The two FFOS-DSA-001 checks listed below |
| `strict_required_status_checks_policy` | `true` |
| `GET .../branches/main` | `protected: true` |
| Classic `branch.protection.enabled` | `false` (distinct endpoint: classic protection not in use) |

Required contexts:
1. `Validate FFOS-DSA-001 register (not runtime assurance)`
2. `Inspect PR added lines for credential indicators`

**Interpretation:** Native GitHub repository ruleset is active and applies to `main`. The legacy/classic branch protection subobject can remain disabled when the ruleset provides protection. The current connection cannot read the classic branch-protection admin endpoint (403); effective ruleset and branch reads are available and positively verified.

## 2. Controlled negative PR experiment
An isolated test branch `test/devsecops-negative-gate-20261116` was branched from the *proposal branch*, not from protected main. It intentionally set `docs/governance/devsecops/assurance-register-v1.json` to invalid `programme_state: ENFORCING`. This is a **test-only invalid value** and not an accepted state claim.

- Test PR: [#58 — TEST ONLY / DO NOT MERGE](https://github.com/Motherpher/FFOS/pull/58).
- Test head SHA: `cf3c7dc2e1ff607fbbfe73940c7b25880e4e8687`.
- Exact-head GitHub check-runs API:
  - `Validate FFOS-DSA-001 register (not runtime assurance)`: `completed / failure`.
  - `Inspect PR added lines for credential indicators`: `completed / success`.
- GitHub PR API readback: `mergeable_state: blocked`, `mergeable: true` (no code conflict, but merge *requirements* unsatisfied).
- [Test workflow run #43783037876](https://github.com/Motherpher/FFOS/actions/runs/43783037876) contained the expected failed validation job.
- PR #58 was **closed unmerged**. No main mutation, no merge attempted, no deployment/release.

**Verified result:** The required check failed and GitHub reported a blocked merge. This is credible negative gating evidence; it is not equivalent to attempting a prohibited merge API operation nor does it test every bypass/actor configuration.

## 3. Remaining limitations and acceptance
- `required_approving_review_count: 0`: no independent human review required by GitHub. Director acceptance remains a separate CDX/FFOS governance matter. Any transition to 1 approval requires an authorized reviewer who is not the PR author.
- The ruleset/CI was introduced before proposal PR #56 is merged. Prior successful runs attest to the exact test/proposal revisions, **not** post-merge baseline activation or independent production deployment.
- No independent negative *direct-push*, deletion or force-push experiment was executed. Their native rule types are verified by readback.
- Positive eligibility under the protected ruleset (fully compliant ready-for-review PR) not yet independently exercised. PR #56 remains a draft and must not be self-accepted.
- Combined commit status on PR #56 had separately reported `Vercel: failure` (blocked account). Vercel is **not** a mandatory context in this ruleset, but deployment/runtime acceptance remains unresolved.
- This is a repository release-boundary result, not a CDX `VERIFIED_RUNTIME_BOUND` claim for all agents or estate-wide `ENFORCING`.

## 4. Next mandated decision
1. Independent review of PR #56 and CDX/AMA compatibility.
2. Authorized Director decision regarding scoped adoption of the assurance candidate and reviewer policy.
3. If PR #56 is accepted, complete source-competent merge on protected `main` with exact-head checks; verify merged commit and positive gate behavior.
4. Separately review unresolved external deployment and broader security/runtime tests.
5. Only then consider promoting G6 assurance beyond `PARTIAL/HOLD`. Never equate `PASS` in a unit test with a human-approved production release.

## 5. Evidence limits and provenance
Source: connected authenticated GitHub REST and repository-app readbacks, 2026-11-16. The author of this record performed the test; **this is not an independent human audit**. Status and branch-setting observations must be rechecked after later ruleset changes.

No canonical CDX law, Pius sources, AMA normative contracts or production runtime were modified by this assessment.
