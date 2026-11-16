# ProjectHub PH-WP08 — Domain source pins and adapter boundary

**State:** BUILD SOURCE PIN  
**Date:** 2026-11-16

## UDL

Reviewed source:
- `UDL_Twin_Unified_System_Blueprint_B1.0_S8_Engines_LOCKED.docx` — locked S8 engine specification available in the governed project source estate.
- Supporting product build directory v4.0 for Evaluation Lab and small-N display semantics.

ProjectHub adapter implements only project-level analytical projections needed by ProjectHub:
- T1/T2/T3 distinction;
- cohort/segment slicing;
- exposure bands supplied by explicit exposure observations;
- respondent vs original-cohort denominator;
- attrition/missingness;
- contribution-state counts;
- small-N disclosure state;
- explicit `causalClaim=false`.

It does **not**:
- redefine UDL Measurement Fabric;
- invent a universal exposure definition;
- manufacture causal proof;
- auto-create Scenario/Learning decisions;
- claim to be the UDL Twin runtime.

Before production adapter binding, the exact canonical UDL repository/source URI and version must be recorded.

## FIELD

Reviewed source:
- `FIELD Protocol v1.0`.

ProjectHub adapter implements validation/projection of:
- actor-card fields;
- actor-system completeness;
- Strategy Kernel structure: Diagnosis → Guiding Policy → Coherent Actions.

It does **not** run the complete FIELD protocol, BAND, Helix research orchestration, intelligence search or mission resolution.

Before production adapter binding, the exact canonical FIELD repository/source URI and version must be recorded.

## Rule

ProjectHub adapters preserve external domain authority. A source-derived object must carry source protocol/version and provenance when persisted.
