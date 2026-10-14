# Spatial model sources

`models/` contains authored source truth for spatial models. Organize each model as:

```text
models/<model-kind>/<model-id>/
  model.json
  semantic.manifest.json
  geometry/
  sources/
```

Generated artifacts used only for validation and acceptance remain under `fixtures/`. Runtime and customer configuration, including installed capability instances, do not belong in either location.

For the procedure to receive, inspect, and promote externally authored Blender
assets, see [Model intake: Blender source to candidate GLB](../docs/runbooks/model-intake-blender-to-glb.md).
