#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/etr-3d-modeler-control-lab"
UNIT_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
ENV_FILE="$CONFIG_DIR/modeler.env"
UNIT_SOURCE="$ROOT/config/deploy/systemd/user/etr-3d-modeler-control-lab.service"
UNIT_TARGET="$UNIT_DIR/etr-3d-modeler-control-lab.service"

mkdir -p "$CONFIG_DIR" "$UNIT_DIR"
if [[ ! -f "$ENV_FILE" ]]; then
  cp "$ROOT/config/deploy/etr-3d-modeler-control-lab-nuc.env.example" "$ENV_FILE"
  echo "[modeler-nuc-install] Created $ENV_FILE from the checked-in non-secret defaults."
fi

# shellcheck disable=SC1091
source "$ROOT/scripts/_modeler-runtime.sh"
require_modeler_environment_keys "$ENV_FILE"
load_modeler_environment_file "$ENV_FILE"
configure_modeler_runtime
require_modeler_commands false
validate_modeler_configuration
ensure_modeler_ports_available

pnpm install --frozen-lockfile
pnpm --filter @etr/equipment-viewer build
cp "$UNIT_SOURCE" "$UNIT_TARGET"
systemctl --user daemon-reload
systemctl --user enable --now etr-3d-modeler-control-lab.service
systemctl --user cat etr-3d-modeler-control-lab.service | grep -F "EnvironmentFile=$ENV_FILE"
bash "$ROOT/scripts/verify-nuc-user-service.sh"
echo "[modeler-nuc-install] Installed and started etr-3d-modeler-control-lab.service"
