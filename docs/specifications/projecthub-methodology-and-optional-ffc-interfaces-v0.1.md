# FFOS ProjectHub — Project Autonomy and Optional FFC/Pius Inputs

**Status:** DEVELOPMENTAL specification; NOT_IMPLEMENTED / NOT_RUNTIME_VERIFIED. **Date:** 2026-10-28.

## Scope
This is a **system boundary** for an existing ProjectHub, not an agent deployment plan. Every project is a separately governed entity with its own purpose, owner, mandate, rights, economic assumptions, methodology and decision-makers. ProjectHub supports developing/operating these projects irrespective of whether they originate in F&F.

## Source of truth
FFC proposal: `Motherpher/form-flode/17-ffos/projecthub/project-autonomy-and-dossier-profiles-v0.1.md`. Governing prior ProjectHub contract: `Motherpher/form-flode/17-ffos/operator/projecthub-contract-v0.3.md`. Existing source v0.3 currently describes a Pius/PIVE-led chain; the present optional-ingress proposal **requires reconciliation before constitutional acceptance**, not silent replacement.

## Input and method profiles
- `FULL_FF`: The work may begin from a **full F&F Assignment Dossier**, drawing on selected full-scope consulting grammar, DNA-Box and relevant intelligence. This is still a project artefact, not an F&F agent.
- `CONFIGURED`: Select only the FFC methods/components useful to this project.
- `PROJECT_NATIVE`: Develop/operate a project according to its own owner's or external methodology. **No F&F or Pius method automatically applied.**

Pius/APz outputs are additional **optional, separately governed sources** if the authorised project requires them. This document does not register future Piusites, create APz agencies or determine their protocol-bound agent relationships.

## Distinguish identities
- **Cashin:** sole proposed F&F business agent, for getting commercial assignments and revenue into F&F; may submit an *approved* commission dossier, not a mandatory project agent.
- **Carpenter:** earlier FFOS ProjectHub agent proposal superseded; not registered or deployed.
- **ProjectHub:** project system, owning project core, operating methodology profile and project state, independent of Stable.
- **FFC/DNA-Box:** knowledge/methods and design artefacts, optional project inputs.
- **FFOS Project Steward:** existing permissioned role with a separate governance contract; not automatically an F&F Agent Stable agent.

## Proposed ingress contract
`ProjectIngress {project_id, owner_ref, mandate_ref, method_profile, source_refs, optional_assignment_dossier_ref, optional_FFC_components, optional_Pius_refs, resource_budget_ref, rights, acceptance_gates}`.

An optional `FullAssignmentDossier` carries version, project/assignment purpose, actors, evidence, design, methods, outputs, resource logic, assumptions, relevant DNA-Box if justified, Pius output references if used, acceptance and handover status.

## Economic isolation
A project does not inherit F&F consulting rate, F&F owner's employment salary, Barnombudet payroll parameters or Pius instructions. If the project actually commissions an F&F service, the fee may be sourced from FFC `08-business/ff-commercial-baseline-2026-2027.json` (SEK 1,200/hour ex VAT, plus applicable VAT). The owner's 2026–2027 employment salary expectation (SEK 55,000 gross/month) is separate. Third-party project costs require that project/owner's actual sources.

## CDX/ProjectHub estate boundary
All ProjectHub code and operations inside the FFOS repository fall under FFOS's repository-level `.cdx/anchor.json`. A ProjectHub project **record** does not automatically require an independent repository anchor; a separately deployed service/owned repository is separately governed. The FFOS [effect inventory](../../integrations/cdx/projecthub-effect-inventory-v0.1.json) identifies A3/A4/A5 gates. No consequential CDX runtime enforcement is verified yet. HCC is an admitted CDX interpretive source and does not bypass human authority.

## ProjectHub runtime gates
Existing project-owner rights, project state, evidence, capability/permissions, Project Steward A3 gate and separate A4/A5 authorities remain. No generic agent auto-routing. No automatic Pius dispatch. No new agent-installed claim from this proposal.

## Next acceptance checks
1. Read v0.3 governance and explicitly reconcile the proposed non-Pius ingress semantics.
2. Verify ProjectHub can run a project without FFC, Cashin, DNA-Box or Pius.
3. Verify optional full F&F dossier handover with actual provenance and authority.
4. Verify isolated project budgets, rights and methods per owner.
5. Verify Pius-derived outputs are routed only with external consent, and no future Piusites invented.
6. Log observed tests and obtain human Fit-for-Purpose and release decisions.

## Provenance
Principal design correction recorded 2026-10-28 in the F&F ProjectHub DevOps working dialogue. Earlier two-agent proposal retained only at `docs/99-archive/projecthub-two-agent-integration-proposal-v0.1.md`.
