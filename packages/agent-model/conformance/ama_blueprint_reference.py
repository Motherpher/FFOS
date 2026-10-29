"""Export two synthetic AMA construction references as inspectable CI artifacts.

Reference bundles use dummy data and are never registered or activated.
Generated blueprints demonstrate the candidate M0-M7 construction contract.
"""
import argparse
import json
import sys
from pathlib import Path

from ama_blueprint import assemble

TESTS = Path(__file__).resolve().parent / "tests"
sys.path.insert(0, str(TESTS))
from test_m1_contracts import fixture
from test_ama_blueprint import complex_reference_bundle, attach_synthetic_external_realm


def make(output_dir):
    output_dir.mkdir(parents=True, exist_ok=True)
    cases = {
        "minimal": (attach_synthetic_external_realm(fixture()), {}),
        "complex": (attach_synthetic_external_realm(complex_reference_bundle()), {
            "at": "2026-10-29T12:00:00+00:00",
            "host_trust_domain": "synthetic",
        }),
    }
    index = {
        "schema": "ama.m7.reference-export/v1",
        "scope": "SYNTHETIC_CONSTRUCTION_ONLY",
        "architecture": "AMA",
        "stages": ["M0", "M1", "M2", "M3", "M4", "M5", "M6", "M7"],
        "f8": "REALM_CONDITIONAL_EXTERNAL_DETACHED_IN_SYNTHETIC_REFERENCES",
        "cases": {},
        "agent_registered": False,
        "agent_activated": False,
        "host_authority_authenticated": False,
    }
    for name, (bundle, kwargs) in cases.items():
        blueprint = assemble(bundle, **kwargs)
        if (blueprint["status"] != "CONSTRUCTION_BLUEPRINT_CANDIDATE"
                or blueprint["validation_errors"]
                or blueprint["assessment_inputs_required"]
                or blueprint["agent_activated"]
                or blueprint["runtime_accepted"]
                or blueprint["template_complete"]):
            raise ValueError("INVALID_SYNTHETIC_REFERENCE:" + name
                             + ":" + json.dumps(blueprint["validation_errors"]))
        for suffix, obj in (("bundle", bundle), ("blueprint", blueprint)):
            (output_dir / f"{name}.{suffix}.json").write_text(
                json.dumps(obj, indent=2, sort_keys=True) + "\n",
                encoding="utf-8",
            )
        index["cases"][name] = {
            "bundle_digest": blueprint["bundle_digest"],
            "selected_optional_modules": blueprint["selected_optional_modules"],
            "semantic_checks": sorted(blueprint["semantic_assessment"]["checks"]),
            "outstanding_obligation_count": len(blueprint["implementation_obligations"]),
            "template_complete": False,
        }
    if not index["cases"]["complex"]["semantic_checks"]:
        raise ValueError("COMPLEX_REFERENCE_WITHOUT_SEMANTIC_EVIDENCE")
    (output_dir / "index.json").write_text(
        json.dumps(index, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return index


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--output-dir", type=Path, required=True)
    args = p.parse_args()
    print(json.dumps(make(args.output_dir), indent=2))
