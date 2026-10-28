# FFOS — FFC Agent Stable General Binding Contract

**Version:** 0.1 · **Status:** DESIGN ONLY; not deployed · **Date:** 2026-10-28

## Principle
**FFC Agent Stable defines all F&F-owned agents.** FFOS supplies a shared permissioned invocation and observability layer that can serve multiple consumer domains. ProjectHub is one consumer, never the parent/owner of an agent. This is structurally analogous to central agent selection elsewhere in the user's tool ecosystem but does **not** import Pius governance or register any Piusites.

## Canonical source
`Motherpher/form-flode/18-agent-stable/README.md`  
`Motherpher/form-flode/18-agent-stable/registry/agent-registry-v0.1.json`  
`Motherpher/form-flode/18-agent-stable/architecture/stable-and-dispatch-v0.1.md`

ProjectHub consumer contract: `Motherpher/form-flode/17-ffos/projecthub/agent-selection-and-dispatch-v0.1.md`.

## Shared FFOS adapter — proposed
1. Read an exact **versioned FFC registry snapshot**, not a mutable unpinned copy, and validate source integrity.
2. Resolve the chosen `agent_id`, `version`, `source_specification`, approved consumers, capabilities, allow/deny and required input/output types.
3. Verify executing user, mandate, requested capability, data sensitivity, authority and tools; **deny by missing registration**.
4. Resolve consumer-specific `WorkContext` / `ProjectHubAgentRequest`; do not mutate Stable specifications from a consumer workroom.
5. Route low-risk draft assistance to the user's current chat where supported; call an actual FFOS agent runtime only when the adapter exists and is authorised.
6. Record source version, approval, execution evidence, result, costs if known, errors and consumed artifacts. A file's existence is not dispatch evidence.
7. Return typed results; let the **consumer-owned** permissioned writer decide whether and how any proposed changes become canonical.
8. Retain release and rollback paths. New agents and changed source versions require their own acceptance gates.

## Proposed interface
`AgentResolveRequest {consumer_id, task_id, capability_requirements, source_registry_ref, context_refs, authority_ref, requested_output_types}`

`AgentResolution {agent_id, agent_version, agent_spec_ref, selection_basis, decision_status, required_approvals, runtime_binding_state}`

`AgentDispatch {resolution_id, approval_refs, execution_mode, invocation_ref, input_refs, event_ref}`

`AgentReturn {dispatch_id, status, output_refs, evidence_refs, warnings, proposed_changes, reconciliation_required}`

## Domain boundaries
- FFC source: agent definition/ownership, shared business grammar, documentation versions.
- ProjectHub: client projects, Project Field, stage semantics, work packages, budgets/learning and project state.
- Proposal & Assignment: opportunity, FF commercial offer, binding contract status.
- FFOS: technical execution, actual permissions, dispatch state, telemetry.
- Project Steward / existing FFOS permissioned roles: retained authority and cannot be assumed by a newly documented Stable agent.
- Barnombudet: no runtime data, economic defaults, executable files or employer policy imported.
- Pius: no automatic activation, no shared authority.

## Economic source
`Motherpher/form-flode/08-business/ff-commercial-baseline-2026-2027.json`: FF standard SEK 1,200/hour excluding VAT, plus applicable VAT; salary expectation SEK 55,000/month gross in 2026–2027 in a separate employment scenario. No universal default tax or employer parameter.

## Implementation sequence — not completion claims
Schema validation → source registry binding → permissions/least privilege → capability matcher → consumer adapters (ProjectHub first) → budget calculation contract → trace/reconcile → negative/security tests → human acceptance → FFC release decision.

**Until those steps have executed and been verified, all bindings remain DESIGN_ONLY / NOT_CONNECTED.**
