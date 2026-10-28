#!/usr/bin/env python3
"""Static CDX ProjectHub scope and false-enforcement claim check."""
import json
from pathlib import Path
root=Path(__file__).resolve().parents[2]
anchor=json.loads((root/".cdx/anchor.json").read_text())
inv=json.loads((root/"integrations/cdx/projecthub-effect-inventory-v0.1.json").read_text())
errors=[]
def require(x,msg):
    if not x: errors.append(msg)
require(anchor.get("governed_surface",{}).get("repository")=="Motherpher/FFOS","Wrong FFOS anchor repository")
require(anchor.get("cdx_authority",{}).get("repository")=="Hybrismannen/Conductellence-","CDX authority mismatch")
require(anchor.get("binding_mode")=="PINNED_COMMIT","Pre-release source pin must be immutable commit")
require(inv.get("subsystem")=="ProjectHub","Inventory must be ProjectHub-scoped")
require(inv.get("repository_anchor")==".cdx/anchor.json","ProjectHub must reference FFOS canonical anchor")
require(inv.get("governed_repository")==anchor.get("governed_surface",{}).get("repository"),"ProjectHub repo identity mismatch")
require(inv.get("authority")==anchor.get("cdx_authority",{}).get("repository"),"ProjectHub CDX authority mismatch")
require(inv.get("repository_anchor_observed")==anchor.get("binding_state"),"ProjectHub snapshot anchor claim mismatch")
require(inv.get("enforcement_claim")=="NOT_VERIFIED","No tested ProjectHub runtime guard evidence authorizes promotion")
require(inv.get("cdx_runtime_integration")=="BOUND_PENDING_RUNTIME_INTEGRATION","ProjectHub CDX integration must remain pending")
require(inv.get("actual_local_enforcement_points")==anchor.get("local_enforcement",{}).get("points",[]),"Enforcement inventory does not match anchor")
require(anchor.get("local_enforcement",{}).get("fail_closed_for_consequential_effects") is True,"FFOS must fail closed for consequential effects")
ids=[x.get("id") for x in inv.get("effects",[])]
require(len(ids)==len(set(ids)),"ProjectHub effects need unique IDs")
require(all(x.get("cdx_enforcement")=="NOT_BOUND" for x in inv.get("effects",[])),"Do not claim effects have runtime CDX enforcement without tests")
require({"A3","A4","A5"}.issubset({x.get("ffos_class") for x in inv.get("effects",[])}),"ProjectHub A3/A4/A5 boundaries not covered")
if errors:
    for x in errors:print("FAIL:",x)
    raise SystemExit(1)
print("PASS: FFOS ProjectHub lies within FFOS CDX repository anchor scope.")
print("LIMIT: none of the ProjectHub consequential runtime effects has verified CDX mediation.")
