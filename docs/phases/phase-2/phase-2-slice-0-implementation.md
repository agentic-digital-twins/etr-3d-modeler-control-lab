Yes, Partner. Looking at the actual repository, **I would change the guidance before we start Phase 2**.

The repo has already taught us something important: it was born around an _equipment model_, but what we've actually created is the beginning of a much more general **semantic spatial-model workbench**. Boats, engines, engine assemblies, cameras, pumps, generators, electrical panels—and eventually other-domain physical systems—should fit the same underlying doctrine.

I would make that generalization now, while the repo is still small.

## The main change

I would **not** create parallel architectures like:

```text
equipment-model
vessel-model
capability-model
engine-model
```

with separate validators, viewers and contracts.

Instead I would introduce one foundational concept:

```text
                    SPATIAL MODEL
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       vessel         equipment      component
          │              │              │
       Hatteras        8V92TA         cylinder
       Sportfish       generator       turbo
       Superyacht      pump            camera
```

`modelKind` already gives us the beginning of this abstraction.

The current `EquipmentModelManifest` is remarkably close. I'd evolve it into something like a canonical `SpatialModelManifest`, with **profiles/kinds layered on top**, rather than throw away Phase 1.

---

## Why I'd do it now

Right now the charter says:

> “equipment-model generation”

and `subjectKind` is literally constrained to:

```ts
z.literal("equipment-model")
```

The repository YAML similarly declares:

```yaml
subjects:
  - subjectKind: equipment-model
```

That made perfect sense for the Detroit cylinder proof.

But our next use case immediately breaks that boundary:

```text
Hatteras 63
    ≠ equipment

Engine
    = equipment

Cylinder
    = equipment component

Salon
    = spatial area

Flybridge
    = spatial area

Camera installation
    = capability instance attached spatially
```

Trying to make all of those `EquipmentModelManifest`s will eventually distort the semantics.

And I **really don't want `vessel-model-contracts`, `engine-model-contracts`, `equipment-model-contracts`, etc.** That's how the self-describing architecture gets fragmented.

---

# I think the repository should become this

```text
etr-3d-modeler-control-lab
│
├── apps/
│   ├── model-api/
│   └── spatial-model-viewer/       ← eventually rename equipment-viewer
│
├── packages/
│   ├── spatial-model-contracts/
│   │
│   ├── model-validation/
│   │
│   └── repository-architecture/
│
├── models/
│   │
│   ├── vessels/
│   │   ├── hatteras-motor-yacht/
│   │   │   ├── model.yaml/json
│   │   │   ├── semantic.manifest.json
│   │   │   ├── geometry/
│   │   │   └── sources/
│   │   │
│   │   ├── offshore-center-console/
│   │   ├── convertible-sportfish/
│   │   └── tri-deck-superyacht/
│   │
│   ├── equipment/
│   │   ├── detroit-diesel-8v92ta/
│   │   ├── onan-generator/
│   │   └── ...
│   │
│   └── components/
│       ├── cylinder/
│       ├── camera/
│       ├── speaker/
│       └── ...
│
├── fixtures/
│   └── spatial-models/             ← generated/acceptance fixtures
│
├── docs/
│   ├── architecture/
│   ├── modeling/
│   └── phases/
│
└── architecture/
    └── repository.yaml
```

There is an important distinction in that layout:

**`models/` contains model source truth.**

**`fixtures/` contains generated artifacts used to prove/test the system.**

Right now our Detroit GLB under `fixtures/equipment-models` is appropriate because it is proving Phase 1. But as this becomes an actual model factory, I wouldn't let `fixtures` quietly turn into our model library.

---

# The semantic contract is the real product

This is the part I think connects beautifully to what we've been doing throughout Phase N.

I'd make the base contract approximately:

```text
SpatialModelManifest
│
├── identity
│   ├── modelId
│   ├── modelKind
│   ├── modelVersion
│   └── subject
│
├── artifact
│   ├── artifactId
│   ├── artifactVersion
│   ├── fileName
│   └── fingerprint
│
├── provenance
│   ├── generator
│   └── sourceReferences[]
│
├── spatial
│   ├── coordinateFrame
│   └── units
│
├── semantics
│   └── nodes[]
│
└── lifecycle
```

Then a semantic node becomes more general than today's `EquipmentComponent`:

```ts
SpatialSemanticNode {
    semanticId
    semanticKind
    semanticRole
    displayName

    parentSemanticId?

    representation: {
        glbNodes[]
    }

    interactionCapabilities[]

    spatial?
}
```

Notice one deliberate change:

### `componentId` → `semanticId`

Your existing boundary document already contains the seed of this:

> "`componentId` remains the durable identity; GLB node names are representation adapters."

**That doctrine is exactly right.**

I would preserve it and generalize the noun.

Because this:

```text
semanticId = vessel.area.engine-room
```

is perfectly legitimate.

Calling Engine Room a `componentId` is awkward.

---

# Then model profiles add domain meaning

We shouldn't make `SpatialModelManifest` understand what a boat is.

Instead:

```text
SpatialModelManifest
       │
       ├── VesselModelProfile
       │
       ├── EquipmentModelProfile
       │
       └── ComponentModelProfile
```

A vessel profile can impose:

```text
vessel
 ├── level
 │    └── area
 │         └── placement-region
 └── exterior-area
```

An equipment profile might impose:

```text
equipment
 ├── assembly
 │    └── component
 │         └── subcomponent
 └── service-point
```

So the same viewer/validator infrastructure works for:

```text
Hatteras 63
Detroit 8V92TA
8V92TA cylinder assembly
Onan generator
Cruisair unit
electrical panel
pump
```

without pretending they're semantically identical.

---

# And capability placement should NOT become model geometry

I feel even more strongly about this after seeing the repository.

We should distinguish three things:

```text
MODEL SEMANTICS
"What physical/spatial thing is this?"

        ↓

PLACEMENT SEMANTICS
"Where may another thing attach?"

        ↓

RUNTIME / CONFIGURATION
"What has actually been installed here?"
```

So the Hatteras model can say:

```text
Flybridge
│
├── placementRegion: overhead
├── placementRegion: helm
├── placementRegion: console
└── placementRegion: aft
```

It does **not** say:

```text
FLIR CAMERA IS HERE
```

The Hey Chief configurator says that.

That preserves the model as reusable physical/spatial truth.

---

# This gives us a very powerful coupling rule

I would formalize this in Phase 2:

> **Semantic identity is durable. Geometry is replaceable.**

For example:

```text
vessel.area.flybridge
          │
          │ semantic binding
          ▼
GLB node: HAT_063_FB_001
```

Awais can completely remodel the Flybridge:

```text
old GLB
HAT_063_FB_001

      ↓ replaced

new GLB
FlybridgeShell_v17
FlybridgeFloor_v4
FlybridgeConsole_v9
```

and our semantic identity remains:

```text
vessel.area.flybridge
```

The manifest simply adapts it:

```text
vessel.area.flybridge
       │
       ├── FlybridgeShell_v17
       ├── FlybridgeFloor_v4
       └── FlybridgeConsole_v9
```

Your current architecture document already warns that the one-component/one-GLB-node relationship is only a Phase A simplification.

**Phase 2 is exactly where I would graduate that.**

That will save us pain almost immediately.

---

# Self-description gets considerably stronger

This is where I think the repo can become a first-class participant in our Architecture Twin rather than merely having `repository.yaml`.

Right now we describe the repository:

```text
Realm: Equipment modeling
Faculty: Spatial modeling
```

I'd change the realm to something more general:

```text
Realm: Spatial Modeling
Faculty: Spatial Representation
```

or perhaps retain **Spatial Modeling** as faculty depending on our canonical faculty vocabulary.

Its self-description should say it owns:

```text
spatial-model-generation
spatial-model-semantic-contracts
spatial-model-validation
spatial-model-inspection
spatial-representation-binding
```

and explicitly does **not** own:

```text
physical operational state
telemetry truth
installed capability truth
alert truth
maintenance truth
Chief authority
```

That's a beautiful boundary.

The modeler says:

> **What can be represented, where it is, what its parts mean, and where other things may spatially relate to it.**

ETR says:

> **What is actually happening.**

Hey Chief Build says:

> **What the customer wants installed/configured.**

Those boundaries are extremely clean.

---

# I would also introduce composition now

Not full implementation necessarily—but the contract should anticipate it.

Because eventually:

```text
Hatteras 63
│
├── Port Engine
│      └── Detroit 8V92TA model
│
├── Starboard Engine
│      └── Detroit 8V92TA model
│
├── Generator
│      └── Onan model
│
└── HVAC
       └── Cruisair models
```

We absolutely do **not** want one giant Hatteras GLB containing authoritative copies of every detailed equipment model.

Instead:

```text
VESSEL MODEL
    │
    └── model attachment
           │
           ├── modelId: detroit-diesel-8v92ta
           ├── instanceId: engine.port
           ├── parentSemanticId: vessel.area.engine-room
           └── transform
```

Now we have genuine spatial composition.

And later:

```text
Detroit 8V92TA
      ↓
Cylinder Bank
      ↓
Cylinder model
```

Same mechanism.

That starts looking very much like the graph we've been building elsewhere:

```text
Vessel
  └─ contains Area
       └─ hosts Equipment Instance
            └─ references Equipment Model
                 └─ contains Components
```

**The graph really is becoming the rails.**

---

# What I would change in our Phase 2 plan

Before implementing the four Hey Chief vessels, I'd add a **Phase 2 / Slice 0 — Spatial Model Generalization**.

Not a giant refactor. A small architectural correction.

Its acceptance criteria would be roughly:

1. Generalize `EquipmentModelManifest` into the foundational spatial-model contract.
2. Preserve an equipment profile so the Detroit fixture continues passing unchanged in meaning.
3. Generalize `EquipmentComponent` into semantic nodes.
4. Support **one semantic identity → one or more representation nodes**.
5. Introduce optional spatial placement regions/anchors.
6. Define model composition/reference semantics, even if nested model loading is deferred.
7. Generalize repository self-description from equipment modeling to spatial modeling.
8. Establish `models/<kind>/<model>/` as model-source organization.
9. Keep generated/test artifacts separate under fixtures.
10. Keep runtime/configuration state completely outside the model contract.

Then:

```text
PHASE 2
│
├── Slice 0
│   Spatial Model Foundation
│
├── Slice 1
│   Hatteras lightweight vessel
│
├── Slice 2
│   Area + placement semantics
│
├── Slice 3
│   Generic capability representations
│
├── Slice 4
│   Hey Chief placement proof
│
└── Slice 5
    Remaining three hull archetypes
```

That sequence feels much stronger than simply starting to manufacture GLBs.

---

## One thing I would _not_ do

I would **not rename the repository**.

`etr-3d-modeler-control-lab` is actually better than the narrower terminology inside it. The repository name already accommodates what we're discovering.

I'd generalize its internals.

Likewise, I wouldn't immediately rename every `equipment-*` package/application just to make the tree pretty. I'd make the architectural change deliberately and migrate names when the generalized contract exists.

We don't need a rename storm.

---

And Partner, I think you were right to stop here and ask.

The four little website boats looked like a side job. They're actually the first use case that reveals what this lab wants to become:

> **ETR's design-time authority for coupling semantic physical identity to spatial representation.**

Not operational truth. Not the Vessel Model's runtime truth. Not configuration truth.

**Representation truth and the contract connecting representation to semantics.**

That makes the Detroit engine work, the Hatteras work, Awais's modeling work, Hey Chief Build, the Architecture Twin, and eventually IPP physical models all fit under one coherent roof.

I would make this correction **before** we build the four hulls.
