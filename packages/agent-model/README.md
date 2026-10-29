# @ffos/agent-model

**Canonical AMA roadmap: M0–M7, with F8 as the optional external security-integration track.** No competing 32-stage architecture exists. `ama-milestones.json` maps the original 96 researched requirements to M0–M7; `ama-template-coverage.json` is a subordinate module inventory. Run `python conformance/ama_milestone_integrity.py` to verify the source mapping and `python conformance/ama_blueprint.py <bundle.json>` to assemble a non-executing construction blueprint. The original v1 interface remains unchanged.


Shared machine-readable contracts for FFOS Agent Master Architecture (AMA).

Current contents:

- `src/index.ts` — shared AMA types and execution-context invariants.
- `agent-manifest.schema.json` — JSON Schema for first-class agent manifests.

This package is architecture-level foundation. It does not provide a production agent runtime, registry store, policy engine or deployment worker yet.

## AMA v0.2 candidate contracts (M1)

A separate, non-production candidate suite is in `schemas/v0.2/` (12 Draft 2020-12 schemas), with isolated type declarations in `src/vnext.ts`. It defines generic agents, commands, workflows, capabilities, tool adapters, optional modules/profiles, tasks, effects, run events and evidence.

`conformance/ama_vnext.py` performs offline schema and semantic graph checks, including exact version/digest references, non-amplification of effect ceilings, bounded scope, finite workflows, disabled modules, typed input/output references and migration review.

**Compatibility:** The v1 manifest and v1 runtime remain authoritative and unchanged. v0.2 returns only `STATIC_PASS_CANDIDATE` or `FAIL`; never live authorization, deployment, conformance C4/C5 or independent acceptance. See [M1 contract guide](../../docs/roadmap/AMA-M1-CANDIDATE-CONTRACTS.md).

## AMA M3 candidate — conditional cognition and memory

Eight additional `schemas/v0.2/` contracts define versioned model, instruction, planner, context, memory, memory-entry, retrieval and cognitive bindings. A standalone `conformance/ama_cognitive.py` validator and `tests/test_m3_cognitive.py` exercise limits, default-off modules, memory poisoning and provenance/retention failures. TypeScript interfaces are isolated in `src/cognitive-vnext.ts`.

**No live model invocation or memory service:** `STATIC_COGNITIVE_ELIGIBLE` never authorizes execution. See [M3 candidate specification](../../docs/roadmap/AMA-M3-COGNITIVE-MEMORY-CONTRACTS.md).

## AMA M4 candidate — durable execution contracts

Seven additional `schemas/v0.2/` schemas (run, step, attempt, checkpoint, effect-receipt, reconciliation and approval-event) make version-pinned execution and recovery records composable without changing v1 manifests. The independent `conformance/ama_durability.py` validator and `tests/test_m4_durability.py` check synthetic graph consistency. Portable TypeScript declarations are in `src/durable-vnext.ts`.

Static eligibility never proves a remote effect or receipt authenticity. M4's PostgreSQL host coordinator is implemented separately in `agent-runtime`; production execution remains blocked pending external enforcement. [M4 specification](../../docs/roadmap/AMA-M4-DURABLE-EXECUTION-CONTRACTS.md).

## AMA M5 — Evaluation and evidence assurance candidate

Six additional `schemas/v0.2/` contracts define evaluation profiles, cases, observations, provenance, candidate reports and non-self-authorizing assessments. `src/evaluation-vnext.ts` mirrors the typed contracts; `conformance/ama_evaluation.py` calculates conservative multi-axis outcome/reliability/error/evidence metrics. `tests/test_m5_evaluation.py` covers synthetic adversarial and negative cases.

**CI evaluations are synthetic, not independently certified.** The self-acceptance schemas reject activation and the evaluator always returns `independent_accepted=false`; real source/oracle attestation and production C4/C5 remain unproven. See [M5 assurance specification](../../docs/roadmap/AMA-M5-INDEPENDENT-EVALUATION-ASSURANCE.md).

## M6 operational lifecycle contracts (candidate)

Six portable v0.2 schemas (`operational-profile`, `compatibility-assessment`, `health-snapshot`, `incident-record`, `release-plan`, `rollback-plan`) extend the optional bundle without changing v1. Types: `src/operations-vnext.ts`; static validator and adversarial tests: `conformance/ama_operations.py` and `tests/test_m6_operations.py`.

All operational results are non-authorizing. Conditional MCP/A2A/OTel bindings do not become template requirements. See [M6 architecture](../../docs/roadmap/AMA-M6-OPERATIONAL-LIFECYCLE-CONTRACTS.md).

## Minimal-to-complex agent construction (M1 contract, M7 blueprint)

Generate an inert draft definition without credentials, a live adapter or runtime access:

```sh
python conformance/ama_starter.py \
  --agent-id SYNTHETIC.ALPHA \
  --name "Sample agent" \
  --purpose "Verify a bounded task" \
  --scope synthetic/item \
  --governing-principal SYNTHETIC.OWNER \
  --command-token SYNTHETIC-START \
  --output /tmp/agent-draft.json
python conformance/ama_blueprint.py /tmp/agent-draft.json \
  --optional memory --output /tmp/agent-blueprint.json
```

The first command uses the existing M1 schema and produces a `DRAFT` bundle; the second uses M0–M7 source mappings to generate implementation obligations. A passing draft or blueprint **does not** supply a working tool, authority, host runtime, acceptance, activation or production effect permission. Optional host-security profiles are specified separately from universal contracts.

## M7 semantic assessment and reference outputs

The M7 blueprint constructor now composes the existing M2–M6 **static** contract validators for any configured sections. Run `python conformance/ama_blueprint.py <bundle.json> --at 2026-10-29T12:00:00+00:00 --host-trust-domain synthetic` to supply an explicit test-only assessment context for cognitive/knowledge contracts. Without required context, `ASSESSMENT_INPUT_REQUIRED` is returned instead of a misleading conformance pass. These options are not trusted policy decisions or live source authentication.

CI also exports two **synthetic, non-deploying reference packages**, with minimal and cross-module complex bundles, their M0–M7 construction blueprints and a source digest index. The generator is `conformance/ama_blueprint_reference.py`; its output is uploaded as `ama-m7-blueprints` inside the existing AMA conformance artifact.

The original M0 requirement register stays unchanged. `ama-m0-test-evidence-bridge.json` supplies separate partial links to **65 of 96** candidate requirements, each checked against a concrete test function. This is not a declaration that any of those requirements has reached full runtime acceptance.
