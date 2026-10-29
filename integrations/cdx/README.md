# FFOS ↔ CDX Integration

**CDX:** Conductellence  
**FFOS role:** local orchestration/control-plane system  
**WP11 state:** `RUNTIME_GUARDED_UNVERIFIED`

## Governance relationship

FFOS does not copy or redefine Conductellence constitutional authority.

```text
CDX  ──publishes governance──>  FFOS
CDX  <──.cdx/anchor.json──────  FFOS
```

CDX owns the governing contract. FFOS owns its local enforcement points.

## CDX 1.0 production binding

WP11 binds the first real FFOS production effect to `CDX-RUNTIME-001@1.0.0`:

```text
Director login attempt
→ credential authentication
→ CDX IDENTITY_AUTHORITY policy evaluation
→ SPETL 1.1 pre-effect evidence
→ restrictive decision blocks effect
→ ALLOW permits FFOS session issuance
→ SPETL effect-result evidence
```

The consequential local effect is issuance of the authenticated `DIRECTOR` session cookie. CDX does not authenticate the password and cannot substitute for FFOS authentication. It mediates whether the authenticated identity assertion may cross into the Director session effect.

### Immutable release pins

- policy: `git-blob-sha1:55dbcdac2f822b59a5a5f0f19eeadfa61d2c7ed0`
- runtime contract: `git-blob-sha1:ad0c01d997c1db8ac73681566b4934f1b76f7141`
- SPETL event schema: `git-blob-sha1:2809554a2a1e672d2859a1ff28819ec64d8affeb`
- release: `1.0.0`

Exact source snapshots and pins are under `integrations/cdx/vendor/1.0.0/` and `integrations/cdx/release-pins.json`.

## Fail-closed behavior

- missing or integrity-mismatched policy → `SECURITY_STOP`;
- no applicable control → `DENY`;
- failed identity/authority control → `DENY`;
- no session cookie is created for restrictive decisions;
- credentials, password and session token are excluded from SPETL logs.

WP11 acceptance explicitly tests **ALLOW**, **DENY**, **POLICY_UNAVAILABLE**, SPETL 1.1 emission and the real session-cookie effect gate.

Runtime state remains `RUNTIME_GUARDED_UNVERIFIED` until CI, deployment and production evidence are independently read back. Only then may FFOS advance to `VERIFIED_RUNTIME_BOUND`.
