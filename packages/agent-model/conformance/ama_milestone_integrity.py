"""AMA canonical M0-M7 source trace: F8 is an optional external CDX adapter.

Checks existing milestone map against the actual 96-row source decision register.
A source candidate / partial contract is never represented as a finished feature.
"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
MODEL = ROOT / "packages" / "agent-model"
STAGE_PACKAGES = {
    "M0": [], "M1": ["F1"], "M2": ["F2"], "M3": ["F3", "F4"],
    "M4": ["F5"], "M5": ["F6"], "M6": ["F7"], "M7": [],
}
STAGES = list(STAGE_PACKAGES)


def inspect(milestones, coverage, decisions, source_index):
    errors = []
    def require(test, code):
        if not test:
            errors.append(code)

    require(milestones.get("schema") == "ama.milestones/v1", "MILESTONE_SCHEMA")
    require(milestones.get("architecture") == "AMA", "NOT_AMA")
    require(milestones.get("milestone_order") == STAGES, "M0_M7_ORDER")
    stages = milestones.get("milestones", {})
    require(set(stages) == set(STAGES), "M0_M7_STAGES")
    for stage, expected in STAGE_PACKAGES.items():
        item = stages.get(stage, {})
        require(item.get("source_packages") == expected, "SOURCE_PACKAGE:" + stage)
        require(bool(item.get("source_artifacts")) and bool(item.get("test_artifact")),
                "MILESTONE_EVIDENCE:" + stage)

    f8 = milestones.get("f8", {})
    require(f8.get("id") == "F8" and f8.get("core_milestone") is False
            and f8.get("role") == "OPTIONAL_EXTERNAL_CDX_INTEGRATION_TRACK",
            "F8_NOT_EXTERNAL")
    require(f8.get("production_binding_required_for_template") is False,
            "F8_REQUIRED_FOR_TEMPLATE")

    entries = decisions.get("items", [])
    indexed = source_index.get("requirements", [])
    ids = [x.get("id") for x in entries]
    source_ids = [x.get("id") for x in indexed]
    require(len(ids) == 96 and len(set(ids)) == 96, "DECISION_REGISTER_96")
    require(len(source_ids) == 96 and len(set(source_ids)) == 96,
            "SOURCE_INDEX_96")
    require(set(ids) == set(source_ids), "SOURCE_REGISTER_MISMATCH")
    allowed = set(sum((STAGE_PACKAGES[x] for x in STAGES), []))
    for entry in entries:
        require(entry.get("package") in allowed, "UNKNOWN_PACKAGE:" + str(entry.get("id")))
        require(bool(entry.get("disposition")) and bool(entry.get("test_id")),
                "UNTRACED_REQUIREMENT:" + str(entry.get("id")))
    require(coverage.get("canonical_milestone_map")
            == "packages/agent-model/ama-milestones.json", "PARALLEL_MODULE_TAXONOMY")
    require(coverage.get("coverage_policy") == "SUPPLEMENTARY_WITHIN_M0_M7",
            "UNAUTHORIZED_NEW_FRAMEWORK")
    modules = coverage.get("modules", [])
    module_ids = [x.get("id") for x in modules]
    require(bool(modules) and len(module_ids) == len(set(module_ids)),
            "DUPLICATE_MODULES")
    for row in modules:
        require(row.get("milestone") in STAGES[1:7],
                "UNMAPPED_MODULE:" + str(row.get("id")))
        require(row.get("implementation_status") in (
                "PARTIAL_EXISTING_CONTRACTS", "REQUIRES_TEMPLATE_CONTRACT", "COMPLETE"),
                "INVALID_MODULE_STATUS:" + str(row.get("id")))
    summary = {}
    for stage in STAGES:
        packages = set(STAGE_PACKAGES[stage])
        summary[stage] = {
            "requirement_count": sum(x.get("package") in packages for x in entries),
            "module_count": sum(x.get("milestone") == stage for x in modules),
            "source_artifacts": stages.get(stage, {}).get("source_artifacts", []),
        }
    summary["M0"]["requirement_count"] = len(entries)
    summary["M7"]["integrates"] = STAGES[1:7]
    unresolved_tests = [x.get("id") for x in entries
                        if x.get("test_status") == "NOT_IMPLEMENTED"
                        or x.get("test_state") == "PLAN_ONLY_NOT_EXECUTED"]
    return {
        "schema": "ama.milestone-integrity-report/v1",
        "architecture": "AMA",
        "stage_count": len(STAGES),
        "source_requirement_count": len(entries),
        "supplementary_module_count": len(modules),
        "template_complete": all(x.get("implementation_status") == "COMPLETE"
                                 for x in modules) and not unresolved_tests and not errors,
        "requirement_test_records_unresolved": len(unresolved_tests),
        "tracking_note": "M0 register test states are historical plan records; this count is not proof that corresponding engineering tests do not exist.",
        "f8": "OPTIONAL_CDX_HOST_INTEGRATION",
        "stages": summary,
        "errors": sorted(set(errors)),
    }


def load():
    def read(path):
        return json.loads((ROOT / path).read_text(encoding="utf-8"))
    return inspect(
        read("packages/agent-model/ama-milestones.json"),
        read("packages/agent-model/ama-template-coverage.json"),
        read("docs/roadmap/AMA-REQUIREMENTS-DECISION-REGISTER.json"),
        read("docs/research/AMA-96-REQUIREMENT-COVERAGE-INDEX-2026-10-29.json"),
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    report = load()
    rendered = json.dumps(report, indent=2) + "\n"
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(rendered, encoding="utf-8")
    else:
        print(rendered, end="")
    raise SystemExit(1 if report["errors"] else 0)
