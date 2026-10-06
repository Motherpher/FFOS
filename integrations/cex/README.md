# FFOS ↔ CEX Integration

**CEX:** Conductellence  
**FFOS role:** local orchestration/control-plane system  
**Current state:** `BOUND_PENDING_RUNTIME_INTEGRATION`

## Governance relationship

FFOS does not copy or redefine Conductellence constitutional authority.

```text
CEX  ──publishes governance──>  FFOS
CEX  <──.cex/anchor.json──────  FFOS
```

CEX owns the governing contract. FFOS owns its local enforcement points.

The canonical repository anchor is [`../../.cex/anchor.json`](../../.cex/anchor.json).

## Current implementation boundary

At this stage the FFOS repository has:

- a canonical CEX anchor;
- CI validation of that anchor;
- an explicit pinned CEX commit;
- declared fail-closed intent for consequential effects.

It does **not** yet claim `VERIFIED_RUNTIME_BOUND` or `CEX_RUNTIME_VERIFIED`. Those states require implemented FFOS enforcement points, CEX policy evaluation before consequential effects, SPETL evidence and tested allow/deny/policy-unavailable cases under `CDX-RUNTIME-001`.

## Planned runtime chain

```text
FFOS intent
→ identity / authority_ref / mandate_ref
→ pinned CEX governance context
→ CEX policy evaluation
→ ALLOW / restrictive decision
→ evidence
→ FFOS local effect gate
→ external effect only if permitted
→ FFOS registry reconciliation
```

The local runtime implementation must remain versioned against the CEX contract rather than importing mutable constitutional logic into FFOS as an independent fork.
