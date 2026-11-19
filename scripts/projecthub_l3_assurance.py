# ProjectHub L3 Release Assurance — static release checks
from pathlib import Path
import json,re,sys

root=Path(".")
required=[
 "docs/specifications/PROJECTHUB-CONTRACT-v0.4.md",
 "docs/architecture/PROJECTHUB-NATIVE-ARCHITECTURE-v0.1.md",
 "packages/registry/migrations/0008_projecthub.sql",
 "modules/projecthub/src/governed-service.ts",
 "modules/projecthub/src/scoped-pg.ts",
 "modules/projecthub/src/effect-gate.ts",
 "integrations/cdx/projecthub-runtime.ts",
 "apps/web/app/(protected)/projecthub/page.tsx",
 "integrations/projecthub/surface-inventory.json",
 "integrations/projecthub/write-admission.ts",
 "packages/registry/migrations/0011_projecthub_writer_login_principal.sql",
]
missing=[p for p in required if not (root/p).exists()]
assert not missing, f"missing release paths: {missing}"

contract=(root/"docs/specifications/PROJECTHUB-CONTRACT-v0.4.md").read_text()
assert "PROJECT_NATIVE" in contract and "Pius/PIVE is no longer the compulsory" in contract
assert "PH-D4" in contract and "first native release" in contract

sql=(root/"packages/registry/migrations/0008_projecthub.sql").read_text()
assert "reject_projecthub_mutation" in sql and "BEFORE UPDATE OR DELETE" in sql
assert "PH-D4" not in re.search(r"data_class text.*?\)",sql,re.S).group(0), "PH-D4 must not be admitted by DB data_class constraint"

server=(root/"apps/web/lib/projecthub/server.ts").read_text()
assert 'FFOS_PROJECTHUB_WRITES_ENABLED==="true"' in server
assert "PROJECTHUB_WRITE_RUNTIME_NOT_ENABLED" in server
assert "FFOS_PROJECTHUB_WRITE_DATABASE_URL" in server
assert "PROJECTHUB_WRITE_ADMISSION_NOT_ACCEPTED" in server
assert "PROJECTHUB_WRITE_ADMISSION.state" in server

scoped=(root/"modules/projecthub/src/scoped-pg.ts").read_text()
assert "withScopedProjectHubRead" in scoped
assert "withScopedProjectHubWrite" in scoped
assert "SET LOCAL ROLE ffos_projecthub_reader" in scoped or "ffos_projecthub_reader" in scoped
assert "ffos_projecthub_runtime" in scoped
assert "PROJECT_SCOPE_REQUIRED" in scoped

admission=(root/"integrations/projecthub/write-admission.ts").read_text()
assert 'state:"NOT_ACCEPTED"' in admission
assert '"PH-D4","PH-D5"' in admission

writer_sql=(root/"packages/registry/migrations/0011_projecthub_writer_login_principal.sql").read_text()
assert "ffos_projecthub_writer_login" in writer_sql
assert "NOLOGIN NOINHERIT" in writer_sql
assert "NOBYPASSRLS" in writer_sql
assert "WITH INHERIT FALSE, SET TRUE" in writer_sql

gate=(root/"modules/projecthub/src/effect-gate.ts").read_text()
assert "PROJECTHUB_CDX_EFFECT_GATE_NOT_BOUND" in gate
assert "A5_HUMAN_GOVERNANCE_REQUIRED" in gate

surfaces=json.loads((root/"integrations/projecthub/surface-inventory.json").read_text())
assert all(x.get("writes") is False for x in surfaces["surfaces"])
assert not any(x.get("state")=="LIVE" for x in surfaces["surfaces"])

status=json.loads((root/"docs/operations/devops/processes/projecthub-reconstitution/status.json").read_text())
assert status["deployment_state"]=="NOT_DEPLOYED"
assert status["acceptance_state"] in {"NOT_ACCEPTED","DIRECTOR_ACCEPTED_INTERNAL_BASELINE"}

if status["acceptance_state"]=="NOT_ACCEPTED":
    assert status["release_state"] in {"NOT_RELEASED","RELEASE_CANDIDATE_AWAITING_ASSURANCE_AND_DIRECTOR"}
else:
    assert status.get("director_disposition")=="ACCEPT"
    assert status["release_state"]=="RELEASED_INTERNAL_BASELINE"
    assert status.get("process_state")=="CLOSED"
    assert status.get("projection_update",{}).get("result")=="PASS"
    assert status.get("merge_commit")
    assert "CANONICAL ACCEPTED PROJECTHUB CONTRACT" in contract

prod_status=root/"docs/operations/devops/processes/projecthub-production/status.json"
if prod_status.exists():
    prod=json.loads(prod_status.read_text())
    assert prod["process_id"]=="FFOS-DEVOPS-PH-PROD-001"
    assert prod["runtime"]["ph_d4"]=="NOT_ADMITTED"
    assert prod["runtime"]["provider_writes"]=="NOT_ADMITTED"
    assert prod["deployment_state"]=="NOT_DEPLOYED"
    assert prod["acceptance_state"]=="NOT_PRODUCTION_ACCEPTED"

print("PROJECTHUB_L3_RELEASE_ASSURANCE_PASS")
