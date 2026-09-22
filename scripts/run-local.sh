#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck disable=SC1091
source "$ROOT/scripts/_load-root-env.sh"
load_root_env "$ROOT"
# shellcheck disable=SC1091
source "$ROOT/scripts/_modeler-runtime.sh"
configure_modeler_runtime

require_modeler_commands true
if [[ ! -d "$ROOT/node_modules" ]]; then
  echo "[modeler-local] ERROR: dependencies are missing. Run pnpm install --reporter=append-only first." >&2
  exit 1
fi
validate_modeler_configuration
ensure_modeler_ports_available

cleanup() {
  trap - EXIT INT TERM
  kill "${api_pid:-}" "${viewer_pid:-}" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "[modeler-local] API: http://${MODEL_API_HOST}:${MODEL_API_PORT}"
echo "[modeler-local] Viewer: http://localhost:${MODEL_VIEWER_PORT}"
echo "[modeler-local] API upstream: ${MODEL_API_UPSTREAM}"

pnpm --filter @etr/model-api dev &
api_pid=$!
pnpm --filter @etr/equipment-viewer dev &
viewer_pid=$!

for _ in {1..30}; do
  if curl -fsS "http://${MODEL_API_HOST}:${MODEL_API_PORT}/health" >/dev/null && curl -fsS "http://127.0.0.1:${MODEL_VIEWER_PORT}" >/dev/null; then
    echo "[modeler-local] Ready"
    echo "[modeler-local] Open: http://localhost:${MODEL_VIEWER_PORT}"
    print_modeler_lan_urls
    echo "[modeler-local] Health: http://${MODEL_API_HOST}:${MODEL_API_PORT}/health"
    wait -n "$api_pid" "$viewer_pid"
    echo "[modeler-local] ERROR: API or viewer exited unexpectedly." >&2
    exit 1
  fi
  sleep 1
done

echo "[modeler-local] ERROR: API or viewer did not become ready within 30 seconds." >&2
exit 1
