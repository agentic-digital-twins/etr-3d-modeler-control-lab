#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck disable=SC1091
source "$ROOT/scripts/_load-root-env.sh"
load_root_env "$ROOT"

export MODEL_API_HOST="${MODEL_API_HOST:-127.0.0.1}"
export MODEL_API_PORT="${MODEL_API_PORT:-4230}"
export MODEL_VIEWER_HOST="${MODEL_VIEWER_HOST:-0.0.0.0}"
export MODEL_VIEWER_PORT="${MODEL_VIEWER_PORT:-4231}"
export MODEL_API_UPSTREAM="${MODEL_API_UPSTREAM:-http://127.0.0.1:${MODEL_API_PORT}}"

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
    echo "[modeler-local] LAN:  http://<this-host-lan-ip>:${MODEL_VIEWER_PORT}"
    wait "$api_pid" "$viewer_pid"
    exit $?
  fi
  sleep 1
done

echo "[modeler-local] ERROR: API or viewer did not become ready within 30 seconds." >&2
exit 1
