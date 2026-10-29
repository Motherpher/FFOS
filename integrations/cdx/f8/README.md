# F8 — FFOS Conductellence consumer security adapter (development candidate)

**Canonical CDX authority:** [Hybrismannen/Conductellence-](https://github.com/Hybrismannen/Conductellence-)  
**Source contract:** CDX-RUNTIME-001, release-candidate 1.0.0, CDX-LAW-001  
**Target:** FFOS's local Agent Stable effect/read boundary, separate from the universal AMA template.

This directory contains the source-grounded F8.1 control matrix and F8.7 runtime-release preflight. It does **not** modify the upstream CDX constitutional or policy core.

- `control-coverage.json`: 131 sections; 69 exactly mapped fully automatable reference controls, with original control IDs and SPETL/audit requirements; 62 other sections remain review-governed
- `audit_coverage.py`: checks source blob identity, frozen law topology and audit/evidence completeness
- `governance-source-state.json`: dated snapshot of CDX's independently governed status (`PRE_RELEASE`, `BOOTSTRAP`, FFOS binding pending)
- `preflight.py`: generates machine-readable `BLOCKED_EXTERNAL_GATES` assessment, without promoting a repository anchor into an actual runtime binding

Host-side implementation:
- `packages/agent-runtime/src/cdx-f8-policy.ts`: signed multi-surface policy/obligation and SPETL v1.1 custody adapter
- `packages/agent-runtime/src/cdx-f8-read.ts`: classified E0 read enforcement requiring an independently verified grant and recipient/purpose
- `packages/agent-runtime/src/effect-gate.ts`: preserves seven CDX outcomes, verified permissive decisions and late policy/graph rechecks
- `packages/agent-runtime/src/cdx-anchor.ts`: rejects historical `PINNED_COMMIT` for consequential production effects

The source control map is **not** the policy engine, an authenticated release package, a CDX signature or a production data-privacy review. CI tests use provider doubles. No real CDX release state, custody authority, policy decision issuer or agent activation has been configured.

See [F8 security binding architecture](../../../docs/roadmap/AMA-F8-CDX-SECURITY-BINDING.md) and [F8 execution report](../../../docs/roadmap/AMA-F8-EXECUTION-REPORT.md).

**Runtime release remains BLOCKED** until the upstream CDX WP07 release blocker and FFOS consumer runtime integration WP11 independently pass, together with human approval and real evidence custody.
