# FF-Spatial — External Spatial Service (proposed)

**State:** `PROPOSED_REFERENCE_ONLY` — no runtime adapter, authorization grant, or live FFOS binding is asserted.

**Canonical source:** [Motherpher/FF-Spatial](https://github.com/Motherpher/FF-Spatial).  
**Related governing environment:** [FFC / FFOS programme](https://github.com/Motherpher/form-flode/tree/main/17-ffos).  
**Pius system:** [Pius Universe](https://github.com/Hybrismannen/pius-universe), independently governed; its runtime interface remains reserved until accepted.

## Responsibility split

FFOS owns request intake, work-package/run linkage, Director approval, dispatch, event and receipt registers, and operator-visible result/status. FF-Spatial owns source discovery, dataset/geography compatibility, QGIS jobs, GIS transformations, spatial artifact and provenance contracts. FFC owns assignment methods/quality and accepted consultancy outputs. Pius may request/assess evidence only through versioned, separately authorized protocols.

**Intended control flow:** FFOS work item → Director authorization → versioned FF-Spatial request → approved FF-Spatial queue → local QGIS execution → receipt/artifact provenance → FFOS reconciliation → explicit output acceptance.

## Constraints

- No direct code fork/absorption of FF-Spatial; no source-of-truth duplication.
- No remote arbitrary shell; execution must honor FF-Spatial's approved transport, schema and local allow-list.
- External FF-Spatial `main:bridge/approved/` is an execution-eligible queue **only after that repository's own PR approval**; this proposed FFOS contract does not submit jobs.
- No write permissions, credentials, deployment, background bridge control, or imported agent authority are granted by this document.
- Contract must later define principal authorization, schema versions, source provenance, sensitive-data controls, idempotent request IDs, state mapping and rollback/failure receipts.
- Integration state can only advance to CONNECTED/TESTED after real adapter code, consent, test evidence and registered operations.

**Related spatial source:** [FF-Spatial architecture](https://github.com/Motherpher/FF-Spatial/blob/main/docs/ARCHITECTURE.md), [approved local transport](https://github.com/Motherpher/FF-Spatial/blob/main/docs/APPROVED_TRANSPORT.md).

This proposal does not modify the FFOS repository's existing Pius-RESERVED semantics.
