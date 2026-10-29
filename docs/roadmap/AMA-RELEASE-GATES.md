# AMA M0 — Versioned Release and Acceptance Gates

**State:** Proposed M0 release-gate definitions. This document is NOT evidence that runtime integration or human acceptance is complete.

## Gate progression

| Gate | Required evidence | Independent decision | Status at M0 |
|---|---|---|---|
| `SPECIFIED` | Source-to-requirement trace, normative classification, owner, clear scope, compatibility report, security review | Human acceptance of requirements | CANDIDATE; pending |
| `SCHEMA_VALID` | Machine-readable manifest and referenced schemas, semantic cross-object checks and invalid fixtures | Design reviewer | NOT TESTED for vNext |
| `STATIC_TESTED` | Positive and denial conformance, policy scope, provenance, regression and template purity | Independent conformance verifier | Baseline v0.1 CI only; vNext NOT TESTED |
| `INTEGRATION_TESTED` | Real registry/durable runtime integration, simulated effect uncertainty, adversarial negative paths | Independent integration reviewer | PostgreSQL baseline CI only; vNext NOT TESTED |
| `RUNTIME_BOUND` | Verified identity/policy adapters, trustworthy control selection, pinned release, authenticated decisions, revocation and receipts | Independent host security reviewer | NOT VERIFIED |
| `INDEPENDENTLY_ACCEPTED` | Verified C4/C5 end-to-end evidence, mandate, production readiness, recovery, actual authorizer approval | Authorized human principal | NOT ACCEPTED |

All gates are ordered. A later gate cannot compensate for failure of an earlier mandatory gate.

## Evidence integrity

Every gate records subject, exact schema/agent/policy versions, source and build digests, evaluation profile, test evidence, failure/waiver state, verifier and decision reference. Mark unavailable evidence UNKNOWN rather than PASS. Human review and policy approval cannot be inferred from an agent response.

`ALLOW_WITH_CONTROLS` requires verified obligations. `REQUIRE_HUMAN`, `DENY`, `QUARANTINE`, `SECURITY_STOP` and `CONSTITUTIONAL_STOP` remain restrictive according to bound policy. Never silently reduce them to generic automatic retries. Denial, cancellation and uncertain external effects require evidence where mandated.

## Milestone M0 acceptance test

M0 is technically complete **only** if its 96 entries have unique IDs, explicit proposed dispositions, meaningful rationale, named owners, normative destinations, planned acceptance tests and compatibility impacts; the source trace has grounded references; the CDX crosswalk points only to real clauses/controls or marks UNMAPPED; and the CI validation passes.

M0 cannot itself reach `RUNTIME_BOUND` or `INDEPENDENTLY_ACCEPTED`. Even successful M0 CI means **TECHNICAL_ARTIFACTS_VALIDATED / PENDING_HUMAN_REQUIREMENT_APPROVAL**.

The source index, plan and F8 report remain non-normative. Neither the universal `AMA.md` nor the frozen CDX constitutional law is changed.