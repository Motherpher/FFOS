# AMA M7-E — Generic Synthetic Reference Suite

**Status:** GENERATED IN CI ONLY · NOT A REGISTERED AGENT · NOT A PRODUCTION APPLICATION.

This directory is an **instance-level fixture space**, deliberately outside `docs/architecture/AMA.md` and the shared universal schema. A single minimal agent cannot exercise every conditional cognitive profile, so M7-E evaluates six synthetic, version-pinned profiles. The source of the generated data is existing tested M1–M6 fixture constructors.

The six profiles:
1. `minimal_memory_off.json`: universal base without enabled memory
2. `e0_classified_read_precheck.json`: scoped identity and recipient/grant static admission
3. `memory_on_profile.json`: conditional reasoning, retrieval and time-bounded memory
4. `durable_unknown_and_reconciliation.json`: pinned run/attempt/receipt graph
5. `evaluation_ten_axis.json`: ten-axis synthetic evaluation and independent-test-double oracles
6. `operational_canary_review.json`: health, compatibility, review-only canary, rollback plan

Run generation through `packages/agent-model/conformance/ama_m7_integration.py` after `integrations/cdx/f8/preflight.py` has emitted a truthful blocked-release snapshot. The generator creates these six JSON objects plus `m7e-assessment.json` under the *selected output directory* and GitHub Actions archives them. No synthetic run may be promoted to `ACTIVE`, and no static candidate report can issue human acceptance.

The actual disposable PostgreSQL end-to-end fixture uses its own isolated v1 Agent Stable runtime shape for the deployed host adapter: `packages/agent-runtime/tests/m7e-end-to-end-pg.test.mjs`. It is intentionally distinct from the v0.2 candidate **model** fixture. The CI test supplies fake signatures, fake policy decisions and a local pretend external resource; they are never source-authenticated CDX/SPETL production services.

**Critical distinction:** M7-E completion is *engineering conformance*, whereas M7-O requires real security policy release F8.7, real independent M5 C4/C5 evidence, approved runtime operations, and governing human release acceptance.
