import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { execFile } from "node:child_process"
import { promisify } from "node:util"

const execFileAsync = promisify(execFile)
const fixtureDirectory = resolve("fixtures/spatial-models")
const sourceDirectory = resolve("models/vessels/hatteras-63-motor-yacht")
const fixtureArtifactPath = resolve(fixtureDirectory, "hatteras-63-motor-yacht.glb")
const fixtureManifestPath = resolve(
  fixtureDirectory,
  "hatteras-63-motor-yacht.manifest.json",
)
const sourceArtifactPath = resolve(
  sourceDirectory,
  "geometry/hatteras-63-motor-yacht.glb",
)
const sourceManifestPath = resolve(sourceDirectory, "semantic.manifest.json")
const expectedFixtureArtifactHash =
  "870a5c3bff406555812fd33a6c1df7401e82c0d239f55a91c66382f58da9579c"
const expectedFixtureManifestHash =
  "3d858dcdf86aeb9d5efce6eddd5115e00be8966491ed9790d487232e54c7a96c"

function sha256(contents) {
  return createHash("sha256").update(contents).digest("hex")
}

function fail(message) {
  throw new Error(`Hatteras fixture regression: ${message}`)
}

await execFileAsync(process.execPath, ["scripts/generate-hatteras-fixture.mjs"])

const [
  fixtureArtifact,
  fixtureManifestContents,
  sourceArtifact,
  sourceManifestContents,
] = await Promise.all([
  readFile(fixtureArtifactPath),
  readFile(fixtureManifestPath),
  readFile(sourceArtifactPath),
  readFile(sourceManifestPath),
])

if (sha256(fixtureArtifact) !== expectedFixtureArtifactHash) {
  fail("prototype GLB geometry changed.")
}
if (sha256(fixtureManifestContents) !== expectedFixtureManifestHash) {
  fail("prototype semantic manifest changed.")
}
if (!fixtureArtifact.equals(sourceArtifact)) {
  fail("normalized source GLB differs from the prototype fixture.")
}

const fixtureManifest = JSON.parse(fixtureManifestContents)
const expectedSourceManifest = {
  ...fixtureManifest,
  modelId: "hatteras-63-motor-yacht",
  modelKind: "vessel",
  subject: {
    ...fixtureManifest.subject,
    subjectId: "vessel-model:hatteras-63-motor-yacht",
  },
  artifact: {
    ...fixtureManifest.artifact,
    artifactId: "hatteras-63-motor-yacht-fixture",
  },
}
const sourceManifest = JSON.parse(sourceManifestContents)

if (JSON.stringify(sourceManifest) !== JSON.stringify(expectedSourceManifest)) {
  fail("normalized source manifest drifted from the prototype fixture.")
}

console.log("Hatteras fixture regression: valid")
