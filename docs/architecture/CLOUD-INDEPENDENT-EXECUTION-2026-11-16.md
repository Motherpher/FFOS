# Cloud-independent execution — operating contract 2026-11-16

**Change:** new DevOps process under FFOS six-stage model: Plan → Design → Build → Test → Release → Learn. **Level L3** due to cross-repository execution, data provenance, and operation governance. **Status:** implementation candidate until PR review, Actions evidence, Director release and credential/storage binding.

## Director objective
Personal Mac is **not** a runtime dependency. Desktop programs (QGIS, Bruno, design/editing apps) remain optional human interfaces. Repositories own source, definitions and approvals; cloud runners own execution; external object storage must own durable versioned data.

### Actual migration slices

| Contract | Execution | Secrets | Output | Approval |
|---|---|---|---|---|
| Kolada municipality identity | FFOS `cloud-kolada-municipality.yml` | None | private GitHub artifact: municipality.csv + municipality.provenance.json, 14-day retention | explicit workflow_dispatch; `cloud-pilot` environment |
| Swedish ADM1 boundary pilot | FF-Spatial `cloud-headless-adm1.yml` | None | temporary verified EPSG:3006 GeoPackage + source GeoJSON + provenance.json, 14-day retention | explicit workflow_dispatch; `cloud-pilot` environment |
| FFOS → FF-Spatial | FFOS `cloud-dispatch-ffspatial.yml` | repo secret `FF_SPATIAL_DISPATCH_TOKEN` (GitHub App / fine-grained token scoped to FF-Spatial Actions:write) | GitHub dispatch receipt only, authoritative execution/artifacts reside in FF-Spatial | `cloud-pilot` environment; API accepts dispatch, not proof of job PASS |
| CI contracts | GitHub-hosted runners | None | test outcome | pull-request review |

**This is not a geographic join**: Kolada municipality identity `0380` and Sweden county (ADM1) geometries are different geographic grains. No 0380-to-county false join allowed. Spatial/statistical joining requires separate approved population/KPI + same-level geography + temporal and license validation.

## Architecture
- **Director:** mandates, gates, data access, and acceptance external to agent and CI.
- **FFOS:** orchestration and API contracts. Bruno OpenCollection definitions remain a human-operated catalogue; API runtime uses controlled direct HTTP requests, not Bruno GUI.
- **FF-Spatial:** authoritative spatial derivation and QGIS/open-source tooling, run headlessly in Linux cloud environments.
- **GitHub:** immutable reviewed code, dispatch, short-lived evidence artifacts; *not* a database, durable data lake or secret vault for downloaded content.
- **Durable data:** NOT YET BOUND. Select and provision cloud object storage with versioning, access control, lifecycle, encryption, data residency and costs, then add verified upload with recorded object/version IDs and checksums. 14-day GitHub artifacts are not durable storage.
- **QGIS Desktop + qgis-mcp:** optional human visual exploration on Mac; no longer required for either new cloud pilot.
- **Legacy FF-Spatial LaunchAgent:** leave stopped; do not remove or change automatically; retire only after cloud acceptance and checking no other workflow depends on it.

## Governance and failure semantics
- CI green ≠ live provider retrieval ≠ production acceptance.
- Workflow dispatch API success ≠ downstream execution success. Cross-repo final acceptance must inspect FF-Spatial run and artifact provenance.
- GH Actions environment protection must be configured by the Director to enforce manual approval; merely naming `cloud-pilot` does not create an approval requirement.
- No credentials, raw restricted data or unreviewed provider content committed to GitHub.
- Fail closed on unexpected HTTP status, duplicate municipality IDs, pagination, missing attributes, non-allowlisted boundary sources, missing geometries, reprojection errors, integrity failures.
- Pin third-party actions and tool/container digests before high-assurance production; current pilot uses provider-supported version tags and apt packages.
- Historical 2009 GeoPackage remains a distinct vintage. The cloud ADM1 workflow retrieves the *current advertised* geoBoundaries vintage, reports the provider's represented year, and does not silently relabel it 2009.

## Runbook after PR merge
1. Review source rights and CI status. Configure `cloud-pilot` environment (required reviewers / branch rules) in both repos.
2. Trigger **FFOS → Actions → FFOS cloud API — Kolada municipality → Run workflow** with `municipality_id=0380`. Confirm artifact identity, timestamps and checksum.
3. Trigger **FF-Spatial → Actions → FF-Spatial cloud headless ADM1 → Run workflow**. Confirm GeoPackage EPSG:3006, >0 units, source year, licence and transformation evidence.
4. If and only if cross-repo execution is desired, provision `FF_SPATIAL_DISPATCH_TOKEN` in FFOS secret settings and trigger FFOS cross-repo dispatch. Confirm *downstream* Actions conclusion and artifact.
5. Designate remote object storage and promote artifacts after checksum and rights checks.
6. Hold legacy LaunchAgent decommissioning until cloud artifacts are independently accepted.

## Status matrix
Plan: done. Design: done. Build: staged in GitHub feature branch. Test: local/CI pending evidence. Release: HOLD until review, permission configuration and live cloud-run evidence. Learn: document measured costs/runtime and replace fragile hosted dependencies.

Pius, CDX, AMA and domain-specific requirements remain unchanged; this migration introduces no new agents or expanded autonomous permissions.
