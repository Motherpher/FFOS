# AMA 0.2 — Candidate Universal Contract Suite (M1)

**Status:** CANDIDATE STATIC SPECIFICATION / NOT NORMATIVELY ADOPTED / NOT DEPLOYED
**Source of requirements:** M0 decision register (96 candidates; proposed, pending independent acceptance).
**Existing compatibility:** `ffos.ama.agent-manifest/v1` and its historical schema ID and validator remain unchanged.

## Contract structure

All schemas live in `packages/agent-model/schemas/v0.2/`, use JSON Schema Draft 2020-12, and have independent `https://ama.example/contracts/v0.2/*` IDs. The `.example` domain is a **reserved documentation namespace**, not a public resolution service. The Python validator uses an offline registry of local schema resources; it makes no network requests.

| Schema | Normative subject if adopted | M1 assurance |
|---|---|---|
| `common.schema.json` | Typed IDs, semantic versions, content digests, refs, effect and lifecycle enums | Draft-2020-12 meta validation |
| `agent.schema.json` | One agent definition, independent authority/mandate declarations, versioned refs, optional module enablement | Structural and cross-reference validation |
| `workflow.schema.json` | Bounded procedure, dependency graph, terminal states, typed IO, admitted capabilities | Graph reachability, finite DAG and effect ceilings |
| `command.schema.json` | Stable invocation token resolving one pinned workflow | Unique token, pinned target |
| `capability.schema.json` | Typed technical capability, resource scope, adapter and optional module binding | Owner/scope/effect/adapter checks |
| `tool-adapter.schema.json` | Replaceable tool implementation interface | Supported-effect and schema validity |
| `profile.schema.json` | Conditional/optional extension declaration | Disabled-by-default behavior and profile/module consistency |
| `run-event.schema.json` | Minimum event identity/typed provenance | Structural linking only; M4 durability is pending |
| `evidence.schema.json` | Minimum evidence identity and digest | Structural linking only; M5 independent evidence is pending |
| `bundle.schema.json` | Versioned composition of registered agent and definitions | Offline closure and semantic validation |

## M1 semantic conformance

`packages/agent-model/conformance/ama_vnext.py` validates:

- schema-valid definitions and unique identifiers;
- exact version and sha256 content digest for all admitted definitions;
- agent-owned capability/workflow/command boundaries;
- resource scopes constrained to declared mandate (segment-boundary matching, not string prefix);
- effect-class ceilings across agent → workflow → capability → adapter;
- active/disabled module and profile gating;
- registered workflow requirements, step capability references, acyclic directed dependencies, reachable terminal nodes and no dead ends;
- duplicate command tokens, unregistered or orphan adapters and inactive bindings;
- optional run/evidence structural references;
- advisory old-to-new migration analysis that **never automatically activates** an agent.

The content hash is deterministic JSON canonicalization within the contract tests, **not** a cryptographic signature or trustworthy provenance attestation. Runtime authorization must independently verify trusted identity, policy, resources and receipts.

## Separations retained

- M1 does not supply a planner, model/runtime adapter or an agent implementation. Reasoning and memory profiles are structural placeholders until M3.
- It does not implement a durable worker, transactionality, leases or idempotency; run/event structures will expand in M4.
- It does not attest actual evidence, evaluation results, auditing or independent acceptance; those belong to M5/F8.
- It does not implement full resource-sensitive reads, multidimensional risk or delegated authorization; those belong to M2.
- No instance identity, host/provider hierarchy or domain workflow is embedded in this schema suite. Synthetic tests remain separate.

## Compatibility and acceptance rules

Historical `v1` artifacts are immutable and validated with the old v1 tool. A v1 manifest cannot masquerade as v0.2 bundle. All major/semantic changes require explicit compatibility analysis, human decision and separately accepted new version. An M1 `STATIC_PASS_CANDIDATE` is not `RUNTIME_BOUND`, `ACTIVE` or `INDEPENDENTLY_ACCEPTED`.

## Next stage

The M1 candidate suite supplies typed interfaces for M2 authorization and parallel F8 host-specific security binding. M2 must strengthen read-sensitive policy, independently verified delegated mandates and real enforcement; it must not infer permissions from schema validity.
