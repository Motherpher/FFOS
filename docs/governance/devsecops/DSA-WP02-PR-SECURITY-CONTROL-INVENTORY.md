# DSA-WP02 — PR-level security control inventory and interim check

**Status:** CANDIDATE / scoped defense in depth; not approved as a required merge gate  
**Date:** 2026-11-16  
**Owner system:** FFOS, governed by CDX; Human Director retains final authority  
**Tracking:** [FFOS PR #56](https://github.com/Motherpher/FFOS/pull/56), [P0 branch protection issue #57](https://github.com/Motherpher/FFOS/issues/57)

## What was actually added
- `tools/devsecops/scan_pr_diff.py` evaluates only **added text lines** in a specified Git diff, using a bounded set of high-confidence credential indicators. The report contains **paths, new-line locations and indicator names only**; secret values are neither printed nor placed in the machine-readable report.
- `.github/workflows/devsecops-assurance.yml` runs its register checks and this credential-indicator check **on every pull request**, with `contents: read`, a full-SHA checkout action, disabled persisted credentials, no service tokens and no production writes. It uploads a redacted report.
- Scanner self-tests include positive and negative cases and confirm detection values are absent from its JSON report.
- `NO_HIGH_CONFIDENCE_INDICATOR_DETECTED` is **not equivalent** to “no secrets”, a general SAST pass, a historical-credential scan or a secured release.

## Scope and initial observed coverage
| Surface / existing CI | Observed evidence | Limitation / next requirement |
|---|---|---|
| Agent Stable Suite | `agent-stable-suite.yml` runs fleet contract + candidate tests on scoped paths | No top-level `permissions` declaration seen; actions include moving version tags; no whole-repo scan claim |
| AMA conformance | `ama-conformance.yml` tests schemas, security/denial fixtures and PostgreSQL integration | Some triggers path-scoped; successful CI does not certify production effects |
| AMA security regressions | `ama-security-regression.yml` runs static denial tests | Static only; separate from runtime/CDX |
| CDX binding | `cdx-binding-audit.yml` contains actual local HTTP allow/deny/unavailable-path tests | Not proof all FFOS effects have live mediation |
| CDX diagnostics | `cdx-runtime-diagnostics.yml` checks static/build/integration candidates | CI is distinct from deployment |
| Household Family | `household-family-ci.yml`, `household-family-security.yml`: build, tests, `npm audit --audit-level=high` | Focused on Household module; not broad dependency inventory |
| GitHub Estate | `estate-snapshot-audit.yml` validates bounded committed snapshots | Live permission, synchronization and recovery validation remains separate |
| FFOS-DSA-001 | `devsecops-assurance.yml` adds always-on candidate PR structure and credential-indicator checks | Required status enforcement is absent until native branch protection is configured |

These are workflow **source observations**, not a new independent test of every historical run.

## Detection design and security limitations
The scanner checks *indicator classes* for PEM private-key headers, GitHub tokens, OpenAI keys, Slack tokens and AWS access-key IDs. It reports an indicator only on lines introduced by the PR comparison.

**Known limitations:**
- Binary content, prior commits, deleted/unchanged lines, encoded or split secrets, token variants not in the indicators, leaks in artifacts/logs, runtime configuration and external vendor credentials are **not covered**.
- An AWS access-key ID indicator alone does not demonstrate exposure of a complete usable key pair; findings require triage.
- Even redacted findings can contain sensitive filenames; the report stays in a private repository and has short retention.
- Do not build a universal claim of “SAST PASS”, “secrets clean”, “supply-chain secure” or “production ready” from this one check.
- An unprotected branch can bypass this check regardless of whether the workflow runs green.

## Prioritized next checks
1. **P0:** owner-configured required checks/review and negative merge test; leave G6 HOLD until verified.
2. **P1:** run an established maintained secret-scanning solution over full history/current tree where appropriate, plus credential-rotation procedure for true positives; select product/licensing and access scope explicitly.
3. **P1:** verify dependency vulnerability control on all deployable packages with path-appropriate lockfiles and ownership; maintain an SBOM/provenance plan and source-to-build linkage.
4. **P1:** perform a GitHub Actions security hardening review: least-privilege explicit permissions, immutable action references, minimal trigger scopes and no trusted-secret execution on untrusted PR code. Track inherited exceptions.
5. **P1:** demonstrate authorized release deny/unavailable/recovery and independent receipt validation at actual effect boundaries.
6. **P2:** operational metrics by complete scope and observation period; no portfolio maturity score from partial coverage.

## Acceptance and evidence law
- A scanner unit test success may support **CI implementation evidence** for a small candidate control; it does not promote G5 or G6 to PASS.
- Merge enforcement and branch protection require authenticated owner read-back and a negative gate test.
- Security exceptions, waivers, risk acceptance and deployment authorization remain separate Director/CDX-governed decisions.

## References
- NIST (2022) *Secure Software Development Framework (SSDF) SP 800-218*. Available at: https://doi.org/10.6028/NIST.SP.800-218 (Accessed: 16 November 2026).
- OWASP (n.d.) *SAMM*. Available at: https://owaspsamm.org/model/ (Accessed: 16 November 2026).
- GitHub (n.d.) *Managing protected branches*. Available at: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches (Accessed: 16 November 2026).
