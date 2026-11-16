"""Kolada municipality JSON reporter -> validated, private R-ready CSV + metadata.

Never changes the source report. Fail closed unless one response contains one
municipality matching the job request. No bulk data or geographic claim.
"""
import argparse
import csv
import datetime
import hashlib
import json
import os
import re
from pathlib import Path

VALID_ID = re.compile(r"^[0-9]{4}$")

def extract(report, expected_id="0380", expected_title="Uppsala"):
    if not VALID_ID.fullmatch(expected_id):
        raise ValueError("Invalid municipality code")
    if not isinstance(report, list) or len(report) != 1:
        raise ValueError("Expected one Bruno execution batch")
    batch = report[0]
    if not isinstance(batch, dict) or not isinstance(batch.get("results"), list) or len(batch["results"]) != 1:
        raise ValueError("Expected one request result")
    result = batch["results"][0]
    if not isinstance(result, dict) or not isinstance(result.get("response"), dict):
        raise ValueError("Missing response")
    response = result["response"]
    if type(response.get("status")) is not int or response["status"] != 200:
        raise ValueError("HTTP 200 required")
    data = response.get("data")
    if not isinstance(data, dict) or not isinstance(data.get("values"), list):
        raise ValueError("Expected Kolada object with values array")
    if type(data.get("count")) is not int or data["count"] != 1 or len(data["values"]) != 1:
        raise ValueError("Expected exactly one matching municipality; incomplete/ambiguous count")
    # Unsupported paging contract: this lookup must be unambiguously complete.
    if data.get("next_page") or data.get("nextPage"):
        raise ValueError("Unexpected additional page")
    item = data["values"][0]
    if not isinstance(item, dict):
        raise ValueError("Municipality record must be an object")
    if not isinstance(item.get("id"), str) or item["id"] != expected_id:
        raise ValueError("Municipality identifier mismatch")
    if not isinstance(item.get("title"), str) or item["title"].strip() != expected_title:
        raise ValueError("Municipality title mismatch")
    if not isinstance(item.get("type"), str) or not item["type"].strip():
        raise ValueError("Missing municipality type")
    # Whitelist only known fields, never transfer arbitrary returned properties.
    return {
        "municipality_id": expected_id,
        "municipality_name": item["title"].strip(),
        "municipality_type": item["type"].strip(),
        "source": "Kolada API",
        "source_operation": "kolada.municipality.lookup"
    }

def export(report_path, destination, expected_id="0380", expected_title="Uppsala"):
    report_path = Path(report_path).expanduser()
    destination = Path(destination).expanduser()
    if not report_path.is_file() or report_path.is_symlink():
        raise ValueError("Input must be an existing regular private report")
    if destination.suffix != ".csv":
        raise ValueError("Destination must be a CSV file")
    if destination.exists() or destination.is_symlink():
        raise FileExistsError("Never overwrite existing export")
    report_bytes = report_path.read_bytes()
    record = extract(json.loads(report_bytes), expected_id, expected_title)
    destination.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    # Exclusive creation; private local files only.
    fd = os.open(destination, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="") as stream:
            writer = csv.DictWriter(stream, fieldnames=list(record))
            writer.writeheader()
            writer.writerow(record)
    except BaseException:
        destination.unlink(missing_ok=True)
        raise
    metadata = {
        "schema": "ffos.kolada.municipality.v1",
        "source_report_sha256": hashlib.sha256(report_bytes).hexdigest(),
        "output_sha256": hashlib.sha256(destination.read_bytes()).hexdigest(),
        "created_at_utc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "municipality_id": record["municipality_id"],
        "record_count": 1,
        "note": "Lookup metadata only; not a spatial boundary dataset"
    }
    sidecar = destination.with_suffix(".provenance.json")
    try:
        fd = os.open(sidecar, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
        with os.fdopen(fd,"w",encoding="utf-8") as stream:
            json.dump(metadata,stream,indent=2,ensure_ascii=False)
            stream.write("\n")
    except BaseException:
        destination.unlink(missing_ok=True)
        raise
    return {"status":"validated_export","records":1,"municipality_id":expected_id,
            "csv_path":str(destination),"provenance_path":str(sidecar)}

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--report",required=True)
    p.add_argument("--output",required=True)
    p.add_argument("--municipality-id",default="0380")
    p.add_argument("--expected-title",default="Uppsala")
    a=p.parse_args()
    print(json.dumps(export(a.report,a.output,a.municipality_id,a.expected_title),indent=2))
if __name__=="__main__": main()
