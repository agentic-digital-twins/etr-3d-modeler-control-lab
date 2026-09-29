Yes, Partner. **I would clean this up before adding another hull.** After watching both clips and comparing them with the Crew Console exploded stack, I think the current viewer has exposed a modeling problem, not merely a presentation problem.

The PTZ/isolation behavior itself looks useful. The problem is that the geometry is not yet telling the same spatial story as the vessel.

### I think your revised stack is right

The Hatteras should be modeled as **four physical levels**, with areas contained by those levels:

```text
HATTERAS 63
│
├── LEVEL 4 — FLYBRIDGE
│   └── Flybridge
│
├── LEVEL 3 — MAIN DECK
│   ├── Bow / Foredeck
│   ├── Port Walk Deck
│   ├── Starboard Walk Deck
│   ├── Salon
│   └── Cockpit / Aft Deck
│
├── LEVEL 2 — ACCOMMODATION
│   ├── VIP Stateroom / Bow Stateroom
│   ├── Dinette
│   ├── Galley
│   ├── Guest Stateroom
│   ├── Master Stateroom
│   └── heads/showers as needed
│
└── LEVEL 1 — MACHINERY
    └── Engine Room
```

And I agree with your distinction between **Main Deck** and **Accommodation**.

They are spatially different elevations. Treating Salon, Galley, staterooms, etc. as though they occupy one generic interior slab is exactly the kind of shortcut that makes the exploded representation feel wrong.

### Main Deck needs the enclosing deck geometry you described

This is particularly important.

Right now we're effectively modeling:

```text
Bow     Salon     Cockpit
```

as isolated semantic blocks.

What we actually have is:

```text
               MAIN DECK
┌──────────────────────────────────────────────┐
│                                              │
│ Bow / Foredeck                              │
│                                              │
│ ┌───────┐     ┌─────────────┐    ┌────────┐ │
│ │ Port  │     │    Salon    │    │Cockpit │ │
│ │ Walk  │     │             │    │        │ │
│ │ Deck  │     │             │    │        │ │
│ └───────┘     └─────────────┘    └────────┘ │
│                                              │
│              Starboard Walk Deck            │
└──────────────────────────────────────────────┘
```

So **Main Deck is the level**, and Bow, walk decks, Salon and Cockpit are areas on/within it.

That is much closer to what your excellent Crew Console stack communicates.

### The three unidentified boxes are telling us something useful

I wouldn't hide them.

Those are evidence that we have representation geometry without adequate semantic binding.

That's precisely what this lab is supposed to catch.

Our desired invariant should now become:

> **Every intentionally visible vessel representation node must either resolve to a semantic node or be explicitly classified as non-semantic/support geometry.**

So instead of letting three anonymous pieces float around, the model should tell us:

```text
GLB NODE
   │
   ├── semantic representation
   │       → bound to semanticId
   │
   └── support representation
           → explicitly declared non-selectable
```

That is much better than simply saying “not every GLB node needs semantics,” because otherwise mystery geometry will accumulate as models get more sophisticated.

This also gives Awais a clean rule later.

---

## I would make the Crew Console stack our spatial reference

Not its exact graphics—the **spatial organization**.

The Crew Console already taught us something through use. Its four-level stack is understandable because you can immediately perceive:

```text
Flybridge
     ↑
Main Deck
     ↑
Accommodation
     ↑
Machinery
```

Then areas subdivide those levels.

I would bring that same mental model into `etr-3d-modeler-control-lab`.

And there's a nice architectural payoff: we're not inventing a marketing-only representation. The modeler and Crew Console will both be projections of the **same vessel spatial semantics**.

```text
                  VESSEL SPATIAL MODEL
                           │
             ┌─────────────┴─────────────┐
             │                           │
     MODELER / DESIGN TIME       CREW CONSOLE / RUNTIME
             │                           │
       model geometry              operational state
       semantic binding            presence
       placement anchors           alerts
       model inspection            history
```

That's exactly where I want us.

### I would also change the viewer slightly

Don't make the Area buttons a manually curated subset anymore.

Once the manifest has the hierarchy, the viewer should derive navigation from it:

```text
LEVEL
  Flybridge
  Main Deck
  Accommodation
  Machinery

AREA
  <areas belonging to selected level>
```

So selecting:

**Accommodation**

could expose:

`VIP | Dinette | Galley | Guest | Master`

Selecting:

**Main Deck**

could expose:

`Bow | Port Walk | Salon | Starboard Walk | Cockpit`

Then **Isolate** can work at either semantic scope:

```text
Isolate Main Deck
        ↓
entire level visible

Isolate Salon
        ↓
only Salon representation emphasized

Show All
        ↓
complete vessel
```

That will feel much closer to the clarity of the Crew Console stack.

---

# I would make this a small corrective slice

Before Center Console, I'd do something like:

**Phase 2 Slice 1.1 — Hatteras Spatial Hierarchy & Representation Convergence**

Scope:

1. Establish the canonical four-level Hatteras hierarchy: Machinery, Accommodation, Main Deck, Flybridge.
2. Add the missing Accommodation areas you identified.
3. Make Main Deck the containing level for Bow/Foredeck, port/starboard walk decks, Salon and Cockpit/Aft Deck.
4. Reconcile every visible GLB node with either a semantic representation binding or explicit support/non-semantic classification.
5. Derive viewer Level/Area navigation from the manifest rather than a hand-selected area list.
6. Preserve PTZ, isolate, highlighting and runtime capability placement.
7. Add acceptance proving **Level → Area → Representation → Placement** correspondence.
8. Compare the resulting exploded hierarchy against Crew Console's four-level spatial organization.

I would **not** make it prettier yet.

First make this spatially correct.

Because once it is correct, the four hulls become variations on a pattern:

```text
VESSEL
  ↓
LEVELS
  ↓
AREAS
  ↓
REPRESENTATION
  ↓
PLACEMENT SEMANTICS
```

Then the Center Console may only have two levels. Sportfish might have three. Superyacht might have five or six. That's fine—the architecture doesn't care.

And I think this answers another question we've been circling: **yes, the vessel model needs profile-specific invariants now.** The Hatteras has supplied the evidence we said we'd wait for.

At minimum, `modelProfile: vessel` now knows about:

**vessel → level → area**

That's no longer speculative architecture. We've encountered the requirement in the first real vessel.

So I agree with your instinct completely: **don't continue manufacturing hulls yet. Get Hatteras clean enough that when we look at it, we recognize the same spatial truth that Crew Console already understands.** Then use that as the template for every vessel after it.
