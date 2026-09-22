# Repository Charter

## Identity

| Field      | Value                        |
| ---------- | ---------------------------- |
| Repository | `etr-3d-modeler-control-lab` |
| Kind       | Control lab                  |
| Realm      | Equipment modeling           |
| Faculty    | Spatial modeling             |
| Maturity   | Experimental                 |

## Purpose

Explore and prove deterministic, semantically structured, web-ready equipment-model generation.

Chief needs equipment representations that can be identified, explored, instrumented, and related to real-world evidence. This lab develops the design-time artifacts and validation needed for that capability; it is not an ETR runtime service.

## Boundary Decision

| Field          | Record                                                                                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Considered     | `twin-crew-platform`, existing ETR labs, `etr-core`/shared library, new control lab                                                                                                          |
| Decision       | New control lab                                                                                                                                                                              |
| Reason         | This is a design-time experimental capability; Blender and model-generation concerns are outside runtime; the capability is reusable beyond Marine and can mature independently when proven. |
| Decision date  | 2026-09-21                                                                                                                                                                                   |
| Decision phase | Phase A / Slice 1                                                                                                                                                                            |

## Repository Provisioning Gate

New repositories created from this charter must be created in the `agentic-digital-twins` GitHub organization. Their canonical `origin` must use the SSH form `git@github.com:agentic-digital-twins/<repository-name>.git`.

Before any feature branch or implementation work begins, establish and push a `main` baseline branch, then verify both conditions:

```bash
git branch --show-current
git ls-remote --heads origin main
```

Expected result: the local branch is `main` and the remote lists `origin/main`. This prevents a repository from starting on an unintended owner or without a reviewable baseline. The reusable procedure is maintained in [README-new-repository-outline.md](../../README-new-repository-outline.md).

## Ownership

This repository owns equipment-model generation experiments, semantic contracts, model validation, and the model-inspection workbench.

It does not own vessel or equipment operational state, telemetry truth, alert lifecycle, maintenance truth, or Chief decision authority.

## Customers and Promotion

The first customer is the Detroit Diesel 8V92TA Equipment Explorer. Plausible future customers include Marine and IPP equipment explorers.

Promotion from this lab requires a proven shared consumer or runtime requirement. Any promoted runtime capability requires a separate ETR ownership decision.

## Local and NUC Operations

The local catalog API and browser server are separate operational surfaces. The browser makes relative `/api` requests; its server-side proxy owns the API upstream address so remote NUC browsers never receive `localhost` as an API target.

Root `.env` is for local/manual process configuration. App-local `.env` files contain only browser-build variables and must not contain NUC topology or secrets. Installed NUC services use a dedicated, machine-local environment file referenced by the systemd user unit; the checked-in `config/deploy` template and installer are the deployment source of truth. Every required NUC setting must be installed, verified in the unit, and confirmed in the live process after restart.

Port allocation and launch procedures are maintained in [api-local-browser-env-port-operational-map.md](api-local-browser-env-port-operational-map.md).

Making the design-time workbench available on the NUC does not promote the Model API into authoritative ETR runtime infrastructure.
