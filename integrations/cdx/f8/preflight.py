#!/usr/bin/env python3
"""Produce an inspectable FFOS F8 integration preflight without granting standing.

A source-state snapshot is not a signed live CDX attestation. The report always
blocks promotion unless an independent authorized release integration does so.
"""
import argparse,json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[3]
def preflight():
    anchor=json.loads((ROOT/".cdx/anchor.json").read_text())
    source=json.loads((ROOT/"integrations/cdx/f8/governance-source-state.json").read_text())
    checks={
      "canonical_anchor":anchor.get("schema")=="cdx.anchor/v1"
       and anchor.get("governed_surface",{}).get("repository")=="Motherpher/FFOS",
      "pinned_production_release":anchor.get("binding_mode")=="PINNED_RELEASE",
      "runtime_enforcement_verified":anchor.get("conformance",{}).get("runtime_state")=="VERIFIED_RUNTIME_BOUND",
      "actual_cdx_release_observed":source.get("release_state")=="RELEASED"
       and source.get("release_authorized") is True,
      "cdx_core_blockers_closed":not source.get("core_release_blockers"),
      "separate_runtime_trust_attested":False,
      "live_spetl_custody_attested":False,
      "human_runtime_release_approval":False,
    }
    blockers=[k for k,v in checks.items() if not v]
    return {"schema":"ffos.f8.preflight/v1","milestone":"F8",
      "engineering_state":"CANDIDATE_IMPLEMENTED",
      "release_gate":"BLOCKED_EXTERNAL_GATES","gate_id":"M2-CDX-VERIFIED-RUNTIME-BOUND",
      "checks":checks,"blockers":blockers,"production_effects_allowed":False,
      "runtime_verified":False,"human_accepted":False,
      "source_snapshot_ref":"integrations/cdx/f8/governance-source-state.json",
      "anchor_ref":".cdx/anchor.json",
      "next_required_authorities":[
        "CDX core repository/release gate WP07",
        "CDX-RUNTIME-001 governed consumer integration (WP11)",
        "independently attested policy service and mandatory control facts",
        "independent SPETL v1.1 receipt custody and verifier",
        "independently authorized human acceptance"
      ]}
if __name__=="__main__":
    parser=argparse.ArgumentParser();parser.add_argument("--output",required=True)
    args=parser.parse_args()
    result=preflight()
    Path(args.output).write_text(json.dumps(result,indent=2)+"\n")
    assert result["production_effects_allowed"] is False
    assert result["release_gate"]=="BLOCKED_EXTERNAL_GATES"
    print("F8 PRE_RELEASE_BOUNDARY_CONFIRMED: engineering candidate only; all consequential effects remain blocked")
