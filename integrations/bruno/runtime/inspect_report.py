"""Inspect private Bruno JSON reporter metadata without disclosing data or secrets.

Only allowlisted metadata keys are ever emitted. No free-text values,
request/response bodies, headers, URLs, tokens, or error details are printed.
"""
import argparse
import json
from pathlib import Path

SAFE_KEYS = {
    "results", "result", "summary", "total", "passed", "failed", "skipped",
    "response", "status", "statusCode", "status_code", "code",
    "data", "body", "headers", "name", "error", "tests", "assertions",
    "duration", "items", "testResults", "responseStatus",
    "responseTime", "time", "size", "responseSize", "headersSize",
    "request", "message", "errorMessage", "url",
}
REDACT = {
    "body", "headers", "request", "data", "items", "error",
    "message", "errorMessage", "url",
}
MAX_DEPTH = 9
MAX_ITEMS = 2

def structure(value, depth=0):
    if depth > MAX_DEPTH:
        return "depth-limit"
    if isinstance(value, dict):
        return {
            key: ("REDACTED" if key in REDACT else structure(value[key], depth + 1))
            for key in value if key in SAFE_KEYS
        }
    if isinstance(value, list):
        return {
            "kind": "array",
            "length": len(value),
            "first_item_structure": structure(value[0], depth + 1) if value else None,
        }
    if value is None:
        return "null"
    if isinstance(value, bool):
        return "boolean"
    if isinstance(value, int):
        return "integer"
    if isinstance(value, float):
        return "number"
    return "string"

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--report", required=True)
    args = parser.parse_args()
    path = Path(args.report).expanduser()
    if not path.is_file() or path.is_symlink():
        raise SystemExit("Expected an existing regular private reporter file")
    payload = json.loads(path.read_text(encoding="utf-8"))
    print(json.dumps({"reporter_structure": structure(payload)},
                     indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
