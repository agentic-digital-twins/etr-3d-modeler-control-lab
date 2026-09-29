import { createHash } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"

const fixtureDirectory = resolve("fixtures/spatial-models")
const artifactPath = resolve(fixtureDirectory, "hatteras-63-motor-yacht.glb")
const manifestPath = resolve(
  fixtureDirectory,
  "hatteras-63-motor-yacht.manifest.json",
)
const encoder = new TextEncoder()

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
  {
    name: "HatterasHull",
    mesh: 0,
    scale: [5.1, 0.7, 1.9],
    translation: [0, 1.8, 0],
  },
  {
    name: "HatterasMachineryDeck",
    mesh: 0,
    scale: [2.3, 0.12, 1.15],
    translation: [0, 0.25, -1.8],
  },
  {
    name: "HatterasEngineRoom",
    mesh: 0,
    scale: [1.5, 0.45, 0.9],
    translation: [0, 0.65, -1.8],
  },
  {
    name: "HatterasAccommodationDeck",
    mesh: 0,
    scale: [4.1, 0.14, 1.5],
    translation: [0, 1.35, -0.1],
  },
  {
    name: "HatterasVipStateroom",
    mesh: 0,
    scale: [1.25, 0.5, 0.8],
    translation: [0, 1.85, 2.55],
  },
  {
    name: "HatterasDinette",
    mesh: 0,
    scale: [1.1, 0.45, 0.7],
    translation: [-1.45, 1.8, 0.65],
  },
  {
    name: "HatterasGalley",
    mesh: 0,
    scale: [1.1, 0.45, 0.7],
    translation: [1.45, 1.8, 0.65],
  },
  {
    name: "HatterasGuestStateroom",
    mesh: 0,
    scale: [1.15, 0.5, 0.75],
    translation: [-1.35, 1.85, -1.1],
  },
  {
    name: "HatterasMasterStateroom",
    mesh: 0,
    scale: [1.45, 0.55, 0.95],
    translation: [0.75, 1.9, -1.75],
  },
  {
    name: "HatterasMainDeck",
    mesh: 0,
    scale: [4.8, 0.18, 1.75],
    translation: [0, 2.65, 0],
  },
  {
    name: "HatterasBow",
    mesh: 0,
    scale: [2.1, 0.32, 1.3],
    translation: [0, 2.95, 3.15],
  },
  {
    name: "HatterasPortWalkDeck",
    mesh: 0,
    scale: [0.4, 0.2, 3.8],
    translation: [-3.45, 2.85, 0.1],
  },
  {
    name: "HatterasSalon",
    mesh: 0,
    scale: [2.35, 0.75, 1.35],
    translation: [0, 3.4, -0.2],
  },
  {
    name: "HatterasStarboardWalkDeck",
    mesh: 0,
    scale: [0.4, 0.2, 3.8],
    translation: [3.45, 2.85, 0.1],
  },
  {
    name: "HatterasCockpit",
    mesh: 0,
    scale: [1.75, 0.25, 1.35],
    translation: [0, 2.95, -3.55],
  },
  {
    name: "HatterasFlybridgeDeck",
    mesh: 0,
    scale: [1.65, 0.16, 1.25],
    translation: [0, 4.55, 0.25],
  },
  {
    name: "HatterasFlybridge",
    mesh: 0,
    scale: [1.25, 0.42, 0.95],
    translation: [0, 4.95, 0.25],
  },
]
const document = {
  asset: { version: "2.0", generator: "phase-2-hatteras-fixture-generator" },
  scene: 0,
  scenes: [{ nodes: nodes.map((_, index) => index) }],
  nodes,
  meshes: [
    {
      primitives: [
        {
          attributes: { POSITION: 0 },
          indices: 1,
          material: 0,
        },
      ],
    },
  ],
  materials: [
    {
      pbrMetallicRoughness: {
        baseColorFactor: [0.26, 0.57, 0.65, 1],
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
const json = Buffer.from(encoder.encode(JSON.stringify(document)))
const paddedJson = Buffer.concat([
  json,
  Buffer.alloc((4 - (json.length % 4)) % 4, 0x20),
])
const paddedBinary = Buffer.concat([
  binary,
  Buffer.alloc((4 - (binary.length % 4)) % 4),
])
const totalLength = 12 + 8 + paddedJson.length + 8 + paddedBinary.length
const header = Buffer.alloc(12)
header.writeUInt32LE(0x46546c67, 0)
header.writeUInt32LE(2, 4)
header.writeUInt32LE(totalLength, 8)
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

const transform = (position) => ({ position })
const region = (regionId, displayName, position, dimensions) => ({
  regionId,
  displayName,
  regionKind: "placement-volume",
  transform: transform(position),
  dimensions,
})
const anchor = (anchorId, displayName, position, placementRegionId) => ({
  anchorId,
  displayName,
  transform: transform(position),
  placementRegionId,
})
const area = (
  semanticId,
  displayName,
  glbNodeName,
  parentSemanticId,
  placement,
) => ({
  semanticId,
  semanticKind: "area",
  semanticRole: "vessel-area",
  displayName,
  parentSemanticId,
  representation: { glbNodes: [glbNodeName] },
  interactionCapabilities: ["selectable", "highlightable"],
  spatial: placement,
})
const level = (semanticId, semanticRole, displayName, glbNodeName) => ({
  semanticId,
  semanticKind: "level",
  semanticRole,
  displayName,
  parentSemanticId: "vessel.hatteras-63",
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
  area(semanticId, displayName, glbNodeName, parentSemanticId, {
    placementRegions: [
      region("placement", `${displayName} placement`, position, dimensions),
    ],
    placementAnchors: [
      anchor("default", `${displayName} default`, position, "placement"),
    ],
  })

const manifest = {
  modelId: "hatteras-63-motor-yacht-prototype",
  modelKind: "hatteras-63-motor-yacht",
  modelProfile: "vessel",
  modelVersion: "0.1.0",
  subject: {
    subjectId: "vessel-model:hatteras-63-motor-yacht-prototype",
    subjectKind: "vessel-model",
  },
  artifact: {
    artifactId: "hatteras-63-motor-yacht-prototype-fixture",
    artifactVersion: "0.1.0",
    fileName: "hatteras-63-motor-yacht.glb",
    contentFingerprint: `sha256:${createHash("sha256").update(artifact).digest("hex")}`,
  },
  generator: {
    name: "phase-2-hatteras-fixture-generator",
    version: "0.1.0",
    sourceRevision: "phase-2-slice-1",
  },
  sourceReferences: [],
  coordinateFrame: "right-handed-y-up",
  placementCoordinateFrame: "model",
  units: "meters",
  createdAt: "2026-09-28T00:00:00.000Z",
  generatedAt: "2026-09-28T00:00:00.000Z",
  exportedAt: "2026-09-28T00:00:00.000Z",
  validatedAt: "2026-09-28T00:00:00.000Z",
  semanticNodes: [
    {
      semanticId: "vessel.hatteras-63",
      semanticKind: "vessel",
      semanticRole: "motor-yacht",
      displayName: "Hatteras 63 Motor Yacht",
      representation: { glbNodes: ["HatterasHull"] },
      interactionCapabilities: ["selectable"],
    },
    level(
      "vessel.level.machinery",
      "machinery",
      "Machinery",
      "HatterasMachineryDeck",
    ),
    level(
      "vessel.level.accommodation",
      "accommodation",
      "Accommodation",
      "HatterasAccommodationDeck",
    ),
    level(
      "vessel.level.main-deck",
      "main-deck",
      "Main Deck",
      "HatterasMainDeck",
    ),
    level(
      "vessel.level.flybridge",
      "flybridge",
      "Flybridge",
      "HatterasFlybridgeDeck",
    ),
    standardArea(
      "vessel.area.engine-room",
      "Engine Room",
      "HatterasEngineRoom",
      "vessel.level.machinery",
      [0, 0.9, -1.8],
      [2.6, 0.3, 1.5],
    ),
    standardArea(
      "vessel.area.vip-stateroom",
      "VIP Stateroom",
      "HatterasVipStateroom",
      "vessel.level.accommodation",
      [0, 2.15, 2.55],
      [2.1, 0.3, 1.4],
    ),
    standardArea(
      "vessel.area.dinette",
      "Dinette",
      "HatterasDinette",
      "vessel.level.accommodation",
      [-1.45, 2.1, 0.65],
      [1.8, 0.3, 1.2],
    ),
    standardArea(
      "vessel.area.galley",
      "Galley",
      "HatterasGalley",
      "vessel.level.accommodation",
      [1.45, 2.1, 0.65],
      [1.8, 0.3, 1.2],
    ),
    standardArea(
      "vessel.area.guest-stateroom",
      "Guest Stateroom",
      "HatterasGuestStateroom",
      "vessel.level.accommodation",
      [-1.35, 2.15, -1.1],
      [1.8, 0.3, 1.3],
    ),
    standardArea(
      "vessel.area.master-stateroom",
      "Master Stateroom",
      "HatterasMasterStateroom",
      "vessel.level.accommodation",
      [0.75, 2.25, -1.75],
      [2.2, 0.3, 1.6],
    ),
    standardArea(
      "vessel.area.bow",
      "Bow / Foredeck",
      "HatterasBow",
      "vessel.level.main-deck",
      [0, 3.3, 3.15],
      [3.8, 0.3, 2.2],
    ),
    standardArea(
      "vessel.area.port-walk-deck",
      "Port Walk Deck",
      "HatterasPortWalkDeck",
      "vessel.level.main-deck",
      [-3.45, 3.1, 0.1],
      [0.7, 0.25, 5.6],
    ),
    standardArea(
      "vessel.area.salon",
      "Salon",
      "HatterasSalon",
      "vessel.level.main-deck",
      [0, 4.25, -0.2],
      [3.8, 0.3, 2.2],
    ),
    standardArea(
      "vessel.area.starboard-walk-deck",
      "Starboard Walk Deck",
      "HatterasStarboardWalkDeck",
      "vessel.level.main-deck",
      [3.45, 3.1, 0.1],
      [0.7, 0.25, 5.6],
    ),
    standardArea(
      "vessel.area.cockpit",
      "Cockpit / Aft Deck",
      "HatterasCockpit",
      "vessel.level.main-deck",
      [0, 3.25, -3.55],
      [3, 0.3, 2.2],
    ),
    area(
      "vessel.area.flybridge",
      "Flybridge",
      "HatterasFlybridge",
      "vessel.level.flybridge",
      {
        placementRegions: [
          region(
            "overhead",
            "Flybridge overhead",
            [0, 3.55, 0.2],
            [2.2, 0.25, 1.6],
          ),
        ],
        placementAnchors: [
          anchor(
            "overhead-port",
            "Overhead port",
            [-0.65, 3.7, 0.2],
            "overhead",
          ),
          anchor(
            "overhead-center",
            "Overhead center",
            [0, 3.7, 0.2],
            "overhead",
          ),
          anchor("helm", "Helm", [0, 3.45, 0.65], "overhead"),
        ],
      },
    ),
  ],
  modelReferences: [],
}

await mkdir(fixtureDirectory, { recursive: true })
await Promise.all([
  writeFile(artifactPath, artifact),
  writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`),
])
console.log(`Generated ${artifactPath}`)
console.log(`Generated ${manifestPath}`)
