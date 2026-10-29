# Household Family — AMA update and prefabrication readiness

**Date:** 29 October 2026. **Disposition:** prepare non-production components now; full agent construction follows the owner's accepted AMA baseline. This is a source reconciliation and work-preparation record, not an activation, mandate or canonical architecture change.

## Current source finding

AMA is **Agent Master Architecture**, architecture ID `FFOS-AMA-001`. It is the reusable M0–M7 construction/conformance architecture from which Household will be instantiated. Household is the agent; Janitor, Handyman and Verifier are bounded internal roles. Director remains external. This resolves the previous `AMBIGUOUS_SOURCE_AMA` finding for this review (Motherpher, 2026a).

The inspected architecture snapshot is `42d8d1b12a2feaa5cb4ab7d4f2f2ad1df5714936` on `feat/ama-foundation-20261028`. Its distribution manifest still says `0.2.0-candidate`, `architecture_accepted=false` and `template_complete=false`. The machine inventory marks 32 areas `PARTIAL_EXISTING_CONTRACTS`; 65 of the 96 source-derived requirements have partial links to test functions. These counts are tracking evidence, not proof that unlinked capabilities are absent or that linked requirements have passed completely. Older prose counting 21 partial/11 missing areas must not override this newer machine inventory (Motherpher, 2026b).

At that exact inspected commit, workflow runs `40906790745` (AMA conformance) and `40906790818` (CDX Binding Audit) report `failure`. Their cause was not established by this review, and this record does not claim that individual test assertions failed. Older passing CI is not current-head verification. AMA is therefore not recorded here as finished or stably adopted.

The existing Household candidate remains in separate draft PR #20, at `0e5a295a337636f204a42ad12c3f326ca6c2b00b`. Its retained 28 October evidence records 46 passing engineering tests. That is reusable work, not evidence of AMA conformance. The separate Household contract PR #21 was closed unmerged following the architecture/instance scope correction; it is not an adopted replacement contract.

## What can be prefabricated now

| Existing Household work package | Concrete preparation | Reuse / acceptance boundary |
| --- | --- | --- |
| HF-WP01 — instance contract | Draft agent identity, purpose/non-goals, governing principal references, operating-realm declaration, role matrix and selected modules. | Use current AMA contracts as a pinned draft; bind to the accepted version later. Registry/activation remain unperformed. |
| HF-WP01 / HF-WP02 — interface bindings | Map the ten MCP tools to explicit command, workflow and capability versions. Separate `E0_OBSERVE`, queue/audit `E1_INTERNAL_STATE` and bounded `E2_REPOSITORY_CHANGE`; keep E3/E4 outside the initial envelope. | Reuse MCP transport and validation. A command/effect ceiling is not permission; restricted reads still require M2 authorization. |
| HF-WP03 — durable execution | Prepare compatibility adapters/tests for AMA M4 runs, attempts, checkpoints, epoch-fenced leases, idempotency, cancellation and independent unknown-effect reconciliation. | Reuse the existing worker/store where compatible. Reconcile with FFOS Agent Stable ports; do not create a second authoritative agent registry or silently replace canonical run semantics. |
| HF-WP04 — role packages | Fix the role inputs/outputs, allowed paths, effect ceilings, registered J1 recipe preconditions and Verifier separation. | Existing modules are reusable. Janitor/Handyman/Verifier do not receive separate first-class authority. J2 remains a stop. |
| HF-WP05 — authority and policy adapters | Prepare contract tests and deny-by-default ports for Director mandates, AMA M2 decisions/obligations, current CDX release binding, revocation and independent receipts. | Synthetic credentials/decisions only. Never infer authority from an agent-provided record or translate restrictive policy outcomes into ALLOW. |
| HF-WP06 / HF-WP07 — verification harness | Extend the two-WP sandbox with AMA C1–C6 checks, schema/version drift, restricted reads, stale authority, unknown effects, cancellation and independent evidence/custody cases. | Reuse the 46-test candidate as a regression baseline. New AMA conformance must actually be run; no inherited PASS. |
| HF-WP08 — operational package | Prepare deployment descriptors, health/telemetry fields, secret-reference slots, least-privilege installation checklist, privacy/retention choices and rollback instructions. | Configuration and isolated tests can be prepared. Real identity, host, custody and permission bindings require their own verification. |
| HF-WP09 / HF-WP10 — admission kit | Prepare a read-only pilot definition, evidence checklist, compatibility/completeness report and owner decision template. | Director selects the exact pilot. Instance operational admission, license/release and activation remain separate decisions. |

Keep optional semantic memory, retrieval, multi-agent delegation and unrelated domain features explicitly OFF unless the Household scope requires them. Durable work-package state is still required; it is not the same thing as optional semantic memory. Selective modules reduce implementation work without weakening the mandatory identity, authority, evidence or conformance boundaries (Motherpher, 2026a; 2026c).

## Concrete compatibility gap already found

Current FFOS main snapshot `1c73aa5774a7f2cef2e646ade36dd09369f4ae3b` declares a `PINNED_RELEASE` CDX `1.0.0` anchor, with `CDX_BOUND`/PASS on the repository-anchor axis. The runtime axis remains `BOUND_PENDING_RUNTIME_INTEGRATION` in that snapshot. The older Household bootstrap explicitly rejects every binding mode except `PINNED_COMMIT`.

The future integration patch must validate the released policy/version/digest and required registry/host evidence. **Do not downgrade the current anchor to make the old bootstrap start.** An installed/verified repository anchor is not runtime effect authorization. AMA's provider-neutral contracts also do not let this CDX-applicable FFOS consumer detach CDX by declaring itself an external realm (Motherpher, 2026d).

Other migration work includes adding AMA agent/workflow/capability version/digest references to the current run context; mapping custom Director/decision records to M2 without losing obligations; aligning state and independent-receipt semantics with M4/M5; and connecting M6 health/suspension/rollback ports. The older runtime's hard-coded AMA-ambiguity warning has not been patched by this documentation-only update.

## What waits for AMA completion

After the owner accepts an immutable AMA architecture baseline: pin its version/commit and schema digests; generate the Household construction blueprint; validate selected-module completeness and C1–C6; reconcile compatible existing components; then execute the remaining Household implementation work under its own Director-approved scope.

AMA architecture acceptance (M7-A) and Household operational admission are different gates. A live CDX estate-wide rollout is not a prerequisite for preparing generic contracts or constructing/testing a non-production candidate. For this applicable FFOS host, actual consequential effects still require the applicable F8/CDX binding, authenticated mandate, independently verifiable evidence and the separate Household instance decision. No architecture PASS may substitute for those operational gates (Motherpher, 2026c; 2026d).

This update adds only this readiness note, source/evidence metadata and a README link on Household's existing branch. It does not alter AMA, runtime code, credentials, registry contents, activation, deployment or permissions.

## References

- Motherpher (2026a) *Agent Master Architecture (AMA)*. Available at: https://github.com/Motherpher/FFOS/blob/42d8d1b12a2feaa5cb4ab7d4f2f2ad1df5714936/docs/architecture/AMA.md (Accessed: 29 October 2026).
- Motherpher (2026b) *AMA distribution manifest; template coverage; M0 test-evidence bridge*. Available at: https://github.com/Motherpher/FFOS/tree/42d8d1b12a2feaa5cb4ab7d4f2f2ad1df5714936/packages/agent-model (Accessed: 29 October 2026). Exact paths, blob identifiers and content digests are in `evidence/ama-source-update-2026-10-29.json`.
- Motherpher (2026c) *AMA release gates and comprehensive template*. Available at: https://github.com/Motherpher/FFOS/blob/42d8d1b12a2feaa5cb4ab7d4f2f2ad1df5714936/packages/agent-model/ama-release-gates.json and https://github.com/Motherpher/FFOS/blob/c6db56724dfa679c325aeb129d66216cc933434a/packages/agent-model/AMA-COMPREHENSIVE-TEMPLATE.md (Accessed: 29 October 2026).
- Motherpher (2026d) *FFOS CDX anchor and Estate applicability policy*. Available at: https://github.com/Motherpher/FFOS/blob/1c73aa5774a7f2cef2e646ade36dd09369f4ae3b/.cdx/anchor.json and https://github.com/Motherpher/FFOS/blob/1c73aa5774a7f2cef2e646ade36dd09369f4ae3b/docs/governance/CDX-ESTATE-POLICY.md (Accessed: 29 October 2026).
- Motherpher (2026e) *Household implementation candidate*, source `0e5a295a337636f204a42ad12c3f326ca6c2b00b`. Available at: https://github.com/Motherpher/FFOS/pull/20 (Accessed: 29 October 2026).
