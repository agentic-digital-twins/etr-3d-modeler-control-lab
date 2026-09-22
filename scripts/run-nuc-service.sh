#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

export MODEL_API_HOST="${MODEL_API_HOST:-127.0.0.1}"
export MODEL_API_PORT="${MODEL_API_PORT:-4230}"
export MODEL_VIEWER_HOST="${MODEL_VIEWER_HOST:-0.0.0.0}"
export MODEL_VIEWER_PORT="${MODEL_VIEWER_PORT:-4231}"
export MODEL_API_UPSTREAM="${MODEL_API_UPSTREAM:-http://127.0.0.1:${MODEL_API_PORT}}"

for command in node pnpm; do
	if ! command -v "$command" >/dev/null; then
		echo "[modeler-nuc] ERROR: $command is required but not available." >&2
		exit 1
	fi
done

echo "[modeler-nuc] API loopback: http://${MODEL_API_HOST}:${MODEL_API_PORT}"
echo "[modeler-nuc] Viewer listener: http://${MODEL_VIEWER_HOST}:${MODEL_VIEWER_PORT}"
echo "[modeler-nuc] Proxy upstream: ${MODEL_API_UPSTREAM}"

pnpm --filter @etr/model-api dev &
api_pid=$!
pnpm --filter @etr/equipment-viewer dev &
viewer_pid=$!

cleanup() {
	trap - EXIT INT TERM
	kill "$api_pid" "$viewer_pid" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

wait -n "$api_pid" "$viewer_pid"
echo "[modeler-nuc] ERROR: API or viewer exited unexpectedly." >&2
exit 1
