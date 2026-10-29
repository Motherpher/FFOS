"""Prevent named implementations from contaminating universal AMA contracts.

An agent's own manifest and fixture belong outside normative AMA documents.
This test only checks master contract purity, not deployed-agent completeness.
"""
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[4]
NORMATIVE = [
    "docs/architecture/AMA.md",
    "docs/decisions/ADR-0004-agent-master-architecture.md",
    "docs/specifications/AGENT-MANIFEST.md",
    "docs/specifications/AMA-CONFORMANCE.md",
    "docs/specifications/WORKFLOW-COMMAND-REGISTRY.md",
    "packages/agent-model/README.md",
    "packages/agent-model/conformance/README.md",
]
# Disallow examples, named roles/workflows, host-governance systems and specific
# stewardship service names in the universal contract. Keep their proper
# descriptions in host integration and independently versioned agent files.
FORBIDDEN = re.compile(
    r"\b(?:household|janitor|handyman|verifier|piusites?|hcc|cdx|"
    r"conductellence|director|mechanic)\b",
    re.IGNORECASE,
)
OLD_TOPOLOGY = "AMA-AUTHORITY-TOPOLOGY.md"


class UniversalTemplatePurityTests(unittest.TestCase):
    def test_all_normative_documents_are_instance_free(self):
        for rel in NORMATIVE:
            with self.subTest(path=rel):
                source = (ROOT / rel).read_text(encoding="utf-8")
                hit = FORBIDDEN.search(source)
                self.assertIsNone(
                    hit, f"{rel} embeds named instance or host-service {hit.group(0) if hit else ''}"
                )
                self.assertNotIn(OLD_TOPOLOGY, source)

    def test_candidate_schemas_and_types_are_agent_agnostic(self):
        schemas = ROOT / "packages/agent-model/schemas/v0.2"
        paths = sorted(schemas.glob("*.schema.json"))
        self.assertEqual(18, len(paths))
        paths.append(ROOT / "packages/agent-model/src/vnext.ts")
        paths.append(ROOT / "packages/agent-model/src/authorization-vnext.ts")
        for p in paths:
            with self.subTest(path=p.name):
                content = p.read_text(encoding="utf-8")
                self.assertIsNone(FORBIDDEN.search(content))
                self.assertNotIn(OLD_TOPOLOGY, content)

    def test_master_section_fifteen_is_non_goals(self):
        master = (ROOT / "docs/architecture/AMA.md").read_text(encoding="utf-8")
        self.assertRegex(master, r"(?m)^## 15\. Non-goals\s*$")
        self.assertIn("Template purity invariant", master)
        self.assertIn("## 16. Foundation acceptance", master)


if __name__ == "__main__":
    unittest.main()
