#!/usr/bin/env bash
set -euo pipefail

load_root_env() {
  local root="$1"
  local env_file="$root/.env"

  if [[ -f "$env_file" ]]; then
    set -a
    # shellcheck disable=SC1090
    source "$env_file"
    set +a
  fi
}
