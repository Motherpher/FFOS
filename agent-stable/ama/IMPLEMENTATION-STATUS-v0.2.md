# AMA v0.2 — Canonical reconciliation and implementation status

**Date:** 2026-10-30  
**Branch:** `feat/ama-v02-canonical-reconcile-20261030` (from restructured `main`)  
**Source:** `feat/ama-foundation-20261028` commit `0843608b9ed66027023c368cc7838f9005ca390f`; original PR #19  
**Disposition:** `ENGINEERING_CANDIDATE / NOT ARCHITECTURALLY ACCEPTED`  
**Scope:** AMA M0–M7 only. F8 is a host adapter, not a ninth milestone.

## Source-of-truth placement

- `agent-stable/ama/README.md` — canonical adopted foundation 0.1.0 pending explicit v0.2 acceptance.
- `agent-stable/ama/ARCHITECTURE-v0.2-CANDIDATE.md` — full candidate architecture, moved from old `docs/architecture/AMA.md`.
- `packages/agent-model/` — machine-readable portable candidate schemas, M0 register, M0–M7 maps, validators, blueprint generator and tests.
- `packages/agent-runtime/`, `packages/registry/` — existing shared host execution components, retained from `main` without any production activation.
- `integrations/cdx/f8/` — host-specific adapter only; one previously existing candidate realm-policy fixture is integrated for static conformance, without external governance-system changes.
- `docs/roadmap/AMA-*`, `docs/research/AMA-*` — source research, test traces, engineering reports and release-gate history.
- `docs/architecture/AMA.md` — preserved compatibility pointer, not overwritten by the old source branch.

Do not resurrect top-level `agents/`; Agent Mechanic and agent instances remain separate from AMA. Preserve the restructured FFOS `main` and the canonical fleet registry.

## Implementation carried into candidate

M0: 96-source requirement register, provisional traceability, 65 partial test-evidence links, 31 unlinked requirements.  
M1: generic manifest, commands, workflows, capabilities, typed I/O, schema validation, reference/digest checks and versioned construction bundles.  
M2: provider-neutral mandate, delegation, read sensitivity, explicit authorization and scope nonamplification.  
M3: optional model, cognition, instruction/context and memory/retrieval/knowledge controls.  
M4: durable run/recovery, eventing and idempotency/unknown-effect contracts; existing shared PostgreSQL adapter.  
M5: candidate assurance/evaluation cases, provenance, redaction, independent-acceptance separation.  
M6: lifecycle, health, incidents, compatibility, canary, rollback and operational contracts.  
M7: synthetic six-profile integration, blueprint generator, architecture/operational acceptance split and M7-A readiness audit.

## Reconciliation controls

1. All candidate model source files are staged as a Git tree overlay on the restructured `main`, not an old full-branch tree replacement.
2. The old AMA master document is moved to `agent-stable/ama/ARCHITECTURE-v0.2-CANDIDATE.md`; the compatibility pointer is preserved.
3. `test_template_purity.py` and `test_m0_governance.py` now target the candidate at its new location.
4. AMA conformance CI is updated to watch `agent-stable/ama/**`.
5. Shared existing runtime and registry migrations on `main` are preserved; no agent activation or authority changes.

## Release blockers and truth labels

- **96/96 requirement dispositions:** PROPOSED, awaiting independent human acceptance.
- **65/96 direct partial evidence links:** tracked, **31** still unlinked. A linked method is not acceptance.
- **32/32 template modules:** `PARTIAL_EXISTING_CONTRACTS`, **0** marked COMPLETE.
- **M7-A:** exact-current-head CI pass required; final technical/compatibility audit and explicit owner acceptance pending.
- **M7-O actual agent admission:** not part of release of the reusable architecture.
- **F8/CDX live binding:** not part of AMA core architecture acceptance.
- **Structural exception:** the previous FFOS host-runner exception authorized structural reorganization only; it does not waive AMA code tests.

This branch is an engineering integration proposal. **No full template completion, normative architecture release, production readiness, permission grant or agent activation may be inferred from a merged or green documentation state.**
