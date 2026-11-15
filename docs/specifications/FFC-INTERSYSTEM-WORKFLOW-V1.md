# FFC Inter-System Workflow v1 — Integration before agents

**State: integration candidate / no agent activation.** Director instructed that AMA and agent development are deferred until all required system connections can be independently exercised.

## End-to-end target

ChatGPT request → FFOS approved typed invocation → FFOS Central API Ledger / Bruno CLI → provider's raw response → FF-Spatial registry/gateway and R validation → derived GeoPackage (EPSG:3006 with pinned vintage/provenance) → existing QGIS bridge approved job → QGIS verified layer → optional Vercel dashboard → domain repository artifact manifest and FFOS execution receipt.

**Governance:** FFOS owns orchestration and common Bruno connector; FF-Spatial owns geographic data/models; Vercel owns optional publishing; GitHub owns versioned definitions, not bulk/raw data. No new agent identities or AMA activation.

## Verified vs not yet verified

| Boundary | Status | Evidence / missing item |
|---|---|---|
| Manual R → GeoPackage → QGIS | Verified | Real 21-feature geoBoundaries SWE ADM1 2009, EPSG:3006 and MD5 provenances |
| Reproducible R environment | Verified | User-operated renv lock/status and smoke tests |
| FFOS Bruno source control | Incomplete | Repository landing zone exists; actual Mac Bruno request files remain local |
| Typed FFOS → Bruno CLI runner | Candidate / offline tests | SHA-pinned allowlist runner in this branch; no Mac bru execution yet |
| Bruno reporter → R input | Blocked | Must inspect actual Bruno CLI reporter schema and safely extract approved data payload; JSON reporter can contain private data |
| R → QGIS automated job handoff | Candidate | Separate FF-Spatial PR generator; approved bridge runtime not exercised for generated job |
| ChatGPT → local FFOS invocation | Not connected | Requires an authenticated plugin/MCP or explicitly approved GitHub job transport and durable local dispatcher |
| QGIS → Vercel | Optional / not connected | Build only if user requests interactive web output |
| Full e2e receipt | Not verified | One run across all boundaries has not occurred |

## Acceptance pilot, deterministic

**A. API-only pilot:** Existing Bruno Central API Ledger municipality lookup for `0380`:
1. Find the real local `.bru` request and inspect inherited scripts and secrets.
2. Verify `bru --version`; pin SHA256 in a nonsecret local runtime config.
3. Run the FFOS Bruno runtime dry-run first, then explicit execute.
4. Inspect JSON reporter's **actual** structure, request status, payload, result identity and pagination; document approved extraction mapping and data rights.

**B. Spatial pilot:** Known derived GeoPackage:
1. Generate QGIS job from an R-validated layer via FF-Spatial's `R/scripts/build_qgis_handoff.py`.
2. Review and approve the exact job through canonical `bridge/approved/` on main.
3. Observe Mac queue/receipt and QGIS verification.

**C. Complete command pilot:** 'Hämta DeSO 2025 i Uppsala kommun och skapa ett återanvändbart referenslager'. A request is fulfilled only with authoritative source/version, complete requested municipality coverage, stable DeSO IDs, CRS, recorded provenance, materialized layer and local QGIS receipt.

A Bruno Kolada municipality lookup is a connectivity check, **not** a source of DeSO polygons. SCB's official geometry endpoint must be independently confirmed and registered.

## Operational rules

- Never treat local GitHub files as an authenticated Mac runtime.
- Do not push secrets, API response bodies, personal data, protected geolocations or bulky GeoPackages into GitHub.
- Data retrieval may be replayed only under explicit idempotency and freshness policy.
- Dataset missing/partial/uncertain is not complete; maintain coverage and temporal compatibility assertions.
- No arbitrary shell commands, agent lifecycle changes, automatic promotion, or direct bridge policy bypass.
- Do not claim activation without evidence for every connector's actual runtime.
