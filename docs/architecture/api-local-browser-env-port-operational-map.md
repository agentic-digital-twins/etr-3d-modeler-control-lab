# API, Local Browser, Environment, and Port Operational Map

## Purpose

This map defines how the Equipment Explorer API and browser server operate locally and on the NUC. It prevents browser configuration from coupling a remote browser to the NUC's loopback interface.

## Endpoint Path

```text
browser on developer machine or vessel LAN
  -> http://<host>:4231
  -> same-origin /api/* request
  -> equipment-viewer Vite proxy
  -> http://127.0.0.1:4230
  -> model-api
```

`VITE_MODEL_API_BASE_URL` is intentionally empty by default. It is an exceptional direct-browser override, not the normal topology.

## Port Allocation

| Surface                           | Port | Bind             | Owner                   | Notes                                  |
| --------------------------------- | ---: | ---------------- | ----------------------- | -------------------------------------- |
| Model API                         | 4230 | `127.0.0.1`      | `@etr/model-api`        | Private upstream for the viewer proxy. |
| Equipment Explorer browser server | 4231 | `0.0.0.0` on NUC | `@etr/equipment-viewer` | LAN browser entry point.               |

This deliberately avoids active established allocations including Twin Crew `4200`, `4205`, `4105`, `8071`, and `8081`, plus Speech IO `7077` and `5183`. This map is the repository's authority for additions or changes.

## Environment Ownership

| Surface                                                         | Purpose                                    | Authority                                                                                     |
| --------------------------------------------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `.env.example`                                                  | Local/manual API and viewer process values | Checked-in template. Copy to ignored root `.env` for local overrides.                         |
| `apps/equipment-viewer/.env.example`                            | Browser-build values only                  | Same-origin by default; never store NUC topology or secrets here.                             |
| `config/deploy/etr-3d-modeler-control-lab-nuc.env.example`      | NUC service template                       | Copy to `~/.config/etr-3d-modeler-control-lab/modeler.env`; do not commit the installed file. |
| `config/deploy/systemd/user/etr-3d-modeler-control-lab.service` | Installed NUC process owner                | References the installed environment file.                                                    |

On a NUC, the systemd `EnvironmentFile` is authoritative. Root `.env` is local/manual only and must not silently compete with the installed service configuration.

## Operations

### Local

Run `pnpm run run:local`. It loads root `.env` when present, starts both processes, waits for API and viewer readiness, and prints local and LAN URLs. `Ctrl+C` stops both processes.

### NUC

1. Copy and review `config/deploy/etr-3d-modeler-control-lab-nuc.env.example` at `~/.config/etr-3d-modeler-control-lab/modeler.env`.
2. Run `pnpm run install:nuc` from the checked-out repository.
3. Run `bash scripts/verify-nuc-user-service.sh` after installation or restart.

The installer reconciles locked dependencies, installs the checked-in systemd user unit, reloads systemd, enables the service, and verifies the installed environment-file reference. The verification script prints the effective non-secret process configuration and probes both surfaces.
