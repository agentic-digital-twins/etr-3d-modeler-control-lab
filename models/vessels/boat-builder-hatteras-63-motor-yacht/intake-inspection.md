# Boat Builder Hatteras hull intake inspection

## Artifact inspected

| Field | Value |
| --- | --- |
| Source | `sources/hatteras-hull-v1.blend` |
| GLB | `geometry/hatteras-hull-v1.glb` |
| Exporter | Khronos glTF Blender I/O v5.2.39 |
| GLB node | `hull` |
| Mesh | `Plane.008` |
| Materials | `Main_White_boat`, `Windows`, `Iron`, `Main_Black_boat_Hull` |
| Triangles | 4,484 |
| Embedded textures | None |
| GLB coordinate frame | Right-handed, Y-up |

## Measured GLB bounds

| Axis | Minimum | Maximum | Dimension |
| --- | ---: | ---: | ---: |
| X | -0.704006 | 0.704006 | 1.408013 |
| Y | -0.267583 | 0.615280 | 0.882862 |
| Z | -2.414189 | 2.331076 | 4.745265 |

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
