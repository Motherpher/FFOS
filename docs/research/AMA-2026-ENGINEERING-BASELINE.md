# AMA — Agent Engineering Reference Baseline (October 2026)

**Status:** RESEARCH-INFORMED DESIGN INPUT; HARP FULL REFERENCE AUDIT (RefA / ITR2–ITR6) PENDING; NOT A RUNTIME CERTIFICATION  
**Owner:** FFOS / Agent Stable  
**Applies to:** Universal AMA contract design, evaluation and host-provided infrastructure  
**Scope:** Engineering patterns and external open standards relevant as at 2026-10-29.

## Design premise

AMA is an agent-agnostic template. Host authority, policy and deployment integrations are separate, versioned contracts and never modify the meaning of its common requirements.

A first-class agent requires independent identity, scope, activation and operational accountability. Otherwise use a workflow, command, capability or deterministic service. No domain-specific identity or workflow is part of the reusable template.

## Evidence-checked external reference set

| Source | Version / date | Engineering implication | AMA decision |
| --- | --- | --- | --- |
| Model Context Protocol official release | 2026-07-28 | Stateless request core, explicit request metadata, new authorization hardening, optional Tasks extension and formal extension lifecycle | **ADOPT AS TARGET** for remote MCP connector transport; version-pin implementation, do not mistake transport statelessness for job statelessness |
| MCP authorization security considerations | 2026-07-28 | Validate token issuer/resource audience, do not pass through access tokens, prevent confused-deputy elevation | **MANDATORY DESIGN CONTROL** for future MCP adapter; no MCP adapter is claimed implemented |
| OWASP Agent Control Standard (ACS) | 2026-09-01 | Middleware hooks, runtime controls, inspectable agent behavior, policy interoperability | **ADOPT AS CONTROL DESIGN INPUT** for local CDX hooks, without claiming ACS certification |
| OWASP Top 10 for Agentic Applications | 2026 edition | Delegation/tool misuse, prompt-injection and authorization threats require systemic controls | **ADOPT AS THREAT-MODEL INPUT**; deny-by-default tool binding, content never grants authority |
| NIST agent identity design tenets | 2026-10-27 | Agent-specific identity, authentication and authorization require explicit design | **TRACK AS PROPOSED GUIDANCE**; not misrepresented as a binding legal standard |
| OpenAI practical agent guide | 2026-01-15 | Narrow high-value agents and explicit orchestration are preferable to agent proliferation | **ADOPT**: workflows before additional agents |
| Anthropic agent architecture guide | current guide accessed Oct 2026 | Single-agent, sequential and parallel workflow patterns should be selected by complexity | **ADOPT**: deterministic routing and the fewest independent agents needed |
| OpenAI evals / trace grading | current docs accessed Oct 2026 | Use traces, datasets, graders, and regression feedback | **ADOPT AS TARGET**: trace-linked evaluation and regression coverage |
| A2A protocol | released v1.0.0 (verified Oct 2026) | External agent discovery/interoperability across independent services | **OPTIONAL ADAPTER**, not the registry's internal primitive |
| OpenTelemetry GenAI agent spans | Development (verified Oct 2026) | Agent/workflow/tool span distinctions and correlation | **INFORMATIVE**; pin semantic version before production integration |
| OpenAI Agents SDK durable integrations | current docs accessed Oct 2026 | Resumable workflows can use Temporal, Restate, or Dapr | **DESIGN OPTION**, no orchestration engine selected or deployed |

### Source URLs

1. https://blog.modelcontextprotocol.io/posts/2026-07-28/
2. https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/specification/2026-07-28/basic/authorization/security-considerations.mdx
3. https://genai.owasp.org/resource/agent-control-standard-acs/
4. https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/
5. https://www.nist.gov/blogs/cybersecurity-insights/design-tenets-agent-identity-management-systems
6. https://openai.com/business/guides-and-resources/a-practical-guide-to-building-ai-agents/
7. https://claude.com/resources/guides/building-effective-ai-agents/common-architecture-patterns
8. https://developers.openai.com/api/docs/guides/agent-evals
9. https://a2a-protocol.org/v1.0.0/specification
10. https://github.com/open-telemetry/semantic-conventions-genai/blob/main/docs/gen-ai/gen-ai-agent-spans.md
11. https://openai.github.io/openai-agents-python/running_agents/

These URLs are research references, not a warranty that every vendor feature is current in every SDK or installed in FFOS. The source shortlist was checked for relevance, recency and primary-source provenance. It is **not** a completed formal full-source reference audit: source-by-source full reading, manual citation verification and the final validation gate remain outstanding before constitutional or public-release claims.

## Architectural controls that follow

**Identity and authority:** Separate human principal, runtime agent identity, command principal, delegating actor, explicit \`authority_ref\`, explicit \`mandate_ref\`, CDX policy pin, target resource, effect, approval proof and revocation check. A conversational message, retrieved page, tool output or implicit login cannot expand the mandate.

**Orchestration:** A workflow is versioned and deterministic in its control envelope even if an LLM is used within specific bounded steps. Each command resolves exactly one workflow version; tool implementations have typed input/output, scope, budget, timeout, retries, cancellation and evidence requirements. Failed hard gates cannot be converted to warnings.

**Durability:** Agent Stable will need persistent run identity, idempotency keys, checkpoint/retry semantics, per-run lease ownership, cancellation, dead-letter or HOLD state, and append-only events. MCP's stateless transport does not supply this infrastructure.

**Tool security:** Least privilege, explicit allowlists, per-target authorization, credential separation, sandboxing for untrusted code, validation before side effects, prompt-injection resistance, and no token passthrough. Policy-unavailable means DENY/HOLD.

**Audit and evaluation:** Preserve immutable/versioned manifests and workflow bindings, test positive and adversarial paths, record trace correlation, capture costs/latency and resource scopes, produce independently reviewable evidence. Evaluation cannot certify the evaluator's own work.

**Lifecycle:** DRAFT → REGISTERED → VALIDATED → DEPLOYABLE → ACTIVE with explicit human gate; SUSPENDED, DEPRECATED, RETIRED as separate states. Shared AMA updates require compatibility inventory, controlled migrations, tests and rollback.

**Domain extensions:** Each implementation may impose stricter independently versioned governance, identity, validation and evidence requirements. A domain-specific policy must never be silently imported into the master AMA contract.

## Build stages

1. **AMA-06 static conformance: IMPLEMENTED on feature branch.** Draft 2020-12 manifest validation, authority/effect ceiling checks, command–workflow version resolution, capability/module binding, protected-diff review and structured reports; CI unit tests.
2. **AMA-07 persistent Agent Registry: NOT IMPLEMENTED.** Append-only history, accepted-version pins, revocation state, reconciliation and referential integrity.
3. **AMA-08 runtime authorization: NOT IMPLEMENTED.** CDX local policy adapter, approval binding, effect mediation, denial tests, SPETL evidence and revocation.
4. **AMA-09 Agent Mechanic runtime: NOT IMPLEMENTED.** Scheduled inventory/health, controlled upgrades and drift alerts.
5. **AMA-10 reference execution: NOT IMPLEMENTED.** An executable minimal agent with C4/C5 verified.
6. **AMA-11 domain adoption: DEFERRED.** Each implementation is registered and evaluated separately after the generic runtime and authority gates pass.

## Verification rule

Never interpret a static conformance pass, a research source, a registered name, a GitHub branch, or an OAuth/CI anchor as proof of a functional autonomous agent. Keep states **DEFINED / IMPLEMENTED / CONNECTED / TESTED / ACCEPTED / ACTIVE** distinct.
