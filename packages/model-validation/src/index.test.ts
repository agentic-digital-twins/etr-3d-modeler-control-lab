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

  it("rejects fingerprint mismatch, duplicate identities, and missing GLB nodes", async () => {
    const { manifestPath, artifactPath } = await createFixture()
    await mutateManifest(manifestPath, (manifest) => {
      manifest.artifact.contentFingerprint = "sha256:" + "0".repeat(64)
      manifest.components.push({
        ...manifest.components[0],
        componentId: "piston.l2",
      })
      manifest.components[1].glbNodeName = "Absent_Node"
    })
    const report = await validateModel(manifestPath, artifactPath)
    expect(report).toMatchObject({ valid: false })
    if (!report.valid) {
      expect(report.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("fingerprint"),
          expect.stringContaining("Duplicate glbNodeName"),
          expect.stringContaining("GLB node not found"),
        ]),
      )
    }
  })

  it("rejects invalid containment and lifecycle ordering", async () => {
    const { manifestPath, artifactPath } = await createFixture()
    await mutateManifest(manifestPath, (manifest) => {
      manifest.components[0].parentComponentId = "missing.component"
      manifest.components[1].parentComponentId = "piston.l1"
      manifest.generatedAt = "2026-09-20T00:00:00.000Z"
    })
    const report = await validateModel(manifestPath, artifactPath)
    expect(report).toMatchObject({ valid: false })
    if (!report.valid) {
      expect(report.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining("Parent component not found"),
          expect.stringContaining("Component cannot parent itself"),
          expect.stringContaining("Lifecycle timestamps"),
        ]),
      )
    }
  })

  it("rejects containment cycles and malformed GLB artifacts", async () => {
    const { manifestPath, artifactPath } = await createFixture()
    await mutateManifest(manifestPath, (manifest) => {
      manifest.components[0].parentComponentId = "piston.l1"
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
