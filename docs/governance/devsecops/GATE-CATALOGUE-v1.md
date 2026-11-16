# FFOS-DSA-001 — Nine-gate assurance catalogue (candidate)

**Status:** Proposed control contract, not automatic authority or configured branch protection.  
**Principle:** Fail closed on consequential effects; retain evidence for blocked attempts. Evidence must bind to exact source/head, version, actor, evaluation time and applicable policy where possible.

| Gate | Owner and mandatory question | Minimum release/exit evidence | Negative / blocked condition |
|---|---|---|---|
| **G0 Authority** | Human Director / CDX host: who authorizes this specific scope/effect? | Mandate and source Issue/WP; principal; applicable CDX anchor, policy and effect classification; explicit authority boundary | No mandate; self-authorization; stale authorization; unknown effect ceiling |
| **G1 Specification** | Domain owner: what must change and why? | Canonical source/version, acceptance criteria, dependencies, explicit non-goals and affected surfaces | Orphan work request; wrong repository authority; unresolved contradictory requirements |
| **G2 Architecture** | Domain architect and security reviewer: does it preserve contracts? | Architecture impact, trust boundaries, threat model proportional to risk, migration/reversal plan | Unreviewed privilege/effect expansion; cross-domain canonical overwrite; unowned interface |
| **G3 Implementation** | Implementing role / maintainer: is the change bounded and reviewable? | Scoped PR diff, reproducible dependency lock, checks for secret exposure, least-privilege permissions, unit tests and source provenance | Direct change without the applicable authorization; leaked secret; untraceable generated code |
| **G4 Verification** | Independent verifier: do requirements and negative cases pass? | Exact-head CI report; integration/negative fixture results; test coverage meaningful to scope, known limitations | Failed/skipped mandatory check; unreviewed change after test; agent self-verification treated as independence |
| **G5 Security** | Security specialist/reviewer: are material security risks controlled? | Dependency and secret scanning; SAST/threat review where applicable; severity disposition; no unresolved release-blocking findings | High/critical unresolved findings without authorized risk handling; provenance or scanner absent but claimed PASS |
| **G6 Release** | Human Director and maintainer: may this revision be merged/released? | Native branch/required-check enforcement proven; exact-head review/approval; version and digest; rollback; acceptance decision | Unprotected merge route; missing required reviewer; waiver interpreted as PASS; draft PR treated as released |
| **G7 Runtime** | Runtime owner and independent observer: does the real bounded effect work? | Bound deployment/environment/commit; authenticated effect tests (ALLOW/DENY/unavailable as applicable); logs/receipts; monitoring and incident response | Documentation-only binding; synthetic test mislabelled production; missing fail-closed negative cases |
| **G8 Audit & Learning** | Custody/audit owner: can operation be proved and improved? | Immutable/traceable decision, test and effect evidence; retention; incident record; recovery rehearsal; post-release verification and learning action | Evidence unavailable, mixed versions, unverifiable claim, untested recovery, silent drift |

## Integration mapping, not replacement
- G0 and G6: CDX authority/effect boundaries and Director decision; CDX runtime `ALLOW`, `DENY`, `SECURITY_STOP`, etc. remain distinct.
- G1–G4: existing FFOS AMA release gates (`SPECIFIED`, `SCHEMA_VALID`, `STATIC_TESTED`, `INTEGRATION_TESTED`), as applicable.
- G5: OWASP SAMM and NIST SSDF evidence categories; **no claim of certification**.
- G6: Native GitHub status-check enforcement must be observed independently; merely defining a workflow is not enough.
- G7: AMA `RUNTIME_BOUND` and CDX consumer verification, with actual effect mediation; not inferred from `.cdx/anchor.json`.
- G8: CDX SPETL/evidence custody and FFOS Estate measured learning; not inferred from an uploaded artifact.

## Minimal assessment record
Each gate assessment MUST have: `gate_id`, `evidence_state`, `assurance_disposition`, `observed_at`, `source_revision`, `evidence_refs`, `verifier`, `limitations`. For a PASS, at least one concrete source/reference and named independent verifier are mandatory, with test/acceptance scope stated. For a WAIVED disposition, the required human decision record and risk are mandatory. The template starts with no PASS cases.

## Required sequence
1. Resolve G0/G1 before creating consequential effects.
2. G2/G3 constrain the allowed implementation. A gate may HOLD without erasing completed lower-scope evidence.
3. G4/G5 pass before G6 releases unless a separate, explicitly permitted and evidenced exception exists; constitutional/security stops cannot be waived through this overlay.
4. G7 is a **different axis** from G6: release does not imply runtime binding.
5. G8 must preserve failures, holds, waivers and incidents without rewriting historical outcomes.

## P0 hardening candidates
- Independently verify and implement an FFOS main-branch protection path with required status checks, human review and no uncontrolled bypass, subject to platform plan/permissions and Director choice.
- Require exact-head CI check results before merge; path-scoped CI omissions must be understood rather than assumed PASS.
- Confirm vulnerability scan, secret scanning, pinning/provenance and post-merge artefact evidence for each relevant surface.
- Test runtime DENY and unavailable-policy paths, rollback and recovery under authorized conditions.
- Establish independent audit sign-off and source/evidence retention without introducing a new agent or overriding CDX.

**References:** See `README.md` for cited primary frameworks and access dates.
