**Phase 2 / Slice 4 / Hull 4: Tri-Deck Superyacht.**

For Hull 4 I want to preserve the discipline Hull 3 just validated: **no new architecture unless this vessel forces us to discover something real.** The new test is scale and spatial richness. Can the same vessel language describe a substantially larger, vertically layered vessel without becoming awkward?

# Phase 2 — Slice 4 / Hull 4

## Tri-Deck Superyacht Spatial Model

### Purpose

Add the fourth Hey Chief vessel archetype: a lightweight **Tri-Deck Superyacht**, approximately **100–130 ft**.

Hull 4 should prove that the existing spatial-model system scales from:

```text
Hatteras Motor Yacht
        ↓
Offshore Center Console
        ↓
Convertible Sportfish
        ↓
Tri-Deck Superyacht
```

without changing the fundamental contract:

```text
VESSEL
  └── LEVEL
       └── AREA
            └── placement regions / anchors
```

This is primarily a **scale test**, not another architecture exercise.

The desired implementation profile is the same one Hull 3 achieved:

```text
new authored model
+ new geometry
+ new manifest
+ catalog registration
+ focused tests
≈ almost no generic application code
```

---

# 1. Target vessel

Use the existing Hey Chief archetype:

**Tri-Deck Superyacht**

The model should represent a contemporary large motor yacht rather than a manufacturer-specific vessel.

The silhouette needs only enough information to communicate:

- long displacement/semi-displacement hull;
- substantial enclosed superstructure;
- three clearly differentiated above-water operational elevations;
- open aft decks;
- upper/sun deck;
- bridge/pilothouse;
- machinery below;
- recognizable bow-to-stern progression.

At normal viewer distance, somebody should immediately say:

> That's a superyacht.

Not:

> That's a stretched Hatteras.

That distinction matters.

---

# 2. Proposed spatial hierarchy

I recommend **six semantic levels**:

```text
Tri-Deck Superyacht
│
├── Machinery
│   └── Engine Room
│
├── Lower Deck
│   ├── Forward Guest Stateroom
│   ├── Port Guest Stateroom
│   ├── Starboard Guest Stateroom
│   └── Master Stateroom
│
├── Main Deck
│   ├── Bow / Foredeck
│   ├── Main Salon
│   └── Aft Deck
│
├── Upper Deck
│   ├── Sky Lounge
│   └── Upper Aft Deck
│
├── Bridge Deck
│   └── Pilothouse
│
└── Sun Deck
    └── Sun Deck
```

That is deliberately more spatially rich than our previous vessels.

And notice what we're **not** doing:

```text
Tri-Deck Superyacht
    ├── Level 1
    ├── Level 2
    ├── Level 3
    ...
```

The levels have semantic meaning.

---

# 3. Machinery

```text
vessel.level.machinery
└── vessel.area.engine-room
```

Place it low and predominantly aft/midships.

Suggested affordances:

```text
regions:
  machinery
  low-point

anchors:
  machinery-center
  machinery-port
  machinery-starboard
  low-point-center
```

Likely eventual capability families:

```text
water sensing
temperature
camera
power monitoring
engine telemetry
pump control
digital switching
```

Still no detailed engine composition.

That temptation will be stronger on the superyacht because an engine room cries out for equipment. Resist it for this slice.

---

# 4. Lower Deck

```text
vessel.level.lower-deck
│
├── vessel.area.forward-guest-stateroom
├── vessel.area.port-guest-stateroom
├── vessel.area.starboard-guest-stateroom
└── vessel.area.master-stateroom
```

This is our first vessel where several similar accommodation areas exist on the same elevation.

That's useful.

It exercises semantic identity without requiring any new concept.

Conceptually:

```text
                    BOW
                     ↑

┌─────────────────────────────────────────┐
│       FORWARD GUEST STATEROOM           │
├───────────────────┬─────────────────────┤
│    PORT GUEST     │   STARBOARD GUEST   │
├───────────────────┴─────────────────────┤
│            MASTER STATEROOM             │
└─────────────────────────────────────────┘

                     ↓
                   STERN
```

Don't spend time making this a naval-architecture-perfect accommodation plan.

It needs to be spatially believable and semantically useful.

---

# 5. Main Deck

```text
vessel.level.main-deck
│
├── vessel.area.bow-foredeck
├── vessel.area.main-salon
└── vessel.area.aft-deck
```

This should be one of the visually dominant levels.

### Bow / Foredeck

Useful affordances:

```text
regions:
  deck
  perimeter

anchors:
  bow-center
  bow-port
  bow-starboard
```

### Main Salon

Keep this straightforward:

```text
regions:
  interior

anchors:
  salon-center
```

### Aft Deck

This should be a substantial exterior social/operational area.

```text
regions:
  deck
  perimeter
  overhead

anchors:
  aft-deck-center
  aft-deck-port
  aft-deck-starboard
  aft-deck-overhead
```

That gives us useful future mounting semantics without inventing installed equipment.

---

# 6. Upper Deck

```text
vessel.level.upper-deck
│
├── vessel.area.sky-lounge
└── vessel.area.upper-aft-deck
```

This level is important because it prevents the superyacht from becoming merely:

```text
big main deck
+ bridge
```

### Sky Lounge

```text
region: interior
anchor: sky-lounge-center
```

### Upper Aft Deck

```text
regions:
  deck
  perimeter
  overhead

anchors:
  upper-aft-center
  upper-aft-port
  upper-aft-starboard
```

The geometry should visibly distinguish the enclosed forward/midship Sky Lounge from the open aft portion.

---

# 7. Bridge Deck

```text
vessel.level.bridge-deck
└── vessel.area.pilothouse
```

I prefer **Bridge Deck → Pilothouse** rather than making the level itself `Pilothouse`.

Same principle we've already validated:

> Level describes spatial elevation/context. Area describes functional semantic space.

Suggested affordances:

```text
regions:
  helm
  overhead
  perimeter

anchors:
  helm-center
  overhead-center
  bridge-port
  bridge-starboard
```

This becomes the natural navigation/control center of the model.

---

# 8. Sun Deck

```text
vessel.level.sun-deck
└── vessel.area.sun-deck
```

Yes, the labels can be identical.

Semantic IDs remain distinct:

```text
vessel.level.sun-deck
vessel.area.sun-deck
```

That's perfectly legitimate.

The level says:

> this elevation exists.

The area says:

> this usable spatial region occupies that elevation.

Suggested affordances:

```text
regions:
  deck
  perimeter
  overhead

anchors:
  sun-deck-center
  sun-deck-forward
  sun-deck-aft
  sun-deck-port
  sun-deck-starboard
```

This is an excellent high-level mounting plane for cameras, communications, environmental sensing, etc.

---

# 9. Geometry strategy

Do **not** respond to “superyacht” by dramatically increasing geometric detail.

We're testing spatial scale, not polygon count.

The silhouette should approximately communicate:

```text
                         SUN DECK
                       ┌───────────┐
                  _____┴___________┴____
                       BRIDGE
                ┌─────────────────────┐
             ___┴_____________________┴___
                      UPPER DECK
          ┌───────────────────────────────┐
       ___┴_______________________________┴____
                       MAIN DECK
    __/                                         \__
 __/                                               \____
/                                                       \
\_______________________________________________________/
                 LOWER / MACHINERY
```

Use broad masses:

- hull;
- deck planes;
- superstructure volumes;
- bridge volume;
- upper-deck volume;
- open aft portions;
- sun deck.

No need for:

- railings;
- furniture;
- tenders;
- davits;
- realistic windows;
- satellite domes;
- antennas;
- jacuzzis;
- stairs;
- doors;
- detailed machinery;
- deck hardware.

Those belong to representation refinement, not this semantic proof.

---

# 10. Exploded spatial grammar

Reuse exactly what now works.

The Explorer should naturally produce something conceptually like:

```text
                 SUN DECK
          ┌──────────────────┐
          │     Sun Deck     │
          └──────────────────┘


               BRIDGE DECK
          ┌──────────────────┐
          │    Pilothouse    │
          └──────────────────┘


                UPPER DECK
     ┌──────────────┬──────────────┐
     │  Sky Lounge  │ Upper Aft    │
     └──────────────┴──────────────┘


                 MAIN DECK
 ┌────────────┬──────────────┬────────────┐
 │ Foredeck   │ Main Salon   │ Aft Deck   │
 └────────────┴──────────────┴────────────┘


                 LOWER DECK
 ┌────────────────────────────────────────┐
 │ Forward Guest                          │
 │ Port Guest             Starboard Guest │
 │ Master                                 │
 └────────────────────────────────────────┘


                 MACHINERY
          ┌──────────────────┐
          │   Engine Room    │
          └──────────────────┘
```

Same visual grammar:

**Level = contextual plane.**  
**Area = semantic panel.**

No superyacht renderer.

---

# 11. Spatial Structure

The existing manifest-driven UI should simply show:

```text
Spatial Structure

Machinery
    Engine Room

Lower Deck
    Forward Guest Stateroom
    Port Guest Stateroom
    Starboard Guest Stateroom
    Master Stateroom

Main Deck
    Bow / Foredeck
    Main Salon
    Aft Deck

Upper Deck
    Sky Lounge
    Upper Aft Deck

Bridge Deck
    Pilothouse

Sun Deck
    Sun Deck
```

This is one place I want us to watch the UI rather than automatically modify it.

Six levels and twelve areas are considerably richer than Hull 2.

If the existing Spatial Structure remains readable, excellent.

If it starts feeling crowded, **record that observation rather than redesigning navigation inside this slice** unless it actually becomes unusable.

That distinction matters.

---

# 12. Model selector

Hull 4 should appear automatically through the existing generic catalog:

```text
Hull

Hatteras 63 Motor Yacht
Offshore Center Console
Convertible Sportfish
Tri-Deck Superyacht
```

And whatever other cataloged non-vessel model remains available according to the current Explorer behavior.

No selector-specific addition beyond catalog registration should be required.

If Hull 4 requires selector code, investigate why before adding it.

---

# 13. Capability-placement proof

Let's make the Hull 4 placement proof deliberately span the vessel vertically.

I recommend:

```text
Thermal Camera
      ↓
Sun Deck

Speaker
      ↓
Upper Aft Deck

Water Sensor
      ↓
Engine Room
```

That gives us:

```text
TOP
│
│  Thermal Camera
│       ↓
│    Sun Deck
│
│  Speaker
│       ↓
│  Upper Aft Deck
│
│
│  Water Sensor
│       ↓
│   Engine Room
│
BOTTOM
```

That's a great final visual proof of the current placement architecture.

The deterministic first-anchor behavior remains accepted.

**Still no capability/anchor compatibility resolver.**

---

# 14. Selection behavior

Existing semantics remain unchanged.

Selecting:

```text
Upper Deck
```

should yield:

```text
TYPE
LEVEL
```

Selecting:

```text
Upper Aft Deck
```

should yield:

```text
TYPE
AREA

LEVEL
Upper Deck
```

Selecting:

```text
Pilothouse
```

should yield:

```text
TYPE
AREA

LEVEL
Bridge Deck
```

Selecting the `Sun Deck` area must distinguish it internally from the `Sun Deck` level despite identical display names.

That's worth testing because it demonstrates why semantic identity matters more than display labels.

---

# 15. Important Hull 4 proof: repeated display names

I would explicitly test:

```text
semanticId: vessel.level.sun-deck
displayName: Sun Deck

semanticId: vessel.area.sun-deck
displayName: Sun Deck
parentSemanticId: vessel.level.sun-deck
```

The system should have absolutely no ambiguity because identity is carried by `semanticId`, not `displayName`.

If that exposes an existing UI selector/test assumption based on display text, fix that assumption generically.

**Do not rename one to avoid the test.**

This is useful pressure on the architecture.

---

# 16. Contract and validator posture

Preferred change:

```text
contracts   0
validator   0
viewer      0
API logic   0
```

Expected implementation:

```text
model source          +
manifest              +
geometry              +
catalog registration  +
tests                 +
```

If six levels or repeated display names require a contract change, investigate carefully.

Nothing about this vessel currently appears to violate our existing spatial vocabulary.

---

# 17. API/catalog

Generic catalog becomes approximately:

```text
Spatial Model Catalog
│
├── Detroit Diesel 8V92TA
├── Hatteras 63 Motor Yacht
├── Offshore Center Console
├── Convertible Sportfish
└── Tri-Deck Superyacht
```

No:

```text
/api/superyacht
```

No:

```ts
if (modelId === "tri-deck-superyacht")
```

outside authored registration/model data where identity obviously belongs.

---

# 18. Tests

Keep the Hull 3 lesson: **don't multiply browser scenarios just because we've multiplied models.**

### Model validation

Prove:

- `modelProfile: vessel`;
- exactly one root vessel;
- six levels;
- correct area parenting;
- repeated `Sun Deck` display names are legal;
- semantic IDs remain unique;
- representation bindings resolve;
- placement frame remains model-space;
- regions/anchors validate.

### Catalog/API

Prove Tri-Deck Superyacht is cataloged and its generic manifest/artifact endpoints work.

### Viewer

Prove it is discoverable through the existing Hull selector and Spatial Structure is derived correctly.

### Focused browser proof

Use Hull 4 as the deep placement scenario:

```text
Select Tri-Deck Superyacht

Select Upper Deck
→ TYPE = LEVEL

Select Upper Aft Deck
→ TYPE = AREA
→ LEVEL = Upper Deck

Place Speaker

Select Sun Deck level
→ TYPE = LEVEL

Select Sun Deck area
→ TYPE = AREA
→ LEVEL = Sun Deck

Place Thermal Camera

Select Engine Room
→ TYPE = AREA
→ LEVEL = Machinery

Place Water Sensor

No console errors
```

The duplicate display-name interaction may require selectors based on hierarchy/context rather than plain text. That's good.

Then:

```text
pnpm check
pnpm test:e2e
```

---

# 19. Regression smoke across all four hulls

I would add a **small** catalog-driven smoke check rather than four full E2E scenarios.

Conceptually:

```text
for each vessel:
    select vessel
    model loads
    Spatial Structure appears
    at least one level appears
    no load error
```

Target set:

```text
Hatteras 63
Offshore Center Console
Convertible Sportfish
Tri-Deck Superyacht
```

This becomes useful now because Hull 4 completes the initial archetype set.

Keep the deep semantic/placement test on one hull.

---

# 20. Explicit non-goals

Hull 4 does **not** include:

- equipment-model composition;
- actual engines/generators;
- decks connected by stairs;
- crew/service spaces;
- tender garage;
- beach club;
- tanks;
- HVAC topology;
- electrical topology;
- capability compatibility resolution;
- placement persistence;
- detailed yacht geometry;
- camera interpolation;
- Explorer visual redesign;
- Hey Chief theme work;
- runtime operational state;
- telemetry;
- alerts;
- maintenance data.

All of those may eventually belong somewhere.

They do not belong in this proof.

---

# 21. Acceptance criteria

Hull 4 is accepted when:

1. It reads immediately as a large tri-deck superyacht.
2. It is visually distinct from the other three archetypes.
3. It uses the existing vessel contract unchanged.
4. Six meaningful levels are represented.
5. The richer hierarchy remains understandable in Spatial Structure.
6. Areas remain visibly subordinate to levels.
7. The model appears through the existing generic selector/catalog.
8. Level/area selection works without superyacht-specific behavior.
9. `Sun Deck` level and `Sun Deck` area remain unambiguously separate semantic identities.
10. Thermal Camera places on the Sun Deck.
11. Speaker places on Upper Aft Deck.
12. Water Sensor places in Engine Room.
13. Placements remain runtime/configuration state.
14. Existing hulls still load successfully.
15. No Superyacht-specific viewer/API branching is introduced.
16. Preferably no contract or validator implementation changes occur.
17. `pnpm check` passes.
18. `pnpm test:e2e` passes.

And our human acceptance test remains:

> **Without reading its name, does it look like a superyacht? Once you inspect Spatial Structure, does the six-level vessel still feel obvious rather than complicated?**

---

## What Hull 4 completes

This is the part I particularly like, Partner.

After Hull 4 we'll have exercised the same spatial language against four quite different shapes:

```text
OFFSHORE CENTER CONSOLE
few levels / mostly open / exterior operational

CONVERTIBLE SPORTFISH
mixed interior + exterior / vertically layered

HATTERAS MOTOR YACHT
accommodation-heavy / traditional motor-yacht organization

TRI-DECK SUPERYACHT
large / deeply layered / spatially rich
```
