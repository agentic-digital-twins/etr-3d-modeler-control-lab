#!/usr/bin/env bash
set -euo pipefail

service="etr-3d-modeler-control-lab.service"
pid="$(systemctl --user show "$service" -p MainPID --value)"

if [[ -z "$pid" || "$pid" == "0" ]]; then
  echo "[modeler-nuc-verify] ERROR: $service is not running." >&2
  exit 1
fi

environment="$(tr '\0' '\n' < "/proc/$pid/environ")"
printf '%s\n' "$environment" \
  | grep -E '^(MODEL_API_HOST|MODEL_API_PORT|MODEL_VIEWER_HOST|MODEL_VIEWER_PORT|MODEL_API_UPSTREAM)='

api_port="$(printf '%s\n' "$environment" | sed -n 's/^MODEL_API_PORT=//p')"
viewer_port="$(printf '%s\n' "$environment" | sed -n 's/^MODEL_VIEWER_PORT=//p')"
curl -fsS "http://127.0.0.1:${api_port}/health"
curl -fsSI "http://127.0.0.1:${viewer_port}" | head -n 1
