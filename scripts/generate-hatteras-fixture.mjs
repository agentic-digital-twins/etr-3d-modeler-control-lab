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
    scale: [4.8, 0.8, 1.7],
    translation: [0, 0.2, 0],
  },
  {
    name: "HatterasMainDeck",
    mesh: 0,
    scale: [4.2, 0.18, 1.55],
    translation: [0, 1, 0],
  },
  {
    name: "HatterasFlybridgeDeck",
    mesh: 0,
    scale: [1.5, 0.15, 1.2],
    translation: [0, 2.75, 0.25],
  },
  {
    name: "HatterasBow",
    mesh: 0,
    scale: [2.8, 0.45, 1.35],
    translation: [0, 0.7, 3.25],
  },
  {
    name: "HatterasSalon",
    mesh: 0,
    scale: [2.3, 1, 1.25],
    translation: [0, 1.7, -0.3],
  },
  {
    name: "HatterasFlybridge",
    mesh: 0,
    scale: [1.2, 0.38, 0.9],
    translation: [0, 3.1, 0.2],
  },
  {
    name: "HatterasEngineRoom",
    mesh: 0,
    scale: [1.2, 0.4, 0.8],
    translation: [0, 0.85, -1.7],
  },
  {
    name: "HatterasCockpit",
    mesh: 0,
    scale: [1.5, 0.25, 1.4],
    translation: [0, 1, -3.5],
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
    {
      semanticId: "vessel.level.main-deck",
      semanticKind: "level",
      semanticRole: "main-deck",
      displayName: "Main Deck",
      parentSemanticId: "vessel.hatteras-63",
      representation: { glbNodes: ["HatterasMainDeck"] },
      interactionCapabilities: ["selectable"],
    },
    {
      semanticId: "vessel.level.flybridge",
      semanticKind: "level",
      semanticRole: "flybridge-deck",
      displayName: "Flybridge Deck",
      parentSemanticId: "vessel.hatteras-63",
      representation: { glbNodes: ["HatterasFlybridgeDeck"] },
      interactionCapabilities: ["selectable"],
    },
    area("vessel.area.bow", "Bow", "HatterasBow", "vessel.level.main-deck", {
      placementRegions: [
        region("deck", "Bow deck", [0, 1.15, 3.25], [2.5, 0.2, 1.2]),
      ],
      placementAnchors: [
        anchor("deck-center", "Deck center", [0, 1.3, 3.25], "deck"),
      ],
    }),
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
    area(
      "vessel.area.salon",
      "Salon",
      "HatterasSalon",
      "vessel.level.main-deck",
      {
        placementRegions: [
          region("ceiling", "Salon ceiling", [0, 2.65, -0.3], [3.8, 0.2, 2]),
        ],
        placementAnchors: [
          anchor("ceiling-center", "Ceiling center", [0, 2.8, -0.3], "ceiling"),
        ],
      },
    ),
    area(
      "vessel.area.engine-room",
      "Engine Room",
      "HatterasEngineRoom",
      "vessel.level.main-deck",
      {
        placementRegions: [
          region(
            "bilge",
            "Engine room bilge",
            [0, 0.55, -1.7],
            [1.8, 0.2, 1.2],
          ),
        ],
        placementAnchors: [
          anchor("bilge-center", "Bilge center", [0, 0.65, -1.7], "bilge"),
        ],
      },
    ),
    area(
      "vessel.area.cockpit",
      "Cockpit",
      "HatterasCockpit",
      "vessel.level.main-deck",
      {
        placementRegions: [
          region("aft-deck", "Aft deck", [0, 1.2, -3.5], [2.5, 0.2, 2]),
        ],
        placementAnchors: [
          anchor("aft-center", "Aft center", [0, 1.35, -3.5], "aft-deck"),
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
