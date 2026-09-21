# Equipment Model Contract Boundaries

## Generator

The generator creates design-time geometry and records its own name, version, and source revision. It does not own runtime equipment state or Chief behavior.

## Artifact

A GLB is an immutable exported geometry artifact identified by `artifactId`, `artifactVersion`, filename, and SHA-256 `contentFingerprint`.

## Manifest

The canonical `EquipmentModelManifest` identifies the model, semantic components, coordinate frame, units, provenance, lifecycle timestamps, and each component's GLB node name. It is owned by `@etr/equipment-model-contracts`.

`generator` provenance answers what produced the artifact. `sourceReferences` answers which engineering evidence informed its representation.

## Validator

`@etr/model-validation` validates the manifest schema, fingerprint, component/node uniqueness, lifecycle ordering, and GLB node resolution. It is independent of the API and viewer.

## API

`@etr/model-api` serves validated local fixtures. It validates the fixture before accepting requests and does not generate models, persist state, or act as an ETR runtime boundary.

## Viewer

`@etr/equipment-viewer` loads the manifest and GLB from the API. It maps GLB node names back to semantic component IDs for selection, isolate, show-all, and reset operations.
