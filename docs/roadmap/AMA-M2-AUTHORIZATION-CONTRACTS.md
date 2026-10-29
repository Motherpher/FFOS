# AMA M2 — Universal Scoped Authorization Contracts

**Status:** TECHNICAL CANDIDATE; independent normative and runtime acceptance pending.
**Date:** 2026-10-29
**M0 basis:** original B01–B10 plus source-derived E0 sensitivity, risk classification and delegation findings.
**Architecture rule:** the universal AMA contract specifies *what evidence is required*, not a particular policy authority or enforcement provider.

## Six new provider-neutral schemas

In `packages/agent-model/schemas/v0.2/`:

| Artifact | Mandatory declarations |
| --- | --- |
| `principal.schema.json` | Principal/workload identity, tenant and trust domain, issuer and evidence digest |
| `mandate.schema.json` | Issuer, subject, agent pin, scope grants, validity, revocation reference, delegation depth, evidence |
| `delegation.schema.json` | Exact parent and child mandate pins, issuing principal and provenance |
| `authorization-request.schema.json` | Agent/actor/workload/mandate/capability/policy pins, resource, purpose, recipient, data class and risk |
| `authorization-decision.schema.json` | Independent policy-service identity, decision/obligations, policy pin, validity and evidence |
| `approval.schema.json` | Human review identity, request pin, time window and proof reference |

All are JSON Schema Draft 2020-12 under the agent-independent candidate family. `authorization-vnext.ts` supplies matching TypeScript interface declarations.

## Security properties checked offline

`conformance/ama_authorization.py` is a **static preflight**, not a runtime authorization service. It checks original M1 bundle integrity and M2 schema shape, identity references, root and delegated mandate chains, tenant consistency, agent/capability scope, and declared policy and approval continuity.

- **E0 is not intrinsically safe:** restricted reads, unauthorized recipients and cross-scope observation are rejected despite an E0 ceiling.
- **Risk is multidimensional:** effect kind, data classification, recipient, purpose, aggregation permission, external exposure, reversibility, impact and financial amount are independent fields.
- **Delegation never amplifies:** downstream action/effect, resource, data class, recipient list, allowed aggregation, approval obligation, validity and depth must be no broader than the parent mandate.
- **Policy is separate from reasoning:** an agent cannot sign its own approval or present untrusted tool/retrieved text as governing authority; missing, conflicting, restrictive, stale or misbound decision declarations fail the precheck.
- **Time and version are pinned:** principal, mandate, delegation, request, decision, approval and optional effect references have version/digest relationships; expiry and issued-at boundaries are checked against an explicitly provided host observation time.
- **Human review is not optional for elevated risk:** a declared approval must exist for high-impact, financially consequential, restricted external exposure or E3/E4 actions; its authenticity is still not proven by a JSON field.

## Critical anti-overclaim boundary

A structurally valid record is **not authenticated evidence**. A SHA-256 content digest is not a digital signature or proof of mandate issuance. The precheck returns only:
- `REJECTED`, or
- `STATIC_ELIGIBLE_FOR_EXTERNAL_VERIFICATION`.

It **never returns ALLOW/PERMIT**, never grants authority, and always reports `external_verification_required: true`. The host must independently authenticate principal identity, mandate issuance/delegation, revocation freshness, signed/attested policy provenance, approval authenticity, runtime resource classification, obligations, audit receipt and actual effect/read gate. An untrusted agent-provided `PERMIT` record cannot replace any of these checks.

The generic M2 policy decisions are transport-neutral. Their outcomes must not be naively translated to host-specific policy outcomes; F8 is responsible for complete lossless provider adapter semantics and independent evidence.

## Compatibility and subsequent work

Historical v1 schema, runtime gate and the M1 candidate contracts remain separate; M2 adds six candidate schemas and optional bundle fields without migrating a registered agent. M1's static conformance remains distinct from the stricter M2 authorization preflight. Optional structural records alone never create permission.

**M2 engineering pass conditions:** validation suite and all old regressions green; all schemas and TypeScript interfaces instance-free; fail-closed negative tests; no production migration or claimed runtime enforcement.

**Remaining:** external authority service, actual policy/verifier revocation and controlled effects/read path (F8); durable races and effect uncertainty (M4); independent live evidence and acceptance (M5).

## M2 extension — provider-neutral secret references

`schemas/v0.2/secret-binding.schema.json` and `src/authorization-vnext.ts` now define optional, version-pinned secret bindings attached to exact agent and capability digests. The contract stores **opaque `ref:` pointers rather than secret material**, requires runtime injection, rotation/revocation checks, access audit and redaction, and prevents the credential scope exceeding the capability or agent mandate.

`conformance/ama_support_profiles.py` tests structural and semantic continuity (including a credential-aware adapter), with adversarial cases in `tests/test_ama_support_profiles.py`. No provider is mandated and no real credential is read, rotated or revoked. These are separately host-enforced requirements; the M2 secret area is **partially implemented**, not operationally verified.
