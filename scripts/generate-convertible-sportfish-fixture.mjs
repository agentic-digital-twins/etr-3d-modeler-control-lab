import { createHash } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const fixtureDirectory = resolve("fixtures/spatial-models")
const sourceDirectory = resolve("models/vessels/convertible-sportfish")
const artifactFileName = "convertible-sportfish.glb"
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
  ["SportfishHull", [6.6, 0.85, 2.15], [0, 2.05, -0.15]],
  ["SportfishFlaredBow", [3.5, 0.7, 1.7], [0, 2.7, 4.85]],
  ["SportfishEnclosedHouse", [3.25, 1.25, 1.55], [0, 3.55, -0.15]],
  ["SportfishMachineryLevel", [2.9, 0.12, 1.35], [0, 0.35, -1.7]],
  ["SportfishEngineRoom", [2.15, 0.48, 1.05], [0, 0.82, -1.7]],
  ["SportfishAccommodationLevel", [5.1, 0.14, 1.75], [0, 1.55, 0.15]],
  ["SportfishForwardStateroom", [1.85, 0.48, 1.15], [0, 2.02, 3.45]],
  ["SportfishGalley", [1.35, 0.38, 0.85], [-1.85, 1.95, 0.8]],
  ["SportfishGuestStateroom", [1.35, 0.45, 0.85], [1.85, 2.02, 0.8]],
  ["SportfishSalon", [2.8, 0.52, 1.05], [0, 2.05, -1.45]],
  ["SportfishMainDeck", [6.15, 0.16, 1.95], [0, 3.0, 0]],
  ["SportfishBowForedeck", [2.8, 0.3, 1.45], [0, 3.35, 4.65]],
  ["SportfishPortSideDeck", [0.48, 0.22, 4.8], [-4.45, 3.22, 0.45]],
  ["SportfishStarboardSideDeck", [0.48, 0.22, 4.8], [4.45, 3.22, 0.45]],
  ["SportfishCockpit", [3.55, 0.3, 1.55], [0, 3.35, -4.35]],
  ["SportfishBridgeLevel", [2.35, 0.14, 1.4], [0, 5.45, -0.05]],
  ["SportfishFlybridgeHelm", [1.8, 0.48, 1.05], [0, 5.85, -0.05]],
].map(([name, scale, translation]) => ({ name, mesh: 0, scale, translation }))
const document = {
  asset: { version: "2.0", generator: "phase-2-sportfish-fixture-generator" },
  scene: 0,
  scenes: [{ nodes: nodes.map((_, index) => index) }],
  nodes,
  meshes: [
    { primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 0 }] },
  ],
  materials: [
    {
      pbrMetallicRoughness: {
        baseColorFactor: [0.18, 0.48, 0.62, 1],
        metallicFactor: 0.2,
        roughnessFactor: 0.4,
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
const level = (semanticId, semanticRole, displayName, glbNodeName) => ({
  semanticId,
  semanticKind: "level",
  semanticRole,
  displayName,
  parentSemanticId: "vessel.convertible-sportfish",
  representation: { glbNodes: [glbNodeName] },
  interactionCapabilities: ["selectable", "highlightable", "isolatable"],
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
    [region("interior", `${displayName} interior`, position, dimensions)],
    [anchor("default", `${displayName} default`, position, "interior")],
  )
const manifest = {
  modelId: "convertible-sportfish",
  modelKind: "vessel",
  modelProfile: "vessel",
  modelVersion: "0.1.0",
  subject: {
    subjectId: "vessel-model:convertible-sportfish",
    subjectKind: "vessel-model",
  },
  artifact: {
    artifactId: "convertible-sportfish-fixture",
    artifactVersion: "0.1.0",
    fileName: artifactFileName,
    contentFingerprint: `sha256:${createHash("sha256").update(artifact).digest("hex")}`,
  },
  generator: {
    name: "phase-2-sportfish-fixture-generator",
    version: "0.1.0",
    sourceRevision: "phase-2-slice-3",
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
      semanticId: "vessel.convertible-sportfish",
      semanticKind: "vessel",
      semanticRole: "convertible-sportfish",
      displayName: "Convertible Sportfish",
      representation: {
        glbNodes: [
          "SportfishHull",
          "SportfishFlaredBow",
          "SportfishEnclosedHouse",
        ],
      },
      interactionCapabilities: ["selectable"],
    },
    level(
      "vessel.level.machinery",
      "machinery",
      "Machinery",
      "SportfishMachineryLevel",
    ),
    level(
      "vessel.level.accommodation",
      "accommodation",
      "Accommodation",
      "SportfishAccommodationLevel",
    ),
    level(
      "vessel.level.main-deck",
      "main-deck",
      "Main Deck",
      "SportfishMainDeck",
    ),
    level("vessel.level.bridge", "bridge", "Bridge", "SportfishBridgeLevel"),
    area(
      "vessel.area.engine-room",
      "Engine Room",
      ["SportfishEngineRoom"],
      "vessel.level.machinery",
      [
        region(
          "machinery",
          "Engine room machinery",
          [0, 1.05, -1.7],
          [3.5, 0.6, 1.8],
        ),
        region(
          "low-point",
          "Engine room low point",
          [0, 0.8, -1.7],
          [3.5, 0.2, 1.8],
        ),
      ],
      [
        anchor(
          "machinery-center",
          "Machinery center",
          [0, 1.2, -1.7],
          "machinery",
        ),
        anchor(
          "machinery-port",
          "Machinery port",
          [-1.25, 1.1, -1.7],
          "machinery",
        ),
        anchor(
          "machinery-starboard",
          "Machinery starboard",
          [1.25, 1.1, -1.7],
          "machinery",
        ),
        anchor(
          "low-point-center",
          "Low point center",
          [0, 0.85, -1.7],
          "low-point",
        ),
      ],
    ),
    standardArea(
      "vessel.area.forward-stateroom",
      "Forward Stateroom",
      "SportfishForwardStateroom",
      "vessel.level.accommodation",
      [0, 2.2, 3.45],
      [3, 0.4, 2],
    ),
    standardArea(
      "vessel.area.galley",
      "Galley",
      "SportfishGalley",
      "vessel.level.accommodation",
      [-1.85, 2.12, 0.8],
      [2.2, 0.35, 1.5],
    ),
    standardArea(
      "vessel.area.salon",
      "Salon",
      "SportfishSalon",
      "vessel.level.accommodation",
      [0, 2.3, -1.45],
      [4.7, 0.45, 1.9],
    ),
    standardArea(
      "vessel.area.guest-stateroom",
      "Guest Stateroom",
      "SportfishGuestStateroom",
      "vessel.level.accommodation",
      [1.85, 2.2, 0.8],
      [2.2, 0.4, 1.5],
    ),
    standardArea(
      "vessel.area.bow-foredeck",
      "Bow / Foredeck",
      "SportfishBowForedeck",
      "vessel.level.main-deck",
      [0, 3.6, 4.65],
      [5, 0.3, 2.4],
    ),
    standardArea(
      "vessel.area.port-side-deck",
      "Port Side Deck",
      "SportfishPortSideDeck",
      "vessel.level.main-deck",
      [-4.45, 3.45, 0.45],
      [0.8, 0.25, 6],
    ),
    standardArea(
      "vessel.area.starboard-side-deck",
      "Starboard Side Deck",
      "SportfishStarboardSideDeck",
      "vessel.level.main-deck",
      [4.45, 3.45, 0.45],
      [0.8, 0.25, 6],
    ),
    area(
      "vessel.area.cockpit",
      "Cockpit",
      ["SportfishCockpit"],
      "vessel.level.main-deck",
      [
        region("deck", "Cockpit deck", [0, 3.6, -4.35], [6, 0.3, 2.5]),
        region(
          "transom",
          "Cockpit transom",
          [0, 3.75, -5.55],
          [5.5, 0.5, 0.35],
        ),
        region(
          "overhead",
          "Cockpit overhead",
          [0, 4.7, -4.35],
          [5.5, 0.25, 2.5],
        ),
      ],
      [
        anchor("cockpit-center", "Cockpit center", [0, 3.75, -4.35], "deck"),
        anchor("cockpit-port", "Cockpit port", [-2.1, 3.75, -4.35], "deck"),
        anchor(
          "cockpit-starboard",
          "Cockpit starboard",
          [2.1, 3.75, -4.35],
          "deck",
        ),
        anchor("transom-center", "Transom center", [0, 3.9, -5.55], "transom"),
      ],
    ),
    area(
      "vessel.area.flybridge-helm",
      "Flybridge / Helm",
      ["SportfishFlybridgeHelm"],
      "vessel.level.bridge",
      [
        region("helm", "Bridge helm", [0, 6.1, -0.05], [2.8, 0.7, 1.8]),
        region("overhead", "Bridge overhead", [0, 6.6, -0.05], [3.4, 0.2, 2.2]),
        region("perimeter", "Bridge perimeter", [0, 6, -0.05], [4, 0.3, 2.8]),
      ],
      [
        anchor("helm-center", "Helm center", [0, 6.2, -0.05], "helm"),
        anchor(
          "overhead-center",
          "Overhead center",
          [0, 6.55, -0.05],
          "overhead",
        ),
        anchor("bridge-port", "Bridge port", [-1.45, 6.15, -0.05], "perimeter"),
        anchor(
          "bridge-starboard",
          "Bridge starboard",
          [1.45, 6.15, -0.05],
          "perimeter",
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
    resolve(fixtureDirectory, "convertible-sportfish.manifest.json"),
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
