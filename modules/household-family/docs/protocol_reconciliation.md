# Protocol reconciliation — HF-WP00 / HF-WP01

The handoff is an implementation proposal. The current execution instruction authorizes this candidate build, not automatic canonical acceptance of every proposed semantic change.

| Question                    | Verified source result                                                                                                  | Implementation decision                                                                |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| J0                          | Ephemeral cleanup                                                                                                       | Never grants durable repository mutation authority                                     |
| J1                          | Deterministic registered repair                                                                                         | Exact recipe, path guard, digest precondition and independent verification             |
| J2                          | Interpretive or constitutional stop                                                                                     | Never automatic repair; proposed fallback J2 meaning rejected                          |
| AMA                         | No positive canonical expansion verified                                                                                | `AMBIGUOUS_SOURCE_AMA`; no authorization semantics inferred                            |
| Director                    | Deterministic progression; immutable acceptance; no substantive human self-certification                                | External signed feed/decisions; Household cannot mint authority                        |
| September continuity orders | No per-WP next prompt; bounded execution; explicit stop conditions                                                      | Preserve continuity within a new current delegation                                    |
| Expired mandates            | Phase III/V marked fulfilled/closed; no carry-forward                                                                   | Never reuse them to authorize new WPs                                                  |
| Repository identity         | Historical Household manifest says `Hybrismannen/form-flode`; connected canonical repository is `Motherpher/form-flode` | Preserve source discrepancy; require exact current installation/repository match       |
| New FFOS                    | External domain ownership; Pius reserved; explicit decision/provenance grammar                                          | Add a module; do not modify constitutional or domain source                            |
| FFOS CDX anchor             | Pinned to `7edbc47899af23b415114628469aca2970779ea1`; runtime binding pending                                           | Require external signed pinned CDX effect decisions; do not claim live CDX integration |
| FF-Spatial pilot            | 40 `SRC-WP00`–`SRC-WP39`, all `PLANNED`; P1–P5 mapping not identified                                                   | Read-only observation; no pilot WP selected or dispatched                              |
| Verification role           | Original Household has Director, Handyman, Janitor; independent Verifier is a proposed extension                        | Add a separate non-accepting evaluator; preserve Director authority                    |

The source search used accessible repository inventories, pinned full-file retrieval, the complete Household subtree and Director manifest/orders. The connector's AMA code search returned no matches. Repository code indexing was reported unavailable, so this result is not proof that AMA never exists elsewhere. Its expansion remains a genuine source decision, while unrelated safe implementation continues.

The canonical manifest observation adapter in `packages/director-adapter/canonical.ts` preserves source states and identifies unsupported check semantics. It does not silently convert arbitrary command checks, closed packages, human gates or planned packages into executable signed contracts.

## References

- Motherpher (2026a) _FFOS Household Family_. Available at: https://github.com/Motherpher/form-flode/blob/1a5962b42a6f033bc932ab084a8808607cdf6266/17-ffos/household/README.md (Accessed: 28 October 2026).
- Motherpher (2026b) _Director WP manifest_. Available at: https://github.com/Motherpher/form-flode/blob/1a5962b42a6f033bc932ab084a8808607cdf6266/17-ffos/director/wp-manifest.json (Accessed: 28 October 2026).
- Motherpher (2026c) _FFOS Architecture Baseline_. Available at: https://github.com/Motherpher/FFOS/blob/3a93eb3d7a5195232acc850c7d301bf901014306/docs/architecture/ARCHITECTURE.md (Accessed: 28 October 2026).
- Motherpher (2026d) _Sourcing WP register_. Available at: https://github.com/Motherpher/FF-Spatial/blob/3b91cf106995c678589d134ab70bc7fb5bbab5c4/ops/workpackages/SOURCING_WP_REGISTER.json (Accessed: 28 October 2026).
