# @ffos/agent-model

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
