from __future__ import annotations
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
REG=ROOT/"agents"/"registry.json"

def load(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))

def test_registry():
    r=load(REG)
    fleet=r["fleet"]
    assert [x["ordinal"] for x in fleet]==[1,2]
    assert [x["agentId"] for x in fleet]==["FFOS-AGENT-MESSI-001","FFOS-AGENT-HOUSEHOLD-002"]
    assert r["governance"]["director"]=="EXTERNAL_GOVERNING_AUTHORITY"
    assert r["governance"]["ama"]=="ARCHITECTURE_NOT_AGENT"
    assert "NOT_FLEET_AGENT" in r["governance"]["mechanic"]
    non=r["nonFleetClassification"]
    for key in ("cashin","carpenter","evaluate","research","janitor","handyman","verifier","director"):
        assert key in non

def test_manifests():
    m=load(ROOT/"agents"/"messi"/"manifest-candidate-v0.1.json")
    h=load(ROOT/"agents"/"household-family"/"manifest-candidate-v0.1.json")
    assert m["agentId"]=="FFOS-AGENT-MESSI-001" and m["lifecycleState"]=="DRAFT"
    assert h["agentId"]=="FFOS-AGENT-HOUSEHOLD-002" and h["lifecycleState"]=="DRAFT"
    assert m["authority"]["governingAuthority"]=="FFOS_DIRECTOR"
    assert h["authority"]["governingAuthority"]=="FFOS_DIRECTOR"
    assert m["authority"]["selfApprovalProhibited"] is True
    assert h["authority"]["selfApprovalProhibited"] is True
    roles={r["roleId"] for r in h["internalRoles"]}
    assert roles=={"JANITOR","HANDYMAN","VERIFIER"}
    assert all(x["effectCeiling"]!="E3_EXTERNAL_EFFECT" for x in h["internalRoles"])

if __name__=="__main__":
    test_registry(); test_manifests()
    print("AGENT_STABLE_SUITE_STATIC_PASS")
