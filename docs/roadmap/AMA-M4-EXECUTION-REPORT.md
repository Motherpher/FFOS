# AMA M4 — Execution, Durability and Failure-Recovery Report

**Date:** 2026-10-29  
**Milestone:** M4 / F5 — Durable execution and uncertain external effects  
**Development:** `Motherpher/FFOS`, `feat/ama-foundation-20261028`, draft PR #19  
**Status:** ENGINEERING CANDIDATE; NOT NORMATIVELY ADOPTED; NOT PRODUCTION BOUND

## Delivered

1. **Seven additional universal schemas** in `packages/agent-model/schemas/v0.2/`: run, step, attempt, checkpoint, effect-receipt, reconciliation, approval-event. The candidate schema suite now contains 33 documents; historical AMA v1 remains unchanged.
2. `packages/agent-model/src/durable-vnext.ts` holds model/host-independent TypeScript contracts.
3. `packages/agent-model/conformance/ama_durability.py` validates static graph closure, run/task/agent/workflow pins, attempt/step/lease association, checkpoint generation, receipt integrity declarations and reconciliation semantics. Synthetic negative cases are in `test_m4_durability.py`.
4. **Real disposable PostgreSQL 17 integration:** `packages/registry/migrations/0004_ama_m4_durable_runs.sql` adds transactional mutable run/effect coordination and append-only event, attempt, checkpoint and receipt evidence.
5. `packages/agent-runtime/src/durable-run.ts` adds a bounded durable coordinator using trusted external admission/reconciliation/resume ports and composing the preexisting `AgentEffectGate`.
6. `packages/agent-runtime/tests/m4-durable-pg.test.mjs` exercises failure recovery, worker contention, epoch fencing, checkpoints, operation-key deduplication, callback uncertainty, immutable journaling, revocation, cancellation and independent receipts in an isolated real PostgreSQL database.

## Safety invariant coverage

- **No ungoverned admission:** missing host RunAdmissionPort denies creating runs. Worker claims and approved resumes revalidate independently supplied host admission.
- **Fenced workers:** worker ID and monotonic lease epoch must match a non-expired live run. Competing claims and stale epochs are rejected.
- **Persistent checkpoints:** state and digest commit in one transaction, with an append-only journal. Loading and new claim verify that the latest stored generation and content digest agree.
- **Effect intent before dispatch:** PREPARED and then DISPATCHED records are committed before `AgentEffectGate` can call any external callback. A unique operation key forbids replay.
- **Uncertain external effects cannot be auto-retried:** callback return, remote timeout or post-effect evidence failure leaves the run HOLD and the effect UNKNOWN; process crash with PREPARED/DISPATCHED record is treated conservatively as UNKNOWN on recovery.
- **Independent reconciliation:** a verified receipt and separate approval must precede resumption after HOLD. A forged receipt fails. NOT_APPLIED is not treated as successful effect completion.
- **Cancellation does not reverse remote work:** lease is fenced; any possibly dispatched effect remains held for reconciliation.
- **Run PASS is not acceptance:** it only records completion of coordinator steps, never human or Director acceptance.

## Validation evidence and classification

The preceding complete [GitHub Actions run 40811831132](https://github.com/Motherpher/FFOS/actions/runs/40811831132) passed **144 Python + 9 shared-model + 52 runtime/PostgreSQL tests** (205 combined). The subsequent additions strengthen checkpoint persistence integrity and must be checked in the latest GitHub Actions run before final technical status. Test counts include baseline M0–M3/v1 cases.

These CI tests are real PostgreSQL integration against disposable tables, but external policy, receipt and admission services are injected *test doubles*. The production anchor still reports unbound runtime policy mediation. The SQL migration has not been applied to production.

## Residual limitations

- No actual deployment, live CDX policy, SPETL custody, authenticated external receipt provider, independent operational reviewer or production database role/RLS validation.
- A DB commit cannot atomically commit a remote effect. External exactly-once is **not** claimed. Live TOCTOU and lease/provider races need additional orchestration and compensating procedures.
- Retention, encryption and data minimization for checkpoint JSONB require separate operational review.
- Full run-level acceptance, stateful incident escalation and emergency rollback remain independent governed actions.
- Model/memory consistency after crash requires a real M3 backend and independent F8 trust gating.
- Generic schemas remain subject to human acceptance from M0; the v1 runtime and normative `docs/architecture/AMA.md` were not changed.

## Next milestone

M5 — independent outcome evaluation, adversarial recovery testing and evidence assurance. Continue F8 binding of authenticated security facts, complete decision/obligation semantics, SPETL evidence and deployment release gate in parallel. Production effects must remain fail-closed.

**Verdict:** Versioned M4 contracts and a durable PostgreSQL coordinator have been implemented and tested as candidate engineering, with actual operational acceptance reserved for F8/M5 and authorized human release.
