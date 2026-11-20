# FF-GH-WO-002 — Current Reconciliation, 16 November 2026

**Scope:** 33 repositories under the currently connected GitHub installations (**14 Motherpher / 19 Hybrismannen**). **Status:** This dated change addendum is a **review candidate**, not yet the accepted operating baseline.

## What changed?

- 2 previously unregistered repositories: [Ideburen](https://github.com/Motherpher/Ideburen) and [Texts-n-Lyrics](https://github.com/Hybrismannen/Texts-n-Lyrics).
- 13 Wiki-enabled repository flags, **not** 13 verified native Wikis.
- Existing domain Projects remain [Opal #2](https://github.com/users/Hybrismannen/projects/2) (16), [Politent #3](https://github.com/orgs/Motherpher/projects/3) (18), [CareerHub #4](https://github.com/orgs/Motherpher/projects/4) (13).
- Central [Estate Portfolio #2](https://github.com/orgs/Motherpher/projects/2) now has 24 native-source Items. This is noncanonical planning coverage, not 24 accepted decisions.
- FFOS main now has Bruno integration *documentation* and a proposed ownership ADR. Other cross-repository Bruno, data-asset and geospatial contracts remain open/draft PRs; do not call them a live pipeline.
- WO-002 **WP01 implementation staged/DG-01 pending**, **WP02 native Projects implemented/DG-02 pending**, **WP03 not started**. Earlier WO-001 WP04 DG-04 remains HOLD.

## Read the updated work order

1. [33-repository full source register](CURRENT-ESTATE-REGISTER-33-v1.1.md) and [machine-readable audit](ESTATE-REGISTER-33-v1.1.json)
2. [Work-order revision and dependencies v1.1](WORKORDER-RECONCILIATION-v1.1.md) — complete impact of 16 November changes, source vs project vs proposed data-asset work-order IDs, no extra WPs
3. [Acceptance and verification delta](ASSURANCE-AND-DECISION-DELTA-v1.1.md) — technical/source PASS, partial checks, HOLDs and tests added to WP01–WP03

## Where to operate

**[Authoritative master Issue #48](https://github.com/Motherpher/FFOS/issues/48)** — WP01/master work order and Director gates.  
**[WP02 source Issue #50](https://github.com/Motherpher/FFOS/issues/50)** — existing domain Projects, exact Project item evidence and DG-02.  
**[WO-002 WP01 draft PR #49](https://github.com/Motherpher/FFOS/pull/49)** — D01–D04 and seven source PRs, unmerged.  
**[WO-002 WP02 draft PR #54](https://github.com/Motherpher/FFOS/pull/54)** — D05–D09 and two domain navigation PRs, unmerged.  
**[Older DG-04 final HOLD](https://github.com/Motherpher/FFOS/issues/46)** — must not be superseded.

## New knowledge and data sources (proposed/current differentiated)

| Domain | Source | Verified maturity |
|---|---|---|
| FFOS Bruno definitions | [Main `integrations/bruno/`](https://github.com/Motherpher/FFOS/tree/main/integrations/bruno) | Main docs and proposed ADR; no live service |
| Bruno API collection | [FFOS #51](https://github.com/Motherpher/FFOS/pull/51) | Open review, static QA; not accepted/live |
| Bruno local runner | [FFOS #52](https://github.com/Motherpher/FFOS/pull/52) | Draft and mocked tests; no live Mac binding |
| Asset-first work orders | [FFOS #53](https://github.com/Motherpher/FFOS/pull/53) | Draft registry/schema/tests, no DB migration applied |
| FFC semantics | [FFC #43](https://github.com/Motherpher/form-flode/pull/43) | Proposed FFC-DATA-01–18, no canonical change |
| Spatial asset metadata | [FF-Spatial #42](https://github.com/Motherpher/FF-Spatial/pull/42) | Draft local metadata catalogue, not verified QGIS geometry |
| Civic-sector data | [Ideburen Release Status](https://github.com/Motherpher/Ideburen/blob/main/docs/RELEASE_STATUS.md) | Internal pre-release, source-rights/polygons blocked |
| Literary atlas | [Texts-n-Lyrics wiki source](https://github.com/Hybrismannen/Texts-n-Lyrics/blob/main/wiki/Home.md) | Versioned Wiki source; native publication/rights not independently verified |

**Boundary:** Documentation, source Issues and Projects are not the source of Director acceptance or technical/production capability. New FFC-DATA semantics and asset IDs may only be adopted through their owning source decision and independent testing.

**Current operation:** Review this PR and its 3 November predecessors. Do not silently merge, create additional Project boards, publish native Wikis, grant credentials or activate runtime in response to this reconciliation alone.
