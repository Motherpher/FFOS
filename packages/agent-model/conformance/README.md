# AMA-06 — Static Agent Conformance

Offline, agent-agnostic contract gate for any candidate manifest. Python 3.11+ and pinned `jsonschema` are required.

```bash
python -m pip install -r packages/agent-model/conformance/requirements.txt
python -m unittest discover -s packages/agent-model/conformance/tests -v
python packages/agent-model/conformance/ama_conformance.py \
  --manifest packages/agent-model/conformance/fixtures/agent.json \
  --bindings packages/agent-model/conformance/fixtures/bindings.json \
  --report /tmp/ama-conformance.json
```

## What is checked

- C1: JSON Schema Draft 2020-12 validation, immutable version strings, duplicate binding IDs.
- C2: authority and mandate reference policy, effect ceilings, internal-role ceiling; high effects block until a distinct review path exists.
- C3: exact command → workflow version mapping, capability scopes, ownership, optional modules default off.
- C6: semantic/authority changes and binding drift against prior accepted manifest.

Structured reports use `ffos.ama.conformance-report/v1`: `STATIC_PASS` or `FAIL`, deterministic findings and explicit `not_proven` fields. **STATIC_PASS never means DEPLOYABLE, ACTIVE, or ACCEPTED.**

## Explicit nonclaims

C4 runtime execution and C5 live evidence are NOT evaluated by this tool. No production policy adapter, registered deployment, independently authorized activation, network endpoint, domain-specific governance extension, or durable worker is implemented here. This is a deterministic pre-admission gate, not production runtime validation.

The bundled synthetic fixture tests contract behavior only; it is not a real agent, an instance template, or an endorsement of any domain workflow.

## Separate v0.2 candidate gate

The new `ama_vnext.py` validator reads only local schemas from `../schemas/v0.2/`. It validates complete versioned bundles and distinguishes document/schema correctness from runtime permission. M1 regression tests in `tests/test_m1_contracts.py` include malformed schemas, scope and effect escalation, graph cycles, digest mismatch, disabled modules, task/effect misbinding and migration review. The original `ama_conformance.py` entry point and v1 fixtures remain unchanged.

`STATIC_PASS_CANDIDATE` is not agent activation or policy approval; v1 and v0.2 validators remain intentionally separate.

## M2 — scoped authorization precheck (candidate only)

`ama_authorization.py` validates identity and agent/workload/actor separation, root/delegated mandate attenuation, scoped and sensitive E0 reads, risk-context completeness, policy decision references, time validity and declared independent human approvals. The six supporting JSON Schemas reside in `../schemas/v0.2/`, and negative regression tests in `tests/test_m2_authorization.py`.

**No runtime permission is ever issued.** Even a successful precheck returns `STATIC_ELIGIBLE_FOR_EXTERNAL_VERIFICATION` with `authority_granted: false`. Real trusted facts, revocation, policy outcomes, obligation fulfillment and effect mediation require a separately verified host integration. See [M2 contract guide](../../../docs/roadmap/AMA-M2-AUTHORIZATION-CONTRACTS.md).

## AMA M3 offline cognitive and memory preflight

`ama_cognitive.py` checks optional model/instruction/plan/context bindings, fail-closed budgets, memory provenance/quarantine/retention, cross-domain retrieval and source-marker compaction tests. It uses a deterministic observation timestamp for expiry checks; it does not authenticate source facts or run a model/memory backend. See [M3 specifications](../../../docs/roadmap/AMA-M3-COGNITIVE-MEMORY-CONTRACTS.md).
