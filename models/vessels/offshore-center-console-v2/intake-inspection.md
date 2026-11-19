# Offshore Center Console intake

| Field | Observation |
| --- | --- |
| Delivery | [center-console.blend](sources/center-console.blend) and [center-console.glb](geometry/center-console.glb), reported added 2026-11-19 |
| Provenance | Supplier, original authoring/export dates, and usage restrictions were not provided |
| Delivered GLB | glTF 2.0, Khronos glTF Blender I/O v5.0.21, requiring `KHR_draco_mesh_compression` |
| Delivered GLB SHA-256 | `8a52d9c76b4a87c10a34d18c9a1539aeb7d5e258f7806e4352e4af99b9cc619b` |
| Viewer GLB | [center-console-viewer-v1.glb](geometry/center-console-viewer-v1.glb), exported 2026-11-19 with Blender 5.2.0 and Khronos glTF Blender I/O v5.2.39 |
| Viewer GLB SHA-256 | `a7aaa9929eed2c44d17328ff75186dd3cff739ad39969c320ba1c60953f415e6` |
| Exported nodes | `Hull`, `BowDeck`, `CockpitDeck`, `CentreConsole`, `Helm`, `HelmSeating/LeaningPost`, `TTOP`, `BowSeating`, `AftSeating`, `TransomPlatform` |
| Meshes | `Cube`, `Cube.001`, `Cube.027`, `Cube.030`, `Circle.007`, `Plane`, `Plane.001`, `Plane.004`, `Plane.024`, `Plane.031` |
| Geometry | 10 meshes, 13 primitives, 13,177 triangles, five named materials, no images or textures |
| Materials | `Accessorries`, `Main_White_boat`, `Iron`, `Black_Window_border`, `seats` |
| Viewer bounds (raw XYZ) | Min `[-1.9530, -0.0429, -1.3275]`; max `[2.0181, 3.9387, 10.6940]` |

Both delivered files remain unchanged. The viewer export was made by importing
the delivered GLB into an empty Blender scene and exporting it without Draco so
the viewer does not need a remote decoder. The two GLBs have the same node
names, per-material triangle counts, and material assignments; their aggregate
bounds agree within 0.0001 raw units per endpoint. No deliberate rescaling or
axis change was made.

The Blender source opens with Imperial display units and unit scale `1.0`, and
contains the same named mesh objects as the delivery. This is not a measurement
of real-world scale. Bow/starboard orientation, origin alignment, visual parity
with the source, normals, and browser framing still require manual acceptance.
The manifest binds the delivered hull, deck meshes, and areas without adding
placement anchors or inferring unmodeled compartments. The generated fixture
remains available as a separate model.
