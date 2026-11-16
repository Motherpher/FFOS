# AMA v1.0 — Household-protocol FIN progression

**Authority:** Director authorizes the *workflow policy* permitting verified progression. AMA is the only development target. Household Family's protocol is reused as a method, **not** as an active agent, MCP plugin or scheduler.

## Protocol classification and duties
- **J0:** ephemeral inspection and cleanup; may collect evidence but not mutate repository or grant durable effect authority
- **J1:** registered bounded corrective recipe with source/digest preconditions; independently verified
- **J2:** interpretive/constitutional stop; no automatic repair or FIN progression
- **Janitor:** inspect sources, mandate, drift, open requirements and acceptance evidence
- **Handyman:** execute only already authorized bounded corrections
- **Verifier:** independently assess immutable source, tests and requirements; cannot issue Director acceptance
- **Director:** external authority for mandate, priority, accepted FIN gates, next-stage delegation and AMA v1.0 release

## Conditional next-FIN policy
A completed FIN stage may be nominated for progression by the Household *protocol* only when:
1. Its Janitor, Handyman and independent Verifier evidence all report `VERIFIED_PASS` with source references.
2. Any J1 action has a registered recipe and J2 is absent.
3. The current Director mandate has been independently verified.
4. The Director has separately accepted that FIN stage, with independent acceptance/signature verification evidence.
5. The next FIN stage is in sequence and has its own externally verified mandate.
6. All stage-specific required checks (including exact-head executed tests where required) have passed.

This is a **permission to nominate an eligible successor**, not an autonomous permission to manufacture acceptance, create new mandates, run unrelated tasks, bypass branch protection, merge, publish or activate agents.

## Implementation
`packages/agent-model/conformance/ama_fin_protocol_progression.py` is a **read-only decision evaluator** operating on externally verified evidence records. Its output is `ELIGIBLE_FOR_DIRECTOR_AUTHORIZED_NEXT_STAGE` or `HOLD`. It does not trigger a GitHub workflow, issue a signed decision or schedule background execution. Live invocation would require a separately authorized orchestrator; none is built or requested here.

## Current disposition
FIN-01 remains `HOLD`: 31 source requirements have no direct test links, primary source evidence has not been independently authenticated, full exact-head executable tests have not been run and Director adoption is pending. Therefore the next FIN may be prepared, but not **auto-accepted as a consequence of FIN-01**. No evidence is fabricated to unblock it.

FIN-05 is terminal and always requires a distinct Director release decision after all completion gates.

## Source basis
- `modules/household-family/README.md` on canonical FFOS main: J0/J1/J2 meanings, independent Verifier, Director-controlled acceptance
- `modules/household-family/docs/protocol_reconciliation.md`: original authority separation and limitations
- `packages/agent-model/ama-release-gates.json`: architecture baseline and release authority requirements
- `docs/roadmap/AMA-V1-COMPLETION-EXECUTION-REGISTER.md`: five FIN closure runs
