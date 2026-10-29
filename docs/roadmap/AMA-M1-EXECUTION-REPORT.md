# AMA M1 — Execution and Verification Report

**Milestone:** M1 — F1 Universal Contract Engineering  
**Date:** 2026-10-29  
**Repository:** Motherpher/FFOS  
**Development branch:** `feat/ama-foundation-20261028` / draft PR #19  
**Classification:** TECHNICALLY VERIFIED CANDIDATE; NOT ADOPTED NORMATIVE AMA / NOT DEPLOYED

## Delivered artifacts

1. **Twelve JSON Schema Draft 2020-12 contracts** at `packages/agent-model/schemas/v0.2/`: common, agent, workflow, command, capability, tool-adapter, profile, task, effect, run-event, evidence and bundle.
2. **Portable typed definitions** at `packages/agent-model/src/vnext.ts`, isolated from historical TypeScript v1 runtime types.
3. **Offline semantic validator** at `packages/agent-model/conformance/ama_vnext.py` using local JSON Schema registry, exact version/digest-pinned references and deterministic findings.
4. **Synthetic positive and adversarial regression tests** at `packages/agent-model/conformance/tests/test_m1_contracts.py`.
5. **Template-purity test extended** to all twelve candidate schemas and the new TypeScript module.
6. **Compatibility and architecture specification** at `docs/roadmap/AMA-M1-CANDIDATE-CONTRACTS.md`, linked from the development roadmap and package READMEs.

## Conformance and security boundaries

The new validator checks schema and cross-object integrity; duplicate/unresolved/stale references; content-digest mismatches; agent ownership; command tokens; finite/acyclic workflow dependency graphs with reachable terminal steps; action-capability integrity; resource scope against mandate; relative effect ceilings; optional-module profile gates; task/effect association and semantic action-class alignment; static run/evidence references; and standalone, offline-referenced input/output schemas.

### CI evidence

**GitHub Actions run:** https://github.com/Motherpher/FFOS/actions/runs/40806829631 — **SUCCESS** (completed).

Observed job checks:
- 61 Python unit and negative tests passed (includes M0, M1, existing AMA conformance and purity).
- 9 Node shared-model type/guard tests passed.
- 38 Node runtime/PostgreSQL tests passed.
- Candidate TypeScript `src/vnext.ts` successfully parsed by Node TypeScript stripping.
- Existing v1 positive manifest fixture passed static validation.

**Test-count scope:** These counts include the *existing* AMA v1 and runtime tests; 108 is a suite total, **not** 108 tests exclusively for M1. Passing Python/CI is static/ephemeral integration evidence and is not real service or operational admission evidence.

## Backward compatibility

The historical v1 schema ID, `ffos.ama.agent-manifest/v1`, v1 static validator, shared runtime types and active-runtime semantics were left unchanged. v0.2 candidate bundles are intentionally distinct, version-pinned, and cannot masquerade as v1. An advisory migration report always requires human acceptance and never activates versions automatically.

## M1 acceptance assessment

| Criterion | Technical result |
|---|---|
| Universal, instance-free candidate schemas | PASS |
| Cross-schema version/digest resolution | PASS |
| Agent → workflow → command → capability → adapter graph | PASS |
| Finite, reachable workflow dependency graph | PASS |
| Enabled/disabled modules and profiles | PASS |
| Task/effect typed referential checks | PASS |
| Version compatibility and no automatic migration | PASS |
| v1 regression and PostgreSQL integration CI | PASS |
| Real scoped authorization and delegated mandate | OUT OF SCOPE / M2 |
| Live CDX decision and revocation binding | NOT VERIFIED / F8 |
| Durable transactional worker and idempotency | NOT VERIFIED / M4 |
| Independent live C4/C5 evidence and acceptance | NOT VERIFIED / M5 |
| Formal human normative acceptance of v0.2 | PENDING |

**Disposition:** M1 engineering work is complete as a **versioned candidate**, pending independent specification acceptance. No change to universal `docs/architecture/AMA.md`, CDX constitutional law, production permissions, registry state or live deployments.

## Next governed step

M2: provider-neutral resource-scoped authorization and read-data governance. In parallel, F8 control-semantics mapping and trusted CDX policy fact resolution must be completed before any live consequential runtime authorization. Existing candidate static gates **do not** grant authority.
