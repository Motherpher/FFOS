# External Director and CDX integration contracts

This adapter contract is new implementation plumbing. It does not replace the canonical Director's decision semantics or claim that a compatible production endpoint already exists. Canonical machine checks must be reconciled explicitly; the observation importer never creates authority (Motherpher, 2026).

## Director endpoints

The independent authority service exposes these routes under `HF_DIRECTOR_URL`:

| Request                                    | Response                                                                                                                       |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `GET /projects/{project_id}/authorization` | Compact signed JWT whose `kind` is `authorization` and `data` validates against `config/schemas/director_snapshot.schema.json` |
| `GET /runs/{run_id}/decision`              | Signed decision JWT or HTTP 404 when no decision exists                                                                        |

Tokens require `alg=EdDSA`, configured `iss` and `aud`, `iat`, `exp` and unique `jti`. The runtime only holds the public key. `data` contains typed policy and dispatched WP contracts. A snapshot is rejected when expired, revoked, scoped to another project, cyclic, ambiguous about automated identity, or inconsistent with the exact WP scope hash. `scope_hash` is SHA-256 of recursively key-sorted compact JSON for the WP with the `scope_hash` field removed; acceptance criteria, dependencies and actions are included.

The snapshot must explicitly provide `authority_ref`, `mandate_ref`, `hcc_review_ref`, `ci_cost_approved`, eligible IDs in Director order and accepted dependency versions. `auto_dispatch_subject` is a delegated service identity in `allowed_subjects`; it is not an impersonated chat user. No default list of priorities or inferred delegation is supplied.

For decision delivery use polling or `POST /director/decisions` with the compact signed JWT as the raw body. Its `kind` is `decision`; `data` validates against `decision.schema.json`. It binds the exact run, WP version, policy/eligibility revision, scope hash, commit SHA and evidence bundle hash. Only `ACCEPT` advances the DAG. `WAIVE` is not implemented as a permission shortcut. Before acceptance, the service re-observes and independently re-verifies the candidate; it refuses to accept newly failed/stale/unobservable evidence.

After a decision, the Director service must publish its current accepted dependency versions and eligible successor(s). Household polls this feed via a transactional outbox; it never locally assumes that the next sequence entry has become eligible. Decision receipt is immutable; the adapter does not edit the original Director manifest or merge a PR.

## CDX effect mediation

`HF_CDX_EVALUATE_URL` receives a JSON `intent`, its SHA-256 `intent_hash` and the policy commit pin from the FFOS `.cdx/anchor.json`. The intent includes authority/mandate context, principal, repository, WP revision, branch, baseline/candidate commit, action and registered recipe hash.

The response is a compact `EdDSA` JWT with configured issuer/audience, required `iat/exp/jti`, `kind=cdx-decision` and a `data` body with:

```json
{
  "decision": "ALLOW",
  "intent_hash": "SHA256_OF_EXACT_INTENT",
  "authority_ref": "EXTERNAL_AUTHORITY_REFERENCE",
  "mandate_ref": "EXTERNAL_MANDATE_REFERENCE",
  "policy_pin": "PINNED_CDX_COMMIT_FROM_FFOS_ANCHOR",
  "policy_version": "EXTERNAL_CDX_POLICY_VERSION",
  "revoked": false,
  "observed_at": "CURRENT_ISO_UTC_TIMESTAMP",
  "expires_at": "SHORT_LIVED_ISO_UTC_TIMESTAMP",
  "spetl_ref": "EXTERNAL_SPETL_EVIDENCE_REFERENCE",
  "control_results": [
    {
      "control_id": "APPLICABLE_CANONICAL_CONTROL",
      "pass": true,
      "decision": "ALLOW"
    }
  ]
}
```

An ALLOW receipt must be fresh (observed within 60 seconds), bound to this exact intent/pin/mandate, not revoked, and contain passing applicable controls. Errors, signature failure, divergence or restrictive decisions stop the write. The signed receipt and SPETL reference enter the audit before the effect. The canonical CDX service remains responsible for choosing/evaluating its controls; Household does not reimplement or invent them (Hybrismannen, 2026).

The `scripts/sandbox.ts` service is a test fixture with generated in-memory keys. Its ALLOW/acceptance outputs are never production clearance. Production runtime defaults to denial without configured CDX; no `environment=test` bypass exists in the default enforcement object.

## References

- Motherpher (2026) _FFOS Director_. Available at: https://github.com/Motherpher/form-flode/blob/1a5962b42a6f033bc932ab084a8808607cdf6266/17-ffos/director/README.md (Accessed: 28 October 2026).
- Hybrismannen (2026) _Runtime Integration Contract CDX-RUNTIME-001_. Available at: https://github.com/Hybrismannen/Conductellence-/blob/7edbc47899af23b415114628469aca2970779ea1/RUNTIME-INTEGRATION/README.md (Accessed: 28 October 2026).
