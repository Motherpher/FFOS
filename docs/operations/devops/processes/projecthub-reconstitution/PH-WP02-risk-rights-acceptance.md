# ProjectHub Reconstitution — PH-WP02 Scope, Threat, Rights & Acceptance Baseline

**Process:** FFOS-DEVOPS-PH-RECON-001  
**Level:** L3 Controlled  
**State:** COMPLETE  
**Date:** 2026-11-16

## 1. Product scope

ProjectHub is a native FFOS project operating subsystem that maintains governed project state from ingress/genesis through design, delivery, monitoring, learning, closure and institutional memory.

It is not:
- an F&F agent;
- a Pius agency/Piusite;
- a Barnombudet deployment;
- a replacement for canonical UDL/FIELD/Pius protocols;
- an accounting system;
- an unrestricted autonomous external-action system.

## 2. Supported methodological profiles

### FULL_FF
Project explicitly adopts a full F&F/FFC assignment methodology and may receive a versioned Assignment Dossier, DNA-Box and separately governed Pius/PIVE outputs.

### CONFIGURED
Project selects only named FFC methods/components that are useful to its own mandate.

### PROJECT_NATIVE
Project uses the owner's/external methodology. FFC/Pius methods are not automatically applied.

The chosen profile is project state and may change only through governed change control.

## 3. Data classes

| Class | Meaning | Examples | Default treatment |
|---|---|---|---|
| PH-D0 PUBLIC | safe public project information | published project title, public funder page | readable where product policy allows |
| PH-D1 INTERNAL | internal operational information | work packages, internal deadlines, project notes | authenticated project-scoped access |
| PH-D2 CONFIDENTIAL | commercial/client/confidential information | proposals, budgets, unpublished client decisions | explicit project authorization; no public rendering |
| PH-D3 PERSONAL | personal/participant information | contact/participant identifiers, interview records | minimization, purpose limitation, restricted access, pseudonymous analytical views |
| PH-D4 SENSITIVE | high-risk/special-category/safeguarding/regulated material | child safeguarding records, sensitive health/social information, secrets/credentials | ProjectHub must not ingest by default; explicit lawful/organizational authority and dedicated protection required |
| PH-D5 SECRET | credentials and authentication secrets | API tokens, DB URLs, session secrets | never stored as ProjectHub content; secret manager/runtime environment only |

## 4. Role semantics

Current active FFOS authority remains `DIRECTOR`.

Target ProjectHub role vocabulary is defined for implementation but is **not active merely because it appears here**:

- `PROJECT_OWNER` — accountable owner for a project mandate and project-level approvals within granted scope;
- `PROJECT_OPERATOR` — may operate authorized project workflows, not alter mission or external authority;
- `REVIEWER` — read/review/decision role as explicitly assigned;
- `SERVICE` — machine identity with narrow connector/runtime permissions;
- `PARTICIPANT_DATA_STEWARD` — optional restricted role for participant-identifiable datasets where such data is admitted;
- `DIRECTOR` — FFOS human authority; retains estate-level decisions and any authority not explicitly delegated.

No multi-user role becomes effective until PH-WP07 implements and tests it.

## 5. Effect classes

- **A0 Observe** — read/query within rights.
- **A1 Analyse** — derived analysis; no canonical mutation.
- **A2 Draft/Propose** — non-canonical proposal/draft.
- **A3 Governed reversible mutation** — canonical internal state change; requires local authorization, transactional write, idempotency, audit and applicable CDX decision.
- **A4 External/financial/contractual/public effect** — separate explicit action-specific human authority + applicable CDX mediation + external receipt.
- **A5 Mission/DNA/policy redesign** — governing human decision/change control; generic Project Steward cannot execute.

## 6. Primary threat model

| Threat | Failure | Required design response |
|---|---|---|
| Cross-project leakage | object/relationship traversal exposes another project's data | explicit project ownership/scope on objects/relations + negative traversal tests |
| Partial canonical write | object changes without relation/event or vice versa | atomic Unit-of-Work / transaction for canonical write set |
| Replay/duplicate effect | retried request duplicates mutation/external action | idempotency keys + effect receipts |
| Concurrent overwrite | stale actor writes over newer project version | optimistic concurrency/version precondition |
| Content-authority injection | imported document/prompt attempts to grant authority | content never grants authority; explicit authority/mandate refs |
| Role escalation | operator performs owner/Director action | authorization matrix + fail-closed policy |
| Privacy disclosure | participant identifiers leak into UI/exports/analytics | minimization, pseudonymization, role filtering, small-N suppression where relevant |
| Secret ingestion | credentials enter project objects/logs | deny/strip PH-D5; secret manager only |
| Stale provider sync | external change silently overwrites canonical state | LinkedArtifact review + source/version comparison |
| Methodology contamination | F&F/Pius cost/method assumptions enter PROJECT_NATIVE project | method-profile isolation + source provenance |
| Funding distortion | funder rules silently redesign project | hard eligibility + explicit distortion/change proposal |
| Evidence laundering | arbitrary ref satisfies North Star | evidence object existence/scope/state/freshness/provenance validation |
| Migration corruption | legacy fixture import damages current registry | isolated migration rehearsal + backup/restore + reconciliation report |
| CDX unavailable | consequential effect continues without decision/evidence | fail closed |
| External effect non-reversibility | publication/payment/contract cannot be rolled back | pre-effect approval + receipt + compensating-action plan; never claim rollback where impossible |

## 7. Rollback / recovery model

### Internal state
Canonical state is append-only/versioned. Recovery uses a new governed compensating version/event; historical rows are not edited away.

### Transaction failure
A failed Unit-of-Work must leave no partial canonical mutation.

### Migration
Migration is rehearsed against isolated/restored data. Production migration, if later authorized, requires a backup/restore path and exact migration receipt.

### External effect
External effects are not labelled “rolled back” unless the target system actually supports reversal and returns evidence. Otherwise ProjectHub records a compensating action and residual consequence.

### UI/runtime release
New ProjectHub surfaces must be feature-gated or independently reversible at deployment level until release acceptance.

## 8. Acceptance model

A ProjectHub release candidate cannot be accepted unless evidence demonstrates:

1. `PROJECT_NATIVE` works with no FFC/Pius dependency.
2. FULL_FF and CONFIGURED use explicit source refs and do not become hidden defaults.
3. canonical writes are atomic, idempotent and version-checked.
4. cross-project leakage tests fail closed.
5. role/rights tests include denial cases, not only successful Director use.
6. PH-D3 views are minimized/pseudonymized and sensitive export paths are controlled.
7. PH-D5 is rejected from ordinary project content.
8. ProjectHub A3 has verified CDX allow/deny/policy-unavailable behavior and SPETL evidence.
9. A4/A5 cannot execute through generic Steward mutation.
10. evidence refs are validated before satisfying North Star.
11. linked-artifact inbound changes require review unless a separately governed external authority contract exists.
12. the UI does not imply provider connectivity that is not actually verified.
13. legacy migration fixture passes without making legacy runtime a dependency.
14. one real project is run end-to-end.
15. one PROJECT_NATIVE or CONFIGURED pilot demonstrates method independence.
16. merge, release, deployment and acceptance states are recorded separately.

## 9. Non-goals for first native release

- autonomous contracting/payment/grant submission;
- automatic Pius routing;
- automatic Barnombudet synchronization;
- full accounting ledger;
- ingestion of PH-D4 safeguarding/special-category datasets without a dedicated later admission decision;
- broad multi-tenant SaaS exposure;
- replacing canonical UDL/FIELD/Pius runtimes.

## Exit

**PH-WP02 COMPLETE.**

The L3 threat/rights/acceptance baseline is sufficient to enter Design. Any later expansion into PH-D4 sensitive data, public multi-user service, or new consequential provider effect must trigger prospective scope/risk reassessment.
