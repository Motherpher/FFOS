"""Read-only privacy-safe Kolada response schema inspection.

No values, tokens, URLs, headers, or raw response bodies are printed.
Exact reporter path is supplied locally, never transmitted.
"""
import argparse
import json
from pathlib import Path

KNOWN_FIELDS={
    "values","count","previous_page","next_page","id","title","type",
    "municipality","municipality_id","municipalityId","region_type",
    "name","data","metadata","total","page","per_page",
}

def type_of(value):
    if value is None: return "null"
    if isinstance(value,bool): return "boolean"
    if isinstance(value,dict): return "object"
    if isinstance(value,list): return "array"
    if isinstance(value,str): return "string"
    if isinstance(value,(int,float)): return "number"
    return "unknown"

def safe_fields(value):
    if not isinstance(value,dict): return []
    return [{"name":k,"type":type_of(v)} for k,v in value.items() if k in KNOWN_FIELDS]

def probe(payload):
    if not isinstance(payload,list) or len(payload)!=1: raise ValueError("Expected exactly one Bruno reporter batch")
    batch=payload[0]
    if not isinstance(batch,dict) or not isinstance(batch.get("results"),list) or len(batch["results"])!=1:
        raise ValueError("Expected exactly one Bruno request result")
    result=batch["results"][0]
    resp=result.get("response") if isinstance(result,dict) else None
    if not isinstance(resp,dict): raise ValueError("Missing response")
    data=resp.get("data")
    info={
      "http_status":resp.get("status") if type(resp.get("status")) is int else None,
      "response_data_type":type_of(data),
      "top_level_fields":safe_fields(data)
    }
    if isinstance(data,dict):
        rows=data.get("values")
        info["values_type"]=type_of(rows)
        info["values_length"]=len(rows) if isinstance(rows,list) else None
        info["first_value_fields"]=safe_fields(rows[0]) if isinstance(rows,list) and rows else []
        info["next_page_present"]=bool(data.get("next_page")) if "next_page" in data else None
    return info

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--report",required=True)
    args=p.parse_args()
    path=Path(args.report).expanduser()
    if not path.is_file() or path.is_symlink(): raise SystemExit("Expected existing regular private report file")
    payload=json.loads(path.read_text(encoding="utf-8"))
    print(json.dumps(probe(payload),indent=2,ensure_ascii=False))

if __name__=="__main__":main()
