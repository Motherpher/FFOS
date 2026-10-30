# FFOS ↔ CDX Runtime Binding

**CDX release:** `1.0.0`  
**Contract:** `CDX-RUNTIME-001@1.0.0`  
**FFOS role:** local consumer / enforcement owner  
**Runtime state:** `CDX_RUNTIME_VERIFIED / VERIFIED_RUNTIME_BOUND`

## Runtime chain

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

## Bound runtime effects

1. `ISSUE_DIRECTOR_SESSION` — the real FFOS Director-session cookie cannot be issued before CDX evaluation and pre-effect evidence.
2. `ISSUE_RUNTIME_PROOF_RECEIPT` — a non-privileged, short-lived runtime verification cookie used to exercise the real HTTP effect boundary without accessing Director credentials.

The proof endpoint does **not** create a Director session or grant application authority.

## Verification ladder

PR #35 satisfied the implementation-level runtime gates and merged to `main` at `5d5024078074c3ad00d454964357e546d2e6dac7`.

The promotion is supported by executed effect evidence plus exact Git tree identity between the verified PR head and the merged runtime implementation. The verification chain is:

1. branch CI acceptance on the exact implementation;
2. real HTTP ALLOW, DENY and POLICY_UNAVAILABLE effect tests against that implementation;
3. SPETL PRE_EFFECT / BLOCKED / POST_EFFECT evidence from those tests;
4. reviewed merge to current FFOS main;
5. exact merged-main re-verification;
6. independent CDX-side reconciliation.

A Vercel deployment is not part of this acceptance contract.

The reusable Agent Stable `AgentEffectGate` remains the enforcement mechanism for future agent effects. This first binding verifies the consumer runtime boundary without prematurely declaring Household Family or other agents production-accepted.


## AMA conformance note

The CDX runtime binding does not alter AMA semantics. The canonical AMA master now lives at `agent-stable/ama/README.md`; legacy architecture paths are compatibility pointers only. Runtime acceptance must therefore coexist with the current Agent Stable conformance suite.
