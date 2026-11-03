# FF-GH-WP04-D28 — FFOS / CDX GitHub Estate Integration Contract (proposed)

**ID:** FF-GH-CDX-GITHUB-001 · **Status:** DESIGN ONLY, NOT RUNTIME-BOUND, NOT DG-04 ACCEPTED · **Date:** 2026-11-03.

## 1. Authority layers

`Human Director → CDX → FFC → FFOS → {Agent Stable, Pius}` is the **Director's intended containment**, not a connected runtime proof. Each system retains its own source authority.

- **Director:** issues bounded mandates and final acceptance; can hold/revoke.
- **CDX:** source of constitutional controls, runtime effect decisions and SPETL evidence. CDX is **not** a universal superadmin; each consumer owns its enforcement point.
- **FFC:** governed Corpus, version and object authority, not a second FFOS implementation.
- **FFOS:** work/run/dispatch/provenance/orchestration shell; local repository and runtime state.
- **Pius/HCC:** independent Pius protocol and ethical controls; runtime integration currently RESERVED.
- **GitHub:** repository source and Projects operational projections, **not** a new authority layer.

## 2. Classification of operations

| Class | Examples | Required gate |
|---|---|---|
| Read-only evidence retrieval | Query repository metadata/Issues/Project | Authenticated, least privilege; privacy and rate limits |
| Local offline analysis | Parse registered snapshots; compare revisions | Source provenance, no GitHub effect |
| Bounded Project metadata | Add existing Issue, update Programme/Work Stage | Source verification, Director mandate, Project-level authorisation; no self-acceptance |
| Consequential source operation | Close Issue, merge PR, create release, change ruleset | Repository-local source governance plus CDX policy evaluation where required, appropriate human authorisation |
| Deployment/agent/runtime effect | Activate agent, send dispatch, deploy production | Independently implemented policy effect point, evidence, runtime tests and explicit Director acceptance |

The current programme authorises only read-only/reversible Project intake and draft documentation/automation. **Do not infer a production integration from a merged GitHub Action or a valid `.cdx/anchor.json`.**

## 3. Proposed pre-effect decision envelope

A future consequential operation must bind:
`actor_id, principal_id, mandate_id, target_owner/repo/object, effect_kind, requested_capability, local_policy_version, pinned_CDX_policy_version, source_revision, evidence_ref, expiry/revocation status`.

**Decision handling**:
- `ALLOW` / `ALLOW_WITH_CONTROLS`: execute only the bounded permitted action and preserve pre/post evidence if *all* required local rules and Director mandates are satisfied.
- `REQUIRE_HUMAN`, `QUARANTINE`, `DENY`, `SECURITY_STOP`, `CONSTITUTIONAL_STOP`: **no consequential effect**. Hold or escalate, retaining the exact policy decision.
- CDX service unavailable at required pre-effect boundary: **fail closed**, not bypass.
- Project Authority Gate field is not a CDX decision code; never translate one directly into the other.

## 4. Proof of real runtime integration

Required, independent of this document:
1. Consumer's actual enforcement hook identified and executable.
2. Source revision, mandate/authority and policy bundle pinned at time of evaluation.
3. Deny/REQUIRE_HUMAN/security-stop and policy-unavailable test cases.
4. Pre-effect and post-effect SPETL/audit receipts, with policy identity.
5. No effect upon restrictive decision; no effect without pre-effect evidence.
6. Revocation and source-version changes checked just before effect.
7. Evidence from actual deployed consumer, not just unit tests or a reference runtime.
8. Director acceptance recorded in canonical source with exact scope.

[CDX runtime blocker](https://github.com/Hybrismannen/Conductellence-/issues/7) is **open** and remains the controlling unresolved requirement. FFOS local `.cdx/anchor.json` is an anchor, not sufficient evidence of runtime binding.

## 5. Cross-owner Project flow

Manual bounded intake and the read-only project snapshot are already tested, but **no durable FFOS/CDX-driven cross-owner GitHub worker is installed**. The future workflow must request narrowly scoped credentials; read original source and current policy, apply idempotent changes, reconcile and log. It cannot close source Issues, merge PRs or accept releases on Project workflow events alone.

A Project item may represent an approved decision **after** the source decision exists, as in [DG-02](https://github.com/Motherpher/FFOS/issues/43) and [DG-03](https://github.com/Motherpher/FFOS/issues/45). It may never generate a decision merely by changing Work Stage to Accepted.

## 6. Security and non-goals

- No elevation to admin across 31 repositories.
- No new agency or new first-class agents.
- No implicit AMA certification, Pius runtime, UDL connector or production deployment.
- No transfer of clients', children's, profile owners' or research participants' identifying data to portfolio dashboards.
- No FFC version bump caused by a metadata projection.
- No auto-write sync or release accepted by this proposal.

**DG-04 may accept this **proposed contract**, but must not accidentally accept a production/runtime implementation that does not exist.**
