# AMA Completion and CDX Work-Package Executor — Controlled Handoff

**Date:** 2026-10-29  
**Primary objective:** finish AMA as an operational FFOS agent and then use it to execute CDX WP08–WP14 under the canonical Director/CDX authority model.  
**Reality:** M7-E candidate and F8 adapter are tested, but AMA is NOT operationally accepted. No first-class agent activation or consequential effect authority follows from this document.

## Verified evidence and corrected upstream status

- AMA M7-E: `docs/roadmap/AMA-M7-E-EXECUTION-REPORT.md`, 316 combined CI tests, synthetic evidence only; independent M7-O acceptance pending.
- F8 engineering: `docs/roadmap/AMA-F8-EXECUTION-REPORT.md`, F8.1–F8.6 candidate implementation; no live signature/custody integration.
- FFOS F8.7: `docs/roadmap/AMA-F8-7-EXECUTION-RECORD-2026-10-29.md` is a **historical** hold report, not live CDX state.
- CDX canonical `GOVERNANCE/system-state.json` on 2026-10-29: WP05 protection closed; core release blockers empty; sovereign `RELEASE_1_0_0` decision recorded in `GOVERNANCE/orders/CDX-RELEASE-1.0.0.json`; **publication_authorized=false**, `release_state=PRE_RELEASE`, `enforcement_state=BOOTSTRAP`, `Motherpher/FFOS` consumer still `NOT_STARTED`.
- FFOS `.cdx/anchor.json`: historical `PINNED_COMMIT`, `CDX_CI_MONITORED`, runtime `BOUND_PENDING_RUNTIME_INTEGRATION`. Do not silently promote.
- Upstream release dossier and publication checklist on CDX main; no release tag/production deployment attested.

## Critical path — do not confuse these gates

### Gate A — CDX 1.0 immutable release and source contract (upstream)
1. Verify pinned RC package digests and independently attested evidence on exact publication commit; verify final branch-protection CI.
2. Obtain **separate human publication authorization**. Prior `RELEASE_1_0_0` only authorized the governed release process.
3. Publish immutable CDX 1.0 through separate authorized release workflow; verify tag/release provenance and policy package digest. Maintain estate `BOOTSTRAP` until real estate proof.

### Gate B — AMA M7-E engineering integration admission (FFOS)
1. Independently audit PR #19 exact head, CI artifacts and all M1–M7-E/F8 contracts.
2. Resolve failing required checks without bypass and reconcile stale historical CDX source snapshots as dated observations, not fabricated live attestations.
3. Merge approved engineering code only under governing FFOS branch protections. Engineering merge is not production activation.

### Gate C — AMA F8.7 production CDX runtime (FFOS consumer)
1. After Gate A, verify released immutable CDX policy and change `.cdx/anchor.json` via governed PR to `PINNED_RELEASE` with exact proven release digest.
2. Bind real authenticated identity, mandate, permitted target, signed policy decision, current revocation and Security Twin graph/history facts.
3. Bind independent SPETL v1.1 consumer custody and post-effect reconciliation with real signed receipts; reference CDX pipeline custody alone is insufficient.
4. Independently negative-test withheld policy, forged signatures, missing mandatory controls, late revocation, changed graph/history, evidence loss and unknown effects. No fallback to synthetic allow.

### Gate D — AMA M5/M6/M7-O operational admission
1. Independent M5 C4/C5 live oracle and false-allow/false-deny calibration.
2. M6 production telemetry, incident, rollback, canary, external effects, classified read grants, and unknown-effect hold/resume verification.
3. Independent Verifier/Human acceptance of a tightly scoped canary, explicitly authorized by Director. Only then issue a named AMA runtime-admission decision.

## Proposed CDX work-package executor envelope (after Gate D)

**Role:** AMA coordinates bounded work packages, with distinct execution and independent verification; Director remains governing authority.  
**Scope:** CDX WP08–WP14 only when Director explicitly assigns a specific WP and dependency graph.  
**Inputs:** work-package ID, exact upstream source SHA, authority, mandatory dependencies, permitted repository paths, allowed tools/effect classes, budget/time limit, acceptance tests and human escalation route.  
**Outputs:** proposed patch on a new branch, machine CI/audit evidence, SPETL-linked durable execution receipt, independent verifier finding and governed review PR.  
**Never autonomous:** constitutional amendment, priority/dependency rewriting, permission expansion, self-acceptance, bypass, main branch push, auto-merge, release/tag/deploy or FFOS registration.  
**Failure mode:** `HOLD`, evidence capture and escalation; no speculative automatic replay of uncertain remote effects.  
**Idempotency:** exact `(WP_ID,source_pin,mandate,execution_id)` scoped operations; unknown remote commit requires independent reconciliation.  
**WP completion:** only external Director/human acceptance after independent verifier, not AMA executor self-declaration.

## First supervised pilot (once AMA M7-O accepted)

Use a narrow, reversible **read-only** CDX WP inventory task before any mutation: identify WP08–WP14 canonical dependencies and existing acceptance gaps; generate a proposed execution DAG and evidence report, verify against CDX source. Any subsequent code mutation requires a separately authorized bounded WP order, test environment, independent verifier and protected PR.

## Current admission flags (must remain false)

`AMA_OPERATIONAL_ACCEPTED=false`  
`AMA_FIRST_CLASS_ACTIVATION=false`  
`CDX_RELEASE_PUBLISHED=false` (not independently attested)  
`FFOS_CDX_PINNED_RELEASE=false`  
`FFOS_CDX_CONSUMER_CUSTODY_VERIFIED=false`  
`CDX_WP_EXECUTION_AUTONOMOUS=false`  
`FFOS_PRODUCTION_EFFECTS_ALLOWED=false`

## Completion definition

AMA is *finished* only when Gates A–D produce independent evidence and a named human acceptance of a real bounded operation. WP execution can then be enabled per-work-package, not globally.


## CORRECTION — Normative architecture/agent separation (2026-10-29)

**Supersedes the mistaken objectives and definitions above wherever they characterize AMA as an agent, an executor, an actor, or a deployable operational agent.** AMA is the **Agent Master Architecture**, a generic reusable engineering and conformance architecture for constructing agents; it must remain domain-agnostic. No `AMA_OPERATIONAL_ACCEPTED` or `AMA_FIRST_CLASS_ACTIVATION` field may be interpreted as AMA itself being registered as an agent. M7-E/M7-O refer to architecture conformance and host runtime/instance acceptance evidence, not to a self-operating AMA actor.

**Canonical intended dependency path:**

1. **FFOS / Director / Agent Stable** — external authority, agent registry, shared host operations, Agent Mechanic as separately scoped maintenance/assurance function.
2. **AMA** — universal agent build specification: manifests, modules, roles, commands/workflows, effect boundaries, cognition/memory options, durable runs, assurance, operational lifecycle and reusable conformance.
3. **Household Family 2.0** — first narrowly scoped operational **agent built using AMA**, implemented as a ChatGPT-compatible MCP-facing service with durable orchestrator. Janitor, Handyman and Verifier are differentiated internal roles/workflows; never independently authorized or self-accepting agents. Director remains external.
4. **Conductellence** — canonical security/constitutional authority and WP program. After Household is bounded, independently tested and authorized, Director may assign it specific CDX engineering/maintenance work packages; CDX cannot delegate constitutional decisions or independently accept its own changes. Household assists with **completion of CDX**, not AMA itself.
5. **MESSI** — later, larger agent **also built from AMA**, after the necessary architecture and governance are operational. MESSI is not Household and is not AMA.

**Execution-order nuance:** CDX's existing reference policy/contracts can govern early AMA/Household **development and synthetic tests** while production authorization is still fail-closed. This is distinct from full CDX release and consequential live effect permission. Work on Household must not be circularly blocked by demanding CDX estate-wide operational completion before non-production construction; conversely no unsafe live effects may be permitted until its actual runtime authorization gates are satisfied.

**Replacement acceptance model:** AMA = architecture conformance and reusable build contracts; Household = concrete agent instance with bounded operational acceptance; CDX = independent policy/governance and work-package target; MESSI = subsequent AMA-built agent. The earlier paragraph 'First supervised pilot (once AMA M7-O accepted)' should be read as **first supervised Household pilot after Household instance acceptance under AMA and FFOS/CDX controls**, not AMA execution.

**Do not use the erroneous earlier recommendation 'finish AMA as an operational FFOS agent' or 'AMA coordinates bounded work packages' as implementation guidance. The executor is Household, explicitly authorized by Director.**
