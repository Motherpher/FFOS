# AMA M4 — Durable Execution and Effect Recovery Candidate

**Date:** 2026-10-29  
**Status:** CANDIDATE ENGINEERING / NOT A RELEASED OR DEPLOYED AGENT ORCHESTRATOR  
**Owner separation:** Universal AMA model defines contracts. The PostgreSQL implementation is a governed host adapter. External policy/evidence authentication and human acceptance remain outside AMA and M4.

## Contract composition

Seven additional independent JSON Schema Draft 2020-12 contracts at `packages/agent-model/schemas/v0.2/`:

| Contract | Purpose |
| --- | --- |
| `run.schema.json` | Task/agent/workflow/policy pins, lifecycle state, lease epoch and checkpoint reference |
| `step.schema.json` | Workflow-step identity, linked run and attempts |
| `attempt.schema.json` | Worker, step, epoch and bounded attempt result |
| `checkpoint.schema.json` | Persistent checkpoint generation, immutable content digest and storage reference |
| `effect-receipt.schema.json` | Effect outcome, independent verifier and evidence identity |
| `reconciliation.schema.json` | Verified resolution and review record of previously uncertain effect |
| `approval-event.schema.json` | Run-level human review request/decision and evidence reference |

They extend optional bundle fields and are mirrored by `src/durable-vnext.ts`. The existing task/effect schemas from M1 remain compatible. `ama_durability.py` and `test_m4_durability.py` verify structural identity and pinned reference closure, uniqueness, attempt/lease epoch limits, reconciliation/receipt continuity and that static evidence is never authentication.

## Host execution: PostgreSQL durability

Implementation: `packages/agent-runtime/src/durable-run.ts`; migration: `packages/registry/migrations/0004_ama_m4_durable_runs.sql`. A new `DurablePgCoordinator` composes **the existing `AgentEffectGate`**, it does **not** replace policy decisions or the registry.

| Phase | Durable sequence | Safety invariant |
|---|---|---|
| Admission | Independent host admission port → immutable run row and CREATE event | No agent-defined admission or auto-activation |
| Lease | Atomic row lock and epoch-incremented worker claim | Single current worker; expired lease cannot be reused |
| Attempt | Worker/step/epoch record and append-only event | Work attribution and fencing |
| Checkpoint | Atomic generation increment, immutable JSON/digest and event | Recovery without silently losing history |
| Effect intent | Unique operation key + PREPARED record committed before any dispatch | Replay of same operation key rejected |
| Dispatch | DISPATCHED record and event committed before invoking existing `AgentEffectGate` | Crash after dispatch cannot lead to automatic replay |
| Callback return or failure | Run becomes HOLD; effect UNKNOWN if callback invoked, BLOCKED if never called | Callback return does not prove external commitment |
| Recovery | Expired lease + PREPARED/DISPATCHED/UNKNOWN effect → HOLD + UNKNOWN | No blind retry under a new worker |
| Reconciliation | Independent receipt verifier → immutable receipt + COMMITTED/NOT_APPLIED/UNKNOWN record | Agent text cannot declare effect successful |
| Resume | Independent reviewer plus renewed host admission; unsettled effect blocks resume | No autonomous restart/permission changes |
| Cancellation | Fence lease; any possibly dispatched effect remains HOLD for reconciliation | Cancellation does not pretend remote effects were undone |
| Finish | Requires valid lease and absence of pending/blocked/unapplied effects | PASS denotes run execution only, not final human acceptance |

The run/effect coordination tables are mutable under a restricted future application role. Event, attempt, checkpoint and receipt tables are protected by the shared append-only mutation-rejection trigger. Database transaction boundaries prevent a claimed checkpoint or event from committing independently of its state change.

### Important limits

The effect gate already performs pinned policy/anchor/revocation checks and emits pre/post effect evidence. However, **its current CDX runtime binding remains unavailable**, so M4 cannot execute consequential effects in production. Test doubles are used only by CI. A worker lease is not a distributed transaction with an external provider; between the final fence check and a remote effect a race is still possible. Downstream exactly-once side effects are not assumed.

Receipt authenticity, policy freshness, operator identity and cross-tenant isolation require independently integrated services and database permissions. An `UNKNOWN` effect cannot be marked committed merely because a callback returned or a model reported success. A `NOT_APPLIED` receipt does not imply that the requested task was fulfilled.

**Data caution:** Checkpoint state is stored as JSONB in the candidate database. Production privacy requires schema field classification, encryption/retention, role isolation, minimized evidence and a dedicated risk/PII review before deployment.

## Verification plan

`packages/agent-runtime/tests/m4-durable-pg.test.mjs` exercises an actual disposable PostgreSQL 17 schema. It applies the historical base and v1 registry migrations before the additive M4 migration, then tests concurrent workers, lease expiry and fencing, persistent checkpoints, immutable journals, duplicated operation keys, a callback returning but lacking independent proof, late/failed post-effect evidence, unknown external outcome, forged receipt denial, independent reconciliation, safe cancellation, revocation and explicitly reviewed resume.

The static `test_m4_durability.py` exercises schema and graph cases without a database. All tests run with the preexisting M0–M3, AMA v1, registry and effect-gate regressions.

## Acceptance gates and handoff

**M4-DURABILITY-PASS (candidate)** requires a green complete CI run with the real disposable PostgreSQL tests, not only schema parsing. Even then, `RUNTIME_BOUND` and `INDEPENDENTLY_ACCEPTED` remain unproven.

F8 must deliver authenticated policy inputs, comprehensive decision mapping, live CDX anchor and SPETL/receipt custody. M5 must independently verify actual final-state outcomes, adversarial reliability and failure recovery in the chosen production environment. F7/M6 covers operational incident handling and deployment safety. **No production migration, real effect, PR merge or agent activation is authorized by this document.**

## M4 extension — scheduled and external event triggers

The optional M4 eventing extension is `schemas/v0.2/event-trigger.schema.json`, added to the existing bundle via `eventTriggers[]`. `src/durable-vnext.ts` exports its candidate TypeScript declaration. This is **M4**, not a new milestone or an event-dispatch agent.

A trigger resolves one immutable command/workflow pair and binds an enabled `SCHEDULING` or `EVENTS` module. Schedules declare an expression, timezone and required occurrence key. Webhooks and queue consumers declare an external source, authentication requirement, idempotency-key field and typed payload. Every trigger requires bounded delivery/age/concurrency, external authorization, a no-implicit-replay policy, HOLD on failure and an invariant that event payloads cannot expand an agent mandate.

`conformance/ama_eventing.py` performs static semantic pin, module and effect-ceiling checks, with adversarial tests in `tests/test_m4_eventing.py`. **No scheduler, transport, dispatch, source authentication, replay ledger or actual policy decision is implemented by this contract.** Those remain explicit host obligations, tracked as PARTIAL_EXISTING_CONTRACTS in the supplementary inventory.
