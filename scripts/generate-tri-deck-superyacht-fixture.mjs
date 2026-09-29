import { createHash } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const fixtureDirectory = resolve("fixtures/spatial-models")
const sourceDirectory = resolve("models/vessels/tri-deck-superyacht")
const artifactFileName = "tri-deck-superyacht.glb"
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
  ["SuperyachtHull", [10, 1.1, 2.7], [0, 2.4, 0]],
  ["SuperyachtBow", [4.8, 0.9, 2.1], [0, 3.05, 8.5]],
  ["SuperyachtSuperstructure", [7.4, 2.1, 2.15], [0, 4.4, -0.2]],
  ["SuperyachtMachineryLevel", [3.7, 0.12, 1.65], [0, 0.35, -2.8]],
  ["SuperyachtEngineRoom", [2.9, 0.52, 1.3], [0, 0.85, -2.8]],
  ["SuperyachtLowerDeck", [7.9, 0.14, 2.2], [0, 1.6, 0.1]],
  ["SuperyachtForwardGuest", [2.75, 0.45, 1.35], [0, 2.05, 5.1]],
  ["SuperyachtPortGuest", [2, 0.42, 1.05], [-3, 2.02, 1.5]],
  ["SuperyachtStarboardGuest", [2, 0.42, 1.05], [3, 2.02, 1.5]],
  ["SuperyachtMaster", [3.75, 0.5, 1.55], [0, 2.1, -3.1]],
  ["SuperyachtMainDeck", [9.2, 0.16, 2.45], [0, 4.15, 0]],
  ["SuperyachtForedeck", [3.7, 0.3, 1.7], [0, 4.5, 8.1]],
  ["SuperyachtMainSalon", [4.4, 0.65, 1.65], [0, 5, -0.3]],
  ["SuperyachtAftDeck", [4, 0.32, 1.7], [0, 4.52, -7.2]],
  ["SuperyachtUpperDeck", [7.4, 0.16, 2.05], [0, 6.65, -0.4]],
  ["SuperyachtSkyLounge", [3.9, 0.62, 1.55], [0, 7.3, 0.2]],
  ["SuperyachtUpperAft", [3.4, 0.3, 1.4], [0, 7, -5.2]],
  ["SuperyachtBridgeDeck", [4.2, 0.15, 1.55], [0, 8.75, 0.3]],
  ["SuperyachtPilothouse", [2.8, 0.55, 1.15], [0, 9.25, 0.65]],
  ["SuperyachtSunDeckLevel", [3.3, 0.14, 1.45], [0, 10.75, 0.1]],
  ["SuperyachtSunDeck", [2.9, 0.28, 1.2], [0, 11.02, 0.1]],
].map(([name, scale, translation]) => ({ name, mesh: 0, scale, translation }))
const document = {
  asset: { version: "2.0", generator: "phase-2-superyacht-fixture-generator" },
  scene: 0,
  scenes: [{ nodes: nodes.map((_, i) => i) }],
  nodes,
  meshes: [
    { primitives: [{ attributes: { POSITION: 0 }, indices: 1, material: 0 }] },
  ],
  materials: [
    {
      pbrMetallicRoughness: {
        baseColorFactor: [0.24, 0.5, 0.64, 1],
        metallicFactor: 0.2,
        roughnessFactor: 0.38,
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
  parentSemanticId: "vessel.tri-deck-superyacht",
  representation: { glbNodes: [glbNodeName] },
  interactionCapabilities: ["selectable", "highlightable", "isolatable"],
})
const area = (
  semanticId,
  displayName,
  glbNodeName,
  parentSemanticId,
  position,
  dimensions,
  regionId = "interior",
  anchorId = "default",
) => ({
  semanticId,
  semanticKind: "area",
  semanticRole: "vessel-area",
  displayName,
  parentSemanticId,
  representation: { glbNodes: [glbNodeName] },
  interactionCapabilities: ["selectable", "highlightable"],
  spatial: {
    placementRegions: [
      region(regionId, `${displayName} ${regionId}`, position, dimensions),
    ],
    placementAnchors: [
      anchor(anchorId, `${displayName} ${anchorId}`, position, regionId),
    ],
  },
})
const manifest = {
  modelId: "tri-deck-superyacht",
  modelKind: "vessel",
  modelProfile: "vessel",
  modelVersion: "0.1.0",
  subject: {
    subjectId: "vessel-model:tri-deck-superyacht",
    subjectKind: "vessel-model",
  },
  artifact: {
    artifactId: "tri-deck-superyacht-fixture",
    artifactVersion: "0.1.0",
    fileName: artifactFileName,
    contentFingerprint: `sha256:${createHash("sha256").update(artifact).digest("hex")}`,
  },
  generator: {
    name: "phase-2-superyacht-fixture-generator",
    version: "0.1.0",
    sourceRevision: "phase-2-slice-4",
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
      semanticId: "vessel.tri-deck-superyacht",
      semanticKind: "vessel",
      semanticRole: "tri-deck-superyacht",
      displayName: "Tri-Deck Superyacht",
      representation: {
        glbNodes: [
          "SuperyachtHull",
          "SuperyachtBow",
          "SuperyachtSuperstructure",
        ],
      },
      interactionCapabilities: ["selectable"],
    },
    level(
      "vessel.level.machinery",
      "machinery",
      "Machinery",
      "SuperyachtMachineryLevel",
    ),
    level(
      "vessel.level.lower-deck",
      "lower-deck",
      "Lower Deck",
      "SuperyachtLowerDeck",
    ),
    level(
      "vessel.level.main-deck",
      "main-deck",
      "Main Deck",
      "SuperyachtMainDeck",
    ),
    level(
      "vessel.level.upper-deck",
      "upper-deck",
      "Upper Deck",
      "SuperyachtUpperDeck",
    ),
    level(
      "vessel.level.bridge-deck",
      "bridge-deck",
      "Bridge Deck",
      "SuperyachtBridgeDeck",
    ),
    level(
      "vessel.level.sun-deck",
      "sun-deck",
      "Sun Deck",
      "SuperyachtSunDeckLevel",
    ),
    area(
      "vessel.area.engine-room",
      "Engine Room",
      "SuperyachtEngineRoom",
      "vessel.level.machinery",
      [0, 1.05, -2.8],
      [4.6, 0.6, 2.2],
      "machinery",
      "machinery-center",
    ),
    area(
      "vessel.area.forward-guest-stateroom",
      "Forward Guest Stateroom",
      "SuperyachtForwardGuest",
      "vessel.level.lower-deck",
      [0, 2.25, 5.1],
      [4.7, 0.4, 2.4],
    ),
    area(
      "vessel.area.port-guest-stateroom",
      "Port Guest Stateroom",
      "SuperyachtPortGuest",
      "vessel.level.lower-deck",
      [-3, 2.2, 1.5],
      [3.2, 0.4, 1.8],
    ),
    area(
      "vessel.area.starboard-guest-stateroom",
      "Starboard Guest Stateroom",
      "SuperyachtStarboardGuest",
      "vessel.level.lower-deck",
      [3, 2.2, 1.5],
      [3.2, 0.4, 1.8],
    ),
    area(
      "vessel.area.master-stateroom",
      "Master Stateroom",
      "SuperyachtMaster",
      "vessel.level.lower-deck",
      [0, 2.3, -3.1],
      [6.2, 0.5, 2.7],
    ),
    area(
      "vessel.area.bow-foredeck",
      "Bow / Foredeck",
      "SuperyachtForedeck",
      "vessel.level.main-deck",
      [0, 4.72, 8.1],
      [6.6, 0.3, 3],
      "deck",
      "bow-center",
    ),
    area(
      "vessel.area.main-salon",
      "Main Salon",
      "SuperyachtMainSalon",
      "vessel.level.main-deck",
      [0, 5.2, -0.3],
      [7.2, 0.6, 2.7],
    ),
    area(
      "vessel.area.aft-deck",
      "Aft Deck",
      "SuperyachtAftDeck",
      "vessel.level.main-deck",
      [0, 4.75, -7.2],
      [6.6, 0.3, 3],
      "deck",
      "aft-deck-center",
    ),
    area(
      "vessel.area.sky-lounge",
      "Sky Lounge",
      "SuperyachtSkyLounge",
      "vessel.level.upper-deck",
      [0, 7.5, 0.2],
      [6.4, 0.6, 2.5],
    ),
    area(
      "vessel.area.upper-aft-deck",
      "Upper Aft Deck",
      "SuperyachtUpperAft",
      "vessel.level.upper-deck",
      [0, 7.22, -5.2],
      [5.8, 0.3, 2.5],
      "deck",
      "upper-aft-center",
    ),
    area(
      "vessel.area.pilothouse",
      "Pilothouse",
      "SuperyachtPilothouse",
      "vessel.level.bridge-deck",
      [0, 9.45, 0.65],
      [4.5, 0.55, 2],
      "helm",
      "helm-center",
    ),
    area(
      "vessel.area.sun-deck",
      "Sun Deck",
      "SuperyachtSunDeck",
      "vessel.level.sun-deck",
      [0, 11.2, 0.1],
      [5, 0.3, 2.1],
      "deck",
      "sun-deck-center",
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
    resolve(fixtureDirectory, "tri-deck-superyacht.manifest.json"),
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
