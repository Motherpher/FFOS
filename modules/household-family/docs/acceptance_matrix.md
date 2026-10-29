# Acceptance evidence matrix

All rows below are deterministic fixture/contract test results. A local or CI fixture PASS does not establish live provider enrollment or genuine Director acceptance. AT25 specifically retains its separate ChatGPT fresh-conversation gate. No line/branch coverage percentage is claimed.

| ID   | Exercised assertion                                                                                        | Fixture result | Live evidence boundary                                |
| ---- | ---------------------------------------------------------------------------------------------------------- | -------------- | ----------------------------------------------------- |
| AT01 | unmet Director dependency prevents enqueue and all writes                                                  | PASSED         | See repository CI and operational admission tests     |
| AT02 | missing or revoked Director policy prevents mutation                                                       | PASSED         | See repository CI and operational admission tests     |
| AT03 | production GitHub adapter creates isolated branch and draft PR through HTTP contracts                      | PASSED         | See repository CI and operational admission tests     |
| AT04 | failed independent test never creates acceptance                                                           | PASSED         | See repository CI and operational admission tests     |
| AT05 | registered repair produces a fresh independent verification context                                        | PASSED         | See repository CI and operational admission tests     |
| AT06 | repair exhaustion is BLOCKED with earlier raw evidence retained                                            | PASSED         | See repository CI and operational admission tests     |
| AT07 | sensitive operation returns HOLD_HUMAN without side effects                                                | PASSED         | See repository CI and operational admission tests     |
| AT08 | duplicate enqueue and retries yield one logical run and one mutation                                       | PASSED         | See repository CI and operational admission tests     |
| AT09 | signed external acceptance advances dependent WP automatically                                             | PASSED         | Live signed governance/worker deployment NOT VERIFIED |
| AT10 | no eligible work produces IDLE and no invented activity                                                    | PASSED         | See repository CI and operational admission tests     |
| AT11 | crash after external commit recovers durable lease without duplicate write                                 | PASSED         | Live signed governance/worker deployment NOT VERIFIED |
| AT12 | repository/CI disconnect stays INCONCLUSIVE or BLOCKED, never PASS                                         | PASSED         | See repository CI and operational admission tests     |
| AT13 | injected repository instructions cannot authorize actions or acceptance                                    | PASSED         | See repository CI and operational admission tests     |
| AT14 | Verifier uses separate process and raw criterion-bound evidence                                            | PASSED         | Live signed governance/worker deployment NOT VERIFIED |
| AT15 | append-only audit reconstructs writes and rejects tampering                                                | PASSED         | See repository CI and operational admission tests     |
| AT16 | changed policy after enqueue halts before any mutation                                                     | PASSED         | See repository CI and operational admission tests     |
| AT17 | unauthorized paths are rejected before isolated candidate mutation                                         | PASSED         | See repository CI and operational admission tests     |
| AT18 | Director rejection does not advance the DAG                                                                | PASSED         | See repository CI and operational admission tests     |
| AT19 | project/repository isolation blocks cross-project access and policy reuse                                  | PASSED         | See repository CI and operational admission tests     |
| AT20 | stop during in-flight commit confirms boundary before any new side effect                                  | PASSED         | See repository CI and operational admission tests     |
| AT21 | webhook HMAC matches GitHub vector and rejects invalid signatures                                          | PASSED         | See repository CI and operational admission tests     |
| AT22 | OAuth validates issuer/audience and rechecks live token revocation                                         | PASSED         | Live signed governance/worker deployment NOT VERIFIED |
| AT23 | canonical J2 means a stop; provisional J2 repair schema is rejected                                        | PASSED         | See repository CI and operational admission tests     |
| AT24 | MCP tools return truthful QUEUED and HOLD with safety metadata                                             | PASSED         | See repository CI and operational admission tests     |
| AT25 | fresh MCP client and restarted store retrieve persistent run state (ChatGPT reconnect remains a live gate) | PASSED         | Live ChatGPT reconnect NOT VERIFIED                   |

Additional tests cover canonical manifest import, CDX allow/deny/unavailable, signature tamper, missing dispatch, scope hash drift, cyclic DAG, trusted-workflow drift, recipe precondition mismatch, subject revocation, actor/idempotency conflict, lease theft prevention, wrong decision binding, decision replay, host/origin/auth/webhook boundaries, expired token/issuer/audience, incremental OAuth scope challenge, stale cancellation recovery and dead letters.

PostgreSQL transaction locks, cross-connection idempotency, restart visibility and immutable audit are tested when `HF_TEST_DATABASE_URL` is set. The local run skips that one test. Actual GitHub CI passed it: 46 total tests passed, 0 failed and 0 skipped. The downloaded artifact digest was verified; see `evidence/vitest-ci.json` and `evidence/github-integration.json`.

## References

- Test evidence: `evidence/vitest-local.json`; test source: `../tests/acceptance.test.ts`, `../tests/security.test.ts`, `../tests/governance.test.ts`, `../tests/recovery.test.ts`, `../tests/postgres.test.ts`.
