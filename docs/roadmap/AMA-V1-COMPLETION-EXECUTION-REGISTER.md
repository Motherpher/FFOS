# AMA v1.0 — completion execution register

Status: PLAN APPROVED FOR ENGINEERING PREPARATION ONLY; NOT A RELEASE DECISION.
Canonical development: M0–M7. This register groups remaining closure work into
**five execution runs**; it does not create new AMA milestones or rewrite M0–M7.

## Version rule
- v0.1.0 is the adopted foundation; v0.2.0-candidate remains an unreleased architecture candidate.
- **v1.0.0** is reserved for the user's definition of **fully developed AMA**.
- Do not edit the distribution manifest, contract identifiers or release gates to claim
  1.0.0 until all five runs pass, owner adoption is explicit and provenance is preserved.
- M7-A architecture baseline can pass earlier than comprehensive template completion;
  it does not by itself constitute completed AMA v1.0.
- Host CDX F8.7 and individual agent activation remain independent release gates.

## Exactly five closure runs (planning units, not individual test invocations)
| Run | Scope | Required terminal evidence |
| --- | --- | --- |
| AMA-FIN-01 | Requirement decisions and coverage triage | All 96 requirements individually disposed (covered, deferred with bounded rationale, or blocked); 31 previously unlinked reviewed; mapped M0–M7 evidence with source paths and no fabricated PASS |
| AMA-FIN-02 | Complete the normative reusable template | All 32 modules independently reviewed and implemented/verified or explicitly excluded from the accepted v1.0 scope; no unqualified 'complete' claim for partial modules; versioned package, schema, examples and compatibility migrations |
| AMA-FIN-03 | Full exact-head executable verification | Actual Python/Node/PostgreSQL and negative test logs, test totals, dependency/tool versions, checked commit, artifact hashes and clean checkout; approved external equivalent if GitHub Actions is blocked; no synthetic-only substitution for demanded runtime tests |
| AMA-FIN-04 | Independent M7-A technical audit | Compatibility, portability, effect/authority non-amplification, disabled module defaults, realm isolation, evidence lineage, residual risks; reviewer/source integrity and exact-head verification, with adverse findings resolved |
| AMA-FIN-05 | Director acceptance and governed 1.0 release | Director's explicit architecture adoption, compatible protected merge/tag, immutable v1.0 release evidence, no agent activation or implied live CDX F8.7 |

Run statuses: NOT_STARTED, IN_PROGRESS, BLOCKED, PASS, FAIL.
A run cannot be marked PASS solely because its instructions or scripts are committed.
Rework within a failed run may take multiple attempts; five runs is a **closure structure**,
not a guarantee of five CI executions or five chat messages.

## Baseline as inspected 2026-11-02
- Candidate PR: https://github.com/Motherpher/FFOS/pull/34 (still draft at inspection).
- 96 source requirements; 65 partial evidence links; 31 without direct links.
- All 32 supplementary template modules are marked PARTIAL_EXISTING_CONTRACTS.
- CI is blocked at hosted-runner access; externally executed exact-head test evidence absent.
- M7-A independent technical acceptance and owner adoption absent.
- GitHub-connected write privileges do not constitute authorization to self-accept.

## Stop conditions
Missing source/evidence, a failing mandatory check, modified worktree, policy/authority
ambiguity, non-reproducible provenance or unauthorized reviewer all produce HOLD.
No silent scope shrink to make all 32 modules appear complete.
