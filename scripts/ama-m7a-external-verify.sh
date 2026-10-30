#!/usr/bin/env bash
# AMA M7-A external executable CI alternative. Run only from a clean exact-head
# PR #34 checkout with internet access and local Docker + Python + Node.
# This does NOT waive the M7-A requirement for an authorized CI exception.
set -Eeuo pipefail
export LC_ALL=C
EXPECTED_SHA="${1:?Usage: bash scripts/ama-m7a-external-verify.sh <exact-pr-head-sha>}"
ACTUAL_SHA="$(git rev-parse HEAD)"
if [[ "$ACTUAL_SHA" != "$EXPECTED_SHA" ]]; then echo "HOLD: HEAD mismatch $ACTUAL_SHA != $EXPECTED_SHA" >&2; exit 64; fi
if [[ -n "$(git status --porcelain)" ]]; then echo "HOLD: dirty worktree" >&2; exit 65; fi
if ! command -v python3 >/dev/null || ! command -v node >/dev/null || ! command -v docker >/dev/null; then
  echo "HOLD: Python, Node and Docker are all required" >&2; exit 66
fi
OUT="$(mktemp -d -t ama-m7a-XXXXXXXX)"
printf '%s\n' "$OUT" > /tmp/ama-m7a-last-evidence-path
git show -s --format='%H%n%P%n%cI' HEAD > "$OUT/commit.txt"
python3 --version > "$OUT/python-version.txt"
node --version > "$OUT/node-version.txt"
docker --version > "$OUT/docker-version.txt"
if ! python3 -m pip install -r packages/agent-model/conformance/requirements.txt; then echo "HOLD: dependency install failed" >&2; exit 67; fi
# Runner must be locally provisioned; docker requires explicit cleanup on exit.
CONTAINER="ama-m7a-${BASHPID}"
cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT
docker run -d --name "$CONTAINER" -e POSTGRES_USER=ffos_ama -e POSTGRES_PASSWORD=ffos_ama_ci -e POSTGRES_DB=ffos_ama_test -p 127.0.0.1:5432:5432 postgres:17 > "$OUT/postgres-container.txt"
for attempt in $(seq 1 30); do
  if docker exec "$CONTAINER" pg_isready -U ffos_ama -d ffos_ama_test >/dev/null 2>&1; then break; fi
  sleep 1
done
docker exec "$CONTAINER" pg_isready -U ffos_ama -d ffos_ama_test > "$OUT/postgres-ready.txt"
export AMA_TEST_DATABASE_URL="postgres://ffos_ama:ffos_ama_ci@localhost:5432/ffos_ama_test"
run() {
  local label="$1"; shift
  printf '%s\n' "$*" > "$OUT/$label.command"
  if "$@" > "$OUT/$label.log" 2>&1; then printf 'PASS\n' > "$OUT/$label.status"; else
    printf 'FAIL\n' > "$OUT/$label.status"; return 1; fi
}
# Match the executable conformance contract rather than its non-executed GitHub job status.
run static-tests python3 -m unittest discover -s packages/agent-model/conformance/tests -v
run security-tests python3 -m unittest discover -s packages/agent-model/conformance -p 'test_ama*.py' -v
run architecture-boundary python3 packages/agent-model/conformance/ama_architecture_boundary.py
run template-coverage python3 packages/agent-model/conformance/ama_template_coverage.py
run source-evidence python3 packages/agent-model/conformance/ama_requirement_evidence.py --output "$OUT/ama-m0-evidence.json"
run m7a-readiness python3 packages/agent-model/conformance/ama_m7a_release_audit.py --output "$OUT/ama-m7a-readiness.json"
run schema-compatibility python3 packages/agent-model/conformance/ama_architecture_compatibility.py --output "$OUT/ama-compatibility.json"
run typed-context node --experimental-strip-types --test packages/agent-model/src/index.test.mjs
run install-pg npm install --no-save --prefix packages/agent-runtime pg@8.23.1 --ignore-scripts --no-audit --no-fund
run runtime-pg node --experimental-strip-types --test packages/agent-runtime/tests/*.test.mjs
run m7e python3 packages/agent-model/conformance/ama_m7_integration.py --output-dir "$OUT/ama-m7e"
python3 - "$OUT" <<'PY'
import hashlib, json, pathlib, sys
root=pathlib.Path(sys.argv[1])
items=[{"path":p.relative_to(root).as_posix(),"sha256":hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(root.rglob("*")) if p.is_file() and p.name!="sha256-manifest.json"]
(root/"sha256-manifest.json").write_text(json.dumps(items,indent=2)+"\n")
PY
printf 'EXTERNAL_TEST_EXECUTION_PASSED; NOT GITHUB_CI_OR_DIRECTOR_ACCEPTANCE\n'
printf 'Evidence directory: %s\n' "$OUT"
