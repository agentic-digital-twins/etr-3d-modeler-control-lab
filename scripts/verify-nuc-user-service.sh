#!/usr/bin/env bash
set -euo pipefail

service="etr-3d-modeler-control-lab.service"
pid="$(systemctl --user show "$service" -p MainPID --value)"

if [[ -z "$pid" || "$pid" == "0" ]]; then
  echo "[modeler-nuc-verify] ERROR: $service is not running." >&2
  exit 1
fi

tr '\0' '\n' < "/proc/$pid/environ" \
  | grep -E '^(MODEL_API_HOST|MODEL_API_PORT|MODEL_VIEWER_HOST|MODEL_VIEWER_PORT|MODEL_API_UPSTREAM)='
curl -fsS "http://127.0.0.1:${MODEL_API_PORT:-4230}/health"
curl -fsSI "http://127.0.0.1:${MODEL_VIEWER_PORT:-4231}" | head -n 1
