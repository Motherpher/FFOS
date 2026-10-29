# AMA — Comprehensive Agent Template Specification

**Architecture:** AMA (Agent Master Architecture)  
**Owner acceptance model:** AI builds and verifies; owner reviews and accepts.  
**Scope:** Reusable, domain-agnostic agent template. AMA is not an agent.

## Completion target

An AMA user should be able to specify an agent using a complete configuration, choose optional functions, attach interchangeable host services, generate a validated agent blueprint and obtain an explicit inventory of missing implementation obligations **before** writing domain-specific code. A manifest is not enough; the template must cover design, tooling, behavior, governance, runtime integration, operation, evaluation and retirement.

The authoritative machine-readable coverage inventory is `packages/agent-model/ama-template-coverage.json`. Every module has an explicit purpose, mandatory/optional classification, lifecycle and current implementation status. **PARTIAL_EXISTING_CONTRACTS is not COMPLETE**. Template work must fill absent contracts rather than declaring completion by adding this inventory.

## Canonical construction process

1. **Profile:** define agent purpose, success criteria, environment, stakeholders, limitations, scope and excluded actions.
2. **Authority:** specify owner, external governance source, permitted effect ceilings, autonomy limits, escalation and stop conditions.
3. **Interface:** define commands, task schema, workflow graph, capability registry, input/output validation, tools and external API adapters.
4. **Intelligence:** choose reasoning/planning strategy, prompt layering, context budget, model fallback, grounding, retrieval and memory policies.
5. **State:** define durable run lifecycle, checkpoints, concurrency, retries, idempotency, unknown effects and reconciliation.
6. **Collaboration:** declare delegation/agent-to-agent contracts, human handoffs and separation of duties; default OFF.
7. **Data:** declare schema, sources, source authority, consent, secrecy classification, retention, deletion and evidence custody.
8. **Security:** declare identity, credential lifecycle, policy injection, least privilege, effect classification, revocation and fail-closed operation.
9. **Operations:** declare host requirements, deployment descriptor, capacity, observability, telemetry, incident handling, rollback, continuity and retirement.
10. **Evaluation:** specify fixtures, acceptance thresholds, adversarial cases, regression suite, portability validation and independent host evidence when required.
11. **Economics and UX:** cost ceilings, quotas, localization, accessibility and support/escalation behavior.
12. **Output:** freeze version-pinned blueprint, validate completeness, emit missing-work list and obtain owner acceptance.

## Output package for every AMA-built agent

- Definition/manifest, command catalog, workflows, capabilities and adapter specifications.
- Per-module configuration with explicit defaults and optional-feature OFF semantics.
- Authority and security integration requirements: policy provider is injected, never hardcoded.
- IO types, state-machine descriptions, failure matrix, retry and recovery semantics.
- Host deployment and operation requirements, never inferred from AMA validation alone.
- Test matrix: schema, semantic, negative/adversarial, compatibility, lifecycle and operational criteria.
- Build completion report: complete/partial/missing per required module with blocking obligations.
- Owner decision record and agent-instance operational admission performed **outside** AMA.

## Architectural invariants

- Contract/configuration does not equal implementation.
- Reference fixture pass does not equal live host readiness or permission to perform an effect.
- No specific domain, vendor, sovereign authority, datastore, model, framework, MCP host or runtime is mandatory.
- Explicitly version breaking changes and provide migration guidance; preserve legacy v1 contract.
- Default to denying external consequential actions and disabling conditional modules.
- An agent's acceptance belongs to its authorized owner/host; AMA cannot accept its own generated instances.
- Host binding F8.7 and real-instance operational M7-O are not requirements for accepting the universal template.

## Backlog derived from coverage inventory

Immediate engineering requirement: complete the unimplemented module contracts (instruction, knowledge, multi-agent, eventing, human-interaction, observability, safety, privacy, secrets, interoperability, deployment, cost-control, localization, governance), strengthen partial module contracts and produce a universal blueprint generator plus completeness checker. Continue integration and adversarial test coverage until the template is materially complete, not simply documented.

**Status:** This specification and inventory define the target; they do not claim the listed missing modules have already been implemented.
