# AMA scope boundary — universal agent architecture only

**Status:** Governing workstream scope clarification (2026-10-29).

## Normative identity
AMA (Agent Master Architecture) is a **domain-agnostic architecture and conformance framework for building agents**, never an agent, a delegated Director, a WP executor or an independently operable system.

AMA deliverables in this workstream:
- Universal versioned agent manifest, command/workflow/capability and effect-class contracts.
- Optional cognition, memory, durable execution, evidence, evaluation, recovery and operations schemas.
- Generic adapters/interfaces and reusable conformance tooling with negative/adversarial regression coverage.
- Architecture documentation, migration rules, interoperability profiles and explicit non-self-authorization invariants.
- Test fixtures must use synthetic, unbranded reference agents rather than a named live implementation.

## Excluded from AMA workstream
- Household Family agent design, MCP server, orchestrator, Janitor/Handyman/Verifier implementation.
- CDX work-package execution, release publication, agent-specific security-policy decisions or estate rollout.
- MESSI implementation or any other instantiated agent.
- Production registration, activation, tool credentials, production effects and agent-specific acceptance.

## Boundaries and portability
CDX or FFOS may provide external *example* host integrations; they may not be hard-coded as the sole authority or mandatory dependency for the universal AMA contracts. Security/policy enforcement is a pluggable external service with generic trust and evidence requirements. An AMA conformance PASS is **not** a production deployment or agent authorization.

## Completion definition
AMA is complete as an architecture when stable generic schemas, reusable host interfaces, compatibility/migration rules, validation tests, documentation and independently reviewed reference conformance evidence are verified. A real agent built using AMA has its own separate implementation, runtime integration, approval and deployment lifecycle.

## Historical cleanup
Draft FFOS PR #21 (Household instance contract) was closed **unmerged** following scope correction. The previous AMA-to-CDX work-package-executor handoff has been removed from the AMA development branch. Neither the Household draft branch nor other instantiated-agent source should be merged into the agnostic AMA workstream.
