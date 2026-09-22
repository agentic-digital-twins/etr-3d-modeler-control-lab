#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# shellcheck disable=SC1091
source "$ROOT/scripts/_modeler-runtime.sh"
configure_modeler_runtime
require_modeler_commands false
validate_modeler_configuration
ensure_modeler_ports_available

if [[ ! -f "$ROOT/apps/equipment-viewer/dist/index.html" ]]; then
  echo "[modeler-nuc] ERROR: static viewer build is missing. Run pnpm run install:nuc." >&2
  exit 1
fi

echo "[modeler-nuc] API loopback: http://${MODEL_API_HOST}:${MODEL_API_PORT}"
echo "[modeler-nuc] Viewer listener: http://${MODEL_VIEWER_HOST}:${MODEL_VIEWER_PORT}"
echo "[modeler-nuc] Same-origin API route: /api"
exec pnpm --filter @etr/model-api start
