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

for command in node pnpm curl; do
  if ! command -v "$command" >/dev/null; then
    echo "[modeler-local] ERROR: $command is required but not available." >&2
    exit 1
  fi
done

if [[ "$(node -p 'process.versions.node.split(".")[0]')" != "24" ]]; then
  echo "[modeler-local] ERROR: Node.js 24 is required; found $(node --version)." >&2
  exit 1
fi
if [[ "$(pnpm --version | cut -d. -f1)" != "10" ]]; then
  echo "[modeler-local] ERROR: pnpm 10 is required; found $(pnpm --version)." >&2
  exit 1
fi
if [[ ! -d "$ROOT/node_modules" ]]; then
  echo "[modeler-local] ERROR: dependencies are missing. Run pnpm install --reporter=append-only first." >&2
  exit 1
fi

MODEL_API_HOST="$MODEL_API_HOST" \
MODEL_API_PORT="$MODEL_API_PORT" \
MODEL_VIEWER_HOST="$MODEL_VIEWER_HOST" \
MODEL_VIEWER_PORT="$MODEL_VIEWER_PORT" \
node --input-type=module <<'NODE'
import net from "node:net"

const listeners = [
  [process.env.MODEL_API_HOST, Number(process.env.MODEL_API_PORT), "Model API"],
  [process.env.MODEL_VIEWER_HOST, Number(process.env.MODEL_VIEWER_PORT), "Equipment Explorer"],
]

await Promise.all(listeners.map(([host, port, label]) => new Promise((resolve, reject) => {
  const server = net.createServer()
  server.once("error", (error) => reject(new Error(`${label} port ${port} on ${host} is unavailable: ${error.message}`)))
  server.listen({ host, port }, () => server.close(resolve))
})))
NODE

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
    echo "[modeler-local] Health: http://${MODEL_API_HOST}:${MODEL_API_PORT}/health"
    wait -n "$api_pid" "$viewer_pid"
    echo "[modeler-local] ERROR: API or viewer exited unexpectedly." >&2
    exit 1
  fi
  sleep 1
done

echo "[modeler-local] ERROR: API or viewer did not become ready within 30 seconds." >&2
exit 1
