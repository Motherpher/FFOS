"""AMA-06 static admission: schema, authority ceilings, bindings, compatibility.
Deterministic and offline. This DOES NOT execute tools, bind CDX, or approve agents.
"""
from __future__ import annotations

import argparse
import json
from dataclasses import dataclass, asdict, field
from pathlib import Path
from typing import Any
from jsonschema import Draft202012Validator

EFFECTS = ["E0_OBSERVE", "E1_INTERNAL_STATE", "E2_REPOSITORY_CHANGE",
           "E3_EXTERNAL_EFFECT", "E4_AUTHORITY_CHANGE"]
RANK = {v: n for n, v in enumerate(EFFECTS)}
CAPABILITY_STATES = {"DRAFT", "VALIDATED", "ACTIVE", "SUSPENDED", "DEPRECATED"}


@dataclass(frozen=True)
class Finding:
    gate: str
    code: str
    path: str
    message: str
    severity: str = "ERROR"


@dataclass
class Report:
    contract: str = "ffos.ama.conformance-report/v1"
    status: str = "FAIL"
    assurance: str = "STATIC_CONTRACT_ONLY"
    agent_id: str | None = None
    agent_version: str | None = None
    ama_version: str | None = None
    checked_gates: list[str] = field(default_factory=lambda: ["C1", "C2", "C3", "C6"])
    not_proven: list[str] = field(default_factory=lambda: [
        "C4_RUNTIME_EXECUTION", "C5_LIVE_EVIDENCE", "CDX_RUNTIME_BINDING",
        "DIRECTOR_ACTIVATION", "PRODUCTION_DEPLOYMENT",
    ])
    findings: list[Finding] = field(default_factory=list)

    def add(self, gate: str, code: str, path: str, message: str) -> None:
        self.findings.append(Finding(gate, code, path, message))

    def finish(self) -> "Report":
        self.findings.sort(key=lambda f: (f.gate, f.code, f.path, f.message))
        self.status = "FAIL" if self.findings else "STATIC_PASS"
        return self

    def data(self) -> dict[str, Any]:
        data = asdict(self)
        data["findings"] = [asdict(f) for f in self.findings]
        return data


def _index(items: Any, key: str, r: Report, path: str) -> dict[str, dict]:
    out: dict[str, dict] = {}
    if not isinstance(items, list):
        r.add("C3", "INVALID_BINDINGS", path, "Expected array")
        return out
    for i, item in enumerate(items):
        p = f"{path}[{i}]"
        if not isinstance(item, dict) or not isinstance(item.get(key), str) or not item[key].strip():
            r.add("C3", "INVALID_ENTRY", p, f"Missing nonblank {key}")
            continue
        if item[key] in out:
            r.add("C3", "DUPLICATE_ID", p, f"Duplicate {key}: {item[key]}")
        else:
            out[item[key]] = item
    return out


def validate_agent(manifest: Any, bindings: Any, *, schema: dict,
                   previous: dict | None = None) -> Report:
    """No side effects. A static PASS is never Director acceptance."""
    r = Report()
    if not isinstance(manifest, dict):
        r.add("C1", "INVALID_MANIFEST", "$", "Manifest must be an object")
        return r.finish()
    r.agent_id = manifest.get("agentId")
    r.agent_version = manifest.get("agentVersion")
    r.ama_version = manifest.get("amaVersion")
    for error in Draft202012Validator(schema).iter_errors(manifest):
        p = "$." + ".".join(str(v) for v in error.absolute_path) if error.absolute_path else "$"
        r.add("C1", "SCHEMA", p, error.message)
    if r.findings:
        return r.finish()
    if not isinstance(bindings, dict) or bindings.get("schema") != "ffos.ama.bindings/v1":
        r.add("C3", "BINDINGS_SCHEMA", "$bindings", "Expected ffos.ama.bindings/v1")
        return r.finish()

    agent_id = manifest["agentId"]
    ids = {k: manifest[k] for k in ("workflows", "commands", "capabilities")}
    for kind, declared in ids.items():
        if len(declared) != len(set(declared)):
            r.add("C1", "DUPLICATE_REFERENCE", f"$.{kind}", "Duplicate IDs are prohibited")

    if not manifest["mandate"]["scope"]:
        r.add("C2", "EMPTY_SCOPE", "$.mandate.scope", "Mandate must have bounded scope")
    if not manifest["authority"]["authorityRefRequired"] or not manifest["authority"]["mandateRefRequired"]:
        r.add("C2", "AUTHORITY_REFERENCES", "$.authority", "Both authority and mandate references required")
    if RANK[manifest["effectCeiling"]] >= RANK["E3_EXTERNAL_EFFECT"]:
        r.add("C2", "HIGH_EFFECT_REVIEW", "$.effectCeiling",
              "E3/E4 ceiling requires separate human/Director policy review")

    flows = _index(bindings.get("workflows"), "workflowId", r, "$bindings.workflows")
    cmds = _index(bindings.get("commands"), "commandId", r, "$bindings.commands")
    caps = _index(bindings.get("capabilities"), "capabilityId", r, "$bindings.capabilities")
    for kind, found in (("workflows", flows), ("commands", cmds), ("capabilities", caps)):
        for ref in ids[kind]:
            if ref not in found:
                r.add("C3", "UNRESOLVED_" + kind[:-1].upper(), f"$.{kind}", f"Missing binding: {ref}")
        for ref in found:
            if ref not in ids[kind]:
                r.add("C3", "UNDECLARED_" + kind[:-1].upper(), f"$bindings.{kind}", f"Undeclared binding: {ref}")

    modules = manifest.get("modules", {})
    for cid, cap in caps.items():
        p = f"$bindings.capabilities.{cid}"
        if cap.get("agentId") != agent_id:
            r.add("C3", "OWNER_MISMATCH", p, "Capability owned by another agent")
        effect = cap.get("effectClass")
        if effect not in RANK:
            r.add("C3", "INVALID_EFFECT", p, "Unknown effect class")
        elif RANK[effect] > RANK[manifest["effectCeiling"]]:
            r.add("C2", "CAPABILITY_EXCEEDS_AGENT", p, "Capability exceeds agent effect ceiling")
        if cap.get("status") not in CAPABILITY_STATES:
            r.add("C3", "INVALID_STATUS", p, "Unknown capability status")
        if manifest["lifecycleState"] == "ACTIVE" and cap.get("status") != "ACTIVE":
            r.add("C3", "INACTIVE_BINDING", p, "Active agent references inactive capability")
        module = cap.get("moduleId")
        if module and not modules.get(module, {}).get("enabled", False):
            r.add("C3", "MODULE_DISABLED", p, "Capability requires disabled/missing module")

    for wid, flow in flows.items():
        p = f"$bindings.workflows.{wid}"
        if flow.get("agentId") != agent_id:
            r.add("C3", "OWNER_MISMATCH", p, "Workflow owned by another agent")
        if not isinstance(flow.get("version"), str) or not flow["version"]:
            r.add("C3", "WORKFLOW_VERSION", p, "Pinned workflow version required")
        effect = flow.get("effectCeiling")
        if effect not in RANK:
            r.add("C3", "INVALID_EFFECT", p, "Unknown workflow effect")
        elif RANK[effect] > RANK[manifest["effectCeiling"]]:
            r.add("C2", "WORKFLOW_EXCEEDS_AGENT", p, "Workflow exceeds agent effect ceiling")
        if manifest["lifecycleState"] == "ACTIVE" and flow.get("status") != "ACTIVE":
            r.add("C3", "INACTIVE_BINDING", p, "Active agent references inactive workflow")
        deps = flow.get("requiredCapabilities")
        if not isinstance(deps, list) or not all(isinstance(d, str) for d in deps):
            r.add("C3", "INVALID_CAPABILITIES", p, "requiredCapabilities must be string array")
            continue
        for dep in deps:
            if dep not in ids["capabilities"] or dep not in caps:
                r.add("C3", "UNDECLARED_CAPABILITY", p, f"Unapproved required capability: {dep}")
                continue
            cap_effect = caps[dep].get("effectClass")
            if effect in RANK and cap_effect in RANK and RANK[cap_effect] > RANK[effect]:
                r.add("C2", "CAPABILITY_EXCEEDS_WORKFLOW", p, f"{dep} exceeds workflow ceiling")
        for key in ("authorityRequirements", "verification", "evidenceRequirements", "terminalStates"):
            if not isinstance(flow.get(key), list) or not flow[key]:
                r.add("C3", "MISSING_WORKFLOW_CONTRACT", p, f"Nonempty {key} required")

    for cid, cmd in cmds.items():
        p = f"$bindings.commands.{cid}"
        if cmd.get("agentId") != agent_id:
            r.add("C3", "OWNER_MISMATCH", p, "Command owned by another agent")
        wid = cmd.get("workflowId")
        if wid not in ids["workflows"] or wid not in flows:
            r.add("C3", "UNRESOLVED_COMMAND_TARGET", p, "Command target not in registered workflows")
        elif cmd.get("workflowVersion") != flows[wid].get("version"):
            r.add("C3", "WORKFLOW_VERSION_MISMATCH", p, "Command must pin exact workflow version")
        if not isinstance(cmd.get("token"), str) or not cmd["token"].strip():
            r.add("C3", "INVALID_COMMAND", p, "Command token required")
        if manifest["lifecycleState"] == "ACTIVE" and cmd.get("status") != "ACTIVE":
            r.add("C3", "INACTIVE_BINDING", p, "Active agent references inactive command")
    tokens = [c.get("token") for c in cmds.values() if c.get("token")]
    if len(tokens) != len(set(tokens)):
        r.add("C3", "DUPLICATE_TOKEN", "$bindings.commands", "Command tokens must be unique")

    for role in manifest.get("internalRoles", []):
        if RANK[role["effectCeiling"]] > RANK[manifest["effectCeiling"]]:
            r.add("C2", "ROLE_EXCEEDS_AGENT", "$.internalRoles", "Role exceeds parent agent")
        for key, kind in (("workflowIds", "workflows"), ("capabilityIds", "capabilities")):
            if any(ref not in ids[kind] for ref in role[key]):
                r.add("C2", "ROLE_UNDECLARED_BINDING", "$.internalRoles", f"Unapproved {key}")

    if previous is not None:
        if not isinstance(previous, dict):
            r.add("C6", "INVALID_BASELINE", "$previous", "Previous manifest must be object")
        else:
            for key in ("agentId", "purpose", "mandate", "authority", "effectCeiling"):
                if previous.get(key) != manifest.get(key):
                    r.add("C6", "DIRECTOR_REVIEW_REQUIRED", f"$.{key}",
                          "Authority or semantic change: separate Director authorization required")
            for key in ("workflows", "commands", "capabilities"):
                if set(previous.get(key, [])) != set(manifest.get(key, [])):
                    r.add("C6", "BINDING_CHANGE_REVIEW", f"$.{key}",
                          "Binding change requires regression/migration evidence")
            if previous.get("agentVersion") == manifest.get("agentVersion") and previous != manifest:
                r.add("C6", "VERSION_IMMUTABILITY", "$.agentVersion",
                      "Modified version must increment")
    return r.finish()


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="AMA-06 static admission checks")
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--bindings", type=Path, required=True)
    parser.add_argument("--schema", type=Path,
                        default=Path(__file__).resolve().parents[1] / "agent-manifest.schema.json")
    parser.add_argument("--previous", type=Path)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args(argv)
    try:
        read = lambda p: json.loads(p.read_text(encoding="utf-8"))
        result = validate_agent(read(args.manifest), read(args.bindings), schema=read(args.schema),
                                previous=read(args.previous) if args.previous else None)
        output = result.data()
    except Exception as exc:
        # Fail closed on malformed input, unavailable schema, or validator failure.
        output = Report().data()
        output["findings"] = [asdict(Finding("C1", "LOAD_FAILURE", "$", str(exc)))]
    if args.report:
        args.report.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(output, indent=2))
    return 0 if output["status"] == "STATIC_PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
