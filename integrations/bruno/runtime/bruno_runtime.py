"""FFOS Bruno CLI integration pilot. No AMA agent or deployed ChatGPT binding.
The configured .bru file MUST be reviewed and SHA256-pinned by an operator.
"""
import argparse, datetime, hashlib, json, re, shutil, subprocess
from pathlib import Path

_ID=re.compile(r"^[a-z][a-z0-9_.-]{2,100}$")
_KEY=re.compile(r"^[A-Za-z][A-Za-z0-9_]{0,63}$")

def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def resolve(config, job):
    if not isinstance(job,dict) or set(job)!={"job_id","operation_id","parameters"}:
        raise ValueError("Invalid job shape")
    if any(not isinstance(job[k],str) or not _ID.fullmatch(job[k]) for k in ("job_id","operation_id")):
        raise ValueError("Invalid job identity")
    op=config.get("operations",{}).get(job["operation_id"])
    if not isinstance(op,dict): raise ValueError("Operation not allowlisted")
    root=Path(config["collection_root"]).expanduser().resolve(strict=True)
    request=(root/op["request"]).resolve(strict=True)
    if not request.is_relative_to(root) or request.suffix not in (".bru", ".yml"):
        raise ValueError("Request outside collection root or unsupported format")
    marker = "opencollection.yml" if request.suffix == ".yml" else "bruno.json"
    if not (root / marker).is_file():
        raise ValueError("Missing expected collection marker: " + marker)
    if not isinstance(op.get("sha256"),str) or not re.fullmatch("[a-f0-9]{64}",op["sha256"]):
        raise ValueError("Missing or invalid approved request hash")
    if sha256(request)!=op["sha256"]:
        raise ValueError("Unreviewed request modification; hash mismatch")
    params=job["parameters"]
    allowed=op.get("allowed_parameters",{})
    if not isinstance(params,dict) or not isinstance(allowed,dict) or set(params)-set(allowed):
        raise ValueError("Unexpected parameter")
    for name,value in params.items():
        if not _KEY.fullmatch(name) or not isinstance(value,str) or len(value)>256 or not re.fullmatch(allowed[name],value):
            raise ValueError("Invalid parameter: "+name)
    environment=op.get("environment","Development")
    if not isinstance(environment,str) or not re.fullmatch("[A-Za-z0-9_ -]{1,64}",environment):
        raise ValueError("Invalid environment")
    return root,request,environment

def run(config,job,execute=False,bru="bru",output_dir=None):
    root,request,env=resolve(config,job)
    if not execute:
        return {"job_id":job["job_id"],"operation_id":job["operation_id"],
                "status":"validated_dry_run","request":str(request.relative_to(root)),
                "environment":env,"parameter_names":sorted(job["parameters"])}
    binary=shutil.which(bru) if "/" not in bru else bru
    if not binary or not Path(binary).is_file():
        raise RuntimeError("Missing Bruno CLI; check bru --version on this Mac")
    base=Path(output_dir).expanduser() if output_dir else Path.home()/".local/share/ffos/bruno-runs"
    if base.is_symlink(): raise RuntimeError("Run directory may not be a symlink")
    base.mkdir(parents=True,exist_ok=True,mode=0o700)
    target=base/job["job_id"]
    target.mkdir(mode=0o700,exist_ok=False)
    report=target/"report.private.json"
    argv=[str(binary),"run",str(request.relative_to(root)),"--env",env,
          "--reporter-json",str(report),"--reporter-skip-all-headers",
          "--reporter-skip-request-body","--bail"]
    for key,value in sorted(job["parameters"].items()):
        argv+=["--env-var",f"{key}={value}"]
    try:
        done=subprocess.run(argv,cwd=root,text=True,capture_output=True,timeout=180,check=False)
    except subprocess.TimeoutExpired:
        raise RuntimeError("Bruno timeout") from None
    status="executed" if done.returncode==0 and report.is_file() else "failed"
    if report.is_file():
        report.chmod(0o600)
        try: json.loads(report.read_text(encoding="utf-8"))
        except (UnicodeError,ValueError): status="failed_invalid_report"
    receipt={"job_id":job["job_id"],"operation_id":job["operation_id"],
             "status":status,"exit_code":done.returncode,
             "request_sha256":sha256(request),
             "reported_at_utc":datetime.datetime.now(datetime.timezone.utc).isoformat(),
             "report_path":str(report) if report.is_file() else None}
    out=target/"receipt.json"
    out.write_text(json.dumps(receipt,indent=2)+"\n",encoding="utf-8")
    out.chmod(0o600)
    if status!="executed":
        raise RuntimeError("Bruno failed; review private local receipt")
    return receipt

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--config",required=True)
    p.add_argument("--job",required=True)
    p.add_argument("--execute",action="store_true")
    p.add_argument("--output-dir")
    a=p.parse_args()
    config=json.loads(Path(a.config).read_text(encoding="utf-8"))
    job=json.loads(Path(a.job).read_text(encoding="utf-8"))
    print(json.dumps(run(config,job,execute=a.execute,output_dir=a.output_dir),indent=2))

if __name__=="__main__":main()
