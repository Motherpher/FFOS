# AMA — Wiki home (draft for publication)

Agent Master Architecture (AMA) is the reusable architecture for constructing first-class agents. It is not an agent itself.

## Start here
- Canonical AMA M0–M7 definitions: [AMA candidate](../../agent-stable/ama/ARCHITECTURE-v0.2-CANDIDATE.md)
- Module inventory: [32-module coverage](../../packages/agent-model/ama-template-coverage.json)
- Normative module candidates: [v1 catalog](../../packages/agent-model/ama-v1-module-contract-catalog.json)
- Construction guidance: [Comprehensive template](../../packages/agent-model/AMA-COMPREHENSIVE-TEMPLATE.md)
- Release work: [FIN completion register](../roadmap/AMA-V1-COMPLETION-EXECUTION-REGISTER.md)
- GitHub project specification and issue links: [Coordination index](../roadmap/AMA-GITHUB-PROJECT-ISSUES-WIKI.md)

## Architecture
M0 research and traceability; M1 identity and agent contracts; M2 mandate and authorization; M3 optional cognition and memory; M4 durable execution; M5 evidence and evaluation; M6 lifecycle and operations; M7 synthetic integration and conformance. F8/CDX is a separately bound host interface.

## Current release truth
Target is AMA 1.0. Current PR #34 remains a candidate. All 32 module entries have proposed contracts; 0 have completed executed acceptance. FIN-01 through FIN-05 have distinct evidence and Director gates. GitHub Actions failures without job steps are not test assertion failures.

## Agent build rule
Agents must declare an operating realm, mandate, capabilities, effect ceiling, evidence and separate human acceptance. Optional modules default off. Passing construction/schema validation cannot activate agents.

This page is a repository-backed Wiki publication draft, not an actual GitHub Wiki page or an adoption decision.
