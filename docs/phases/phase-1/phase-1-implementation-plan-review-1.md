Partner, I read the plan closely. **The engineering scaffold is good, but as a standard for creating a new ETR lab, it begins one layer too low.** Right now it answers, “How do we build `etr-3d-modeler-control-lab`?” very well. I think we want Phase A Slice 1 to answer the more durable question:

> **How does AiGDC deliberately introduce a new capability/repository into our system?**

That could become reusable for Marine, IPP, or something we haven't anticipated.

The plan already gets several important things right. It establishes a deliberately small lab rather than importing the entire `twin-crew-platform`; it keeps Blender/Python out of the runtime; and it separates contracts, validation, API, viewer and generated artifacts. I especially like that `models/` is explicitly an artifact boundary and the viewer cannot depend on Blender at runtime.

The contracts are also unusually mature for a brand-new experiment: identity, subject identity, generator provenance and four distinct lifecycle timestamps are present from the beginning. And the validator makes those semantics enforceable rather than documentary, including GLB-node resolution and timestamp ordering.

So I would **preserve almost all of the implementation plan**. My changes are primarily above and around it.

## I think we're missing an AiGDC Repository Genesis step

Before:

```text
pnpm
Turbo
React
Express
contracts
viewer
```

there should be something like:

```text
              AiGDC
                │
                ▼
        PURPOSE / WHY EXIST?
                │
                ▼
       SYSTEM BOUNDARY DECISION
                │
         ┌──────┴──────┐
         │             │
     existing       new boundary
       repo              │
                         ▼
                       LAB?
                         │
                         ▼
                REPOSITORY GENESIS
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      identity       architecture    contracts
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                    scaffold
                         │
                         ▼
                  implementation
                         │
                         ▼
                     evidence
                         │
                         ▼
                    acceptance
```

That's the process I think is worth institutionalizing.

### Start Phase A Slice 1 with a Repository Charter

I'd add something like:

`docs/architecture/repository-charter.md`

And make it short and highly structured rather than another prose design document.

For this repo:

```text
Repository
  etr-3d-modeler-control-lab

Purpose
  Explore and prove deterministic, semantically structured,
  web-ready 3D equipment model generation.

Why it exists inside Chief
  Chief needs equipment representations that can be identified,
  explored, instrumented and related to real-world evidence.

Boundary
  Design-time/workbench capability.
  Not an ETR runtime service.

Owns
  equipment-model generation experiments
  equipment-model semantic contracts
  model validation
  model inspection workbench

Does not own
  vessel runtime state
  telemetry truth
  alert lifecycle
  maintenance truth
  Chief decision authority
  equipment operational state

First customer
  Detroit Diesel 8V92TA Equipment Explorer

Future plausible customers
  marine equipment
  IPP equipment

Promotion condition
  Proven shared consumer or runtime requirement.
```

That last pair is important. A lab should explain **how something graduates from being a lab**.

Otherwise five years from now we have twenty-seven `*-control-lab` repositories and nobody knows which are experiments and which became architecture.

## I would also make the self-description mandatory in Slice 1

This is the biggest omission relative to what we've learned in Phase N.

The current documentation calls for `model-contract-boundaries.md` and the cylinder prototype document. Good—but **the repo itself should describe its architectural existence in machine-readable form.**

Something along the lines of:

```yaml
repositoryId: etr-3d-modeler-control-lab
repositoryKind: control-lab

purpose:
  capability: semantic-equipment-model-generation
  statement: >
    Generate and validate semantically structured,
    web-ready equipment models.

architecture:
  realm: equipment-modeling
  faculty: spatial-modeling
  maturity: experimental

boundaries:
  owns:
    - equipment-model-generation
    - equipment-model-validation
    - equipment-model-inspection
  doesNotOwn:
    - operational-equipment-state
    - telemetry-truth
    - alert-lifecycle
    - runtime-authority

subjects:
  - subjectKind: equipment-model

integrations:
  current: []
  planned:
    - equipment-explorer

lifecycle:
  introducedIn: phase-a-slice-1
```

I'm not attached to those exact field names yet.

I **am** attached to the requirement.

Then our architecture tooling can eventually discover this lab rather than somebody manually adding a card to Control Assets.

That is the system-defining-itself pattern showing up at repository birth.

## Shared contracts: one adjustment

The plan currently says:

> `@etr/equipment-model-contracts` is the **only shared semantic source of truth for Phase 1**.

I agree within this repository.

But I'd explicitly record:

> **Local-first, promotion-ready.**

Don't put `EquipmentModelManifest` into `etr-core` yet.

But require the package to have **no application dependencies** and design it so that when Equipment Explorer becomes an external consumer we can promote/extract it without redesigning the contract.

That's an AiGDC decision worth capturing:

```text
1 consumer  → local contract
2 consumers → evaluate shared ownership
cross-domain → identify canonical owner
runtime truth → ETR ownership rules apply
```

Not an absolute mathematical rule, but a useful decision trigger.

## I would strengthen provenance slightly

Your timestamp work is already excellent. The plan requires `createdAt`, `generatedAt`, `exportedAt`, and `validatedAt`, and validation ensures valid ISO-8601 values in nondecreasing order.

I'd add artifact identity now:

```text
artifactId
artifactVersion
contentFingerprint
```

Possibly:

```text
generator:
  name
  version
  sourceRevision
```

Then when we generate:

```text
detroit-8v92ta-cylinder-v003.glb
```

we can prove precisely what manifest describes precisely what geometry.

We've learned repeatedly that **“this probably belongs to that” isn't sufficient evidence**.

A SHA-256 fingerprint costs essentially nothing and gives us durable identity.

## One thing in the implementation sequence bothers me

The plan currently doesn't introduce the Detroit Diesel prototype manifest until step 7, after contracts, validator, API, viewer and browser tests have been implemented.

I'd invert a little of that.

Not the actual Blender cylinder—just the **semantic exemplar**.

I'd go:

```text
Repository Charter
        ↓
Self Description
        ↓
Contract
        ↓
8V92TA exemplar manifest
        ↓
Validator
        ↓
tiny fixture GLB
        ↓
API
        ↓
Viewer
```

Why?

Because the contract should emerge from **one concrete subject**, not from abstract anticipation.

Our cylinder exemplar puts pressure on the contract immediately:

> Can I express a piston?

> Can I express that it belongs to Cylinder L1?

> Can I say it is selectable?

> Can I bind it to a GLB node?

> Can I distinguish model identity from component identity?

That's AiGDC operating inside the implementation.

## I'd make the acceptance criteria include architectural acceptance

Currently acceptance is almost entirely technical: clean install, API behavior, manifest/node validation, browser operation and automated tests.

Keep all of it.

Add:

```text
Architecture acceptance

□ Repository purpose declared
□ "Why does this exist inside Chief?" answered
□ Ownership boundary declared
□ Non-ownership boundary declared
□ Realm/faculty relationship declared
□ Subjects declared
□ Contracts have explicit ownership
□ Promotion/graduation criteria declared
□ Self-description validates
□ Artifact provenance validates
□ No undeclared ETR runtime dependency introduced
```

Now **`pnpm check` proves more than code correctness.**

Eventually:

```text
pnpm check
```

could include:

```text
✓ repository charter
✓ architecture self-description
✓ contract schemas
✓ artifact provenance
✓ model validation
✓ typecheck
✓ unit tests
✓ integration tests

AiGDC repository acceptance: PASS
```

That would make me very happy.

## And I think this becomes an AiGDC primitive

I wouldn't call it specifically the "lab creation process."

I'd call it something broader, perhaps:

**AiGDC Repository Genesis**

because sometimes the answer to the process should be:

> **Don't create a repository. This capability belongs in an existing boundary.**

That's important.

So Repository Genesis starts with a decision gate:

```text
New capability
     │
     ▼
What is its purpose?
     │
     ▼
Where does this truth/capability belong?
     │
 ┌───┴───────────────┐
 ▼                   ▼
existing boundary   genuinely new boundary
 │                   │
 ▼                   ▼
extend it          repo kind?
                    │
              ┌─────┼──────┐
              ▼     ▼      ▼
             lab  service library
```

Only after that does scaffolding happen.

That keeps Conway's Law from slowly designing Chief for us.

---

So my review result is: **don't rewrite this plan. Promote it.**

The engineering portion from lines 60 onward is already a very good **Repository Scaffold implementation specification**.

Put an **AiGDC Repository Genesis layer in front of it**, add machine-readable self-description, artifact fingerprint/provenance, move the semantic exemplar earlier, and expand acceptance to include architectural correctness.

Then Phase A Slice 1 isn't merely:

> _We created `etr-3d-modeler-control-lab`._

It becomes:

> **We established the standard way AiGDC introduces a new architectural boundary into Chief.**

That's worth doing now even if Marine never needs another lab—because when we walk into IPP, we won't be starting over.
