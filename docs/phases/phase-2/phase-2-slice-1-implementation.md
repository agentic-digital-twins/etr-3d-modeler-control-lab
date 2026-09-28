Absolutely. And I would write the work statement so **Awais can participate when he has bandwidth, but nothing he does blocks us**.

I also think this should be a small, unusually crisp slice. The goal is **not “model four boats.”** The goal is to establish the lightweight spatial vessel pattern that lets the Hey Chief configurator demonstrate real capability placement.

# Hey Chief — Lightweight Vessel & Capability Placement Prototype

## Purpose

Create a lightweight 3D vessel representation for the **Hey Chief Build experience** that allows a prospective customer to:

1. Select a vessel archetype.
2. See a recognizable 3D representation of that vessel.
3. Select vessel areas such as Flybridge, Bow, Cockpit, Salon, Engine Room, etc.
4. Add capabilities such as cameras, speakers, switches, sensors and presence devices to those areas.
5. Immediately see those capabilities represented spatially on the vessel.

This is a **marketing/configuration spatial twin**, not a production vessel model.

The implementation should intentionally favor **clarity, speed and semantic structure over geometric detail**.

## Slice 0 alignment

Slice 1 consumes the canonical `SpatialModelManifest` introduced in Slice 0. The Hatteras artifact must declare `modelProfile: "vessel"` and represent every selectable vessel area as a `semanticNodes[]` entry. Each area uses a durable `semanticId`, a replaceable `representation.glbNodes[]` binding, and optional `spatial.placementRegions[]` and `spatial.placementAnchors[]` metadata.

The vessel manifest owns reusable spatial truth only. Capability instances, selected areas, and chosen anchors are Hey Chief configuration data and remain outside the GLB and model manifest. A capability instance must reference the vessel `semanticId` and optional anchor identifier; it must not add capability geometry to the vessel artifact.

Use `modelReferences[]` only when a vessel needs to declare an independently versioned attached model. Nested model loading is deferred; Slice 1 renders generic Three.js capability primitives directly from configuration data.

## Deferred contract decisions

- Keep `modelProfile` as an open string in Slice 0. Slice 1 will define vessel-specific invariants only after the first Hatteras model establishes the required level and area semantics.
- Keep `modelReferences[]` unpinned in Slice 0 because composition is declarative only. Before nested model loading is implemented, require a deterministic referenced model version or resolved artifact identity.

---

# 1. Core design principle

The spatial hierarchy should be:

```text
VESSEL
   │
   ├── LEVEL
   │     │
   │     └── AREA
   │            │
   │            ├── placement volume / surface
   │            │
   │            └── optional named anchors
   │
   └── CAPABILITY INSTANCE
               │
               └── attached to AREA / ANCHOR
```

The important contract is:

> **The semantic vessel model defines where things belong.
> The 3D geometry provides the visual projection of that model.**

Capability placement must therefore **not depend upon a capability being modeled into the vessel GLB**.

---

# 2. Vessel archetypes

The first version should support the four archetypes currently represented by the Hey Chief configurator.

### Offshore Center Console

Approximate visual characteristics:

```text
                  ┌── T-TOP ──┐
        BOW       │   HELM    │       COCKPIT
    ______________│___________│________________
   /                                             \
  /_______________________________________________\
```

Suggested semantic areas:

```text
Vessel
├── Bow
├── Foredeck
├── Helm
├── TTop
├── Cockpit
├── Machinery
└── Bilge
```

---

### Hatteras Motor Yacht

This can eventually use our existing Hatteras knowledge as its reference.

```text
                     ┌──── FLYBRIDGE ────┐
                     │                   │
              ┌──────┴───────────────────┴───┐
              │           SALON              │
        ______│______________________________│____
      /  BOW      STATEROOMS     ENGINE ROOM      \
 ____/______________________________________________\__
                                      AFT / COCKPIT
```

Suggested areas:

```text
Vessel
├── Bow
├── Foredeck
├── Flybridge
├── Salon
├── Galley
├── Owner Stateroom
├── Guest Stateroom
├── Engine Room
├── Cockpit / Aft Deck
├── Port Exterior
└── Starboard Exterior
```

---

### Convertible Sportfish

The silhouette should communicate **Carolina bow + enclosed/bridge structure + large fighting cockpit**.

```text
                         ┌── BRIDGE ──┐
                         │            │
                 ________│____________│
             ___/                        \____
          __/                                  │
    _____/                                     │ COCKPIT
   /___________________________________________│_______
      BOW          CABIN       MACHINERY
```

Suggested areas:

```text
Vessel
├── Bow
├── Foredeck
├── Bridge
├── Helm
├── Cabin
├── Cockpit
├── Machinery
└── Bilge
```

---

### Tri-Deck Superyacht

The important characteristic is the unmistakable **stacked multi-deck silhouette**.

```text
                         ┌── SUN DECK ──────┐
                    ┌────┴──────────────────┴───┐
                    │       UPPER DECK          │
              ┌─────┴───────────────────────────┴───┐
              │             MAIN DECK               │
        ______┴_____________________________________┴____
      /                  LOWER DECK                      \
 ____/____________________________________________________\___
```

Initial semantic areas can remain deliberately coarse:

```text
Vessel
├── Sun Deck
├── Upper Deck
├── Bridge
├── Main Deck
│   ├── Salon
│   └── Aft Deck
├── Lower Deck
│   ├── Guest Areas
│   └── Engineering
├── Bow
└── Stern
```

We do **not** need to model a 140-foot yacht interior.

The hierarchy merely needs to make placing equipment believable.

---

# 3. Geometry requirements

Each vessel requires two related representations.

### A. Visual shell

A low-poly exterior whose primary job is establishing the archetype.

At the intended viewport size:

> **Silhouette is more important than detail.**

No requirement for:

- furniture
- cabinetry
- detailed engines
- plumbing
- electrical systems
- deck hardware
- realistic materials
- production-quality topology
- photorealistic texturing

Simple neutral materials are preferable because Hey Chief applies its own holographic/technical visual treatment.

### B. Semantic spatial geometry

Areas should have simple selectable geometry associated with them.

For example:

```text
                VISUAL SHELL
          _______________________
        /                         \
       /                           \
      /_____________________________\
             ↓          ↓

       SEMANTIC AREA VOLUMES

       ┌───────────┐
       │ Flybridge │
       └───────────┘

    ┌─────────────────┐
    │      Salon      │
    └─────────────────┘

 ┌────────────┬────────────┐
 │ Staterooms │ EngineRoom │
 └────────────┴────────────┘
```

These volumes can normally be invisible.

Hey Chief can reveal/highlight them when an area or capability is selected.

---

# 4. Capability placement

This is the central functional requirement.

A capability is **not part of the vessel model**.

Instead:

```text
Capability Definition
        │
        ▼
Capability Instance
        │
        ▼
      Area
        │
        ▼
Placement Surface / Anchor
        │
        ▼
3D representation
```

Example:

```text
FLIR Thermal Camera
        │
        ▼
    Flybridge
        │
        ▼
  overhead-port
        │
        ▼
       📷
```

Conceptually:

```json
{
  "capabilityId": "camera-001",
  "type": "camera.thermal.ptz",
  "areaId": "flybridge",
  "anchorId": "overhead-port"
}
```

The website owns this relationship.

The GLB does not.

---

# 5. Placement model

Areas should support two levels of placement.

### Simple placement

An area supplies a bounding volume or placement surface.

```text
┌─────────────────────────────┐
│                             │
│       FLYBRIDGE AREA        │
│                             │
│       +       +       +     │
│                             │
└─────────────────────────────┘
```

Hey Chief can automatically choose a reasonable position.

This should handle most marketing-demo placement.

### Named anchors

Where positioning matters, an area can provide named attachment points:

```text
FLYBRIDGE

      CAMERA
        ↓
  +-------------+
  |      ●      |  overhead-center
  | ●         ● |  overhead-port/starboard
  |             |
  |      ●      |  helm
  +-------------+
```

These anchors should be metadata/transforms, not detailed geometry.

---

# 6. Initial capability library

We should create a small reusable library rather than individual models for every product SKU.

Something approximately like:

```text
PERCEPTION
  camera.fixed
  camera.ptz
  camera.thermal
  microphone

AUDIO
  speaker

PRESENCE
  beacon
  beacon.receiver

SENSORS
  water
  temperature
  door
  motion

CONTROL
  light.switch
  digital.switch
  on-off.control
  smart-plug

POWER
  power.monitor
  breaker

VESSEL
  engine.telemetry
  tank.telemetry
  gps
  heading
```

The initial visual assets can be extremely simple.

For example:

```text
 Camera       Speaker      Switch       Water       Beacon

   ╭──╮         ╭──╮         ┌─┐          ◇           ((●))
 ──┤◉ │         │)))         │●│         ~~~
   ╰──╯         ╰──╯         └─┘
```

They only need to be visually distinct enough that a user understands that **something has been installed at that location**.

---

# 7. Interaction target

The proof should demonstrate this sequence:

```text
SELECT HULL
    ↓
Hatteras Motor Yacht

SELECT CAPABILITY
    ↓
Thermal Camera

SELECT AREA
    ↓
Flybridge

         ┌──────────────┐
         │  📷          │ ← capability appears
         │  FLYBRIDGE   │ ← area highlights
         └──────────────┘
        ╱                ╲
 ______╱__________________╲______
╱                               ╲
╲________________________________╱

CONFIGURATION
Thermal Camera
Location: Flybridge
Status: Added
```

Then:

```text
Water Sensor
      ↓
Engine Room
      ↓
sensor appears low in engine-room area
      ↓
Engine Room highlights
```

That is enough to prove the architecture.

---

# 8. Separation of responsibilities

I would make this explicit because it prevents us from accidentally waiting for modeling work.

### Hey Chief application work — us

We own:

- semantic vessel schema
- vessel → level → area hierarchy
- area IDs
- placement contract
- capability taxonomy
- capability instances
- capability-to-area association
- runtime placement
- selection/highlighting
- holographic rendering
- configurator state
- eventual ETR contract alignment

### 3D modeling work — Awais / modeler

The modeler owns:

- recognizable vessel silhouette
- sensible proportions
- low-poly exterior shell
- simple deck/area geometry where useful
- clean hierarchy/naming
- exportable GLB
- compliance with our semantic model contract

Critically:

> **The modeler does not determine our semantic architecture.**

We provide that contract.

---

# 9. Recommended first proof

Before commissioning all four vessels, implement one deliberately crude reference vessel.

I suggest:

**Hatteras Motor Yacht**

with only:

```text
Flybridge
Salon
Engine Room
Bow
Cockpit
```

and only:

```text
Camera
Speaker
Water Sensor
```

Acceptance scenario:

```text
Camera       → Flybridge
Speaker      → Salon
Water Sensor → Engine Room
```

Each placement must:

1. resolve to the correct semantic area;
2. render a capability representation;
3. highlight the associated area;
4. survive camera movement;
5. remain associated when another capability is selected;
6. be representable entirely as configuration data.

If that works, the underlying problem is solved.

---

# 10. Modeler deliverable

Once the prototype proves the contract, I would hand Awais something very concrete:

> **Hey Chief Lightweight Vessel Model Contract**
>
> Produce a lightweight visual vessel shell conforming to the supplied semantic vessel definition.
>
> The model is intended for an interactive web-based spatial configurator rather than photorealistic presentation.
>
> Optimize for recognizable silhouette, clean geometry, semantic area correspondence and efficient WebGL rendering.
>
> Capability objects will be placed dynamically by the application and must not be modeled into the vessel.
>
> Hey Chief will provide area definitions, IDs and required attachment/placement semantics.
>
> Initial reference vessel: **Hatteras Motor Yacht**.
>
> Once the pattern is accepted, the same contract will be applied to Center Console, Convertible Sportfish and Tri-Deck Superyacht archetypes.

That changes his job considerably.

He's no longer being asked:

> “Can you figure out how our 3D configurator should work?”

He's being asked:

> “Here is how our spatial system works. Please give it a better vessel.”

That is a much safer asynchronous boundary.

---

## One addition I would make now

I wouldn't make the capability icon library dependent upon Blender either.

Most of those can be generated directly from **Three.js primitives** initially:

```text
camera  = box + cylinder + lens
speaker = cylinder/cone
beacon  = sphere + rings
switch  = plate + toggle
sensor  = puck/cylinder
light   = small emissive disc
```

That means the entire first proof could potentially contain **zero externally authored assets**.

Then later:

```text
Three.js primitive
        ↓
better generic GLB
        ↓
manufacturer-specific representation
```

without changing the semantic capability instance.

That is exactly the kind of replaceable visual layer we've been trying to establish throughout ETR.

So yes, Partner: **I'd start this ourselves now and give Awais the contract once we've proven it.** If he has time, great—we get prettier hulls sooner. If he's busy, the Hey Chief site keeps moving anyway.
