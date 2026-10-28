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
