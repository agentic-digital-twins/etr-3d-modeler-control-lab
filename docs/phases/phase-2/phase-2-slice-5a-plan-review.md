Partner, I think you've made the right architectural distinction here. The existing Hatteras spatial model and Awais's Boat Builder hull are two different assets with two different responsibilities.

The naming now makes that distinction explicit:

| Model                                  | Responsibility                                                              |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `hatteras-63-motor-yacht`              | Canonical spatial structure: vessel, levels, areas, and placement semantics |
| `boat-builder-hatteras-63-motor-yacht` | Externally authored visual geometry for the Boat Builder                    |

I particularly agree with your decision to normalize the original Hatteras into the same source layout as the other three vessel archetypes. Its spatial identity should remain stable; its previous location in the repository shouldn't make it seem architecturally special.

And I would not introduce a composition layer yet. That's a future capability, not a prerequisite for getting Awais's hull into the external Boat Builder.

The reported validation results are encouraging, but there's an important difference between a valid manifest and a visually verified, ready-to-use GLB. I'll distinguish those in the review.

## PR review — `125283d`

Approve direction, with follow-up checks

I inspected the supplied patch. The architecture is sound, and I would not request a redesign.

The patch contains the expected 11 files, including both model records, the preserved Blender source, the exported GLB, the intake runbook, and the Hatteras fixture-generator change.

There are, however, a few details I'd address before calling the intake fully accepted.

### 1. Preserve the original spatial Hatteras exactly

The normalized spatial manifest declares `modelProfile: "vessel"`, uses meters, and retains the full semantic structure.

The generator now also writes a normalized source representation.

That's the right direction, but I'd add one explicit regression check:

Generate the existing prototype fixture before and after this change and verify that its semantic content, bindings, placement anchors, and geometry remain identical.

The reported 17-node validation proves structural validity, but not necessarily non-regression.

Also confirm that the normalized source cannot silently drift from the fixture on future generator runs.

### 2. Keep the Boat Builder hull a visual component

The new manifest declares:

- `modelKind: "vessel-visual-component"`
- `modelProfile: "visual-component"`
- `modelId: "boat-builder-hatteras-63-motor-yacht"`

This is exactly the separation we wanted.

One thing I'd watch: don't let the visual-component manifest accidentally become a second authoritative vessel hierarchy. It should describe the delivered asset and its GLB binding, not pretend to own the Hatteras's spatial levels or areas.

The single-node validation is appropriate for this asset.

### 3. Resolve the unverified geometry metadata

I particularly like that the manifest says `unverified-blender-units` rather than asserting meters without evidence.

Before promotion, verify:

| Check       | Required result                                 |
| ----------- | ----------------------------------------------- |
| Dimensions  | Plausible Hatteras hull length, beam, and depth |
| Orientation | Bow-forward axis documented                     |
| Origin      | Hull position and transforms understood         |
| Geometry    | Correctly rendered without missing faces        |
| Materials   | Acceptable appearance in the web renderer       |
| GLB node    | `hull` binding resolves correctly               |
| Browser     | Loads in the intended Boat Builder runtime      |

A passing manifest validator does not establish these facts.

I would also verify that `createdAt`, `exportedAt`, and `validatedAt` reflect actual events rather than being populated together merely when the manifest was generated.

### 4. Check the normalized `modelKind`

One small consistency concern: the normalized spatial Hatteras uses `modelKind: "hatteras-63-motor-yacht"`, while the visual hull uses the more generic `vessel-visual-component`.

That might match the existing vessel-model convention, but I'd compare it with the Center Console, Sportfish, and Superyacht records.

If their `modelKind` is similarly model-specific, preserve the pattern. Otherwise, normalize this field too, without changing the stable `modelId`.

### 5. Make the external handoff explicit

This is the most important next step.

The repository now contains an accepted candidate for engineering inspection, but Boat Builder doesn't automatically consume it simply because it exists in Modeler Lab.

We need a narrow, explicit publishing handoff.

I'd define that handoff as:

Modeler Lab

Receive → Export → Inspect → Validate → Approve

Versioned GLB + minimal asset metadata

Hey Chief Boat Builder

Load → Frame → Render → Switch vessels

The external application should not need to understand the entire Modeler Lab manifest or the ETR spatial model just to display a hull.

For the first iteration, copying a versioned, validated GLB into the Boat Builder's public asset directory may be entirely sufficient. We can formalize distribution later if the workflow proves useful.

## What I'd do next

I would merge this PR after the focused non-regression checks, then begin a separate Boat Builder Hull Integration slice.

Its scope should be very small: publish this GLB, load it into the Hatteras Boat Builder scene, get the scale and framing right, and confirm that switching among the four archetypes still works.

No composition contract. No semantic overlay integration. No changes to the existing Hatteras spatial hierarchy.

The only outstanding concern is that this is currently a hull-only asset. We should expect the first visual result to be incomplete until the other Hatteras structures are delivered.

Bottom line, Partner: I think you've grasped the important architectural distinction correctly. The patch is a good first intake implementation. The next challenge isn't more model architecture; it's proving the visual asset can travel cleanly from Awais, through Modeler Lab, into the Boat Builder.

That's exactly the kind of small, tangible milestone we wanted for this first collaboration.
