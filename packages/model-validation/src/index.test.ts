import { createHash } from "node:crypto"
import { cp, mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import { validateModel } from "./index.js"

const fixtureDirectory = join(
  import.meta.dirname,
  "../../../fixtures/equipment-models",
)
const fixtureManifest = join(
  fixtureDirectory,
  "dd-8v92ta-cylinder.manifest.json",
)
const fixtureArtifact = join(fixtureDirectory, "dd-8v92ta-cylinder.glb")
const hatterasFixtureDirectory = join(
  import.meta.dirname,
  "../../../fixtures/spatial-models",
)
const temporaryDirectories: string[] = []

async function createFixture(): Promise<{
  manifestPath: string
  artifactPath: string
}> {
  const directory = await mkdtemp(join(tmpdir(), "etr-model-validation-"))
  temporaryDirectories.push(directory)
  const manifestPath = join(directory, "dd-8v92ta-cylinder.glb.manifest.json")
  const artifactPath = join(directory, "dd-8v92ta-cylinder.glb")
  await cp(fixtureArtifact, artifactPath)
  const manifest = JSON.parse(
    await readFile(fixtureManifest, "utf8"),
  ) as Record<string, unknown>
  manifest.artifact = {
    ...(manifest.artifact as Record<string, unknown>),
    fileName: "dd-8v92ta-cylinder.glb",
  }
  await writeFile(manifestPath, JSON.stringify(manifest))
  return { manifestPath, artifactPath }
}

async function mutateManifest(
  manifestPath: string,
  mutate: (manifest: Record<string, any>) => void,
): Promise<void> {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<
    string,
    any
  >
  mutate(manifest)
  await writeFile(manifestPath, JSON.stringify(manifest))
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) =>
        import("node:fs/promises").then(({ rm }) =>
          rm(directory, { recursive: true, force: true }),
        ),
      ),
  )
})

describe("validateModel", () => {
  it("accepts the checked-in fixture", async () => {
    const { manifestPath, artifactPath } = await createFixture()
    await expect(
      validateModel(manifestPath, artifactPath),
    ).resolves.toMatchObject({ valid: true })
  })

  it("accepts the checked-in Hatteras vessel fixture", async () => {
    const report = await validateModel(
      join(hatterasFixtureDirectory, "hatteras-63-motor-yacht.manifest.json"),
      join(hatterasFixtureDirectory, "hatteras-63-motor-yacht.glb"),
    )

    expect(report).toMatchObject({ valid: true })
    if (report.valid) {
      expect(report.manifest.placementCoordinateFrame).toBe("model")
    }
  })

  it("rejects an unsupported placement coordinate frame", async () => {
    const { manifestPath, artifactPath } = await createFixture()
    await mutateManifest(manifestPath, (manifest) => {
      manifest.placementCoordinateFrame = "placement-region"
    })

    const report = await validateModel(manifestPath, artifactPath)

    expect(report).toMatchObject({ valid: false })
    if (!report.valid) {
      expect(report.errors).toContain('Invalid literal value, expected "model"')
    }
  })

  it("accepts multiple representation nodes, placement anchors, and model references", async () => {
    const { manifestPath, artifactPath } = await createFixture()
    await mutateManifest(manifestPath, (manifest) => {
      manifest.semanticNodes = [
        {
          ...manifest.semanticNodes[0],
          representation: { glbNodes: ["Cylinder_L1", "Piston_L1"] },
          spatial: {
            placementRegions: [
              {
                regionId: "service-surface",
                displayName: "Service surface",
                regionKind: "surface",
                transform: { position: [0, 0, 0] },
                dimensions: [1, 1, 1],
              },
            ],
            placementAnchors: [
              {
                anchorId: "service-center",
                displayName: "Service center",
                placementRegionId: "service-surface",
                transform: { position: [0, 0, 0] },
              },
            ],
          },
        },
      ]
      manifest.modelReferences = [
        {
          modelId: "sensor-model",
          instanceId: "sensor.service",
          parentSemanticId: "cylinder.l1",
          transform: { position: [0, 0, 0] },
        },
      ]
    })

    await expect(
      validateModel(manifestPath, artifactPath),
    ).resolves.toMatchObject({ valid: true })
  })

  it("rejects duplicate placement anchors within a semantic node", async () => {
    const { manifestPath, artifactPath } = await createFixture()
    await mutateManifest(manifestPath, (manifest) => {
      manifest.semanticNodes[0].spatial = {
        placementRegions: [],
        placementAnchors: [
          {
            anchorId: "overhead-center",
            displayName: "Overhead center",
            transform: { position: [0, 0, 0] },
          },
          {
            anchorId: "overhead-center",
            displayName: "Overhead center duplicate",
            transform: { position: [0, 1, 0] },
          },
        ],
      }
    })

    const report = await validateModel(manifestPath, artifactPath)

    expect(report).toMatchObject({ valid: false })
    if (!report.valid) {
      expect(report.errors).toContain(
        "Duplicate placement anchor: cylinder.l1 -> overhead-center",
      )
    }
  })

  it("rejects an artifact whose file name differs from the manifest", async () => {
    const { manifestPath, artifactPath } = await createFixture()
    await mutateManifest(manifestPath, (manifest) => {
      manifest.artifact.fileName = "other-artifact.glb"
    })

    const report = await validateModel(manifestPath, artifactPath)

    expect(report).toEqual({
      valid: false,
      errors: ["Artifact file name does not match the supplied artifact path."],
    })
  })

  it.each([
    [
      "invalid magic",
      "Artifact is not a GLB file.",
      (contents: Buffer) => contents.writeUInt32LE(0, 0),
    ],
    [
      "unsupported version",
      "GLB must use version 2.",
      (contents: Buffer) => contents.writeUInt32LE(1, 4),
    ],
    [
      "mismatched declared length",
      "GLB header length does not match artifact length.",
      (contents: Buffer) => contents.writeUInt32LE(contents.length + 4, 8),
    ],
    [
      "missing JSON chunk marker",
      "GLB is missing its JSON chunk.",
      (contents: Buffer) => contents.writeUInt32LE(0, 16),
    ],
    [
      "out-of-bounds JSON chunk",
      "GLB JSON chunk exceeds artifact bounds.",
      (contents: Buffer) => contents.writeUInt32LE(contents.length, 12),
    ],
  ])("rejects GLB with %s", async (_name, expectedError, mutateArtifact) => {
    const { manifestPath, artifactPath } = await createFixture()
    const artifactContents = await readFile(artifactPath)
    mutateArtifact(artifactContents)
    await writeFile(artifactPath, artifactContents)

    const report = await validateModel(manifestPath, artifactPath)

    expect(report).toMatchObject({ valid: false })
    if (!report.valid) {
      expect(report.errors).toContain(expectedError)
    }
  })

  it("rejects fingerprint mismatch, duplicate identities, and missing GLB nodes", async () => {
    const { manifestPath, artifactPath } = await createFixture()
    await mutateManifest(manifestPath, (manifest) => {
      manifest.artifact.contentFingerprint = "sha256:" + "0".repeat(64)
      manifest.semanticNodes.push({
        ...manifest.semanticNodes[0],
        semanticId: "piston.l2",
      })
      manifest.semanticNodes[1].representation.glbNodes = ["Absent_Node"]
    })
    const report = await validateModel(manifestPath, artifactPath)
    expect(report).toMatchObject({ valid: false })
    if (!report.valid) {
      expect(report.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("fingerprint"),
          expect.stringContaining("Duplicate GLB node binding"),
          expect.stringContaining("GLB node not found"),
        ]),
      )
    }
  })

  it("rejects invalid containment and lifecycle ordering", async () => {
    const { manifestPath, artifactPath } = await createFixture()
    await mutateManifest(manifestPath, (manifest) => {
      manifest.semanticNodes[0].parentSemanticId = "missing.semantic-node"
      manifest.semanticNodes[1].parentSemanticId = "piston.l1"
      manifest.generatedAt = "2026-09-20T00:00:00.000Z"
    })
    const report = await validateModel(manifestPath, artifactPath)
    expect(report).toMatchObject({ valid: false })
    if (!report.valid) {
      expect(report.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Parent semantic node not found"),
          expect.stringContaining("Semantic node cannot parent itself"),
          expect.stringContaining("Lifecycle timestamps"),
        ]),
      )
    }
  })

  it("rejects containment cycles and malformed GLB artifacts", async () => {
    const { manifestPath, artifactPath } = await createFixture()
    await mutateManifest(manifestPath, (manifest) => {
      manifest.semanticNodes[0].parentSemanticId = "piston.l1"
    })
    await writeFile(artifactPath, Buffer.from("not-a-glb"))
    const report = await validateModel(manifestPath, artifactPath)
    expect(report).toMatchObject({ valid: false })
    if (!report.valid) {
      expect(report.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("fingerprint"),
          expect.stringContaining("GLB is too short"),
          expect.stringContaining("Containment cycle"),
        ]),
      )
    }
  })
})
