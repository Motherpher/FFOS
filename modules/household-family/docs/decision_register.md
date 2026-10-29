# Decision and gate register

| ID  | Decision / gate                                                        | State                 | Authority / evidence                                                                        |
| --- | ---------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------- |
| D01 | Preserve canonical J0/J1/J2                                            | RESOLVED_SOURCE       | Original September Household README/manifest/runtime                                        |
| D02 | Expand AMA                                                             | HOLD_SOURCE           | No positive canonical definition verified; grants no permissions                            |
| D03 | Add module in FFOS candidate branch                                    | IMPLEMENTED_CANDIDATE | Current user execution directive; existing main/governance unmodified                       |
| D04 | PostgreSQL + transactional queue/outbox; SQLite/WAL embedded tests     | IMPLEMENTED           | Durable storage, global transaction serialization and lease tests                           |
| D05 | Separate credential-free Verifier process                              | IMPLEMENTED           | Raw criterion/CI checks and distinct-context tests                                          |
| D06 | Registered deterministic J1 changes only                               | IMPLEMENTED           | No arbitrary shell/model-driven mutation; sensitive-path/byte/file guards                   |
| D07 | External signed Director decisions; no Household acceptance key        | IMPLEMENTED_CONTRACT  | Real current Director endpoint/signing identity still required                              |
| D08 | Preserve pinned CDX enforcement and SPETL references                   | IMPLEMENTED_CONTRACT  | Missing/deny/unavailable guard tests; real service binding still required                   |
| G01 | Hosting/data retention/cost envelope                                   | HUMAN_REQUIRED        | Choose durable host/database and approve resource/CI capacity                               |
| G02 | OAuth and GitHub App installation                                      | HUMAN_REQUIRED        | New account/provider identities, repository scopes and actual default-branch protection                                       |
| G03 | Current Director/HCC/CDX mandate and service identity                  | HUMAN_REQUIRED        | Exact signed current dispatch/acceptance context; expired September orders are insufficient |
| G04 | ChatGPT custom plugin registration/consent and fresh-conversation test | HUMAN_REQUIRED        | Verified endpoint and account/workspace permission needed                                   |
| G05 | FF-Spatial safe pilot WP and P1–P5 mapping                             | HOLD_DIRECTOR         | Inspected 40 packages are PLANNED; no new dispatch inferred                                 |
| G06 | License, constitutional release, merge/tag                             | HUMAN_REQUIRED        | No license chosen; no release tag or main merge issued                                      |

Routine test fixes, documentation, branch commits, repair/reverification and dependency-ready progression inside current authority do not introduce per-WP confirmation gates. The test fixture's external decisions prove the protocol, not resolution of G03.

## References

- User (2026) _Execution directive — Household Family 2.0_ and _HF-2.0-WORK-001 v1.0_. Supplied in this assignment, 28 October 2026.
- Canonical source references and hashes: `source_lineage.md` / `source_lineage.json`.
