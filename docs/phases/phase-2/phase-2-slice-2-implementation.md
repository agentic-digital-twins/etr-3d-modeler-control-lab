Oh yes — **Phase 2, Slice 2, Hull 2.** I wouldn't fight that synchronicity.

And I think Hull 2 should be the **Offshore Center Console**. It is the best next test because it is structurally different from the Hatteras: fewer levels, mostly exterior operational space, outboards rather than an engine room, and areas that share one largely continuous deck. If our vessel pattern handles that cleanly, we've demonstrated that Hatteras didn't accidentally define “vessel” as “motor yacht.”

# Phase 2 — Slice 2

## Offshore Center Console Spatial Model

### Purpose

Prove that the spatial-model foundation and vessel profile established by the Hatteras reference implementation generalize cleanly to a substantially different vessel archetype.

Create a lightweight **38–43 ft Offshore Center Console** spatial model suitable for the Hey Chief vessel configurator.

The model must preserve the established doctrine:

> **Vessel → Level → Area → Representation → Placement**

The slice should reuse the existing contracts, validator, API, viewer, and runtime capability-placement mechanism wherever possible.

**This is not a new vessel architecture. It is the second implementation of the existing vessel architecture.**

---

## 1. Primary proof

Slice 2 should answer one question:

> Can we represent a center-console vessel naturally using the spatial language learned from Hatteras without introducing vessel-specific application logic?

Target result:

```text
Offshore Center Console
│
├── Main Deck
│   ├── Bow
│   ├── Helm
│   ├── Port Walk Deck
│   ├── Starboard Walk Deck
│   └── Cockpit
│
├── Machinery
│   ├── Bilge / Machinery
│   └── Outboard Machinery
│
└── T-Top
    └── T-Top / Overhead
```

I would use **three levels**.

That deliberately proves that `level` is a semantic/spatial concept rather than an assumption that all vessels have four decks.

---

# 2. Vessel identity

Suggested identity:

```text
modelId:
offshore-center-console

modelProfile:
vessel

displayName:
Offshore Center Console

modelKind:
vessel
```

This remains an **archetype**, not a manufacturer-specific model.

The Hey Chief configurator currently describes this class as approximately:

> 38–43 ft Tournament Open Cockpit

That's enough guidance for silhouette and proportions.

Do not introduce manufacturer/model identity merely to make the fixture sound more realistic.

---

# 3. Canonical spatial hierarchy

## Level 1 — Machinery

This is mostly below-deck / propulsion context.

```text
vessel.level.machinery
│
├── vessel.area.bilge-machinery
│
└── vessel.area.outboard-machinery
```

### Bilge / Machinery

Represents the below-deck machinery/service region.

Useful eventual capability placements include:

```text
water sensor
pump control
temperature sensor
battery/power monitoring
digital switching
```

Suggested placement semantics:

```text
region: low-point
region: machinery
anchor: bilge-low-center
anchor: machinery-center
```

### Outboard Machinery

Represents the stern propulsion installation.

It does **not** require detailed Mercury models.

For this slice, simple outboard representations are sufficient.

Suggested placement semantics:

```text
region: propulsion
anchor: port-outboard
anchor: starboard-outboard
```

If four visually simple outboards help establish the center-console silhouette, use four. They do not need individual detailed semantic models yet.

---

# 4. Level 2 — Main Deck

This should be the dominant spatial plane.

```text
vessel.level.main-deck
│
├── vessel.area.bow
├── vessel.area.port-walk-deck
├── vessel.area.helm
├── vessel.area.starboard-walk-deck
└── vessel.area.cockpit
```

This is where I would reuse the visual grammar we just validated:

```text
┌───────────────────────────────────────────────┐
│                  MAIN DECK                    │
│                                               │
│                ╭──────────╮                   │
│                │   BOW    │                   │
│                ╰──────────╯                   │
│                                               │
│ ╭──────────╮   ╭──────────╮   ╭──────────╮  │
│ │PORT WALK │   │   HELM   │   │STBD WALK │  │
│ ╰──────────╯   ╰──────────╯   ╰──────────╯  │
│                                               │
│             ╭────────────────╮                │
│             │    COCKPIT     │                │
│             ╰────────────────╯                │
└───────────────────────────────────────────────┘
```

The exact geometry should follow a believable hull rather than this schematic, but the semantic relationship is the point.

### Bow

Suggested placement semantics:

```text
region: deck
region: perimeter
anchor: bow-center
anchor: bow-port
anchor: bow-starboard
```

Potential future capabilities:

```text
camera
speaker
navigation light
presence receiver
```

### Port / Starboard Walk Deck

These are useful because they prove that areas do not need to be room-like.

They are legitimate spatial regions.

Potential capability classes:

```text
lighting
presence
camera
deck sensor
```

### Helm

This should be a particularly useful capability-dense area.

Suggested regions:

```text
region: console
region: overhead
region: operator
```

Suggested anchors:

```text
helm-console
helm-overhead
helm-port
helm-starboard
```

Future capabilities could include:

```text
MFD / telemetry
camera display
speaker
microphone
switching
navigation
presence
```

### Cockpit

Large open aft working area.

Suggested regions:

```text
region: deck
region: perimeter
region: transom
```

Suggested anchors:

```text
cockpit-center
cockpit-port
cockpit-starboard
transom-center
```

---

# 5. Level 3 — T-Top

I would model the T-Top as a **level**, not merely as a piece of support geometry.

That's intentional.

It occupies a meaningful elevated spatial plane and is an obvious mounting location for vessel capabilities.

```text
vessel.level.t-top
└── vessel.area.t-top-overhead
```

This gives us a beautiful test of our semantics because a level does not have to mean “habitable deck.”

It can represent a meaningful spatial elevation.

Suggested placement regions:

```text
region: upper-surface
region: underside
region: forward-edge
region: aft-edge
```

Suggested anchors:

```text
t-top-forward-center
t-top-aft-center
t-top-port
t-top-starboard
```

This is where things such as:

```text
thermal camera
fixed camera
radar
GPS antenna
satellite antenna
speaker
lighting
```

could eventually live.

---

# 6. Geometry requirements

The model should immediately read as a **large offshore center console**.

Minimum silhouette cues:

```text
pronounced bow
long open deck
central helm/console
T-top
large aft cockpit
outboard propulsion
```

No need for:

```text
seats
upholstery
rails
rod holders
cleats
electronics detail
realistic engines
manufacturer styling
textures
```

At Hey Chief viewport scale, those details contribute very little.

The target is:

> **recognizable in silhouette at a glance.**

---

# 7. Level and area representation

Preserve the Hatteras convention exactly.

### Level

Thin dimensional plane providing spatial extent/context.

### Area

Raised/rounded semantic panel associated with its parent level.

Conceptually:

```text
             T-TOP
        ┌─────────────┐
        │ T-TOP AREA  │
        └─────────────┘
              ↑

          MAIN DECK
┌──────────────────────────────┐
│ BOW                          │
│                              │
│ WALK    HELM         WALK    │
│                              │
│          COCKPIT             │
└──────────────────────────────┘
              ↑

          MACHINERY
┌──────────────────────────────┐
│ BILGE          OUTBOARDS     │
└──────────────────────────────┘
```

The viewer should require **no center-console-specific rendering logic** to produce this.

---

# 8. Spatial Structure

The existing manifest-derived viewer should naturally produce:

```text
Spatial Structure

Machinery
    Bilge / Machinery
    Outboard Machinery

Main Deck
    Bow
    Port Walk Deck
    Helm
    Starboard Walk Deck
    Cockpit

T-Top
    T-Top / Overhead
```

This is an important acceptance condition.

If we find ourselves writing something like:

```ts
if (modelId === "offshore-center-console")
```

in the viewer, stop.

That would mean the abstraction has failed.

---

# 9. Capability placement proof

Reuse the existing runtime-only capability mechanism.

For Slice 2, I would prove at least three placements:

```text
Thermal Camera
      ↓
T-Top / Overhead

Speaker
      ↓
Helm

Water Sensor
      ↓
Bilge / Machinery
```

These are particularly useful because they span all three levels:

```text
T-Top       → perception
Main Deck   → audio
Machinery   → sensor
```

That gives us a much stronger placement proof than three capabilities on one plane.

The current deterministic first-anchor behavior remains acceptable.

**Do not implement the future capability/anchor resolver in this slice.**

---

# 10. Runtime behavior

Selecting:

```text
T-Top / Overhead
```

should establish:

```text
Type: AREA
Level: T-Top
```

Selecting:

```text
Main Deck
```

should establish:

```text
Type: LEVEL
```

Selecting Helm should retain Main Deck as spatial context.

Isolation should preserve the hierarchy-aware behavior established in Slice 1.1.

No new camera choreography is required.

The existing snap/jump behavior is explicitly acceptable.

---

# 11. Vessel-profile validation

This slice should **exercise**, not substantially expand, the vessel profile.

The existing invariant remains:

```text
VESSEL
  └── LEVEL
       └── AREA
```

with:

- exactly one vessel;
- vessel is root-level;
- at least one level;
- levels parent directly to vessel;
- areas parent directly to levels;
- levels may legally contain zero areas.

Do not introduce assumptions such as:

```text
exactly four levels
level must represent a deck
every vessel has accommodation
every vessel has an engine room
```

Hull 2 exists partly to prove those would be incorrect assumptions.

---

# 12. Self-description / architecture requirement

No new realm or faculty should be necessary.

This is still:

```text
Realm:
Spatial Modeling

Faculty:
Spatial Representation
```

The new model should enter the existing spatial-model catalog through the same mechanism as Detroit and Hatteras.

The API should now expose at least:

```text
Spatial Model Catalog
│
├── Detroit Diesel 8V92TA
├── Hatteras 63 Motor Yacht
└── Offshore Center Console
```

Again, no vessel-specific API route.

---

# 13. Source organization

This is a good opportunity to exercise the source-model organization we established.

Target:

```text
models/
└── vessels/
    └── offshore-center-console/
        ├── model.json
        ├── semantic.manifest.json
        ├── geometry/
        │   └── offshore-center-console.glb
        └── sources/
```

If the current repository uses a slightly different canonical path after the preceding implementation, follow that existing pattern rather than creating a parallel one.

Generated acceptance fixtures remain separate from authored model source truth.

---

# 14. Tests

### Contract / validation

Prove the Center Console manifest:

- parses as `modelProfile: vessel`;
- satisfies vessel root invariant;
- has three levels;
- has areas correctly parented;
- uses the declared model placement coordinate frame;
- has valid representation bindings;
- has valid placement regions/anchors.

### API integration

Prove:

```text
GET model catalog
    → Detroit
    → Hatteras
    → Offshore Center Console
```

and that Center Console manifest + artifact can be retrieved through the existing generic model API.

### Viewer

Prove the Spatial Structure is derived from the manifest and contains the expected hierarchy.

### Runtime placement

Prove:

```text
Thermal Camera → T-Top
Speaker        → Helm
Water Sensor   → Bilge
```

without modifying the manifest.

### Browser

At minimum:

```text
load Offshore Center Console
select Main Deck
verify TYPE = LEVEL

select Helm
verify TYPE = AREA
verify LEVEL = Main Deck

place Speaker

select T-Top / Overhead
place Thermal Camera

select Bilge / Machinery
place Water Sensor

assert no browser console errors
```

---

# 15. Explicit non-goals

Slice 2 does **not** include:

- manufacturer-specific center-console fidelity;
- production-quality hull modeling;
- realistic outboard engines;
- capability compatibility/resolution engine;
- local coordinate frames;
- animated camera transitions;
- visual-theme convergence with Hey Chief;
- persistent configured installations;
- runtime ETR operational state;
- detailed equipment composition;
- detailed interior spaces;
- mobile integration.

Especially:

> **Do not polish the Spatial Model Explorer into a customer-facing surface.**

It remains our engineering instrument.

---

# 16. Acceptance criteria

I would call Slice 2 accepted when all of these are true:

1. Offshore Center Console is recognizable at normal viewer scale.
2. It uses the existing `modelProfile: vessel` contract without vessel-specific exceptions.
3. Its hierarchy is naturally represented as three levels with nested areas.
4. Level planes and child areas use the established Hatteras visual grammar.
5. Spatial Structure is entirely manifest-derived.
6. Level and area selection clearly communicate semantic type and parent context.
7. Thermal Camera can be placed on the T-Top.
8. Speaker can be placed at Helm.
9. Water Sensor can be placed in Bilge/Machinery.
10. Capability placements remain runtime/configuration state and do not mutate model truth.
11. Existing Detroit and Hatteras behavior remains green.
12. `pnpm check` passes.
13. `pnpm test:e2e` passes.
14. No Center Console-specific viewer/API architecture is introduced.

And I'd add one **human acceptance test**, because our Hatteras experience proved its value:

> Open the Center Console in the Spatial Model Explorer and ask: **“Without reading the hierarchy, does this immediately look like a center console—and after reading the hierarchy, does its spatial organization make sense?”**

If either answer is no, don't compensate with more code. Fix the model.

---

## What Slice 2 should teach us

Hatteras taught the system:

> **What is a vessel?**

The Center Console should teach it:

> **How different can another vessel be while still being represented by exactly the same spatial language?**

If this goes cleanly, **Hull 3 should become almost boring**.

And that would be a very good sign.
