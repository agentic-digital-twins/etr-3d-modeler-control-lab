import { mkdir, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"

const outputPath = resolve("fixtures/equipment-models/dd-8v92ta-cylinder.glb")
const encoder = new TextEncoder()

const positions = new Float32Array([-0.3, -0.2, 0, 0.3, -0.2, 0, 0, 0.3, 0])
const indices = new Uint16Array([0, 1, 2])
const binary = Buffer.concat([
  Buffer.from(positions.buffer),
  Buffer.from(indices.buffer),
])
const document = {
  asset: { version: "2.0", generator: "phase-a-fixture-generator" },
  scene: 0,
  scenes: [{ nodes: [0, 1] }],
  nodes: [
    { name: "Cylinder_L1", mesh: 0, translation: [-0.35, 0, 0] },
    { name: "Piston_L1", mesh: 1, translation: [0.35, 0, 0] },
  ],
  meshes: [
    { primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] },
    { primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] },
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
      count: 3,
      type: "VEC3",
      min: [-0.3, -0.2, 0],
      max: [0.3, 0.3, 0],
    },
    { bufferView: 1, componentType: 5123, count: 3, type: "SCALAR" },
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

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(
  outputPath,
  Buffer.concat([header, jsonHeader, paddedJson, binaryHeader, paddedBinary]),
)
console.log(`Generated ${outputPath}`)
