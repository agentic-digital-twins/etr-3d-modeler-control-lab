# Boat Builder Hatteras hull intake inspection

## Artifact inspected

| Field                | Value                                                        |
| -------------------- | ------------------------------------------------------------ |
| Source               | `sources/hatteras-hull-v1.blend`                             |
| GLB                  | `geometry/hatteras-hull-v1.glb`                              |
| Exporter             | Khronos glTF Blender I/O v5.2.39                             |
| GLB node             | `hull`                                                       |
| Mesh                 | `Plane.008`                                                  |
| Materials            | `Main_White_boat`, `Windows`, `Iron`, `Main_Black_boat_Hull` |
| Triangles            | 4,484                                                        |
| Embedded textures    | None                                                         |
| GLB coordinate frame | Right-handed, Y-up                                           |

## Measured GLB bounds

| Axis |   Minimum |  Maximum | Dimension |
| ---- | --------: | -------: | --------: |
| X    | -0.704006 | 0.704006 |  1.408013 |
| Y    | -0.267583 | 0.615280 |  0.882862 |
| Z    | -2.414189 | 2.331076 |  4.745265 |

These values are raw GLB values. The source unit is not yet verified, so they
must not be treated as meters or used to infer real-world Hatteras dimensions.

## Verified by metadata inspection

- The artifact is GLB 2 and its manifest binding resolves to the `hull` node.
- The GLB contains four named materials and no embedded texture images.
- The asset has no separate nodes for levels, areas, or other vessel
  components.

## Not yet verified

- Bow-forward direction and starboard orientation.
- Relationship of the hull origin to the Boat Builder reference point.
- Visible normals, missing faces, transparency, and material appearance in a
  browser renderer.
- Real-world scale and the source/export timestamps supplied by the author.

## Initial manual verification retrospective — October 13–14, 2026

### Purpose

This section records the first manual verification of Awais's simplified Hatteras hull and its initial integration into the HeyChief Boat Builder.

It supplements the automated intake evidence and does not replace the formal acceptance requirements in `model-intake-blender-to-glb.md`.

### 1. Source and export inspection

The externally authored Blender hull was opened successfully, and a candidate GLB was exported and inspected.

The inspection established that:

- The exported artifact contains a named `hull` node.
- The principal mesh is identified as `Plane.008`.
- The GLB contains 4,484 triangles and four named materials.
- The exported artifact contains no embedded texture images.
- The exported model dimensions were measured and recorded.
- The hull remains a visual component rather than a complete vessel spatial representation.

The recorded metadata confirms the exported GLB structure and component binding.

The source units, real-world scale, authoring orientation, and source-to-export transform relationship require final confirmation.

### 2. Visual inspection

The hull was rendered in a browser as part of the initial verification process.

Manual observation indicated that:

- The visible hull geometry rendered coherently.
- The hull materials and window surfaces were present.
- The running gear appeared in the rendered model.
- No immediately obvious catastrophic export or rendering failure was observed.

These observations establish preliminary visual suitability, not complete geometric correctness.

In particular, they do not constitute exhaustive verification of outward-facing normals, manifold geometry, scale, or material behavior under all lighting conditions.

### 3. HeyChief Boat Builder integration

On October 14, 2026, an operator-recorded video demonstrated the simplified hull within the HeyChief Boat Builder presentation.

The model appeared within the existing vessel-selection and presentation experience.

The integration demonstrated:

- The hull could be incorporated into the application as an external visual asset.
- The existing presentation environment could accommodate its geometry and materials.
- The hull appeared visually coherent within the Boat Builder scene.
- The integration did not require replacing the existing canonical Hatteras spatial model.
- The application could continue presenting other vessel archetypes.

This was an important initial demonstration of the separation between external geometry, Modeler Lab preparation, and Boat Builder presentation.

The video provides visual integration evidence; it is not a substitute for automated browser regression tests.

### 4. Modeling conventions and supplier feedback

The following points were communicated to Awais:

- Confirm whether the observed approximately 4.75-unit hull length represents intentional reduced-scale authoring.
- Ultimately use approximately real-world vessel dimensions, with all major components consistently scaled.
- Confirm exterior face normals point outward.
- Preserve a common authoring coordinate frame and reference origin.
- Preserve individually identifiable main vessel components.
- Add the main deck, cabin/salon superstructure, and flybridge from the existing Hatteras design.
- Do not add detailed interiors or undertake unnecessary refinements at this stage.

The simplified Boat Builder model is intentionally distinct from the more detailed Hatteras model used by Crew Console.

### 5. Next component-delivery expectations

The intended next delivery is an assembled exterior vessel with separately identifiable major components:

- Hull
- MainDeck
- SalonSuperstructure
- Flybridge

The preferred delivery consists of the Blender source and an assembled GLB preserving the individual component identities.

Major components should be independently addressable through their exported nodes, allowing application-side selection, highlighting, visibility control, and future composition.

Named parent nodes with child meshes are acceptable; requiring a single mesh per component is unnecessary.

These requirements are expectations for the next delivery, not capabilities verified in the hull-only candidate.

### 6. Acceptance classification

**Established by repository metadata and regression evidence**

- Separate canonical spatial-model and external visual-model identities.
- Candidate GLB and source preservation.
- Recorded GLB structure, artifact fingerprint, and hull-node binding.
- Reported passing Hatteras generated-fixture regression.

**Established by manual observation**

- Source could be inspected in Blender.
- Hull rendered coherently in the browser.
- Hull appeared successfully in the HeyChief Boat Builder.
- No obvious major visible component loss during export.

**Remaining for confirmation**

- Real-world scale and source unit conversion.
- Exact authoring-to-GLB coordinate transform.
- Origin relationship and outward-facing normals.
- Formal visual acceptance and reproducible browser test evidence.
- Correct artifact lifecycle timestamps.
- Component-level selection and visibility behavior for future multipart deliveries.

### 7. Architectural conclusion

The first hull delivery demonstrated the viability of the intended asset supply chain:

External authoring → Modeler Lab intake and validation → approved visual GLB → HeyChief Boat Builder presentation.

The result supports continued incremental exterior modeling without merging the visual component's identity into the canonical vessel spatial model.

Future deliveries should follow the same intake procedure, retaining distinct versioned assets and explicit acceptance evidence.
