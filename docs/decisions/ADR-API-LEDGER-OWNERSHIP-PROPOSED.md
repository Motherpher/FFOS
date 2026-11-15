# ADR candidate — FFOS Central API Ledger and Bruno collection boundary

**Status:** PROPOSED — not Director accepted
**Date:** 2026-11-15
**Scope:** External API development collection, source provenance and local-to-FFOS transfer

## Decision proposed

- FFOS shall host the shared, provider-neutral API Ledger definitions and Bruno collection under `integrations/bruno/central-api-ledger/`. The collection is a developer/testing client, **not** a credential vault, authoritative data store or deployed API server.
- FFOS owns common technical connectors, source contract manifests, execution receipts and operational controls. Domain repositories, including Ideburen, own research selections and interpretation. FFC/CDX and Pius/HARP remain authoritative within their respective, separately versioned mandates.
- Only scrubbed public-facing definition files may be committed. No SCB AFR keys, OpenAI keys, environment secret contents, API responses, personal data, exports, or hidden local Bruno state.
- A local Bruno collection may be imported only after an explicit list/diff and an independent secret scan. **No automatic sync, merge into main, or remote publication** follows from local Git init.
- Provider documentation may be mirrored as links/pointers with provenance; no API contract is claimed verified because a client request received HTTP 200.
- Director acceptance is needed before making this ADR canonical or enabling an FFOS runtime binding. The ordinary request to establish Git sync authorizes safe staging of this work but does **not** attest to an acceptance of this ADR.

## Source and architecture gates

- `docs/architecture/REPOSITORY-STRUCTURE.md`: integrations is the provider/client boundary; shared packages are domain-neutral.
- `docs/architecture/FFOS-ESTATE-AUTHORITY-TOPOLOGY.md`: proposed topology is not proof of runtime delegation.
- `integrations/README.md`: documented protocol ≠ implemented and tested connector.
- `Motherpher/Ideburen/config/api_ledger/`: existing domain-specific source ledger and classification policy, not automatically relocated.

## Implementation state

- Repository destination and safe transfer instructions: staged in FFOS.
- User's Bruno application and local collection: **NOT CONNECTED** by this GitHub change.
- Live secrets, automated export, CI integration, ingestion services: **NOT IMPLEMENTED**.
- Completion gate: local authorized source handoff, diff/security review, exact commit evidence, safe sync verification in Bruno.
