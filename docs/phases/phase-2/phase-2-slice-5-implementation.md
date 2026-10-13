### Execution approach — incremental external collaboration

This plan describes the engineering objectives for Phase 2 / Slice 5, not the requirements for Awais's first hull delivery.

The initial Hatteras assignment is intentionally lightweight. Awais may reuse his existing vessel model, organize a few major structures, and provide an early Blender/GLB candidate without needing to satisfy the full semantic-model integration contract.

Our repository owns the translation from externally authored geometry into validated spatial representation, including semantic bindings, placement preservation, and integration acceptance.

We will use the first delivery to discover practical requirements before formalizing a stricter Blender delivery contract.

**Awais's first delivery is a learning milestone. Successful integration into our spatial-model pipeline is the engineering milestone.**

Partner, I think we're at exactly the right point to bring Awais into the production process.

And I agree with your observation about the engine. The visual quality is there. What's missing is the semantic organization that makes the geometry useful to our system.

I would not ask Awais to rework the engine immediately. Instead, I'd use it to establish the delivery process, then apply what we learn to the first hull.

## My proposed sequence

Step 1 — Formalize the Blender delivery contract

Define coordinate conventions, scale, origin, collections, object naming, GLB export, and versioning. Awais should know exactly what our importer expects before building hulls.

Step 2 — Import the low-poly engine

Use the existing Spatial Model Explorer and validation pipeline. Map the main engine to a stable semantic identity, inspect the GLB, and record any importer gaps. No engine redesign required.

Step 3 — Give Awais the Hatteras hull specification

Start with the vessel we understand best. Supply our established levels, areas, semantic IDs, and a visual reference. Have him deliver one recognizable low-poly exterior shell with meaningful Blender object organization.

Step 4 — Prove geometry replacement

Substitute Awais's Hatteras geometry for the generated representation. Preserve semantic identities, selection, isolation, and capability placements. Adjust representation bindings where necessary, not the semantic hierarchy.

Step 5 — Commission the other three hulls

Once the Hatteras passes acceptance, Awais can produce Center Console, Sportfish, and Superyacht using the same delivery contract.

## An important distinction about Blender collections

I wouldn't require one Blender collection for every semantic node.

Collections are useful for organizing the artist's work, but our runtime depends on stable exported GLB nodes and their bindings, not Blender collection names.

For example, the Hatteras might be organized like this:

```
Hatteras_63
├── Hull
├── Superstructure
├── Levels
│   ├── Machinery
│   ├── Accommodation
│   ├── MainDeck
│   └── Flybridge
├── Areas
│   ├── EngineRoom
│   ├── Salon
│   ├── Galley
│   ├── Cockpit
│   └── ...
└── Details
```

Those are suggested authoring groups, not a new runtime schema.

I'd ask Awais to maintain distinct, named objects for geometry we need to select, highlight, or isolate. Decorative details can remain grouped together.

One subtlety: we shouldn't force semantic areas to become artificial pieces of the exterior hull. A salon can have an invisible selection proxy or separate spatial representation. Awais should create the recognizable vessel; our modeler can continue supplying the semantic deck/area overlays.

That keeps his job manageable and avoids making him responsible for ETR architecture.

## The first deliverable I'd create

I recommend a document named:

`phase-2-slice-5-blender-asset-intake-and-hull-replacement-plan.md`

It should establish two parallel workstreams:

| Awais                                       | Our modeler repository                        |
| ------------------------------------------- | --------------------------------------------- |
| Follow the Blender delivery specification   | Define and validate intake requirements       |
| Supply organized low-poly Hatteras geometry | Import the engine as the first external asset |
| Provide `.blend` and `.glb`                 | Validate geometry and node bindings           |
| Correct any asset-side issues               | Prove semantic identity survives replacement  |
| Produce subsequent hulls                    | Automate repeatable acceptance                |

One other recommendation: don't make Awais wait for our engine-import work to finish. We can send him the Blender delivery specification and Hatteras requirements while we build the importer acceptance path.

That preserves the parallelism we've worked hard to establish.

## Where I would draw the first acceptance boundary

I would consider Slice 5 successful when:

- Awais's low-poly engine loads as an externally authored spatial model.
- The Hatteras visual shell can be replaced without changing its established semantic IDs.
- All Hatteras levels, areas, and placement behaviors continue working.
- The import and validation procedure is documented and repeatable.
- Awais has a clear specification for producing the remaining hulls.

And importantly, we do not need the high-poly engine, detailed machinery composition, or customer-facing Hey Chief rendering in this slice.

This is the transition I find most interesting:

Phase 2, Slices 1–4 proved we can create spatial models. Slice 5 should prove we can receive them from another creator without surrendering our architecture.

That's the next milestone I'd pursue, Partner.&#x20;
