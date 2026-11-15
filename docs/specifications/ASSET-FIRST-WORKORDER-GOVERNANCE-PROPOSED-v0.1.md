# FFOS Asset-first work orders & data product governance — candidate v0.1

**Status: PROPOSED / NOT IMPLEMENTED / NOT DIRECTOR ACCEPTED**  
**Date:** 2026-11-16  
**Scope:** all domain-neutral data retrieval, transformation, spatial production, re-use and return workflows.  
**Governance owner:** Human Director under existing CDX/FFC/FFOS authority contracts.  
**Technical home:** `Motherpher/FFOS`. Geospatial source and product identity stays with `Motherpher/FF-Spatial`; project-specific analytic meaning stays in its domain repo.  
**Related:** FFC PR #43 (human-facing workflow), FFOS PR #51 (Bruno developer collection, distinct from runtime).

## I. Binding distinction

This is a **normative proposal** for future implementation, not evidence of an active job router, R worker, data catalog, asset store, API service, QGIS sync, or ChatGPT connector. If accepted, it augments existing FFOS registry/event/workflow/approval contracts rather than creating a second system. Existing approved authority/mandate, source-identity, information security, Pius/HARP/HCC and domain ownership rules take precedence. No file here authorizes autonomous external effects or publication.

## II. Fundamental laws

**W01 — Work order before execution.** A natural-language intent produces a typed `WorkOrder`; intent parsing alone cannot start external reads, writes, cost, geo-processing or release. The order contains requester/principal, mandate, domain, goal, geography+version, observation time, population definition, outputs, sensitivity, access, acceptance criteria, and `work_order_id`.

**W02 — Asset-first discovery.** Before any external fetch, analysis or rendering, resolve existing assets from the shared catalogue, including the spatial registry. Record a reuse assessment even when nothing matches. Compare meaning, scope, schema, geographical vintage, validity period, source-as-of/freshness, quality, coverage, licence, privacy, availability and integrity. Matching keywords or geometries is **insufficient**.

**W03 — Explicit reuse decision.** Choose one: `REUSE_EXACT`, `REUSE_WITH_TRANSFORMATION`, `REFRESH_REQUIRED`, `NEW_SOURCE_REQUIRED`, `BLOCKED`. Record considered assets and *reasons* for accepting/rejecting each, as work-order evidence. Automatic reuse is permissible only under bounded authority with passing compatibility/rights checks; else review.

**W04 — One identity per asset, immutable versions.** Assign stable logical `asset_id`, immutable `asset_version_id`, producer/run IDs and a content digest. Never mutate or silently overwrite an accepted version. Corrections create a superseding version and provenance edge. Deletion follows retention/legal controls and keeps tombstone/evidence references.

**W05 — Data and operational truth stay with owners.** FFOS owns orchestration/asset index, not the original provider facts or every domain's analytical interpretation. Raw/provider authority remains external; FF-Spatial owns geographic binding and spatial product catalogue; domain repo owns field-specific classifications. The index is a pointer/reference graph, not universal file duplication.

**W06 — Raw/derived/publish/evidence isolation.** Immutable raw snapshots, reproducible derived tables, spatial outputs, approved publish views and append-only evidence occupy separate storage namespaces. Git stores source contracts, code, manifests and suitable small public fixtures—not credentials, uncontrolled raw dumps or sensitive/geospatial bulk payloads.

**W07 — Layer atomicity and composability.** A reusable base dataset must express one clearly defined geographical or thematic subject; joins and visual combinations generate separate derived assets. A DeSO polygon layer never silently becomes a "DeSO+föreningar" canonical baseline. Preserve ability to inspect, switch and overlay layers independently.

**W08 — Spatiotemporal integrity.** Typed identifiers preserve leading zeroes; require geography type/code/vintage, observation period and temporal validity. Crosswalking between DeSO vintages, assigning a historical club to a modern boundary, or treating registered office as operational presence demands explicit methodology, uncertainty and authorization.

**W09 — No inferred geolocation or completeness.** A municipality or address alone does not prove presence inside a DeSO. Geocoding, coordinate precision, point-in-polygon, missing/out-of-scope and protected cases must be explicit. Log unmatched records and coverage denominators. HTTP 200 ≠ population completeness.

**W10 — Reproducible transform, not mandatory R hop.** A configured R worker may own tabular normalization/analysis through pinned scripts, package versions, deterministic input/output, QA and manifest. If a safe direct approved FF-Spatial path is more appropriate for a pure polygon product, do not add artificial R processing. No arbitrary code from prompts.

**W11 — Separation of design client and execution.** Bruno's OpenCollection is a versioned design/test surface; autonomous fetching requires an approved FFOS provider adapter/runner. All sources have verified contract, authorization, pagination, throttling, retry classification, timeouts, checksum and run receipts. Secrets remain in authorized secret storage, never chat or repo.

**W12 — Persistent discoverable GIS workspace.** QGIS projects are reproducible views/workspaces referencing separately stored approved layer assets by stable IDs and resolvable URIs. "Always available" means catalogued and recoverable, *not* continuously loaded into every local QGIS session. Project state, layer data and presentation styling have independent versioning.

**W13 — Cross-repo lineage without duplication.** FFOS maintains global work-order/run/asset-edge references. Each participating canonical domain repository holds an appropriate local work-order journal/index referencing the same IDs and receipts, without wholesale copies of another repo's source, secrets or large data. No silent back-write across authority boundaries.

**W14 — Independent outcome evidence.** Completion requires verifiable physical product availability, schema/content and spatial checks, access/rights, lineage and `VerificationReceipt`. Process exit 0, Bruno 200, GitHub PASS or a pretty map alone are not acceptance evidence.

**W15 — Publication is independent.** Non-spatial table, map layer, styled QGIS export, Miro/Canva/Figma asset, Lovable-built app and Vercel-hosted web page are distinct delivery products. A VisualSpec never becomes source truth. Vercel hosts/deploys suitable web artifacts; it is not the cartographic data engine. Public access requires a separate publication decision, licensing and disclosure gate.

**W16 — Fail closed; report partial truth.** Unavailable source, inaccessible local runtime, mismatched vintage, failed licence, missing geography or privacy risk yields `BLOCKED`/`PARTIAL`/`FAILED` with evidence and allowed fallback, not synthetic data. Require explicit disable/rollback paths and invalidate stale assets.

**W17 — No agent or cross-project authority by analogy.** This reusable asset scheme may inspire Pius "källare" patterns but does not activate Pius runtime, replicate its corpus or change HCC/CDX authority. Barnombudet or other client/NGO data remain separate and require explicit source/access/transfer permits.

## III. Minimum record contracts (proposed additions to existing registries)

### WorkOrder

`work_order_id, request_id, requester, project_id, owner_repo, principal, mandate_ref, purpose, intent_type, population_definition, geography_type, geography_id, geography_vintage, observation_period, sensitivity, outputs_requested, success_criteria, access_policy_ref, status, created_at`

### AssetRecord

`asset_id, asset_version_id, asset_kind [RAW|TABULAR_BASE|SPATIAL_BASE|DERIVED_ANALYSIS|PRESENTATION], owner_repo, authority_ref, location_ref, schema_ref, content_sha256, source_snapshot_refs[], observed_time, acquired_at, valid_from, valid_to, geography_id, geography_vintage, crs, population_definition, granularity, completeness_status, QA_receipt_ref, license_ref, disclosure_class, reuse_status, supersedes_version_id`

`location_ref` is a scoped resolvable pointer, not a hardcoded single-user absolute file path. The index must not expose restricted URLs or credentials.

### ReuseDecision

`work_order_id, requested_capability, candidate_assets[], selected_assets[], compatibility_checks[], rejection_reasons[], decision, decision_actor, decided_at, evidence_refs[]`

### Run and lineage edges

`run_id, work_order_id, stage, engine, adapter_or_script_version, input_asset_version_ids[], output_asset_version_ids[], started_at, completed_at, status, checksum_refs[], receipt_refs[], cost_or_limits, warnings[]`

### Spatial product references

Geography and layer contracts defer to FF-Spatial `AnalyticalRequirement`, `GeographyBinding`, `SpatialProduct` and `VerificationReceipt`—do **not** define competing FFOS geometry semantics.

## IV. Routing/state law

```text
REQUESTED
 → TYPED
 → AUTHORITY_PREFLIGHT
 → ASSET_LOOKUP
 → REUSE_ASSESSMENT
    ├── REUSE_EXACT → VERIFY_ASSET → DELIVER
    ├── REUSE_WITH_TRANSFORMATION → TRANSFORM → [SPATIALIZE] → VERIFY → DELIVER
    ├── REFRESH_REQUIRED / NEW_SOURCE_REQUIRED → SOURCE_ADMISSION → ACQUIRE
    │      → NORMALIZE [R when useful] → [SPATIALIZE] → VERIFY → REGISTER_ASSET → DELIVER
    └── BLOCKED → EXPLAIN
 → OPTIONAL_PUBLICATION_GATE → PUBLISH
```

Every transition uses the existing FFOS event envelope (event_id/type, occurred_at, actor, correlation/causation/idempotency, evidence refs, epistemic state), with append-only corrections. Retries must not silently create duplicate artifacts. Authorization is checked at every external read/write effect and publication. A project's local journal is a projection, never an alternate FFOS control plane.

## V. Per-repository journal law (proposal)

Minimum entry: `work_order_id`, `run_id`, `local_task_ref`, `owner_repo`, role (`producer|consumer|transformer|renderer`), `input_asset_versions`, `outputs`, `status`, `receipt_refs`, timestamp, approvals. The repo decides its own presentation (Markdown/NDJSON/DB reference) within existing local conventions. **Do not mass-create journals in every repo or modify unrelated projects without a domain-approved port.**

## VI. Implementation and promotion gates

1. Governance review of this contract and FFC+FF-Spatial parallel proposals.
2. Registry schema compatibility design and migration plan; distinguish asset reuse from live source refresh; test historical vintage and licence counterexamples.
3. Offline fixtures: exact-match reuse, stale/version mismatch, DeSO+organisation point-vs-seat, missing rights, failed pagination, simultaneous requests and retry idempotency.
4. FFOS runner/provider adapter under existing boundaries; Bruno collection may supply a verified request *definition*, never silently run local GUI.
5. R-worker admission and format/manifest validation; verify no arbitrary prompt code.
6. FF-Spatial product registry and reproducible QGIS project loading; independent layer open/geometry/CRS/vintage QA.
7. ChatGPT/FFOS invocation binding, actual artifact handoff, audit/authority approval, observed runtime receipts.
8. Publication adapters only if justified, with independent consent/rights/secret checks.

**Release language:** `DEFINED` ≠ `IMPLEMENTED` ≠ `CONNECTED` ≠ `TESTED` ≠ `ACCEPTED` ≠ `PUBLISHED`. No stage may be promoted by documentation alone.
