#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/etr-3d-modeler-control-lab"
UNIT_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
ENV_FILE="$CONFIG_DIR/modeler.env"
UNIT_SOURCE="$ROOT/config/deploy/systemd/user/etr-3d-modeler-control-lab.service"
UNIT_TARGET="$UNIT_DIR/etr-3d-modeler-control-lab.service"

mkdir -p "$CONFIG_DIR" "$UNIT_DIR"
if [[ ! -f "$ENV_FILE" ]]; then
  cp "$ROOT/config/deploy/etr-3d-modeler-control-lab-nuc.env.example" "$ENV_FILE"
  echo "[modeler-nuc-install] Created $ENV_FILE. Review it, then rerun this installer." >&2
  exit 1
fi

for required in MODEL_API_HOST MODEL_API_PORT MODEL_VIEWER_HOST MODEL_VIEWER_PORT MODEL_API_UPSTREAM; do
  if ! grep -q "^${required}=" "$ENV_FILE"; then
    echo "[modeler-nuc-install] ERROR: $required is required in $ENV_FILE" >&2
    exit 1
  fi
done

cd "$ROOT"
pnpm install --frozen-lockfile
cp "$UNIT_SOURCE" "$UNIT_TARGET"
systemctl --user daemon-reload
systemctl --user enable --now etr-3d-modeler-control-lab.service
systemctl --user cat etr-3d-modeler-control-lab.service | grep -F "EnvironmentFile=$ENV_FILE"
echo "[modeler-nuc-install] Installed and started etr-3d-modeler-control-lab.service"
