# Phase 2 Slice 5A: still required

This list records work that remains after normalizing the Hatteras spatial
model and registering the Boat Builder hull as a separate visual component.

## Visual asset acceptance

- [ ] Inspect `hatteras-hull-v1.blend` in Blender and document bow-forward,
  starboard, up axis, origin, object transforms, normals, and unapplied
  modifiers.
- [ ] Establish the source unit and conversion factor from author-provided or
  measured Hatteras dimensions; update the Boat Builder manifest from
  `unverified-blender-units` only after confirmation.
- [ ] Obtain or record the actual authored, exported, and received times, then
  correct the Boat Builder manifest lifecycle timestamps.
- [ ] Render the GLB in a browser and confirm faces, normals, material
  appearance, transparency, and camera framing.
- [ ] Confirm whether the hull-only delivery is intentionally incomplete and
  identify the required cabin, deck, flybridge, and detail deliveries.

## Boat Builder integration

- [ ] Identify the Boat Builder repository, public asset location, asset
  versioning rule, and deployment owner.
- [ ] Publish the approved versioned GLB and minimal display metadata without
  making Boat Builder depend on the Modeler Lab spatial manifest.
- [ ] Load the Hatteras hull in the Boat Builder scene; set scale, origin
  offset, and camera framing using the verified dimensions.
- [ ] Verify vessel switching among all four Boat Builder archetypes after
  adding the Hatteras asset.

## Future architecture

- [ ] Define a composition contract only when Boat Builder needs to combine
  the visual hull with the canonical Hatteras levels, areas, overlays, or
  capability placements.
