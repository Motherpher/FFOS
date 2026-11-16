# FFOS DevOps Operating Model — forward-only transition record

**Decision source:** Director instruction in the current ChatGPT work discussion, 2026-11-16: prior/completed work must not be retroactively made to use the new model; newly initiated DevOps processes should use it.  
**Decision interpretation:** Prospective standardisation of **process intake and execution** across the F&F/FFOS development estate, not a retroactive migration, automatic control-plane enforcement, or CDX amendment.

## Decision table
| Matter | Disposition |
|---|---|
| Newly initiated DevOps process (after instruction) | **Use FFOS-DEVOPS-OM-001@1.0**, select L1/L2/L3 |
| Already active or completed DevOps processes and WPs | **Grandfathered**: no rework, renumbering, source mutation or retrospective compliance score |
| Existing CDX, AMA, Pius/HCC and repo-specific mandatory controls | **Unchanged and independently applicable** |
| Nine-gate FFOS-DSA-001 candidate framework / draft PR #56 | **Retired from universal adoption**, historic source retained unmerged |
| DevSecOps candidate check jobs not installed on main | **Remove as mandatory GitHub merge status contexts**; never represent them as required running checks |
| FFOS GitHub basic branch safety | **Retain** required PR route, block deletion/force-push and conversation resolution, with no new blanket human approval |
| Future L3 consequential runtime/release | **Must still meet applicable authoritative security/effect/review controls** |
| Adoption evidence | New DevOps intake records linking this model; no claim that other repos have installed the model without confirmation |

## Implementation scope
The FFOS operator reference and intake template are versioned in `docs/operations/devops/`. New process owners should reference them; they need not retrofit old projects or amend constitutional files. Other repositories may link rather than copy the model. Do not enforce this as mandatory GitHub CI across every repository; operational adoption is by the new process record, proportionate to L1–L3.

## Audit semantics
This is a forward-only operating-method decision recorded by the assistant in repository documentation. It is not a substitute for a personally signed, source-linked independent security review or production release. Historical nine-gate test PRs (#58 and #59), the dated DSA proposal (#56), and any earlier recorded HOLD/FAIL remain unchanged as history, not as future obligations.

**Active reference:** [DevOps Operating Model 1.0](README.md).
