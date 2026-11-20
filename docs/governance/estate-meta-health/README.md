# FFOS Estate Meta-Health — standing estatewide health and coherence routine

**Routine ID:** `FFOS-EMH-001`  
**Home:** `Motherpher/FFOS/docs/governance/estate-meta-health/`  
**Director directive:** 20 November 2026 — establish a conceptual and procedural estatewide meta-health routine.  
**State:** SOURCE REVIEW / not yet merged to `main`; [establishment Issue #123](https://github.com/Motherpher/FFOS/issues/123). The Director's request establishes the programme intent, while the exact protocol revision still follows normal source review.  
**Nature:** Read-first, evidence-led, human-governed diagnostic and improvement cycle. It is **not** a standalone repository, autonomous agent, GitHub Project, mandatory CI, production service, constitutional authority, or a substitute for domain DevOps.

## What it exists to achieve

The estate contains multiple independent systems, repositories, products, archives, policies, websites and derived knowledge interfaces. Local development may be valid while the overall estate becomes difficult to understand, insecure, inconsistent, inaccessible, redundant or operationally fragile. Estate Meta-Health identifies these **cross-boundary conditions** and turns verified observations into proportional, source-owned corrective action.

**Definition:** Estate health is the current ability of the connected estate to preserve truthful source identity, delegated authority, verifiable operations, safe access, intelligible user journeys and the capacity to correct drift and adapt without losing provenance.

### Form and flow interpretation

- **Form:** the institutional/technical structures holding repository ownership, canonical materials, interfaces, roles, rights, releases and workorders.
- **Flow:** how people, evidence, decisions, dependencies, data, software changes and knowledge navigate across those structures.
- **Health:** forms maintain their authority and integrity **while** relevant flows remain possible, discoverable, proportionate, accountable and recoverable.
- **Failure pattern:** local artifacts exist but cross-repository action or understanding stalls; apparent completion outruns evidence; a proposed interface is treated as a deployed one; knowledge and authority drift into duplicates.

The routine does not diagnose health solely from commits, tickets or traffic. Movement alone does not equal useful progress.

## Location and relationship to the estate

```text
Human Director — decision / prioritisation / acceptance
        │
CDX — applicable constitutional authority and consequential-effect controls
        │
FFC — organisational and corpus source ownership
        │
FFOS — estate coordination and operational record
        └── docs/governance/estate-meta-health/
              ├── README.md                      programme entry
              ├── PROTOCOL-v1.0.md               conceptual and procedural kernel
              ├── RUN-TEMPLATE-v1.0.md           repeatable inspection record
              └── BASELINE-2026-11-20.md         starting evidence / uncertainty
```

**Separate but linked:** FF-GH-WO-002 [Issue #48](https://github.com/Motherpher/FFOS/issues/48) is a bounded GitHub Projects/Wikis/guide workorder; Estate Meta-Health [Issue #123](https://github.com/Motherpher/FFOS/issues/123) is the standing oversight routine. Future issues are created only for actual, evidenced corrections and follow the canonical source owner. GitHub Project V2 remains a planning view, and FFOS ProjectHub is a distinct programme with its own release gates. No new universal management board is required.

## Operate the routine

1. **Choose mode:** SNAPSHOT (specific new event), LIGHT (bounded monthly-type drift check), FULL (90-day-type thorough cycle), or INCIDENT (safety/authority escalation). Frequency is a suggested manual practice—not a scheduled task or background executor.
2. **Read current source:** start with [the protocol](PROTOCOL-v1.0.md), previous run, current repository metadata, relevant decisions and canonical domain documentation; never use a prior summary as proof of today's state.
3. **Record scope:** visible installations, inaccessible repositories, date, source commit refs, domains, trigger, relevant authority and what you did not test.
4. **Diagnose:** apply the nine dimensions, distinguish verified fact from inference, identify cross-repo impact and severity.
5. **Route:** reuse an existing source-owned Issue/workorder where possible; propose the smallest corrective action and its actual decision gate. Escalate security and constitutional effects to their own owners.
6. **Verify outcome:** only actual source, tests, user tasks and authorised external readback can close evidence gaps. Report unknowns explicitly.
7. **Learn:** capture emerging failure patterns and update the routine only on evidence and approved review.

**Suggested call:** `FFOS: Estate Meta-Health — LIGHT / FULL / SNAPSHOT / INCIDENT [scope]`. This is a **human-readable request convention**, not a registered ChatGPT command, agent or automatic dispatch endpoint.

## Starting documents

- [Protocol and thresholds](PROTOCOL-v1.0.md)
- [Run / reporting template](RUN-TEMPLATE-v1.0.md)
- [Initial baseline](BASELINE-2026-11-20.md)
- [Estate Wiki and knowledge review (draft PR #55)](https://github.com/Motherpher/FFOS/blob/docs/wo002-reconciliation-20261116/docs/governance/github-estate/wo002-20261120/WIKI-KNOWLEDGE-ARCHITECTURE-REVIEW-v1.0.md) — review-branch source, not yet part of `main`.

## Guardrails

- Observations, recommendations and metrics **do not** constitute Director acceptance or CDX `ALLOW`.
- No private source material, personal data, tokens, sensitive client records, or restricted repository excerpts may enter a public report.
- Domain repositories own source/code/rights and remediation; historical records are preserved.
- No automatic Wiki or website publication, GitHub configuration change, Drive mutation, DB write, deployment, secret rotation or account permission change follows from a health finding.
- Existing FFOS DevOps [Operating Model 1.1](../../operations/devops/README.md) remains optional, forward-only and independent. Existing open workorders are not retroactively reclassified.
