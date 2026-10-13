# ETR 3D Modeler Control Lab

This is a design-time workbench for deterministic, semantically structured, web-ready equipment models. It is not an ETR runtime service.

The first fixture is a Detroit Diesel 8V92TA cylinder assembly. The repository proves a manifest and GLB artifact through validation, a local catalog API, and a browser Equipment Explorer.

## Prerequisites

- Node.js 24 or later
- pnpm 10.33.0
- Chromium for browser tests: `pnpm exec playwright install chromium`

## Commands

```bash
pnpm install --reporter=append-only
pnpm check
pnpm validate:model
pnpm test:e2e
```

For local inspection, run the coordinated launcher:

```bash
pnpm run run:local
```

It stops listeners already using the configured API/viewer ports, starts the API and browser server, checks their health, and prints the launch URL. The browser uses same-origin `/api` requests; the viewer server proxies them to the local API, so a browser on another NUC-network device does not need to resolve `localhost`.

See [api-local-browser-env-port-operational-map.md](docs/architecture/api-local-browser-env-port-operational-map.md) for environment ownership, allocated ports, and NUC deployment.

For the reusable Repository Genesis creation procedure, see [README-new-repository-outline.md](README-new-repository-outline.md).

## Artifact Boundary

The viewer consumes a validated GLB and `EquipmentModelManifest` over the local API. It does not execute Blender or procedural-generation tooling. See [repository-charter.md](docs/architecture/repository-charter.md) and [model-contract-boundaries.md](docs/architecture/model-contract-boundaries.md).

## Standard closeout

For a completed change:

1. Run the smallest relevant tests and report their commands and results.
2. Review the working-tree scope and targeted diff, then commit only the intended files with the required co-author trailer.
3. Push a dedicated branch to `origin`, verify its remote SHA, and never push to `main` without explicit approval.
4. Generate a binary-capable patch in ignored `pr-patches/` relative to `origin/main`, prefix its filename with the first 12 characters of its SHA-256, and validate it against its base.
5. Report the patch link, full SHA-256, size, line count, PR title and description, completed work, tests, and final repository state.
