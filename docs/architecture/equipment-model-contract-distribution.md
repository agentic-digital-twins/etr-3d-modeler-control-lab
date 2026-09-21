# Equipment Model Contract Distribution

## Canonical Owner

This repository owns the canonical equipment-model schemas, TypeScript types, fixtures, compatibility classification, and public exports in `@etr/equipment-model-contracts`.

The package is local-first and has no application, Blender, or runtime dependencies.

## Compatibility Classification

Every producer-to-consumer handoff is classified as exactly one of:

- `backward-compatible`: current consumers can remain unchanged.
- `coordinated`: identified consumers must update before or alongside producer rollout.
- `breaking`: requires an explicit transition and compatible deployment sequence.

The classification is never free text.

## Twin Crew Adoption

When `twin-crew-platform` consumes an equipment-model contract:

1. Validate and commit the canonical producer change here.
2. Record the producer commit, changed source files, fixture evidence, and compatibility classification.
3. Reconcile declarations into `twin-crew-platform/packages/shared-contracts`; preserve intentional consumer-only helpers.
4. Export the consumer copy from `@twin-crew/shared-contracts`.
5. Parse untrusted responses using the consumer runtime schema at the Twin Crew boundary.
6. Record source and destination hashes, intentional differences, fixture coverage, typecheck/test/build evidence, and deployment order in the consumer change.

Do not add a registry, tarball distribution, or automated source synchronization without a separate distribution decision. No feature-local interface may replace the shared contract.
