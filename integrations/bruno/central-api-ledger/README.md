# Central API Ledger — Bruno/OpenCollection (FFOS)

**State:** versioned request definitions under PR #51; no FFOS runtime adapter, no unattended API execution, no verified QGIS handoff.

The included `opencollection.yml` is Bruno OpenCollection format, **not** `bruno.json`. This developer collection is not an ingestion service. Provider adapters and automation are separately approved FFOS runtime work.

## Open and configure locally

1. Clone `Motherpher/FFOS`; in Bruno choose **Open Collection** and point to this `central-api-ledger/` directory (back up your original Bruno collection first).
2. Create a **local** `Development` environment, never commit it or its contents. Set the following non-secret example variables:

   | Variable | Example |
   | --- | --- |
   | `kolada_base_url` | `https://api.kolada.se/v3` |
   | `municipality_id` | `0380` |
   | `kpi_id` | `N00060` for municipality requests; test a relevant `has_ou_data=true` ID for OU requests |
   | `year` | `2025` for municipality requests; test `2023` for OU examples |
   | `ou_id` | `V11E110374` (example only) |

3. SCB AFR: **only** set `scb_afr_api_key` as a local Bruno **secret**, never a tracked `.yml` or collection variable in Git. The `X-API-Key` header uses `{{scb_afr_api_key}}`; if the key is unavailable, the SCB request must be considered NOT TESTED.
4. Open request 02 (Municipality Lookup). Verify the environment is active and the resolved URL is `https://api.kolada.se/v3/municipality/0380`. Expect the response identity `0380`, not only a 200 status.
5. Request 08: test a known municipal KPI/year. Request 13: select an OU KPI with `has_ou_data=true` and test an OU/year with observed data.
6. Record the **actual** response status, count, ID, pagination pointers, retrieval time, provider/schema vintage and exceptions. No fresh runtime test has been performed as part of this GitHub commit.

## Paging and query semantics

- Request 10 now defaults to `per_page=100`. This does **not** mean all KPIs were fetched: follow returned `next_url` until null, observing provider limits and failures.
- Request 09's `region_type=municipality` is a query filter, not a claim that raw outputs have exactly 290 rows. Respect any aggregate rows.
- `from_date` filters API update dates; do not use it to mean the observation year. `year` belongs to the path.
- Avoid submitting empty `from_date` or `title` query parameters.
- When reproducing historical statistics, verify the geographic classification, year, KPI definition, and source release independently.

## Read-only static validation

From repository root:

```bash
python3 integrations/bruno/validate_collection.py
```

This checks collection shape, 14 numbered Kolada requests, naming/URL invariants, secret patterns, and risky query settings. It does not fetch live data, install Bruno, validate the complete OpenCollection schema, or prove provider correctness.

## Cleanup

Three older top-level Kolada requests remain intentionally for continuity where they have functional URLs. Previously empty placeholder requests were removed from the proposed collection; the 14 grouped Kolada requests remain.

## Integration boundary

FFC defines the human process and data authority; FFOS owns the future API/automation orchestration, `Motherpher/FF-Spatial` owns source/geography and QGIS contracts, and data/figure publication is derived. The intended route is **ChatGPT request → approved FFOS job → provider adapter → R data transformation → FF-Spatial/QGIS → verified spatial artifact → optional publication**. Bruno is used to design/test request contracts; the actual runtime should call the provider using a bounded adapter or approved CLI runner, not assume the Bruno desktop UI can be remotely controlled.

See `docs/decisions/ADR-API-LEDGER-OWNERSHIP-PROPOSED.md`; no Director acceptance or runtime permission is implied.
