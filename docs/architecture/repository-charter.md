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

## Ownership

This repository owns equipment-model generation experiments, semantic contracts, model validation, and the model-inspection workbench.

It does not own vessel or equipment operational state, telemetry truth, alert lifecycle, maintenance truth, or Chief decision authority.

## Customers and Promotion

The first customer is the Detroit Diesel 8V92TA Equipment Explorer. Plausible future customers include Marine and IPP equipment explorers.

Promotion from this lab requires a proven shared consumer or runtime requirement. Any promoted runtime capability requires a separate ETR ownership decision.
