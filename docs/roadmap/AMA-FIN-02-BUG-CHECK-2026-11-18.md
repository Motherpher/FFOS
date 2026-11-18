# AMA FIN-02 — Bug investigation and bounded correction (2026-11-18)

**Scope:** AMA PR #34; Household protocol J0 source inspection / J1 bounded correction / Verifier source readback. No agent construction or independent Director acceptance.

## Initial symptom
The supplied local run `/mnt/data/ama_fin02_cardinality_local_tests.log` shows **47/47 unittest PASS**, plus two additional cardinality checks. It does **not** contain a failing assertion or stack trace. The issue therefore required direct source-level adversarial investigation.

## Two demonstrated source defects
1. **Mandatory classification can be rewritten through the inventory**: `ama_fin02_semantic_modules.py` previously computed the CORE/OPTIONAL boundary directly from `source.get("requirement")`. A caller-controlled reclassification of canonical CORE `identity` to OPTIONAL, followed by disabling the module, could evade `CORE_DISABLED` in the semantic preflight. Fixed by pinning the 13 canonical CORE IDs independently of the supplied inventory and failing on classification drift.
2. **Semantic validator / JSON Schema type discrepancy**: the Python validator accepted a nonempty `list` or `dict` for a control field, although `fin02-module-controls.schema.json` requires a nonblank string for enabled controls. Fixed by requiring a nonblank string in the Python validator.

## Fix and regressions
- `packages/agent-model/conformance/ama_fin02_semantic_modules.py`: canonical CORE pin + drift rejection; narrow control values to strings.
- `packages/agent-model/conformance/tests/test_ama_fin02_semantic_modules.py`: four added negative cases, covering CORE -> OPTIONAL spoofing, OPTIONAL -> CORE spoofing, list injection and dict injection.
- Source readback confirmed both changes and all four test methods in branch commit `032fee2cfc6367e7edde920a63aabae5bbad5e7c`.
- Previous 47 passing tests **precede these fixes**. Fresh exact-head Python execution and broader CI are **not observed** because no clean GitHub checkout is available in this environment.

## Acceptance state
These are bounded FIN-02 correctness repairs, not completion of the 32 independent module implementations. Source evidence is recorded; executable regression outcome is pending. Formal FIN-02 remains **IN_PROGRESS / HOLD**, with 0/32 independently verified complete. Director acceptance, J2 source decisions and FIN-03 handoff remain gated.
