Absolutely, Partner. **Hull 3: Convertible Sportfish.** And now I want this implementation deliberately boring architecturally. Hull 3 should consume the pattern, not extend it unless the vessel itself exposes a genuine missing concept.

# Phase 2 — Slice 2 / Hull 3

## Convertible Sportfish Spatial Model

### Purpose

Add the third Hey Chief vessel archetype: a lightweight **60–75 ft Convertible Sportfish**.

This hull should prove that the existing spatial-model architecture handles a vessel that combines:

- a large exterior working cockpit;
- enclosed accommodation;
- an elevated bridge;
- below-deck machinery;
- a strongly differentiated bow/stern form.

The implementation must reuse the existing:

```text
SpatialModelManifest
        ↓
modelProfile: vessel
        ↓
VESSEL
  └── LEVEL
       └── AREA
```

plus the existing API catalog, model selector, Spatial Structure navigation, hierarchy-aware selection/isolation, representation bindings, model-space placement semantics, and runtime-only capability placement.

**No new architecture is expected.**

---

## 1. Target vessel

Use the existing Hey Chief archetype:

**Convertible Sportfish**  
**60–75 ft Carolina Flared Tournament**

The visual silhouette should communicate:

```text
             ┌──── BRIDGE ────┐
             │                 │
          ___┴_________________┴__
       __/                        \____
    __/                                │
 __/                                   │
/                                      │
\______________________________________│____
   FLARED BOW      HOUSE          COCKPIT
```

The most important visual cues are:

- pronounced/flared Carolina-style bow;
- long foredeck;
- substantial enclosed house;
- elevated bridge;
- large open fighting cockpit;
- relatively low stern working area.

We don't need tournament-yacht fidelity. We need the archetype to be immediately legible at normal viewer scale.

---

# 2. Proposed hierarchy

I recommend **four levels**, but importantly they are not the same four semantic levels as Hatteras.

```text
Convertible Sportfish
│
├── Machinery
│   └── Engine Room
│
├── Accommodation
│   ├── Forward Stateroom
│   ├── Galley
│   ├── Salon
│   └── Guest Stateroom
│
├── Main Deck
│   ├── Bow / Foredeck
│   ├── Port Side Deck
│   ├── Starboard Side Deck
│   └── Cockpit
│
└── Bridge
    └── Flybridge / Helm
```

This gives us another useful proof:

> The number `4` is incidental. The identities and spatial meanings of those levels come from the vessel.

We are not implementing a four-level template.

---

# 3. Machinery

```text
vessel.level.machinery
└── vessel.area.engine-room
```

The engine room should occupy the lower-mid/aft portion of the vessel beneath the house/cockpit transition.

Suggested placement semantics:

```text
region: machinery
region: low-point

anchor: machinery-center
anchor: machinery-port
anchor: machinery-starboard
anchor: low-point-center
```

Likely eventual capabilities:

```text
water sensor
temperature sensor
camera
digital control
engine telemetry
power monitoring
```

For Slice 2/Hull 3, the engine room remains spatial representation only.

**Do not compose detailed engine models into the Sportfish yet.**

That's a later composition proof.

---

# 4. Accommodation

This should sit physically between Machinery and Main Deck.

Suggested structure:

```text
vessel.level.accommodation
│
├── vessel.area.forward-stateroom
├── vessel.area.galley
├── vessel.area.salon
└── vessel.area.guest-stateroom
```

We don't need to reproduce an actual Viking/Hatteras/Carolina interior plan.

We need a believable spatial decomposition.

Conceptually:

```text
               BOW
                ↑

┌────────────────────────────────┐
│      FORWARD STATEROOM         │
├──────────────┬─────────────────┤
│    GALLEY    │ GUEST STATEROOM │
├──────────────┴─────────────────┤
│             SALON              │
└────────────────────────────────┘

                ↓
              STERN
```

The exact panel shapes should follow the hull geometry sufficiently to remain readable.

Suggested placement regions can remain simple:

```text
Forward Stateroom → interior
Galley            → interior
Salon             → interior
Guest Stateroom   → interior
```

with a `default` anchor for each.

No need to over-author placement metadata yet.

---

# 5. Main Deck

This is where the Sportfish should differ dramatically from Hatteras.

```text
vessel.level.main-deck
│
├── vessel.area.bow-foredeck
├── vessel.area.port-side-deck
├── vessel.area.starboard-side-deck
└── vessel.area.cockpit
```

Visually:

```text
┌──────────────────────────────────────────────┐
│                  MAIN DECK                   │
│                                              │
│              ╭────────────╮                  │
│              │ BOW /      │                  │
│              │ FOREDECK   │                  │
│              ╰────────────╯                  │
│                                              │
│ ╭──────────╮                  ╭──────────╮   │
│ │PORT SIDE │      HOUSE       │STBD SIDE │   │
│ ╰──────────╯                  ╰──────────╯   │
│                                              │
│          ╭────────────────────╮              │
│          │      COCKPIT       │              │
│          ╰────────────────────╯              │
└──────────────────────────────────────────────┘
```

Notice that the enclosed house itself does not need to become a duplicate `Salon` area on Main Deck if Salon already belongs to Accommodation.

The exterior shell can represent the house visually while the semantic spatial hierarchy remains unambiguous.

That avoids creating semantic duplication merely because geometry crosses elevations.

### Cockpit

Cockpit is the defining operational area of this archetype.

Give it useful placement affordances:

```text
region: deck
region: transom
region: overhead
region: perimeter

anchor: cockpit-center
anchor: cockpit-port
anchor: cockpit-starboard
anchor: transom-center
```

That gives us future room for:

```text
camera
speaker
lighting
presence
controls
fish-system sensors
```

without implementing those capabilities now.

---

# 6. Bridge

I would call the semantic level:

```text
vessel.level.bridge
```

and the area:

```text
vessel.area.flybridge-helm
```

Human labels:

```text
Bridge
    Flybridge / Helm
```

That distinction is useful.

The level describes the elevated physical plane; the area describes its operational function.

Suggested placement semantics:

```text
region: helm
region: overhead
region: perimeter

anchor: helm-center
anchor: overhead-center
anchor: bridge-port
anchor: bridge-starboard
```

This gives Thermal Camera an obvious high mounting location.

---

# 7. Geometry

Keep using the deliberately inexpensive geometry strategy.

Hull 3 needs enough form to make this obvious:

```text
CENTER CONSOLE             SPORTFISH

     ┌─┐                     ┌──────┐
 ____│ │_____              __│BRIDGE│__
/            \          __/            \____
\____________/        _/                    │
                     /                      │
                     \______________________│__
                                            COCKPIT
```

The Sportfish should look:

- taller;
- heavier;
- more enclosed;
- more bow-dominant;
- much more vertically layered

than Hull 2.

That's important because eventually these models sit next to each other in Hey Chief's hull selector.

### Non-requirements

Do not spend time on:

- tower detail;
- outriggers;
- fighting chair;
- rod holders;
- realistic windows;
- rails;
- antennas;
- hull textures;
- realistic engines;
- furniture;
- cabinetry.

Silhouette first.

---

# 8. Level/area visual grammar

Reuse the Hatteras and Center Console convention without modification:

**Level:** thin dimensional spatial plane.

**Area:** raised semantic panel on the level.

No Sportfish-specific rendering.

The exploded semantic representation should read approximately:

```text
             BRIDGE
       ┌────────────────┐
       │ Flybridge/Helm │
       └────────────────┘

            MAIN DECK
┌────────────────────────────────┐
│ Bow                            │
│ Port Side          Stbd Side   │
│                                │
│           Cockpit              │
└────────────────────────────────┘

         ACCOMMODATION
┌────────────────────────────────┐
│ Forward Stateroom              │
│ Galley       Guest             │
│ Salon                          │
└────────────────────────────────┘

            MACHINERY
       ┌────────────────┐
       │  Engine Room   │
       └────────────────┘
```

---

# 9. Spatial Structure

The existing viewer should derive:

```text
Spatial Structure

Machinery
    Engine Room

Accommodation
    Forward Stateroom
    Galley
    Salon
    Guest Stateroom

Main Deck
    Bow / Foredeck
    Port Side Deck
    Starboard Side Deck
    Cockpit

Bridge
    Flybridge / Helm
```

Again, this is a major acceptance condition.

There should be **no**:

```ts
if (sportfish)
```

logic in the viewer.

The manifest describes the vessel. The viewer interprets the manifest.

---

# 10. Model selector

Hull 3 should simply appear through the catalog:

```text
MODEL

Detroit Diesel 8V92TA
Hatteras 63 Motor Yacht
Offshore Center Console
Convertible Sportfish
```

The model selector should require no manually maintained UI enumeration if it is already catalog-driven.

Selecting Sportfish must completely derive its:

- title;
- semantic hierarchy;
- selectable structure;
- representation;
- capability placement targets

from the selected model.

---

# 11. Capability placement proof

Reuse our three generic capabilities, but choose locations that exercise this vessel naturally.

I recommend:

```text
Thermal Camera
      ↓
Flybridge / Helm

Speaker
      ↓
Cockpit

Water Sensor
      ↓
Engine Room
```

That spans:

```text
Bridge     → perception
Main Deck  → audio
Machinery  → sensor
```

and gives us a very understandable visual proof.

For this slice, deterministic first-anchor behavior remains accepted.

Do not implement capability compatibility resolution.

---

# 12. Selection and isolation

Preserve existing behavior.

Selecting:

```text
Bridge
```

should produce:

```text
TYPE
LEVEL
```

Selecting:

```text
Flybridge / Helm
```

should produce:

```text
TYPE
AREA

LEVEL
Bridge
```

Selecting Cockpit:

```text
TYPE
AREA

LEVEL
Main Deck
```

The parent level remains contextual when an area is selected.

Isolation remains **semantic-context isolation**, not mesh-only isolation.

No camera-transition work.

---

# 13. API/catalog

The generic catalog should now expose:

```text
Spatial Model Catalog
│
├── Detroit Diesel 8V92TA
├── Hatteras 63 Motor Yacht
├── Offshore Center Console
└── Convertible Sportfish
```

No new Sportfish endpoint.

No new vessel endpoint.

No API branching based upon archetype.

---

# 14. Source organization

Follow the existing Hull 2 pattern exactly.

Conceptually:

```text
models/
└── vessels/
    └── convertible-sportfish/
        ├── model metadata
        ├── semantic manifest
        ├── geometry/
        └── sources/
```

Use whatever exact filenames/path conventions Hull 2 established in the repository.

Don't introduce another organizational variation.

---

# 15. Validation

The Sportfish should pass the existing vessel-profile invariants unchanged:

```text
exactly one vessel
        │
        └── root-level
             │
             └── LEVEL
                    │
                    └── AREA
```

This is important:

### Prefer zero validator changes.

If Hull 3 causes a validator change, stop and ask:

> Did we discover a legitimate new spatial-model concept, or are we trying to accommodate our fixture?

Only the former should change the contract.

I don't currently see anything in this Sportfish that requires new semantics.

---

# 16. Tests

Keep this proportionate. We don't need to retest the entire concept from scratch.

### Model validation

Prove:

- manifest parses;
- `modelProfile: vessel`;
- vessel is root;
- four levels exist;
- areas have correct level parents;
- representation bindings resolve;
- placement frame remains `model`;
- regions/anchors validate.

### API

Catalog contains Sportfish and serves its manifest/artifact through the generic routes.

### Viewer

Model selector can choose Sportfish.

Spatial Structure derives the expected hierarchy.

### Placement

Prove:

```text
Thermal Camera → Flybridge / Helm
Speaker        → Cockpit
Water Sensor   → Engine Room
```

### Browser

A concise flow is enough:

```text
Select Convertible Sportfish

Select Main Deck
→ TYPE = LEVEL

Select Cockpit
→ TYPE = AREA
→ LEVEL = Main Deck

Place Speaker

Select Bridge
→ TYPE = LEVEL

Select Flybridge / Helm
→ TYPE = AREA
→ LEVEL = Bridge

Place Thermal Camera

Select Engine Room
→ LEVEL = Machinery

Place Water Sensor

No console errors
```

And, of course:

```text
pnpm check
pnpm test:e2e
```

---

# 17. Explicit non-goals

No:

- architecture expansion without evidence;
- new semantic-node kinds;
- detailed engine composition;
- detailed Sportfish interior;
- manufacturer fidelity;
- new capability resolver;
- camera smoothing;
- persistence of placements;
- runtime ETR telemetry;
- Hey Chief styling;
- responsive Model Explorer work;
- model-specific viewer code.

The Model Explorer remains unapologetically utilitarian.

---

# 18. Acceptance criteria

Hull 3 is accepted when:

1. The vessel is immediately recognizable as a convertible sportfish.
2. It is visually distinct from Hatteras and Center Console.
3. It uses the existing vessel profile unchanged.
4. Four meaningful levels are represented.
5. Areas are visibly subordinate to their levels.
6. Spatial Structure is manifest-derived.
7. Model selector discovers/selects it through the catalog.
8. Selection correctly distinguishes level vs area.
9. Parent-level context survives area selection.
10. Isolation behaves consistently with Hulls 1 and 2.
11. Thermal Camera places on Flybridge / Helm.
12. Speaker places in Cockpit.
13. Water Sensor places in Engine Room.
14. Placement remains runtime-only.
15. Existing Detroit, Hatteras, and Center Console behavior remains green.
16. No Sportfish-specific viewer/API branching exists.
17. `pnpm check` passes.
18. `pnpm test:e2e` passes.

And retain our human acceptance test:

> **Without reading the model name, does the silhouette read as a Sportfish? After opening Spatial Structure, does its organization feel natural?**

If yes, we're done.

---

## One thing I'd deliberately watch during Hull 3

Hull 2 proved **structural diversity**.

Hull 3 should begin proving **production repeatability**.

So I'd pay attention to how much code actually changes. Ideally this implementation is overwhelmingly:

```text
new manifest
+ new geometry
+ catalog fixture/source
+ focused tests
```

rather than application changes.

If that's what happens, we've crossed an important threshold: we're no longer developing vessel support.

**We're producing vessels.**

And then Phase 2 / Slice 2 / **Hull 4 — Tri-Deck Superyacht** becomes the scale test rather than another architecture exercise.
