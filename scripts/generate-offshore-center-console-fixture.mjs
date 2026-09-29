import { createHash } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const fixtureDirectory = resolve("fixtures/spatial-models")
const sourceDirectory = resolve("models/vessels/offshore-center-console")
const artifactFileName = "offshore-center-console.glb"
const positions = new Float32Array([
  -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5,
  -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
])
const indices = new Uint16Array([
  0, 1, 2, 0, 2, 3, 4, 6, 5, 4, 7, 6, 0, 4, 5, 0, 5, 1, 1, 5, 6, 1, 6, 2, 2, 6,
  7, 2, 7, 3, 4, 0, 3, 4, 3, 7,
])
const binary = Buffer.concat([
  Buffer.from(positions.buffer),
  Buffer.from(indices.buffer),
])
const nodes = [
  ["CenterConsoleHull", [4.8, 0.65, 1.75], [0, 1.35, 0]],
  ["CenterConsoleHullBow", [2.6, 0.4, 1.35], [0, 1.7, 3.25]],
  ["CenterConsoleMachineryLevel", [2.4, 0.12, 1.1], [0, 0.25, -1.45]],
  ["CenterConsoleBilgeMachinery", [1.45, 0.32, 0.9], [0, 0.65, -1.45]],
  ["CenterConsoleOutboardPortOuter", [0.28, 0.7, 0.25], [-1.35, 0.65, -4.55]],
  ["CenterConsoleOutboardPortInner", [0.28, 0.7, 0.25], [-0.45, 0.65, -4.55]],
  [
    "CenterConsoleOutboardStarboardInner",
    [0.28, 0.7, 0.25],
    [0.45, 0.65, -4.55],
  ],
  [
    "CenterConsoleOutboardStarboardOuter",
    [0.28, 0.7, 0.25],
    [1.35, 0.65, -4.55],
  ],
  ["CenterConsoleMainDeck", [4.8, 0.16, 1.65], [0, 2.2, 0]],
  ["CenterConsoleBow", [2.25, 0.28, 1.15], [0, 2.5, 3.15]],
  ["CenterConsolePortWalkDeck", [0.45, 0.22, 3.35], [-3.35, 2.45, 0.15]],
  ["CenterConsoleHelm", [1.15, 0.75, 0.85], [0, 2.9, 0.15]],
  ["CenterConsoleStarboardWalkDeck", [0.45, 0.22, 3.35], [3.35, 2.45, 0.15]],
  ["CenterConsoleCockpit", [2.7, 0.28, 1.3], [0, 2.5, -3.1]],
  ["CenterConsoleTTopLevel", [1.95, 0.12, 1.25], [0, 4.05, 0.1]],
  ["CenterConsoleTTopOverhead", [1.65, 0.18, 1.05], [0, 4.25, 0.1]],
].map(([name, scale, translation]) => ({ name, mesh: 0, scale, translation }))

const document = {
  asset: {
    version: "2.0",
    generator: "phase-2-center-console-fixture-generator",
  },
  scene: 0,
  scenes: [{ nodes: nodes.map((_, index) => index) }],
  nodes,
  meshes: [
    { primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 0 }] },
  ],
  materials: [
    {
      pbrMetallicRoughness: {
        baseColorFactor: [0.2, 0.52, 0.6, 1],
        metallicFactor: 0.15,
        roughnessFactor: 0.45,
      },
    },
  ],
  buffers: [{ byteLength: binary.length }],
  bufferViews: [
    {
      buffer: 0,
      byteOffset: 0,
      byteLength: positions.byteLength,
      target: 34962,
    },
    {
      buffer: 0,
      byteOffset: positions.byteLength,
      byteLength: indices.byteLength,
      target: 34963,
    },
  ],
  accessors: [
    {
      bufferView: 0,
      componentType: 5126,
      count: 8,
      type: "VEC3",
      min: [-0.5, -0.5, -0.5],
      max: [0.5, 0.5, 0.5],
    },
    {
      bufferView: 1,
      componentType: 5123,
      count: indices.length,
      type: "SCALAR",
    },
  ],
}
const json = Buffer.from(JSON.stringify(document))
const paddedJson = Buffer.concat([
  json,
  Buffer.alloc((4 - (json.length % 4)) % 4, 0x20),
])
const paddedBinary = Buffer.concat([
  binary,
  Buffer.alloc((4 - (binary.length % 4)) % 4),
])
const header = Buffer.alloc(12)
header.writeUInt32LE(0x46546c67, 0)
header.writeUInt32LE(2, 4)
header.writeUInt32LE(12 + 8 + paddedJson.length + 8 + paddedBinary.length, 8)
const jsonHeader = Buffer.alloc(8)
jsonHeader.writeUInt32LE(paddedJson.length, 0)
jsonHeader.writeUInt32LE(0x4e4f534a, 4)
const binaryHeader = Buffer.alloc(8)
binaryHeader.writeUInt32LE(paddedBinary.length, 0)
binaryHeader.writeUInt32LE(0x004e4942, 4)
const artifact = Buffer.concat([
  header,
  jsonHeader,
  paddedJson,
  binaryHeader,
  paddedBinary,
])

const region = (regionId, displayName, position, dimensions) => ({
  regionId,
  displayName,
  regionKind: "placement-volume",
  transform: { position },
  dimensions,
})
const anchor = (anchorId, displayName, position, placementRegionId) => ({
  anchorId,
  displayName,
  transform: { position },
  placementRegionId,
})
const area = (
  semanticId,
  displayName,
  glbNodes,
  parentSemanticId,
  placementRegions,
  placementAnchors,
) => ({
  semanticId,
  semanticKind: "area",
  semanticRole: "vessel-area",
  displayName,
  parentSemanticId,
  representation: { glbNodes },
  interactionCapabilities: ["selectable", "highlightable"],
  spatial: { placementRegions, placementAnchors },
})
const level = (semanticId, semanticRole, displayName, glbNodeName) => ({
  semanticId,
  semanticKind: "level",
  semanticRole,
  displayName,
  parentSemanticId: "vessel.offshore-center-console",
  representation: { glbNodes: [glbNodeName] },
  interactionCapabilities: ["selectable", "highlightable", "isolatable"],
})
const standardArea = (
  semanticId,
  displayName,
  glbNodeName,
  parentSemanticId,
  position,
  dimensions,
) =>
  area(
    semanticId,
    displayName,
    [glbNodeName],
    parentSemanticId,
    [region("placement", `${displayName} placement`, position, dimensions)],
    [anchor("default", `${displayName} default`, position, "placement")],
  )

const manifest = {
  modelId: "offshore-center-console",
  modelKind: "vessel",
  modelProfile: "vessel",
  modelVersion: "0.1.0",
  subject: {
    subjectId: "vessel-model:offshore-center-console",
    subjectKind: "vessel-model",
  },
  artifact: {
    artifactId: "offshore-center-console-fixture",
    artifactVersion: "0.1.0",
    fileName: artifactFileName,
    contentFingerprint: `sha256:${createHash("sha256").update(artifact).digest("hex")}`,
  },
  generator: {
    name: "phase-2-center-console-fixture-generator",
    version: "0.1.0",
    sourceRevision: "phase-2-slice-2",
  },
  sourceReferences: [],
  coordinateFrame: "right-handed-y-up",
  placementCoordinateFrame: "model",
  units: "meters",
  createdAt: "2026-09-29T00:00:00.000Z",
  generatedAt: "2026-09-29T00:00:00.000Z",
  exportedAt: "2026-09-29T00:00:00.000Z",
  validatedAt: "2026-09-29T00:00:00.000Z",
  semanticNodes: [
    {
      semanticId: "vessel.offshore-center-console",
      semanticKind: "vessel",
      semanticRole: "offshore-center-console",
      displayName: "Offshore Center Console",
      representation: {
        glbNodes: ["CenterConsoleHull", "CenterConsoleHullBow"],
      },
      interactionCapabilities: ["selectable"],
    },
    level(
      "vessel.level.machinery",
      "machinery",
      "Machinery",
      "CenterConsoleMachineryLevel",
    ),
    level(
      "vessel.level.main-deck",
      "main-deck",
      "Main Deck",
      "CenterConsoleMainDeck",
    ),
    level("vessel.level.t-top", "t-top", "T-Top", "CenterConsoleTTopLevel"),
    area(
      "vessel.area.bilge-machinery",
      "Bilge / Machinery",
      ["CenterConsoleBilgeMachinery"],
      "vessel.level.machinery",
      [
        region(
          "low-point",
          "Bilge low point",
          [0, 0.78, -1.45],
          [1.8, 0.25, 1.1],
        ),
        region(
          "machinery",
          "Machinery service region",
          [0, 0.85, -1.45],
          [1.8, 0.35, 1.1],
        ),
      ],
      [
        anchor(
          "bilge-low-center",
          "Bilge low center",
          [0, 0.82, -1.45],
          "low-point",
        ),
        anchor(
          "machinery-center",
          "Machinery center",
          [0, 0.95, -1.45],
          "machinery",
        ),
      ],
    ),
    area(
      "vessel.area.outboard-machinery",
      "Outboard Machinery",
      [
        "CenterConsoleOutboardPortOuter",
        "CenterConsoleOutboardPortInner",
        "CenterConsoleOutboardStarboardInner",
        "CenterConsoleOutboardStarboardOuter",
      ],
      "vessel.level.machinery",
      [
        region(
          "propulsion",
          "Outboard propulsion",
          [0, 0.65, -4.55],
          [3.3, 1.4, 0.7],
        ),
      ],
      [
        anchor(
          "port-outboard",
          "Port outboard",
          [-1.35, 1.2, -4.55],
          "propulsion",
        ),
        anchor(
          "starboard-outboard",
          "Starboard outboard",
          [1.35, 1.2, -4.55],
          "propulsion",
        ),
      ],
    ),
    standardArea(
      "vessel.area.bow",
      "Bow",
      "CenterConsoleBow",
      "vessel.level.main-deck",
      [0, 2.7, 3.15],
      [3.8, 0.3, 2],
    ),
    standardArea(
      "vessel.area.port-walk-deck",
      "Port Walk Deck",
      "CenterConsolePortWalkDeck",
      "vessel.level.main-deck",
      [-3.35, 2.65, 0.15],
      [0.8, 0.25, 5],
    ),
    area(
      "vessel.area.helm",
      "Helm",
      ["CenterConsoleHelm"],
      "vessel.level.main-deck",
      [
        region("console", "Helm console", [0, 3.05, 0.15], [1.8, 0.8, 1.2]),
        region("overhead", "Helm overhead", [0, 4, 0.15], [2.5, 0.2, 1.8]),
        region("operator", "Helm operator", [0, 2.7, -0.7], [1.6, 0.5, 0.9]),
      ],
      [
        anchor("helm-console", "Helm console", [0, 3.2, 0.15], "console"),
        anchor("helm-overhead", "Helm overhead", [0, 3.85, 0.15], "overhead"),
        anchor("helm-port", "Helm port", [-0.75, 3.1, 0.15], "console"),
        anchor(
          "helm-starboard",
          "Helm starboard",
          [0.75, 3.1, 0.15],
          "console",
        ),
      ],
    ),
    standardArea(
      "vessel.area.starboard-walk-deck",
      "Starboard Walk Deck",
      "CenterConsoleStarboardWalkDeck",
      "vessel.level.main-deck",
      [3.35, 2.65, 0.15],
      [0.8, 0.25, 5],
    ),
    standardArea(
      "vessel.area.cockpit",
      "Cockpit",
      "CenterConsoleCockpit",
      "vessel.level.main-deck",
      [0, 2.7, -3.1],
      [4.8, 0.3, 2],
    ),
    area(
      "vessel.area.t-top-overhead",
      "T-Top / Overhead",
      ["CenterConsoleTTopOverhead"],
      "vessel.level.t-top",
      [
        region(
          "upper-surface",
          "T-Top upper surface",
          [0, 4.45, 0.1],
          [3.5, 0.2, 2.2],
        ),
        region("underside", "T-Top underside", [0, 3.95, 0.1], [3.5, 0.2, 2.2]),
      ],
      [
        anchor(
          "t-top-forward-center",
          "T-Top forward center",
          [0, 4.45, 0.75],
          "upper-surface",
        ),
        anchor(
          "t-top-aft-center",
          "T-Top aft center",
          [0, 4.45, -0.55],
          "upper-surface",
        ),
        anchor("t-top-port", "T-Top port", [-1.35, 4.3, 0.1], "underside"),
        anchor(
          "t-top-starboard",
          "T-Top starboard",
          [1.35, 4.3, 0.1],
          "underside",
        ),
      ],
    ),
  ],
  modelReferences: [],
}

await Promise.all([
  mkdir(fixtureDirectory, { recursive: true }),
  mkdir(resolve(sourceDirectory, "geometry"), { recursive: true }),
  mkdir(resolve(sourceDirectory, "sources"), { recursive: true }),
])
const manifestContents = `${JSON.stringify(manifest, null, 2)}\n`
await Promise.all([
  writeFile(resolve(fixtureDirectory, artifactFileName), artifact),
  writeFile(
    resolve(fixtureDirectory, "offshore-center-console.manifest.json"),
    manifestContents,
  ),
  writeFile(resolve(sourceDirectory, "geometry", artifactFileName), artifact),
  writeFile(
    resolve(sourceDirectory, "semantic.manifest.json"),
    manifestContents,
  ),
  writeFile(
    resolve(sourceDirectory, "model.json"),
    `${JSON.stringify({ modelId: manifest.modelId, modelKind: manifest.modelKind, sourceOfTruth: "semantic.manifest.json" }, null, 2)}\n`,
  ),
  writeFile(resolve(sourceDirectory, "sources", ".gitkeep"), ""),
])
console.log(`Generated ${resolve(fixtureDirectory, artifactFileName)}`)
