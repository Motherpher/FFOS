# FFOS — AMA Runtime Interface, Agent Mechanic and CDX Governance Binding

**Status:** DEVELOPMENTAL DESIGN / IMPLEMENTATION NOT STARTED · **2026-10-28**
**Authority source:** FFC Agent Master Architecture `Motherpher/form-flode/18-agent-stable/ama/`.
**CDX authority:** `Hybrismannen/Conductellence-` (law `CDX-LAW-001`).

## Do not duplicate the authoritative systems
FFC Agent Stable owns AMA core specifications, versioned module catalog, manifests, UDL integration pointers and Agent Mechanic status contract. FFOS owns technical runtime, authorization, adapters, lifecycle executions and telemetry. CDX owns constitutional law/policy and publishes it outward. ProjectHub owns project state and methodology without requiring agents.

## Reference execution flow (future)
```text
FFC Agent Stable AMA core + Cashin manifest + module pins
               │
FFC .cdx/anchor.json ── CDX published/versioned policy
               │
           Config resolver
               │
    typed validated effective config
               │
FFOS .cdx/anchor.json → local policy decision/enforcement
               │
 model + tool broker + approval + state + trace
               │
 observed run outcome / redacted evidence
               │
      Agent Mechanic status ingestion
               │
   risk / CDX conformance / drift / cost
               │
        Director decision reporting
```

## Interfaces to implement
`GET /internal/ama/agents` — catalogue with versions/deployment status, no fake runtime availability.
`POST /internal/ama/compile` — pinned source, module dependency resolution and immutable effective-config digest.
`POST /internal/ama/policy/check` — principal, mandate, action, scope, tool, effect, CDX reference and policy result; not exposed as an unrestricted model tool.
`POST /internal/ama/execute` — explicit permitted sandbox/staging/production run with bounded resource policy and tracing.
`GET /internal/ama/mechanic/agents/{id}` — status from independent actual source telemetry, with freshness.
`GET /internal/ama/mechanic/changes` — impact, regressions, deployments and drift.
`POST /internal/ama/governance/reconcile` — checked CDX source+local+estate state (must not silently promote).
All endpoints are *proposed*, not existing APIs.

## CDX current state facts and blockers
- FFC `.cdx/anchor.json` is staged in PR #34 as `ANCHOR_DECLARED / NOT_VERIFIED`.
- FFOS existing `.cdx/anchor.json` reports `CDX_CI_MONITORED`, binding mode `PINNED_COMMIT`, runtime `BOUND_PENDING_RUNTIME_INTEGRATION` and empty local enforcement points.
- CDX state reports `FOUNDATIONAL_DRAFT`, `PRE_RELEASE`, `BOOTSTRAP`, `PENDING_RUNTIME_BINDINGS`. Central state currently records FFOS consumer binding `NOT_STARTED`; this conflicts with FFOS local claim and requires a cross-source audit.
- CDX Estate Anchor Standard states `PINNED_RELEASE` for consequential production use, and `PINNED_COMMIT` for controlled development/pre-release. Neither FFC nor FFOS may claim `CDX_RUNTIME_VERIFIED` at current evidence level.
- Do **not** copy CDX legal/policy source into AMA; use source pins and control contracts. Do not claim downstream enforcement without actual local policy adapter and audit.

## Technical work packages
1. Validate FFC anchor against CDX canonical schema and verify source commit. Register FFC surface in CDX estate registry via its authorized process; reconcile FFOS/central status.
2. Choose agent framework only after bounded comparison of Agents SDK/Agent Framework/LangGraph and available FFOS stack.
3. Build schema validator, config resolver, module catalog/dependency graph and version/pin/digest compiler.
4. Build local policy decision/enforcement adapter with CDX requirements, human mandate, source authority, action classification, revocation and fail-closed controls.
5. Bind model/tool broker, context assembly, bounded execution, run state/checkpoint and redacted trace export.
6. Integrate first **Cashin** profile; no compulsory ProjectHub agent. UDL remains optional via pinned external domain source `Hybrismannen/udl-twin`.
7. Build Agent Mechanic record ingestion and status: spec, deployment, health, conformance, CDX binding, modules, costs, incidents, drift and approvals.
8. Implement test fixture and 40-case AMA conformance suite (plus CDX-specific negative tests); save observed results.
9. Stage with restricted permissions, rollback/stop, pilot, human review and separate FFC release decision.

## Non-goals
No new F&F agent beyond Cashin by this work order. No Carpenter reactivation. No Piusite or APz agent creation. No automated FFC→Pius→ProjectHub workflow. No automatic UDL runtime connection. No spend or paid Work mode required simply to author AMA. No external/financial write based solely on a model claim.

## Acceptance
- Versioned schema and config compilation tested.
- Actual CDX governance source and local anchor reconciliation checked.
- Runtime policy decisions exercised against negative and positive tests.
- Agent Mechanic status backed by observed events and proper gaps.
- Cashin isolated to F&F commercial context; ProjectHub independent.
- Human approval of scope, permissions, costs, deployment and release.
