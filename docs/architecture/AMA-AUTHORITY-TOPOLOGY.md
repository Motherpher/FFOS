# AMA Authority Topology — Cross-System Reconciliation

**ID:** FFOS-AMA-AUTH-001  
**Status:** RECONCILED DESIGN, NOT VERIFIED RUNTIME  
**Date:** 2026-10-29  
**Scope:** FFOS agents and their external governance bindings

## 1. No single universal linear authority chain

Constitutional authority, moral oversight, normative source ownership, delegated operational authority, policy supply, local enforcement, and execution are different relations. They MUST NOT be presented as a single ladder in which each component delegates sovereignty to the next.

### Authority planes

| Plane | Source / actor | Meaning | Limit |
| --- | --- | --- | --- |
| Human sovereignty | Human principal / Supreme Director for Pius, authenticated Director for Phase-0 FFOS | Origin of explicitly granted mandates, decisions and approvals within the relevant system | Identity/authentication alone does not imply waiver, override or all-domain authority |
| Pius moral/constitutional oversight | Human Canon Charta (HCC), with Ex-Inerta Libertad as a constraint on artificial agency | Independent moral boundary in the Pius universe; cannot be subordinated to a software worker | HCC is not an FFOS dispatcher or generic CDX runtime adapter |
| Pius normative architecture | Accepted versioned Pius Codex, governance contracts, Part 7 and Appendix M | Canonical Pius doctrine for registered, bounded Piusites and their governance | Pius runtime remains RESERVED in FFOS; historical Codex doctrine is source lineage, not an activated FFOS runtime |
| Estate governance | Conductellence (CDX) | Independently versioned governance, authority policy, assurance and evidence controls for applicable governed systems | CDX is not a universal super-admin, owner of FFOS dispatch, or subordinate AMA module |
| FFOS operational governance | FFOS Director authority / approved work-package decisions | Controls agent mandate, activation, delegation, work progression and acceptance inside FFOS, within applicable external governance | Phase-0 DIRECTOR is an authenticated class, not automatic protocol-specific override |
| FFOS agent architecture | AMA and registered contracts | Specifies valid agent identities, capabilities, workflows, conformance, evidence and effect ceilings | AMA is a contract, NOT an authority principal |
| Technical stewardship | Agent Mechanic | Tests, inventory, compatibility, drift and bounded maintenance under mandate | Cannot approve its own work or expand another agent's authority |
| Execution | Registered agent / workflow / internal role / tools | Performs only effects allowed by its mandate, scope, capability, policy and human gates | A capability, tool response or internal role cannot confer authority |

## 2. Distinct relationships, not a transitive hierarchy

```text
HUMAN SOVEREIGN / AUTHORIZED PRINCIPAL
    ├── approves Pius constitutional changes, where applicable
    └── delegates bounded FFOS Director mandates / approvals
                   │
                   ▼
          FFOS DIRECTOR DECISION
                   │ admits/activates/dispatches
                   ▼
     FFOS AGENT REGISTERED UNDER AMA
                   │
                   ▼
       WORKFLOW / COMMAND / CAPABILITY
                   │
                   ▼
              RUN + EVIDENCE

PIUS: Ex-Inerta Libertad + HCC + accepted Codex / agent doctrine
       └── normative constraints and source lineage for Pius;
           integration into FFOS is NOT yet activated

CDX: independent governing policy and assurance source
       ──publishes applicable pinned policy──>
       FFOS LOCAL ENFORCEMENT POINT
       ──allow / restrictive decision + SPETL──>
       consequential effect, ONLY when authorized
```

These are **overlapping authority and enforcement planes**, not a transitive `Pius → CDX → AMA → agent` delegation chain.

## 3. A governed consequential execution

`human mandate / actor identity → Director-authorized assignment and target scope → registered agent + pinned AMA contract → applicable CDX policy pin and local enforcement decision → allowed capability execution → independent verification/evidence → Director/domain acceptance where required`.

This is a **target execution contract**, not a statement that FFOS already has verified CDX runtime binding. Applicable Pius-specific HCC/Piusite gates may be additionally mandatory **only if and when** a versioned Pius integration contract is activated. No invented precedence between HCC and CDX is implied.

## 4. Pius internal governance is not FFOS governance

Prior Pius design discussions distinguish Supreme Director human sovereignty, HCC independent moral review, Codex law, APz/PiusInn orchestration, Agency→Piusite routing, and bounded execution. Those are not interchangeable with the FFOS Director class, CDX policy enforcement or Agent Mechanic. FFOS must not claim an active Pius APz/HCC runtime pathway based on conceptual lineage.

## 5. Source and verification register

- **Pius System Codex 5.0**, Part 5 (HCC), Part 7 (Piusites), Appendix M (Ex-Inerta Libertad), Appendix O (HARP): uploaded normative source for historical Pius doctrine.
- **User-approved prior Pius 6 discussions (July–October 2026)**: Supreme Director, HCC, PiusInn/APz, Agency→Piusite and separation of constitutional from runtime authority; **conversation decisions, not proof of deployed runtime**.
- **Conductellence**: `RUNTIME-INTEGRATION/README.md` and `DISTRIBUTION/policy-shards/authority.json`: independent governance supply, local enforcement, authority/mandate refs, SPETL; repository contract.
- **FFOS**: `docs/specifications/AUTHORITY.md`, `docs/architecture/ARCHITECTURE.md`, `.cdx/anchor.json`: Phase-0 authenticated Director, Pius RESERVED, CDX integration boundary.
- **Legacy Household in form-flode/17-ffos**: domain-specific Director/Janitor/Handyman mechanics; does not create upstream constitutional authority.

**Unverified:** exhaustive review of every historic chat and every repository revision; exact precedence in an integrated Pius/CDX/FFOS production runtime; production enforcement. Do not claim these facts until their canonical versioned contracts and tests are available.

## 6. Control requirements

1. Record `principal_ref`, `authority_ref`, `mandate_ref`, `actor`, `agent_id/version`, `workflow_id/version`, target, effect, policy pin and evidence.
2. Explicit authority is checked at the **local enforcement point**; a Director login is insufficient by itself for a protocol waiver.
3. Reject missing/revoked mandates, inactive agents, effect ceiling violations and unavailable policy for consequential execution.
4. Treat HCC/Pius doctrine as a separate named integration dependency where required; do not silently translate it into CDX.
5. Mechanic may prepare/test a migration; a separate authorized Director accepts and activates it.
6. Preserve distinctions: source-defined, implemented, anchored, runtime-bound, tested, and accepted.
