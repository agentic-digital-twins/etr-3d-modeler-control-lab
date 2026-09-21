# Detroit Diesel 8V92TA Cylinder Prototype

## Purpose

The Phase A fixture proves the semantic model path. It is intentionally a tiny GLB, not a mechanically accurate engine model.

## Semantic Hierarchy

```text
Cylinder_L1
└── Piston_L1
```

The manifest gives these nodes stable component identities:

```text
cylinder.l1
piston.l1
```

The piston is selectable, highlightable, isolatable, and declares future animation capability. No animation driver is implemented in Phase A.

## Coordinate and Unit Contract

- Coordinate frame: right-handed, Y-up
- Units: meters
- Artifact format: GLB 2.0

## Non-Goals

- Blender or Python generation
- mechanically accurate Detroit geometry
- eight-cylinder arrangement
- valve, crank, or piston motion
- live telemetry or Chief bindings

Those belong to later slices after this semantic artifact boundary has proven durable.
