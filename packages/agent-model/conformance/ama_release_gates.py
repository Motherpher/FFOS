"""AMA architectural admission checks; no agent execution."""
import json
from pathlib import Path

def check(data):
    gates = data.get("gates", {})
    errors = []
    if data.get("architecture_not_agent") is not True:
        errors.append("ARCHITECTURE_NOT_AGENT")
    if set(gates) != {"M7_A", "F8_7", "M7_O"}:
        errors.append("GATE_SET")
    if gates.get("M7_A", {}).get("host_runtime_required") is not False:
        errors.append("M7_A_HOST_COUPLING")
    if gates.get("F8_7", {}).get("scope") != "OPTIONAL_HOST_RUNTIME_BINDING":
        errors.append("F8_7_SCOPE")
    if gates.get("M7_O", {}).get("scope") != "GENERIC_INSTANCE_OPERATIONAL_CONFORMANCE_CRITERIA":
        errors.append("M7_O_SCOPE")
    if any(g.get("activation_authorized") is not False for g in gates.values()):
        errors.append("ACTIVATION_CLAIM")
    if not all(data.get("rules", {}).values()) or len(data.get("rules", {})) != 4:
        errors.append("PORTABILITY_INVARIANT")
    return errors

if __name__ == "__main__":
    data = json.loads((Path(__file__).resolve().parents[1] / "ama-release-gates.json").read_text())
    problems = check(data)
    if problems:
        raise SystemExit("FAIL: " + ", ".join(problems))
    print("PASS: AMA architecture gate separation")
