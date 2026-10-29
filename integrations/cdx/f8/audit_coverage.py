#!/usr/bin/env python3
"""F8.1: audit pinned reference catalogue. Does not certify CDX release."""
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[3]
CATALOGUE=ROOT/"integrations/cdx/f8/control-coverage.json"
SOURCE_BLOB="55dbcdac2f822b59a5a5f0f19eeadfa61d2c7ed0"
LAW_BLOB="2550b2045ff0e0b6b3d12312b2e3ef7441d9a95b"
def audit():
    obj=json.loads(CATALOGUE.read_text())
    assert obj["schema"]=="ffos.f8.cdx-control-coverage/v1"
    assert obj["generated_from"]["control_registry_blob_sha"]==SOURCE_BLOB
    assert obj["generated_from"]["law_topology_blob_sha"]==LAW_BLOB
    assert obj["generated_from"]["law_id"]=="CDX-LAW-001"
    rows=obj["sections"]
    assert len(rows)==131
    section_ids=[x["section_id"] for x in rows]
    assert len(set(section_ids))==131
    assert all(x.startswith("CDX-LAW-001-") for x in section_ids)
    controls=[(row,c) for row in rows for c in row["controls"]]
    assert len(controls)==69
    assert len({c["control_id"] for _,c in controls})==69
    assert sum(not r["controls"] for r in rows)==62
    assert all(c["section_id"]==r["section_id"] and
               c["audit_vector_count"]>=2 and
               "SPETL decision event" in c["evidence_requirements"] and
               c["enforcement_surface"] and c["decision_on_fail"]=="DENY"
               for r,c in controls)
    assert all((r["classification"]=="IMPLEMENTED_REFERENCE_CONTROL")==bool(r["controls"])
               for r in rows)
    assert obj["approval_state"]=="CANDIDATE_SOURCE_MAPPING_NOT_INDEPENDENTLY_APPROVED"
    print("F8.1 STATIC_MAPPING_PASS: 131 law sections, 69 controls, 62 review-governed; no normative adoption")
if __name__=="__main__":audit()
