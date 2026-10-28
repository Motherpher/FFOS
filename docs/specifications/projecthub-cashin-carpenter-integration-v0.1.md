# FFOS ProjectHub — Cashin / Carpenter integration contract v0.1

**Canonical documentation language:** English. **Business parameter source:** `Motherpher/form-flode/08-business/ff-commercial-baseline-2026-2027.json` (SEK 1,200/hour excluding VAT for FF consultancy; SEK 55,000/month gross employment salary expectation for 2026–2027). No universal numerical VAT percentage or unrelated employer-cost defaults.

**Status:** DESIGN PROPOSAL — NOT IMPLEMENTED / NOT TESTED / NOT DEPLOYED. **Date:** 2026-10-28.

## Authority
This repository owns FFOS runtime, permissions, ProjectHub UI/API and integrations, **not the canonical FFC consulting grammar**. The authoritative developmental definitions are on the matching proposed FFC branch in **Agent Stable**:
`Motherpher/form-flode/18-agent-stable/`. ProjectHub is an agent consumer and retains its independent project domain.
ProjectHub consumer contract: `Motherpher/form-flode/17-ffos/projecthub/agent-selection-and-dispatch-v0.1.md`.

Source references (FFC Agent Stable):
- `18-agent-stable/README.md`
- `18-agent-stable/architecture/stable-and-dispatch-v0.1.md`
- `18-agent-stable/architecture/dual-agent-operating-model-v0.1.md`
- `18-agent-stable/agents/cashin/specification-v0.1.md`
- `18-agent-stable/agents/carpenter/specification-v0.1.md`
- `18-agent-stable/shared/estimation-budget-ramx-contract-v0.1.md`
- `18-agent-stable/governance/clean-room-exclusion-v0.1.md`
- `18-agent-stable/registry/agent-registry-v0.1.json`
- `18-agent-stable/tests/acceptance-tests-v0.1.json`
- `17-ffos/projecthub/agent-selection-and-dispatch-v0.1.md`

No independent FFC rule fork or automatic promotion is allowed.

## Architecture
```text
Opportunity / Client brief
    |
    +--> Cashin (FFC proposal/assignment design)
    |       -> draft proposal / time / fee / optional RAMx
    |       -> human-approved commissioned assignment
    |       -> versioned AssignmentHandover
    |
    +---------------------+
                          v
                    Carpenter (ProjectHub)
                     -> Project Field
                     -> work/time breakdown
                     -> project budget + FF fee separated
                     -> delivery and six-strata monitoring
                     -> proposed actions
                          |
                    Existing Project Steward
                   (permission + human approval)
                          |
                    ProjectHub core / events

Shared: one FF Project Budget Engine / RAMx contract.
Sources: FFC grammar, governed project and client data, explicit rate and policy sources.
Forbidden: Barnombudet calculation inputs, policies and runtime dependency.
```

## Agent Stable binding boundary

Agent identity, core prompt/specification, lifecycle and capabilities are sourced **only** from FFC Agent Stable. FFOS provides a general adapter for any authorised consumer rather than a bespoke ProjectHub-owned agent system. ProjectHub resolves agent IDs via the Stable registry; it may add project context, gates and stricter restrictions, but not fork definitions. The FFC registry indicates DEFINITION / NOT_IMPLEMENTED until actual FFOS registration and test evidence exist. Existing Project Steward A3 permissions remain independent.

## Native runtime roles (candidate)
| Role | Read | Draft/propose | Commit | External/financial |
|---|---|---|---|---|
| FF-AG-Cashin-001 | eligible opportunity, FFC consultant evidence and approved FF rates | offers, assignment plans, resource scenarios | No unapproved canonical mutation | No |
| FF-AG-CARPENTER-001 | authorised project/ProjectHub state and relevant client sources | project model, milestones, budget/time plans, alerts and changes | Delegate eligible A3 to registered Project Steward + human approval | No |
| Existing Project Steward | existing ProjectHub authorised state | governed transition | existing A3 under policy | A4/A5 remain separately gated |
| Project Budget Engine | versioned budget/rate/time inputs | calculated outputs | only engine-owned planning fields under approved adapter contract | no accounting actual writes |

Registered roles must be enforced by service permissions. Chat activation text must not be interpreted as authentication, approval, delegation or agent installation. Deny-by-missing-registration is mandatory.

## Resource data source contract
A value is eligible for calculation only if it has:
`economic_perspective`, `parameter_name`, `value` or `UNKNOWN`, `unit`, `source_ref`, `source_owner`, `valid_for_party`, `validity_dates`, `decision_status`, `scenario_id` where applicable, and `version`.

Valid perspectives: FF commercial, client project, resource bank, employment scenario, scenario only. Company actuals must come from the appropriate accounting provider, not inferred from project proposals.

**Default policy:** no numerical rate/multiplier/benefit/tax/weekly-hour default from Barnombudet or historical FFOS worksheet models. Historical BSRC-001 may remain as provenance but is not auto-bound to Cashin/Carpenter calculations.

## Proposed handover schema
`AssignmentHandover` must capture:
`handover_id`, `source_opportunity`, `client`, `purpose`, `mandate_status`, `approved_scope`, `deliverables`, `time_plan_version`, `budget_version`, `ramx_terms`, `sources`, `assumptions`, `rights`, `approval`, `created_at`.
Validation requires a verified mandate for a commissioned project; a proposed offer remains a proposal.

## Chat-first build policy
The current ordinary ChatGPT project conversation is the default specification and development control surface. Work mode is not necessary to author or review agent specifications, JSON schemas, tests or GitHub pull requests. New chats for Cashin and Carpenter, and Work mode for interactive system use, can be introduced only when operational need justifies them. A prompt or draft PR alone does not install or activate a persistent agent.

## Expected engineering sequence (not completion claims)
1. Register the two role manifests in the actual FFOS permission service, with source pin + checksum, read scopes and deny-by-default.
2. Expose the existing approved FFOS ProjectHub read model to Carpenter through a registered adapter; no direct legacy source access.
3. Bind Cashin to FFC retrieval and authorised opportunity/FF business context (not all Corpus objects).
4. Implement a shared `estimate → calculate → reconcile → explain` interface over the Project Budget Engine; no duplicate economic truth.
5. Implement RAMx timebank with version, event trace, actual vs committed vs forecast balance and explicit extension gate.
6. Connect handover and project proposals through the existing Project Steward permission path, including rejection and rollback.
7. Add human-readable views and evidence/status indicators to ProjectHub without treating missing sources as zero.
8. Execute FFC `acceptance-tests-v0.1.json` plus adapter-level security, economics, authority and isolation tests. Store observed results, not merely intentions.
9. Receive human Fit-for-Purpose acceptance; reconcile FFC versioning, FFOS release and linked documentation. Do not re-label initial specification as deployed.

## Deployment blockers
- Source version not pinned/reviewed.
- Runtime/permission registry not available.
- Missing actual Project Budget Engine binding.
- Unreviewed accounting, employer or client-specific cost inputs.
- Barnombudet source dependency or inherited numeric default found.
- No observed security and calculation tests.
- No authorised human release decision.

## Testing and rollback
Use synthetic input-only fixtures. Tests must include missing multipliers, RAMx balance, total-reconciliation, cross-perspective non-duplication, employment-mode isolation, scenario isolation, authority denial, rejected handover, and no-legacy-source access. Preserve earlier ProjectHub behaviour; implement behind a disabled/guarded feature flag until accepted. Rollback reverts adapter/registration without modifying earlier ProjectHub financial actuals.

## Provenance
Design derived from FFC's own Operational Routing Grammar, RAMx Resource Adaptation Grammar, FFOS ProjectHub Contract v0.3 and Project Budget Engine Contract v0.1 (accessed 28 October 2026). Source Barnombudet organisational assumptions are excluded.
