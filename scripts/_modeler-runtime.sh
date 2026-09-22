#!/usr/bin/env bash
set -euo pipefail

configure_modeler_runtime() {
  export MODEL_API_HOST="${MODEL_API_HOST-127.0.0.1}"
  export MODEL_API_PORT="${MODEL_API_PORT-4230}"
  export MODEL_VIEWER_HOST="${MODEL_VIEWER_HOST-0.0.0.0}"
  export MODEL_VIEWER_PORT="${MODEL_VIEWER_PORT-4231}"
  export MODEL_API_UPSTREAM="${MODEL_API_UPSTREAM-http://127.0.0.1:${MODEL_API_PORT}}"
  export MODEL_API_UPSTREAM_OVERRIDE="${MODEL_API_UPSTREAM_OVERRIDE-false}"
}

require_modeler_environment_keys() {
  local env_file="$1"
  local key

  for key in MODEL_API_HOST MODEL_API_PORT MODEL_VIEWER_HOST MODEL_VIEWER_PORT MODEL_API_UPSTREAM; do
    if ! grep -q "^${key}=" "$env_file"; then
      echo "[modeler] ERROR: ${key} is required in ${env_file}." >&2
      exit 1
    fi
  done
}

load_modeler_environment_file() {
  local env_file="$1"
  local key

  for key in MODEL_API_HOST MODEL_API_PORT MODEL_VIEWER_HOST MODEL_VIEWER_PORT MODEL_API_UPSTREAM MODEL_API_UPSTREAM_OVERRIDE; do
    if grep -q "^${key}=" "$env_file"; then
      local value
      value="$(sed -n "s/^${key}=//p" "$env_file" | tail -n 1)"
      export "${key}=${value}"
    fi
  done
}

require_modeler_commands() {
  local include_curl="$1"
  local command
  local commands=(node pnpm)
  if [[ "$include_curl" == "true" ]]; then
    commands+=(curl)
  fi

  for command in "${commands[@]}"; do
    if ! command -v "$command" >/dev/null; then
      echo "[modeler] ERROR: $command is required but not available." >&2
      exit 1
    fi
  done

  if [[ "$(node -p 'process.versions.node.split(".")[0]')" != "24" ]]; then
    echo "[modeler] ERROR: Node.js 24 is required; found $(node --version)." >&2
    exit 1
  fi
  if [[ "$(pnpm --version | cut -d. -f1)" != "10" ]]; then
    echo "[modeler] ERROR: pnpm 10 is required; found $(pnpm --version)." >&2
    exit 1
  fi
}

validate_modeler_configuration() {
  MODEL_API_HOST="$MODEL_API_HOST" \
  MODEL_API_PORT="$MODEL_API_PORT" \
  MODEL_VIEWER_HOST="$MODEL_VIEWER_HOST" \
  MODEL_VIEWER_PORT="$MODEL_VIEWER_PORT" \
  MODEL_API_UPSTREAM="$MODEL_API_UPSTREAM" \
  MODEL_API_UPSTREAM_OVERRIDE="$MODEL_API_UPSTREAM_OVERRIDE" \
  node --input-type=module <<'NODE'
const values = process.env
for (const key of ["MODEL_API_HOST", "MODEL_VIEWER_HOST"]) {
  if (!values[key]?.trim()) {
    throw new Error(`${key} must be non-empty.`)
  }
}
for (const key of ["MODEL_API_PORT", "MODEL_VIEWER_PORT"]) {
  const port = Number(values[key])
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${key} must be an integer between 1 and 65535.`)
  }
}
if (!['true', 'false'].includes(values.MODEL_API_UPSTREAM_OVERRIDE)) {
  throw new Error("MODEL_API_UPSTREAM_OVERRIDE must be true or false.")
}
let upstream
try {
  upstream = new URL(values.MODEL_API_UPSTREAM)
} catch {
  throw new Error("MODEL_API_UPSTREAM must be an absolute HTTP(S) URL.")
}
if (!/^https?:$/.test(upstream.protocol)) {
  throw new Error("MODEL_API_UPSTREAM must use HTTP or HTTPS.")
}
if (values.MODEL_API_UPSTREAM_OVERRIDE !== "true") {
  const expected = `http://${values.MODEL_API_HOST}:${values.MODEL_API_PORT}`
  if (upstream.origin !== expected) {
    throw new Error(`MODEL_API_UPSTREAM must equal ${expected} unless MODEL_API_UPSTREAM_OVERRIDE=true.`)
  }
}
NODE
}

ensure_modeler_ports_available() {
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
}

print_modeler_lan_urls() {
  MODEL_VIEWER_PORT="$MODEL_VIEWER_PORT" node --input-type=module <<'NODE'
import os from "node:os"

const addresses = Object.values(os.networkInterfaces())
  .flat()
  .filter((entry) => entry && entry.family === "IPv4" && !entry.internal)
  .map((entry) => entry.address)

for (const address of addresses) {
  console.log(`[modeler] LAN:  http://${address}:${process.env.MODEL_VIEWER_PORT}`)
}
NODE
}
