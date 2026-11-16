# New DevOps process — working record

**Model:** FFOS-DEVOPS-OM-001@1.1 (only after Director selects ACTIVATE)  
**Optional for newly initiated substantial DevOps work after the 1.1 amendment; do not create this record for small changes or when the Director declines.** Do not retrofit existing work.

| Field | Fill in briefly |
|---|---|
| Process name / source link | |
| Start date / owner / canonical repo | |
| **Level:** L1 / L2 / L3 | Select lowest appropriate; give one-line reason |
| Intended outcome / definition of done | |
| Constraints / dependencies | Only what affects the work |
| Existing mandatory governance | Link relevant CDX/AMA/Pius/domain requirements if any; otherwise N/A |

## Working cycle

| Phase | One useful sentence or evidence link (skip redundant bureaucracy) |
|---|---|
| **Plan** | Outcome, ownership, scope |
| **Design** | Approach, interfaces, most relevant constraints |
| **Build** | PR/commit/artifact link |
| **Test** | Checks run, failures, known limitations |
| **Release** | Actual integration/version/enablement disposition, or HOLD |
| **Learn** | What worked, what blocked movement, follow-up if needed |

**Completion:** Date · outcome · final disposition · evidence/source link.

### Level rules
- **L1:** One Issue/PR body with a concise account is sufficient; basic manual check is acceptable where appropriate.
- **L2:** Add dependent interfaces, suitable automated testing and reproducibility evidence.
- **L3:** Add authoritative CDX/AMA/Pius/domain approvals and security/effect-boundary evidence **only where required by the actual change**. No shortcut around existing release/runtime law.

**Do not infer:** code committed ≠ tested; tests passed ≠ deployed; deployed ≠ independently accepted. Existing work packages and releases stay on their existing process definition.

Reference: [FFOS DevOps Operating Model 1.1](README.md) · [optional activation amendment](AMENDMENT-v1.1-OPTIONAL-DISCOVERY.md).
