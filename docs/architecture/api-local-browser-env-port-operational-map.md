# API, Local Browser, Environment, and Port Operational Map

## Purpose

This map defines how the Equipment Explorer API and browser server operate locally and on the NUC. It prevents browser configuration from coupling a remote browser to the NUC's loopback interface.

## Endpoint Paths

```text
local development browser
  -> http://<host>:4231
  -> same-origin /api/* request
  -> equipment-viewer Vite development proxy
  -> http://127.0.0.1:4230
  -> model-api
```

```text
NUC or vessel-LAN browser
  -> http://<NUC-host>:4231
  -> same-origin /api/* request
  -> production static viewer host
  -> mounted model-api handler
  -> validated model fixture
```

`VITE_MODEL_API_BASE_URL` is intentionally empty by default. It is an exceptional direct-browser override, not the normal topology. The NUC service builds the Vite viewer once during installation, then serves the static build through the production Express host; it never runs Vite in dev/watch/HMR mode.

## Port Allocation

| Surface                           | Port | Bind             | Owner                   | Notes                                                                |
| --------------------------------- | ---: | ---------------- | ----------------------- | -------------------------------------------------------------------- |
| Model API                         | 4230 | `127.0.0.1`      | `@etr/model-api`        | Private API listener for local diagnostics and development proxying. |
| Equipment Explorer browser server | 4231 | `0.0.0.0` on NUC | Production modeler host | Serves built viewer and same-origin API boundary.                    |

This deliberately avoids active established allocations including Twin Crew `4200`, `4205`, `4105`, `8071`, and `8081`, plus Speech IO `7077` and `5183`. This map is the repository's authority for additions or changes.

Before assigning another port, inspect the current NUC/system surface map, allocate an unused intentional port, and update this document and the applicable deployment configuration. Do not rely on framework defaults.

## Environment Ownership

| Surface                                                         | Purpose                                    | Authority                                                                                     |
| --------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `.env.example`                                                  | Local/manual API and viewer process values | Checked-in template. Copy to ignored root `.env` for local overrides.                         |
| `apps/equipment-viewer/.env.example`                            | Browser-build values only                  | Same-origin by default; never store NUC topology or secrets here.                             |
| `config/deploy/etr-3d-modeler-control-lab-nuc.env.example`      | NUC service template                       | Copy to `~/.config/etr-3d-modeler-control-lab/modeler.env`; do not commit the installed file. |
| `config/deploy/systemd/user/etr-3d-modeler-control-lab.service` | Installed NUC process owner                | References the installed environment file.                                                    |

On a NUC, the systemd `EnvironmentFile` is authoritative. Root `.env` is local/manual only and must not silently compete with the installed service configuration. Required values must be non-empty; ports must be integers in the TCP range; `MODEL_API_UPSTREAM` must be an HTTP(S) URL consistent with the API listener unless `MODEL_API_UPSTREAM_OVERRIDE=true` explicitly records a different target.

## Operations

### Local

Run `pnpm run run:local`. It loads root `.env` when present, starts both processes, waits for API and viewer readiness, and prints local and LAN URLs. `Ctrl+C` stops both processes.

The launcher requires Node.js 24, pnpm 10, curl, installed workspace dependencies, and available configured ports before it starts either process. The smoke checks are `GET /health` on the API and `GET /` on the browser server.

### NUC

1. Review `config/deploy/etr-3d-modeler-control-lab-nuc.env.example`; `pnpm run install:nuc` creates the installed environment file from those non-secret defaults when it is absent.
2. Run `pnpm run install:nuc` from the checked-out repository.
3. Run `bash scripts/verify-nuc-user-service.sh` after a later restart.

The installer validates the environment and required ports before systemd starts, reconciles locked dependencies, builds the static viewer, installs the checked-in systemd user unit, reloads systemd, enables the service, verifies the installed environment-file reference, then runs the live-process verification. The service repeats configuration and port checks before it starts the production host. The verification script prints the effective non-secret process configuration and probes both surfaces. Use `systemctl --user status etr-3d-modeler-control-lab.service --no-pager` and `journalctl --user -u etr-3d-modeler-control-lab.service -n 100 --no-pager` for troubleshooting.

The canonical NUC checkout location is `~/repos/etr-3d-modeler-control-lab`, matching the installed systemd unit. An alternate checkout requires an explicit unit-template/installer change; it is not inferred at installation time.
