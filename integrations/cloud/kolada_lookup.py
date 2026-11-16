"""FFOS cloud-native Kolada municipality lookup.

No Bruno desktop, local paths, credentials or MCP process needed.
Output is bounded public municipality identity + provenance; never upload raw
HTTP response (it may change schema). Explicit allowlisted provider endpoint.
"""
import argparse
import csv
from datetime import datetime, timezone
import hashlib
import io
import json
from pathlib import Path
import re
from urllib.request import Request, urlopen

BASE="https://api.kolada.se/v3/municipality/"
MUNICIPALITY=re.compile(r"^[0-9]{4}$")
MAX_RESPONSE=1024*1024

def validate(payload, municipality_id):
    if not isinstance(payload,dict):
        raise ValueError("Kolada response not an object")
    values=payload.get("values")
    if not isinstance(values,list) or len(values)!=1 or payload.get("count") != 1:
        raise ValueError("Kolada municipality identity not unique")
    if payload.get("next_page") not in (None, "") or payload.get("next_url") not in (None, ""):
        raise ValueError("Unexpected paging")
    item=values[0]
    if not isinstance(item,dict) or item.get("id") != municipality_id:
        raise ValueError("Municipality ID mismatch")
    for key in ("title","type"):
        if not isinstance(item.get(key),str) or not item[key].strip():
            raise ValueError("Required municipality attribute missing")
    return {"municipality_id":municipality_id,"title":item["title"],"type":item["type"]}

def fetch(municipality_id, *, opener=urlopen):
    if not MUNICIPALITY.fullmatch(municipality_id):
        raise ValueError("Expected 4-digit municipality identifier")
    url=BASE+municipality_id
    req=Request(url,headers={"Accept":"application/json","User-Agent":"FFOS-cloud-gateway/1.0"})
    with opener(req,timeout=20) as response:
        if response.status != 200:
            raise ValueError("Unexpected provider HTTP status")
        raw=response.read(MAX_RESPONSE+1)
    if len(raw)>MAX_RESPONSE:
        raise ValueError("Provider response exceeds size limit")
    data=json.loads(raw)
    identity=validate(data,municipality_id)
    identity.update({
        "provider":"Kolada",
        "endpoint":url,
        "retrieved_at_utc":datetime.now(timezone.utc).isoformat(),
        "response_sha256":hashlib.sha256(raw).hexdigest(),
        "schema":"ffos.kolada.municipality.v1"
    })
    return identity

def write_outputs(identity,out_dir):
    dest=Path(out_dir)
    dest.mkdir(parents=True,exist_ok=True)
    path=dest/"municipality.csv"
    with path.open("w",encoding="utf-8",newline="") as fp:
        writer=csv.DictWriter(fp,fieldnames=["municipality_id","title","type"])
        writer.writeheader()
        writer.writerow({k:identity[k] for k in writer.fieldnames})
    (dest/"municipality.provenance.json").write_text(
        json.dumps(identity,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    return path

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--municipality-id",default="0380")
    p.add_argument("--output-dir",required=True)
    args=p.parse_args()
    result=fetch(args.municipality_id)
    write_outputs(result,args.output_dir)
    print(json.dumps({"status":"validated_export","municipality_id":result["municipality_id"],
                      "provider":"Kolada","schema":result["schema"]}))
if __name__=="__main__":main()
