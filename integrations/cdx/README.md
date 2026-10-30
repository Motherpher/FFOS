# FFOS ↔ CDX Runtime Binding

**CDX release:** `1.0.0`  
**Contract:** `CDX-RUNTIME-001@1.0.0`  
**FFOS role:** local consumer / enforcement owner  
**Branch state:** `CDX_RUNTIME_GUARDED / RUNTIME_GUARDED_UNVERIFIED`

## Production chain

```text
authenticated FFOS intent
→ explicit authority_ref + mandate_ref
→ exact CDX 1.0 policy integrity check
→ applicable CDX controls
→ seven-way CDX decision
→ PRE_EFFECT SPETL 1.1 evidence
→ FFOS local consequential effect
→ POST_EFFECT SPETL 1.1 evidence
```

Missing policy, policy-integrity failure, unknown policy operation, absent controls, restrictive decisions or evidence failure fail closed.

## Bound effects

1. `ISSUE_DIRECTOR_SESSION` — the real FFOS Director-session cookie cannot be issued before CDX evaluation and pre-effect evidence.
2. `ISSUE_RUNTIME_PROOF_RECEIPT` — a non-privileged, short-lived production verification cookie used to prove the deployed runtime without accessing Director credentials.

The proof endpoint does **not** create a Director session or grant application authority.

## Verification ladder

This branch is intentionally only `RUNTIME_GUARDED_UNVERIFIED`.

Promotion to `CDX_RUNTIME_VERIFIED / VERIFIED_RUNTIME_BOUND` requires:

1. branch CI acceptance;
2. reviewed merge to current FFOS main;
3. exact merged commit deployed to Vercel production and `READY`;
4. live production ALLOW, DENY and POLICY_UNAVAILABLE proof;
5. SPETL evidence readback;
6. independent CDX-side reconciliation.

The reusable Agent Stable `AgentEffectGate` remains the enforcement mechanism for future agent effects. This first binding verifies the consumer runtime boundary without prematurely declaring Household Family or other agents production-accepted.
