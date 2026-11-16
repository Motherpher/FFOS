# FFOS-DSA-001 — Release-readiness and Director acceptance packet

**Status:** TECHNICAL GATE EVIDENCE COLLECTED / INDEPENDENT REVIEW REQUIRED / DIRECTOR ACCEPTANCE NOT RECORDED / NOT MERGED  
**Observation date:** 2026-11-16  
**Repository:** `Motherpher/FFOS`  
**Candidate:** [Draft PR #56](https://github.com/Motherpher/FFOS/pull/56)  
**Decision issue:** [DSA-WP05 #60](https://github.com/Motherpher/FFOS/issues/60)  
**P0 enforcement:** [DSA-WP01 #57](https://github.com/Motherpher/FFOS/issues/57)

## Executive review conclusion

The FFOS DevSecOps Assurance Framework 1.0 has an implemented **candidate** register, bounded security-indicator scanner and source-backed governance contract. GitHub native ruleset protection now targets `main` and the negative required-check experiment demonstrated a blocked merge. A separate positive test showed both specified CI jobs passing. **That does not amount to independent review, Director approval, a production release, or complete G6 assurance.**

The framework overlays existing CDX/AMA/FFOS/Pius authority; it cannot create a new CDX decision, agent authority, mandatory deployment, or permission to self-accept. CDX's `ALLOW`/restrictive effects and AMA's lifecycle remain separate from DSA gate outcomes.

## 1. Source-pinned technical evidence

| Evidence item | Source / observation | Scope and limitation |
|---|---|---|
| Native protected main | [Ruleset 27341443](https://github.com/Motherpher/FFOS/rules/27341443): active; target `~DEFAULT_BRANCH`; deletion/non-fast-forward blocking; PR requirement; no bypass actors | Protection configuration read-back, not a universal attack simulation |
| Required checks | `Validate FFOS-DSA-001 register (not runtime assurance)` and `Inspect PR added lines for credential indicators`, strict up-to-date policy | Required-check identity verified; workflows run with code from candidate PR, so reviewer must examine modifications to validator/workflow themselves |
| Negative check | [PR #58](https://github.com/Motherpher/FFOS/pull/58), head `cf3c7dc2e1ff607fbbfe73940c7b25880e4e8687` → validator FAILED in [run 43783037876](https://github.com/Motherpher/FFOS/actions/runs/43783037876), GitHub `mergeable_state=blocked` | PR closed unmerged; no attempted forbidden merge, direct push, force-push or deletion |
| Positive check | [PR #59](https://github.com/Motherpher/FFOS/pull/59), head `052740ac11cfd66e1f49a9c77445a4c01482de65` → both required job check-runs completed SUCCESS in [run 43783660932](https://github.com/Motherpher/FFOS/actions/runs/43783660932) | Overall `mergeable_state=unstable` while a separate Vercel status was failing (causation not independently established); positive check success is **not** verified merge eligibility. PR closed unmerged |
| Current framework PR | [PR #56](https://github.com/Motherpher/FFOS/pull/56), last reviewed candidate head `2c1428f97de17f318b9d9e104f2d2ab787b7fda0`, [CI run 43783216591](https://github.com/Motherpher/FFOS/actions/runs/43783216591) | Required jobs pass at the reviewed revision; any subsequent change requires a new exact-head run |
| Independent GitHub reviews | GitHub reviews endpoint for PR #56 returned **no reviews** at inspection | Not a human acceptance record; cannot be manufactured by CI |
| Native reviewer rule | `required_approving_review_count=0` | Material outstanding governance risk; no mandatory independent GitHub approver |
| Deployment | Combined status `Vercel: failure`, target reports blocked deployment account | External status is **not** an enforced required context in DSA ruleset, but cannot be described as deployed or operational |

## 2. Security/assurance risks to be decided

**R1 — Mutable checks under unreviewed PRs (HIGH; HOLD).** Because the checks execute code from a PR, a contributor with PR/write access could modify the workflow or validator while retaining the required job names. Without a required qualified reviewer or a separate protected trusted execution surface, passing those checks alone cannot establish tamper-resistant review independence. Require at least one source-competent non-author reviewer before claims of G6 complete; if adding GitHub required reviews, first resolve reviewer availability. Do not silently set a requirement that locks the only maintainer out.

**R2 — Credential scanner is narrowly scoped (MEDIUM; tracked).** The scanner inspects added PR text for a fixed set of high-confidence indicators. It does not inspect binary content, history, encoded/fragmented tokens, all secret classes or production credentials. A PASS means only no configured indicator detected within tested additions.

**R3 — External deployment failure (MEDIUM; separate gate).** Vercel continues to report failure independent of the two ruleset-required checks. Investigate its continuing relevance and owner/configuration; do not make it mandatory until resolved, and do not claim production deployment.

**R4 — Approval/waiver authority (HIGH; HOLD).** A passing workflow, branch-protection readback, Director's generic implementation instruction, code author identity or draft PR state cannot substitute for explicit adoption/release authorization. Preserve `NOT_DECIDED`/`HOLD` rather than machine-produce acceptance.

**R5 — Positive gate evidence is scoped (MEDIUM; tracked).** Both mandatory checks passed on positive PR #59, but GitHub reported `unstable` overall and no merge was attempted. Need an authorized, approved and exact-head merge of the accepted candidate plus main readback to establish end-to-end positive route.

## 3. Acceptance record — intentionally unsigned

| Field | Required source / authority | Recorded state |
|---|---|---|
| Candidate scope | PR #56 and exact reviewed SHA | Defined, pending final review |
| Independent qualified reviewer | Named person and native GitHub review | **NOT RECORDED** |
| Reviewer findings and recommendation | Evidence-backed review | **NOT RECORDED** |
| Director framework decision | Explicit `ACCEPT`, `HOLD` or `REJECT`, source reference, scope and residual risk | **HOLD / NOT RECORDED AS AN ACCEPTANCE** |
| Rule requiring independent review | Native ruleset configuration | Currently **0 approvals** |
| Candidate release/merge permission | Director decision + required controls | **NOT AUTHORIZED** |
| Runtime production acceptance | Actual deployment and effect-boundary evidence | **NOT VERIFIED** |

No sign-off or approval is inferred from this document. A future decision must carry a source link, timestamp, principal identity and *exact PR head/reviewed revision*.

## 4. Review-to-release sequence

1. Appoint a qualified, authorized reviewer other than the PR author. Determine whether the repository needs an additional collaborator and enable appropriate review access.
2. Independently review PR #56 files, workflows, scanner, validator, source provenance, CDX/AMA boundaries and known R1–R5 risks.
3. The Human Director makes an explicit accept/hold/reject disposition for the framework as a bounded *governance candidate*, not for full operational or production certification. A separate decision covers required-review rule configuration.
4. If accepted, implement any required code changes **on the PR branch**, rerun exact-head CI and confirm `main` rule freshness; maintain identity of tested artifacts.
5. Mark the PR ready for review; receive a native GitHub review and resolve discussion. Merge only when GitHub allows and mandate/review/Director gates are satisfied.
6. Read back the merged main SHA, ruleset application, required check results, code/artifact integrity and post-merge workflows. Keep acceptance record separate from production activation.
7. Advance the assurance register only to the level independently evidenced. Perform separate deployment, access-control and runtime acceptance before any G7 operational assertion.

## 5. Crosswalk and provenance

The initial dated baseline is retained at `BASELINE-2026-11-16.md` as historical evidence of unprotected state at the time it was first inspected. [WP01 verification](VERIFICATION-DSA-WP01-2026-11-16.md) documents its subsequent remediation and negative test. This record captures subsequent positive-path evidence. These artifacts are intentionally **not** rewritten as if the final state had existed at the start.

**Decision right now: HOLD on adoption and G6 completion; technical ruleset and bounded CI checks verified.**

**External informative frameworks:** NIST SSDF SP 800-218 (https://doi.org/10.6028/NIST.SP.800-218); OWASP SAMM (https://owaspsamm.org/model/); SLSA (https://slsa.dev/). They inform control design but are not themselves adopted internal law. Accessed 16 November 2026.
