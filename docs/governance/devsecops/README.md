# FFOS DevSecOps Assurance Framework — candidate v1.0

**Framework ID:** FFOS-DSA-001  
**Status:** PROPOSAL / NOT ACCEPTED / NOT AN OPERATIONAL ENFORCEMENT CLAIM  
**Observation baseline:** 2026-11-16  
**Canonical implementation surface:** Motherpher/FFOS  
**Authority:** Human Director; CDX constitutional and runtime governance; FFOS owns its local enforcement points.  
**Mandate:** Establish an inspectable, security-aware software delivery assurance process without creating a new constitutional authority, agent or automatic right to release.

## Current assurance status (observed 2026-11-16)

**Native GitHub enforcement is now verified on FFOS `main`; framework adoption is not.** Ruleset [#27341443](https://github.com/Motherpher/FFOS/rules/27341443) targets the default branch, requires two DevSecOps CI checks, and blocked an intentionally noncompliant PR [#58](https://github.com/Motherpher/FFOS/pull/58). Both checks also passed on a compliant nonproduction PR [#59](https://github.com/Motherpher/FFOS/pull/59), which remained unmerged. The current overall PR mergeability was not verified as clean due to a separate unstable status. These results verify limited enforcement behaviour, **not** independent authorization or production acceptance.

Human GitHub reviews are not presently mandatory (`required_approving_review_count=0`); [DSA-WP05 #60](https://github.com/Motherpher/FFOS/issues/60) requires an independent qualified reviewer and an explicit Director decision before adoption. Current assessment remains `G6: PARTIAL / HOLD`. See [DSA-WP01 verification](VERIFICATION-DSA-WP01-2026-11-16.md) and [release-readiness packet](DSA-WP05-RELEASE-READINESS-2026-11-16.md). The initial historical baseline is intentionally preserved separately.

## Executive purpose
This framework overlays assurance on the existing AMA, CDX, Household Family, FFOS Estate and Pius development systems. It **does not replace** CDX's seven runtime decisions, AMA's lifecycle and release states, Pius canonical protocol/version history, or repository-specific acceptance processes. It neither authorizes software changes nor grants an agent additional effects.

The earlier DevSecOps infinity loop (Plan → Develop → Build → Test → Release → Deploy → Operate → Observe) is a useful *lifecycle illustration*, not evidence of security maturity. Here, security requirements and independent verification attach to each stage through explicit gates G0–G8. No work package is complete just because code exists.

**Execution chain:** authorized request → source scope → architecture/threat review → bounded implementation → exact-head test → security assurance → human-governed release → runtime verification → preserved audit and learning evidence.

## Source-of-authority precedence
1. Applicable external law and rights and explicit Human Director mandate (where relevant).
2. CDX current adopted constitutional law, policy, registry, local anchor and runtime decision contract.
3. Repository/domain canonical owners and accepted AMA/FFOS contracts.
4. This local FFOS assurance overlay, which may **tighten evidence requirements**, but may not rewrite higher-level authority, establish new effect permission or supersede CDX.
5. External methodologies used as informative practice mappings, **not adopted law**: OWASP SAMM, NIST SSDF, SLSA and GitHub protected branch documentation.

Pius Codex 5 is a historical source with HARP (Appendix O) and bounded agent doctrine (Appendix M). Pius 6 is under its own DevOps programme in `Hybrismannen/pius-universe`; this framework must not proclaim Pius 6 released or replace accepted Pius-source lineage. CDX 2.0 is a separate unreleased work programme. No internal mandate can be inferred from either programme's draft artifacts.

## Assurance and decision separation
- **Observation** means a source file, GitHub configuration, run or runtime trace was actually inspected, with time and immutable revision where available.
- **Evidence state**: `NOT_ASSESSED`, `PARTIAL`, `VERIFIED`, `FAILED` or `HOLD`. A file existing is not VERIFIED behaviour.
- **Local assurance disposition**: `NOT_DECIDED`, `PASS`, `FAIL`, `HOLD` or `WAIVED`. This is an *assurance* classification, **not** a CDX runtime authorization result or an AMA lifecycle transition.
- **Director decision and independent verification** are separate records. `WAIVED` requires a source reference, human authority, justification, scope, expiry/review point and residual risk; it does not turn a failed test into PASS.
- Missing or stale evidence yields NOT_ASSESSED/HOLD, never an optimistic PASS. Runtime success requires an actual external/local effect-boundary test at the correct revision.

## Gate contract
See [GATE-CATALOGUE-v1.md](GATE-CATALOGUE-v1.md) for G0–G8 criteria, owners, exit gates and negative cases. `assurance-register-v1.json` is a **candidate assessment register**, not an accepted policy engine. The local CI validator checks register structure and forbids unsupported PASS assertions; it does not attest to branch protection, vulnerability absence, external runtime reachability or safe production deployment.

## Proposed maturity scale (not an OWASP SAMM score)
- **M0 — Ad hoc:** controls and evidence inconsistent.
- **M1 — Defined:** named responsibilities, gate definitions and reproducible acceptance criteria.
- **M2 — Enforced:** actual branch, CI, security and authorization gates reject noncompliance; negative enforcement tests proven.
- **M3 — Independently verified:** exact-head QA, fail-closed runtime and recovery tested; independent verifier and human acceptance recorded.
- **M4 — Adaptive:** measurable incident, drift, effectiveness and learning loops demonstrably improve the system over time.

Assess **each repository and control separately**, at a declared snapshot date. Never assign a portfolio-wide maturity level from a single strong component. No maturity level proves CDX estate-wide `ENFORCING`.

## Non-goals and prohibited automatic transitions
- No modification of CDX law, release or canonical source; no alteration of AMA master definitions or Pius evolution.
- No automatically expanded Household Family mandate; Janitor, Handyman and Verifier remain internal roles.
- No auto-merge, auto-release, GitHub permission escalation, policy waiver or production activation.
- No conflation of valid JSON, successful CI, an artifact upload, a configured anchor or a human-authored description with independent runtime assurance.
- No publication of private estate snapshots, secrets, personal data or raw credential-bearing logs.

## Admission and review
This is a reviewed **proposal branch** only. Promoting it to operating standard requires a human source decision, review of compatibility with CDX/AMA and CI verification. Independently test negative enforcement, recovery and permissions before promoting any proposed gate to a mandatory repository rule.

## Related local source
- `README.md` — FFOS scope, agent stable and runtime/production distinctions.
- `docs/roadmap/AMA-RELEASE-GATES.md` — existing AMA lifecycle gates, **not superseded**.
- `docs/governance/github-estate/VERIFICATION-DG04-v1.md` — bounded WP04 assurance and unresolved requirements.
- `docs/governance/github-estate/EVALUATION-BASELINE-v1.md` — dated scope/measurement baseline, not maturity score.
- `.github/workflows/` — implemented CI definitions, not proof that required statuses are protected.
- `https://github.com/Hybrismannen/Conductellence-` — canonical CDX source.

## References (HARP / internal proposal)
- National Institute of Standards and Technology (NIST) (2022) *Secure Software Development Framework (SSDF), SP 800-218*. Available at: https://doi.org/10.6028/NIST.SP.800-218 (Accessed: 16 November 2026).
- OWASP (n.d.) *OWASP SAMM Model*. Available at: https://owaspsamm.org/model/ (Accessed: 16 November 2026).
- SLSA (n.d.) *SLSA Specification v1.2*. Available at: https://slsa.dev/spec/v1.2/ (Accessed: 16 November 2026).
- GitHub (n.d.) *About protected branches*. Available at: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches (Accessed: 16 November 2026).
- FFOS (2026) *FFOS repository README, AMA release gates, and FF-GH-WP04 documentation*, observed at `main@54d4fafcfc4577c2299243346d7dd17e0c0ffef9`, private canonical repository (Accessed: 16 November 2026).
