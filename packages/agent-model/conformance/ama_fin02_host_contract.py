"""Portable AMA module host-obligation preflight; never a host authorization.

Each enabled module must declare any canonical host obligations. An independent
host adapter (not this architecture) is responsible for custody, signature,
revocation and live effect checks. No self-asserted trust values count as proof.
"""
from __future__ import annotations
import re

_HEX64 = re.compile(r"^[0-9a-f]{64}$")


def assess_host_obligations(inventory: dict, configuration: dict, receipts: list, *, head: str, verifier=None) -> dict:
    errors=[]
    bindings=[]
    modules=inventory.get("modules", []) if isinstance(inventory, dict) else []
    indexed={r.get("id"):r for r in modules if isinstance(r,dict)}
    selected=configuration.get("modules", []) if isinstance(configuration,dict) else []
    selected_ids=[r.get("id") if isinstance(r,dict) else None for r in selected]
    if (len(modules)!=32 or len(indexed)!=32 or len(selected)!=32 or
        len(set(selected_ids))!=len(selected_ids) or set(selected_ids)!=set(indexed)):
        errors.append("NONCANONICAL_MODULE_SET")
    if not isinstance(head,str) or not re.fullmatch(r"[a-f0-9]{40}",head):
        errors.append("IMMUTABLE_HEAD_REQUIRED")
    if not isinstance(receipts,list):
        errors.append("INVALID_RECEIPTS");receipts=[]
    receipt_index={}
    for r in receipts:
        if not isinstance(r,dict):
            errors.append("INVALID_RECEIPT_FORMAT");continue
        key=(r.get("module"),r.get("obligation"))
        if key in receipt_index:errors.append("DUPLICATE_HOST_RECEIPT:"+str(key))
        receipt_index[key]=r
    for row in selected:
        if not isinstance(row,dict) or row.get("id") not in indexed:
            errors.append("UNKNOWN_MODULE");continue
        name=row["id"];source=indexed[name]
        if type(row.get("enabled")) is not bool:
            errors.append("INVALID_ENABLED:"+name);continue
        if source.get("requirement")=="CORE" and not row["enabled"]:
            errors.append("DISABLED_CORE:"+name)
        if not row["enabled"]:continue
        obligations=source.get("remaining_host_obligations",[])
        if not isinstance(obligations,list):
            errors.append("INVALID_OBLIGATION_DECLARATION:"+name);continue
        declared=row.get("host_obligations")
        if (not isinstance(declared,list) or
            any(not isinstance(x,str) for x in declared) or
            any(not isinstance(x,str) for x in obligations) or
            not set(obligations).issubset(set(declared))):
            errors.append("OBLIGATIONS_NOT_DECLARED:"+name)
        for obligation in obligations:
            receipt=receipt_index.get((name,obligation))
            if not receipt:
                errors.append("MISSING_HOST_RECEIPT:"+name+":"+obligation);continue
            if receipt.get("head")!=head or not isinstance(receipt.get("artifact_sha256"),str) or not _HEX64.fullmatch(receipt["artifact_sha256"]):
                errors.append("UNPINNED_HOST_RECEIPT:"+name+":"+obligation);continue
            if not isinstance(receipt.get("artifact_ref"),str) or not receipt["artifact_ref"].strip():
                errors.append("MISSING_HOST_ARTIFACT:"+name+":"+obligation);continue
            if not isinstance(receipt.get("external_attestor_ref"),str) or not receipt["external_attestor_ref"].strip():
                errors.append("NO_INDEPENDENT_ATTESTOR:"+name+":"+obligation);continue
            if verifier is None:
                errors.append("ATTESTOR_UNAVAILABLE:"+name+":"+obligation);continue
            try:
                if verifier(receipt,head) is not True:
                    errors.append("HOST_ATTESTATION_FAILED:"+name+":"+obligation);continue
            except Exception:
                errors.append("HOST_ATTESTATION_FAILED:"+name+":"+obligation);continue
            bindings.append({"module":name,"obligation":obligation,"artifact_ref":receipt["artifact_ref"]})
    return {"schema":"ama.fin02.host-obligation-check/v1",
            "status":"HOLD" if errors else "CANDIDATE_HOST_ATTESTATION_ONLY",
            "errors":sorted(set(errors)),"candidate_bindings":bindings,
            "independent_runtime_authority_verified":False,
            "real_host_ready":False,"module_complete":False,
            "agent_constructed":False,"activation_authorized":False}
