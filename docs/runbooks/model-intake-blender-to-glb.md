# Model intake: Blender source to candidate GLB

Use this runbook when receiving an externally authored Blender asset that may
become a visual representation in this lab. It preserves the source asset,
produces an inspectable GLB candidate, and keeps visual geometry separate from
the canonical semantic vessel model until acceptance.

This procedure applies to a complete model and to a component such as a hull.
A hull-only delivery is a candidate visual component, not a replacement for the
vessel semantic hierarchy.

## Storage and naming

Keep the canonical spatial model and an external-consumer visual asset in
separate model directories. For the first Hatteras hull delivery, use:

```text
models/
  vessels/
    hatteras-63-motor-yacht/
      model.json
      semantic.manifest.json
      geometry/
        hatteras-63-motor-yacht.glb
    boat-builder-hatteras-63-motor-yacht/
      model.json
      semantic.manifest.json
      sources/
        hatteras-hull-v1.blend
      geometry/
        hatteras-hull-v1.glb
```

`hatteras-63-motor-yacht` is the canonical spatial model: its semantic
manifest owns the existing vessel, levels, areas, anchors, and placement
behavior. `boat-builder-hatteras-63-motor-yacht` is a distinct externally
consumed visual component model. Do not give both models the same `modelId`
and do not bind the Boat Builder hull to the canonical spatial model until a
composition contract explicitly joins them.

Store the received `.blend` unchanged at
`models/vessels/boat-builder-hatteras-63-motor-yacht/sources/hatteras-hull-v1.blend`.
`sources/` is the authored source of record; do not put a received Blender
file in `fixtures/`, and do not overwrite it during export or cleanup.

Store the exported candidate GLB at
`models/vessels/boat-builder-hatteras-63-motor-yacht/geometry/hatteras-hull-v1.glb`.
Use a versioned filename for every changed export. A promoted artifact may
receive a non-candidate name only after visual and semantic acceptance.

`fixtures/` is reserved for generated artifacts used to prove or test the
system. It is not the source or candidate-artifact library.

## 1. Register the delivery

1. Record the delivery filename, supplier, received date, supplied version,
   and any license or usage restrictions with the intake work item.
2. Copy the delivered source into its `sources/` location without modifying
   the original file.
3. Determine whether the delivery is a complete vessel or an independently
   authored component. Record the intended component identity, for example
   `hatteras63/hull`.
4. Do not replace the generated Hatteras fixture or alter the established
   vessel levels, areas, anchors, or capability-placement data during intake.

## 2. Inspect the Blender source

Open the source in Blender without saving changes to it. Before exporting,
capture the following facts in the intake work item:

| Check | Record |
| --- | --- |
| Blender file and version | Source filename and Blender version used to open it |
| Scope | Complete vessel or named component(s) included |
| Dimensions | Overall X, Y, and Z dimensions and their units |
| Transform | Object position, rotation, scale, and whether transforms are applied |
| Orientation | Which end is bow, which side is starboard, and the up axis |
| Origin | Object origin and its relationship to the vessel reference point |
| Geometry | Object names, mesh names, triangle count, non-manifold geometry, normals, and unapplied modifiers |
| Node names | Object names that must survive as exported GLB node names |
| Materials | Material-slot names, assigned objects, texture dependencies, and missing-texture warnings |

Use Blender's Item panel for transforms and dimensions, Statistics for mesh
counts, and Object Data and Material Properties for mesh and material details.
Enable Face Orientation and inspect normals before accepting a component.

Do not rename objects, apply transforms, recalculate normals, or edit material
assignments as part of the first inspection. Record a required correction and
make it in a separately versioned authoring revision, or explicitly approve it
as a repository-owned conversion change.

## 3. Export the candidate GLB

Export from Blender using **File > Export > glTF 2.0**:

1. Choose **GLB** format and the versioned `geometry/` candidate filename.
2. Export only the intended objects. For a hull delivery, this is the hull and
   any deliberately included child/detail objects, not unrelated scene assets.
3. Preserve meaningful Blender object names: they are the names the semantic
   manifest validates as GLB nodes.
4. Use the glTF exporter’s **+Y Up** conversion, export materials, normals,
   UVs, and required textures. Apply modifiers only if their evaluated
   geometry is part of the delivered appearance; record that choice.
5. Export once without geometry cleanup or simplification. Any optimized
   export is a new candidate version and requires a new inspection.

The lab's vessel contract uses `right-handed-y-up` coordinates and meters.
If the source dimensions are not meters, convert deliberately and record the
conversion and resulting dimensions. Do not infer scale from the filename or
visual appearance.

## 4. Inspect the exported GLB

Open the exported GLB in a clean Blender scene and compare it with the source.
Confirm and record:

- Overall dimensions and origin agree with the inspected source or the
  documented unit conversion.
- Bow, starboard, and up direction are correct in the lab's
  right-handed, Y-up coordinate frame.
- Expected meshes render, no unintended scene objects were exported, and
  normals are outward-facing.
- Exported node names exactly match the intended manifest bindings.
- Material names, assignments, transparency, and texture references survived
  export without missing assets.
- Triangle count is appropriate for the intended viewer use.

If any check fails, retain the failed candidate for diagnosis only, correct the
source or export settings, and export a new versioned candidate. Do not
silently replace a candidate artifact.

## 5. Record inspection evidence

Create `intake-inspection.md` beside the candidate manifest. Record facts
that can be read from the GLB separately from facts that require visual
inspection:

- Exporter name and version, GLB version, SHA-256 fingerprint, node names,
  mesh names, materials, triangle count, texture/image count, and raw bounds.
- Confirmed source units, bow-forward direction, starboard direction, origin
  alignment, rendered normals, material appearance, and browser framing.

Label unconfirmed values explicitly. Do not represent raw GLB bounds as
real-world dimensions until the source units and conversion are confirmed.
Set manifest lifecycle timestamps from the actual creation, export, receipt,
and validation events; do not use the manifest-generation time as a substitute
for unknown authoring or export times.

## 6. Introduce and validate the candidate

The current semantic manifest is the source of truth for vessel hierarchy,
areas, placement anchors, and behavior. Map the candidate only to the
representation it actually provides. A hull-only GLB must not be made to
pretend that it supplies separate level or area nodes.

For a component candidate:

1. Keep existing semantic levels, areas, and placement anchors unchanged.
2. Bind the visual hull only to an appropriate vessel or component
   representation node after its GLB node name has been confirmed.
3. Retain generated overlays or proxies for semantic nodes the hull does not
   represent.
4. Update artifact provenance, filename, SHA-256 fingerprint, export time,
   validation time, and the exact GLB node bindings in
   `semantic.manifest.json`.
5. Validate the exact manifest and GLB pair:

   ```powershell
   pnpm --dir packages/model-validation exec tsx src/cli.ts `
     ../../models/vessels/boat-builder-hatteras-63-motor-yacht/semantic.manifest.json `
     ../../models/vessels/boat-builder-hatteras-63-motor-yacht/geometry/hatteras-hull-v1.glb
   ```

The validator verifies GLB 2 structure, the artifact fingerprint, semantic
structure, unique bindings, and that every manifest GLB node exists. It does
not decide whether the hull looks correct, has appropriate polygon density, or
matches the vessel's real-world dimensions; those remain explicit intake
acceptance checks.

## 7. Preserve normalized fixture parity

When normalizing an existing generated fixture into `models/`, retain its
fixture behavior and add a regression check that:

1. Regenerates the fixture.
2. Verifies the generated fixture artifact and manifest against approved
   baselines.
3. Confirms the normalized source artifact is byte-identical to the fixture.
4. Confirms the normalized manifest preserves semantic nodes, GLB bindings,
   placement regions, and anchors, allowing only documented source-identity
   metadata differences.

For the Hatteras spatial model, run:

```powershell
pnpm run check:hatteras-fixture
```

Do not change the fixture's consumer-facing identity as part of normalization.

## 8. Publish to an external visual consumer

An external application such as Boat Builder should receive only the approved,
versioned GLB and minimal display metadata it needs to render the asset. It
must not need to consume the Modeler Lab spatial manifest merely to display a
hull.

Record the receiving repository, public asset directory, versioning rule, and
deployment owner. In the first iteration, publishing a validated GLB to the
consumer's public asset directory is sufficient; defer a distribution contract
until multiple consumers require one.

## 9. Accept or promote

Load the candidate in the viewer beside the existing Hatteras spatial model
and verify camera framing, material appearance, model switching, selection,
isolation, and capability placement. Accept the candidate only when these
behaviors and all preceding inspection checks pass.

On acceptance, update the model's manifest and any catalog wiring needed to
serve the approved GLB. Run the exact manifest/GLB validation command from
section 6, the applicable fixture-parity check from section 7, and the
consumer's focused rendering and vessel-switching tests.

Keep the original Blender source in `sources/` and the approved GLB in
`geometry/`. Never move either to `fixtures/` merely because it was used by a
test. Record rejected and superseded candidate versions in the intake work
item rather than deleting the source asset.

## Hatteras first-delivery note

`hatteras-hull-v1.blend` is expected to be a hull component, not a complete
Hatteras visual replacement. Its first acceptance target is a correctly
oriented, materially intact Boat Builder candidate that can coexist with the
existing Hatteras semantic model. Cabin, flybridge, decks, and area
representations remain separate until they are independently delivered and
accepted.
