# FFOS Full Restructure Acceptance — 2026-10-29

**Authority:** explicit Human Director instruction  
**Scope:** structural baseline required for future FFOS development  
**Target PR:** #31 — Agent Stable suite: AMA + Mechanic + MESSI #1 + Household #2  
**Production activation:** NONE

## Decision

The Human Director has instructed that the full FFOS restructuring be pushed through because the previous repository layout is no longer fit for future development.

This decision authorizes **merging the structural and engineering baseline** represented by PR #31 despite persistent GitHub hosted-runner allocation failure, provided the exception remains narrow.

It does **not**:
- activate MESSI;
- production-accept Household Family;
- admit or connect a new provider;
- grant external write authority;
- waive AMA conformance for a future deployment;
- waive runtime/security tests when an agent version moves toward DEPLOYABLE or ACTIVE;
- convert source presence into production evidence.

## Canonical post-restructure architecture

```text
FFOS
├── Operator / work / domain systems
├── Agent Stable
│   ├── AMA — master architecture, not an agent
│   ├── Agent Mechanic — technical assurance/maintenance, not a fleet agent
│   └── Agent Fleet
│       ├── #1 MESSI
│       └── #2 Household Family
│           ├── Janitor
│           ├── Handyman
│           └── Verifier
└── Pius — reserved/integration governed separately
```

Director remains external governing authority.

## Integration reconciliation

The Agent Stable feature line was reconciled with the newer `main` content for:
- `.cdx/anchor.json`;
- `.github/workflows/cdx-binding-audit.yml`;
- `docs/governance/CDX-ESTATE-POLICY.md`.

PR #31 is mergeable after that reconciliation.

## Verification exception

Multiple PR workflow attempts for Agent Stable, AMA, Household and CDX returned:
- `steps = 0`;
- `runner_id = 0`;
- empty runner name.

No assertion executed. Those workflow conclusions are therefore runner-allocation failures rather than negative test evidence.

Because the restructure is required to create a coherent development baseline, the Human Director explicitly authorizes the repository merge under an **EXTERNAL_RUNNER_EXCEPTION_STRUCTURAL_ONLY** disposition.

## Deferred executable gates

The following remain mandatory before any affected agent becomes DEPLOYABLE or ACTIVE:
1. AMA static conformance;
2. fleet-contract verification;
3. Household CI and security suites where applicable;
4. CDX binding checks where applicable;
5. runtime/database/integration tests;
6. independent verification evidence;
7. Director lifecycle/activation decision.

## Legacy handling

- Old permissioned "agent" labels remain historical/runtime-role compatibility and are not canonical Agent Stable fleet identities.
- Cashin and Carpenter are not fleet agents; useful functions require explicit workflow/command/capability porting into MESSI.
- Legacy Household implementation remains compatibility evidence; canonical Household Family is Agent #2 with Director external and Janitor/Handyman/Verifier internal.
- No historical evidence is deleted by the restructure.

## Disposition

**STRUCTURAL_RESTRUCTURE_ACCEPTED_FOR_MERGE**  
**EXTERNAL_RUNNER_EXCEPTION_STRUCTURAL_ONLY**  
**AGENT_PRODUCTION_ACTIVATION = NONE**
