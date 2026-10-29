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
    if gates.get("F8_7", {}).get("scope") != "REALM_CONDITIONAL_RUNTIME_BINDING":
        errors.append("F8_7_SCOPE")
    if gates.get("M7_O", {}).get("scope") != "GENERIC_INSTANCE_OPERATIONAL_CONFORMANCE_CRITERIA":
        errors.append("M7_O_SCOPE")
    if any(g.get("activation_authorized") is not False for g in gates.values()):
        errors.append("ACTIVATION_CLAIM")
    rules=data.get("rules",{})
    expected={
        "architecture_may_be_accepted_without_host_binding": True,
        "architecture_may_be_accepted_without_instance_activation": True,
        "independent_instance_acceptance_separate": True,
        "conformance_never_authorizes_effects": True,
        "internal_agent_may_activate_without_required_cdx": False,
        "external_realm_requires_other_explicit_governance": True,
    }
    if rules != expected:
        errors.append("PORTABILITY_AND_REALM_INVARIANT")
    f8=gates.get("F8_7",{})
    if f8.get("internal_ff_estate_required") is not True or f8.get("external_distribution_detachable") is not True:
        errors.append("F8_ESTATE_GATE_INVARIANT")
    return errors

if __name__ == "__main__":
    data = json.loads((Path(__file__).resolve().parents[1] / "ama-release-gates.json").read_text())
    problems = check(data)
    if problems:
        raise SystemExit("FAIL: " + ", ".join(problems))
    print("PASS: AMA architecture gate separation")
