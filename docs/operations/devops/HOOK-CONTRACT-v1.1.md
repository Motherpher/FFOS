# FFOS DevOps passive discovery hook 1.1

**Local path:** `.ffos/devops-hook.json`  
**Schema identifier:** `ffos.devops.discovery-hook/v1.1`  
**Canonical operating model:** `FFOS-DEVOPS-OM-001@1.1`

This hook is a **passive, non-executable, non-normative** pointer. Its presence must NEVER be treated as activation, Director approval, a mandatory DevOps gate, a CDX anchor or an agent instruction with authority.

## Required data

| Key | Meaning |
|---|---|
| `schema` | Fixed marker `ffos.devops.discovery-hook/v1.1` |
| `repository` | Actual `owner/repo`, never a fabricated site |
| `model.id`, `model.version`, `model.uri` | One canonical FFOS Operating Model |
| `activation.default` | `OFFER_ONLY`; no background or implicit activation |
| `activation.director_controlled` | `true` |
| `activation.for_small_changes` | `NORMAL_WORKFLOW` |
| `activation.on_decline` | `NORMAL_WORKFLOW` |
| `activation.existing_processes` | `UNCHANGED` |
| `cdx_review.mode` | `CONDITIONAL_DISCOVERY` |
| `cdx_review.cdx_reference` | Existing canonical CDX source URL |
| `cdx_review.canonical_anchor_path` | `.cdx/anchor.json` (standard path, **not** proof of presence) |
| `cdx_review.automatic_request` | `false` |
| `cdx_review.automatic_authorization` | `false` |

An optional `cdx_review.anchor_observed` may be `true` only after an authenticated source read confirmed the local anchor at rollout. The field is a dated observation, not evidence of runtime verification.

**Reason for separate files:** `.cdx/anchor.json` implements CDX's distinct canonical anchor law. The optional `.ffos/devops-hook.json` only alerts operators and developers that the DevOps method can be offered; it cannot bind or execute policy.

This is a versioned contract for repository discovery, not a GitHub ruleset or hidden mandatory task.

## Frozen-root constitutional source exception

The default path applies to **ordinary consuming repositories**. The canonical [Conductellence source](https://github.com/Hybrismannen/Conductellence-) is a **governing authority**, not an ordinary downstream client: its frozen 1.0 release boundary prohibits new root domains and its protected branch requires `human-sovereign-approval`. Therefore the optional `.ffos` hook is **not installed in CDX main**. Consumers still carry the conditional CDX review reference, and their own existing canonical `.cdx/anchor.json` (where observed) remains authoritative. Do not create exceptions to CDX law or impersonate an anchor to improve hook coverage. See the [final rollout report](ROLLOUT-REPORT-v1.1-2026-11-16.md).
