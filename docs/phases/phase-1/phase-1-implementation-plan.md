# Phase A Implementation Plan: Repository Genesis and Scaffold

## Decision

This repository can support the intended 3D Equipment Explorer workbench without Docker, a database, an event bus, or the full `twin-crew-platform` architecture.

Phase A establishes an AiGDC Repository Genesis pattern before it establishes application code: decide whether a capability belongs in an existing boundary; when it does not, declare the new boundary's purpose, ownership, contracts, evidence, and promotion conditions before scaffolding it.

For this capability, the decision is a new control-lab boundary. It is a design-time workbench for deterministic, semantically structured, web-ready equipment models, not an ETR runtime service.

Use `smart-plug-control-lab` as the structural reference:

- pnpm workspace monorepo with Turbo task orchestration
- a Vite/React browser application in `apps/`
- a small Express/TypeScript API in `apps/`
- local workspace packages for contracts and reusable model tooling

Keep the initial scope smaller than that lab: the first scaffold needs a viewer app and a model API only. A generator worker, runtime integrations, and deployment configuration should be added only when a real boundary requires them.

`presence-fabric-lab` validates the basic monorepo convention but does not provide the browser-app/API pairing needed here. `speech-io-control-lab` is useful as a later source of validation and fixture discipline, but its Docker and worker infrastructure are deliberately out of scope.

## Repository Genesis

### Charter and Self-Description

Before application packages are created, add the following repository-level evidence:

- `docs/architecture/repository-charter.md`: a concise, structured human-readable charter
- `architecture/repository.yaml`: the corresponding machine-readable architectural self-description
- `packages/repository-architecture`: schema and validator for the self-description, unless an established AiGDC architecture package becomes available before implementation

The charter and self-description must declare:

```text
repositoryId: etr-3d-modeler-control-lab
repositoryKind: control-lab
realm: equipment-modeling
faculty: spatial-modeling
maturity: experimental
capability: semantic-equipment-model-generation

owns:
  equipment-model generation experiments
  equipment-model semantic contracts
  model validation
  model inspection workbench

doesNotOwn:
  vessel or equipment operational state
  telemetry truth
  alert lifecycle
  maintenance truth
  Chief decision authority

subjectKind: equipment-model
firstCustomer: Detroit Diesel 8V92TA Equipment Explorer
plannedIntegration: equipment-explorer
promotionCondition: proven shared consumer or runtime requirement
```

The charter must also include a short `Boundary Decision` section that records why this capability received a new repository rather than being added to an existing one:

```text
considered: twin-crew-platform, existing ETR labs, etr-core/shared library, new control lab
decision: new control lab
reason: design-time experimental capability; model-generation concerns are outside runtime;
  reusable beyond Marine; independently promotable when proven
decisionDate: <ISO 8601 date>
decisionPhase: Phase A / Slice 1
```

The self-description must be schema-validated in `pnpm check`. It is a declaration of the lab's architectural place, not runtime configuration and not a substitute for an ETR runtime ownership decision.

### Contract Ownership and Distribution

`@etr/equipment-model-contracts` is the canonical producer package for equipment-model schema, types, fixtures, and compatibility classification. It is local-first and promotion-ready: it has no application dependencies and must remain separable from the viewer, API, Blender, and runtime integrations.

The initial local consumer is this repository. When `twin-crew-platform` adopts an equipment-model contract, follow the established shared-contract distribution pattern:

1. Change and validate the canonical producer contract and public exports here.
2. Classify compatibility as `backward-compatible`, `coordinated`, or `breaking`; record the producer commit, changed source files, and fixture evidence.
3. Reconcile the shared declarations into `twin-crew-platform/packages/shared-contracts`; do not create route-local interfaces or overwrite consumer-specific helpers blindly.
4. Export the consumer copy from `@twin-crew/shared-contracts` and parse untrusted API responses with its runtime schema at the Twin Crew boundary.
5. Record source and destination hashes, intentional differences, consumer fixture coverage, typecheck/test/build evidence, and coordinated deployment order in the consumer change.

Do not configure a registry, vendored tarball, or automated synchronization mechanism without a separate contract-distribution decision. The fact that a model artifact is consumed across repositories does not itself require shared TypeScript source; HTTP/GLB/manifest consumers remain contract-aware through documented wire boundaries and fixtures.

The compatibility classification is a required enum in contract-distribution handoff evidence, never free text. `backward-compatible` permits existing consumers to remain unchanged; `coordinated` requires identified consumers to update before or with producer rollout; `breaking` requires an explicit transition and compatible deployment sequence.

The promotion trigger is a decision aid rather than an automatic rule:

```text
one consumer: local canonical contract
two consumers: evaluate shared ownership and synchronization scope
cross-domain consumer: identify the canonical schema owner and boundary adapter
runtime truth: apply ETR runtime ownership rules
```

## Target Layout

```text
etr-3d-modeler-control-lab/
  apps/
    equipment-viewer/
      src/
        app/
        features/model-viewer/
        features/selection/
        test/
      public/models/
    model-api/
      src/
      test/
  packages/
    repository-architecture/
      src/
      test/
    equipment-model-contracts/
      src/
      test/
    model-validation/
      src/
      test/
  models/
    detroit-diesel-8v92ta/
      references/
      scripts/
      exports/
      manifest/
  fixtures/
    equipment-models/
  docs/
    architecture/
    modeling/
  architecture/
    repository.yaml
  scripts/
  package.json
  pnpm-workspace.yaml
  turbo.json
  tsconfig.base.json
```

`models/` holds generated and source-controlled modeling artifacts, separate from application code. The viewer consumes exported assets and manifests; it must not depend on Blender or Python at runtime.

## Scaffold Deliverables

### 1. Root Workspace

Create the pnpm/Turbo workspace configuration, a shared strict TypeScript base configuration, `.gitignore`, `.env.example`, and root scripts:

```text
dev
build
lint
typecheck
test
test:unit
test:integration
test:e2e
check
```

`check` must run formatting/linting, type checking, unit tests, and integration tests. Browser tests remain separately runnable so the developer loop stays quick.

Use pnpm 10 unless the environment requires the pnpm 9 convention used by the other labs. Pin the version in `packageManager` and commit the lockfile.

### 2. Equipment Model Contracts Package

Create `@etr/equipment-model-contracts` as the canonical, application-independent semantic source of truth for Phase A. It is a local workspace package in this repository; it must not claim that Twin Crew has adopted it until that repository has completed an explicit synchronization change.

Define versioned schemas and TypeScript types for:

- `EquipmentModelManifest`
- `EquipmentComponent`
- `ModelArtifact`
- `InstrumentationBinding`
- `ValidationReport`

The minimum model identity and provenance fields are:

```text
modelId, modelKind, modelVersion
subjectId, subjectKind
artifactId, artifactVersion, contentFingerprint
generator.name, generator.version, generator.sourceRevision
sourceReferences[].referenceId, kind, title, revision, locator, acquiredAt, role
createdAt, generatedAt, exportedAt, validatedAt
```

`contentFingerprint` is the SHA-256 identity of the exported artifact. The manifest must identify the exact GLB it describes, rather than merely a filename expected to match.

`generator` provenance answers what produced the artifact. `sourceReferences` records the engineering evidence that informed the representation, such as a service manual, drawing, measured dimension, photograph, manufacturer specification, operator measurement, or reference mesh. It is optional for the earliest fixture but its shape and provenance semantics are part of the Phase A contract.

Each component must have stable `componentId`, `componentKind`, `semanticRole`, `displayName`, optional `parentComponentId`, and a required GLB node reference. Capability and future-Chief binding fields are allowed but empty by default. The package must provide both TypeScript/Zod runtime schemas and emitted JSON Schemas so cross-repository consumers can validate wire data without re-declaring the contract.

Publish JSON Schema files from this package as build artifacts. Validate the schemas and representative valid/invalid manifests in package tests.

### 3. Model Validation Package

Create `@etr/model-validation` to validate an exported GLB and its manifest without coupling to the viewer.

Phase A validation rules:

- manifest conforms to the contract schema
- `modelId` and artifact version match
- every required component points to exactly one GLB node
- no duplicate component IDs or node references
- coordinate-frame and unit declarations are present
- generated/exported/validated timestamps are valid ISO 8601 values and in nondecreasing order
- artifact SHA-256 matches `contentFingerprint`
- generator source revision and artifact identity are declared

Expose the validator as both a library function and a small CLI invoked by a root script. Use checked-in fixture manifests and a tiny GLB fixture to make the validation suite deterministic.

### 4. Model API Application

Create `apps/model-api` with Express and TypeScript. It serves local model catalog metadata and validation reports; it does not generate models or require a database.

Initial endpoints:

```text
GET /health
GET /api/models
GET /api/models/:modelId
GET /api/models/:modelId/manifest
GET /api/models/:modelId/validation
```

Serve only known model artifacts from the repository's model export directory. Validate manifest data and artifact fingerprint at process startup and fail clearly for invalid development fixtures. This API is a local workbench boundary in Phase A; it is not an ETR runtime integration contract.

Write API integration tests using an in-process app instance, covering success, missing-model, invalid-manifest, and health behavior. Add OpenAPI only after the first external consumer needs it.

### 5. Equipment Viewer Application

Create `apps/equipment-viewer` with React, Vite, TypeScript, Three.js, and React Three Fiber. Start with the actual workbench rather than a marketing screen.

The initial viewer shell includes:

- a stable full-window 3D canvas
- model catalog selection backed by the API
- orbit, pan, zoom, and reset-camera controls
- click selection mapped from GLB node name to manifest `componentId`
- selected-component details panel from the manifest
- isolate, show-all, and reset commands
- loading, empty, unavailable-API, and asset-validation-error states

The first rendered fixture can be a deliberately simple semantic cylinder assembly, not the high-polygon installed engine. The viewer must be able to load a later optimized GLB without changing its component-selection contract.

Use a light, workbench-oriented visual language and responsive layout. Do not add animation, sectioning, x-ray mode, live telemetry, or Chief integration in this scaffold phase.

### 6. Testing Strategy

Make testing a scaffold requirement, not follow-up work:

| Layer                   | Tooling                        | Required Phase 1 coverage                                                            |
| ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------ |
| Repository architecture | Vitest                         | charter/self-description schema, required ownership, and no-runtime-dependency rules |
| Contracts and validator | Vitest                         | schema rules, ID/node matching, timestamp ordering                                   |
| API                     | Vitest + Supertest             | all initial routes and error cases                                                   |
| Viewer logic            | Vitest + React Testing Library | catalog, selection state, error states, command enablement                           |
| Browser workflow        | Playwright                     | load fixture, select component, isolate, reset, report browser console errors        |
| 3D rendering smoke test | Playwright                     | canvas is nonblank and expected fixture nodes render                                 |

Mock WebGL only in component-level tests. Run the real canvas check in Chromium for the end-to-end test, and save a screenshot only on failure or explicit review runs.

### 7. Developer Experience and Documentation

Add a concise README covering prerequisites, install, local development, validation commands, and the artifact boundary. Add the following architecture and modeling documents:

- `docs/architecture/repository-charter.md`: purpose, Chief rationale, ownership, non-ownership, first customer, and promotion criteria
- `docs/architecture/model-contract-boundaries.md`: generator, artifact, manifest, validator, API, and viewer responsibilities
- `docs/architecture/equipment-model-contract-distribution.md`: canonical ownership, enum-based compatibility rules, and Twin Crew synchronization handoff record
- `docs/modeling/detroit-8v92ta-cylinder-prototype.md`: first semantic hierarchy, coordinates, units, and non-goals

Provide a `scripts/dev` entry point only if one command can reliably start both applications. Otherwise document two explicit commands; avoid platform-specific shell behavior.

## Implementation Sequence

1. Add the repository charter, machine-readable self-description, its schema/validator, and architectural acceptance check.
2. Add root pnpm/Turbo/TypeScript configuration and empty workspace packages/apps that typecheck.
3. Implement the application-independent contract package, including schemas, types, source-reference and generator provenance, fixture rules, and a declared producer/consumer distribution procedure with enum-based compatibility classification.
4. Create the Detroit Diesel 92-series semantic exemplar manifest before generating geometry; prove it can express component identity, containment, capabilities, node bindings, and provenance.
5. Implement the validation package and CLI; prove it against valid and invalid manifests, including the exemplar and fingerprint mismatch cases.
6. Add a tiny exported GLB fixture with a matching SHA-256 fingerprint; prove the validator resolves the exemplar's component identities to GLB nodes.
7. Implement the API and its integration tests against the validated fixture catalog.
8. Implement the viewer's API-backed catalog, semantic selection, and visibility commands.
9. Add Playwright browser coverage, including a nonblank canvas assertion.
10. Make `pnpm check` and `pnpm test:e2e` pass from a clean install, then document the verified commands.

## Phase A Acceptance Criteria

- `pnpm install` followed by `pnpm check` succeeds on a clean checkout.
- The repository charter and machine-readable self-description validate, declare the ownership and non-ownership boundary, and introduce no undeclared ETR runtime dependency.
- The repository charter records the considered boundaries, new-control-lab decision, reason, date, and Phase A / Slice 1 context.
- The self-description declares the equipment-modeling realm, spatial-modeling faculty, equipment-model subject, first customer, and promotion condition.
- The contract package has canonical ownership, no application dependencies, separate generator and source-reference provenance, an enum-based compatibility classification, and a documented Twin Crew synchronization procedure.
- The API exposes one valid fixture model and rejects unknown IDs predictably.
- The validator confirms every manifest component resolves to a GLB node and every GLB matches its declared artifact fingerprint.
- The browser viewer loads the fixture through the API, renders a nonblank canvas, and supports select, isolate, show-all, and reset.
- Automated unit, API integration, viewer interaction, and Chromium end-to-end coverage runs from documented commands.
- No Docker, database, queue, external ETR service, or Blender dependency is required to develop or test the scaffold.

## Deferred Deliberately

- Blender execution and procedural generation tooling
- full eight-cylinder mechanical model
- installed high-detail engine asset optimization
- mechanical animation drivers and crank-angle simulation
- x-ray, clipping/section planes, exploded views, and flow overlays
- Chief/ETR telemetry, alert, maintenance, documentation, and spatial bindings
- remote artifact storage, authentication, deployment, or containerization

These remain compatible with the contract shape but should follow only after the semantic cylinder-to-GLB-to-viewer path is proven.
