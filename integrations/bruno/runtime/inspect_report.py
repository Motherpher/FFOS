"""Read-only safe preview of Bruno's PRIVATE JSON reporter structure.

Never prints request URLs, headers, tokens, request/response bodies,
user-controlled string values or raw reporter content. Prints only
container shapes, standard field names, types and safe numeric status codes.
"""
import argparse, json, re
from pathlib import Path

SAFE_KEYS={
    "results","result","summary","total","passed","failed","skipped",
    "request","response","status","statusCode","status_code","code",
    "data","body","headers","name","error","tests","assertions",
    "duration","items","testResults","responseStatus",
}
BLOCKED={"body","headers","request","data","items","error"}

def structure(value,depth=0):
    if depth>3:return "..."
    if isinstance(value,dict):
        return {k:("REDACTED" if k in BLOCKED and depth>0 else structure(value[k],depth+1))
                for k in value if k in SAFE_KEYS}
    if isinstance(value,list):
        return {"kind":"array","length":len(value),
                "first_item_structure":structure(value[0],depth+1) if value else None}
    if value is None:return "null"
    if isinstance(value,bool):return "boolean"
    if isinstance(value,int):return "integer"
    if isinstance(value,float):return "number"
    return "string"

def main():
    a=argparse.ArgumentParser()
    a.add_argument("--report",required=True)
    args=a.parse_args()
    p=Path(args.report).expanduser()
    if not p.is_file() or p.is_symlink():
        raise SystemExit("Expected an existing regular private reporter file")
    payload=json.loads(p.read_text(encoding="utf-8"))
    print(json.dumps({"reporter_structure":structure(payload)},indent=2,ensure_ascii=False))

if __name__=="__main__": main()
