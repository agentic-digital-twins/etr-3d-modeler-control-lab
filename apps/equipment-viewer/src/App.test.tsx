import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { App } from "./App"

vi.mock("@react-three/fiber", () => ({
  Canvas: () => <div data-testid="mock-canvas" />,
}))
vi.mock("@react-three/drei", () => ({
  Bounds: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  OrbitControls: () => null,
  useGLTF: () => ({ scene: { traverse: () => undefined } }),
}))

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
    artifactId: "fixture",
    artifactVersion: "0.1.0",
    fileName: "hatteras-63-motor-yacht.glb",
    contentFingerprint: `sha256:${"a".repeat(64)}`,
  },
  generator: { name: "fixture", version: "0.1.0", sourceRevision: "test" },
  sourceReferences: [],
  coordinateFrame: "right-handed-y-up",
  units: "meters",
  createdAt: "2026-09-21T00:00:00.000Z",
  generatedAt: "2026-09-21T00:00:00.000Z",
  exportedAt: "2026-09-21T00:00:00.000Z",
  validatedAt: "2026-09-21T00:00:00.000Z",
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
      semanticId: "vessel.area.flybridge",
      semanticKind: "area",
      semanticRole: "vessel-area",
      displayName: "Flybridge",
      representation: { glbNodes: ["HatterasFlybridge"] },
      interactionCapabilities: ["selectable", "highlightable"],
      spatial: {
        placementRegions: [
          {
            regionId: "overhead",
            displayName: "Flybridge overhead",
            regionKind: "placement-volume",
            transform: { position: [0, 3, 0] },
            dimensions: [1, 1, 1],
          },
        ],
        placementAnchors: [
          {
            anchorId: "overhead-center",
            displayName: "Overhead center",
            transform: { position: [0, 3, 0] },
            placementRegionId: "overhead",
          },
        ],
      },
    },
    {
      semanticId: "vessel.area.engine-room",
      semanticKind: "area",
      semanticRole: "vessel-area",
      displayName: "Engine Room",
      representation: { glbNodes: ["HatterasEngineRoom"] },
      interactionCapabilities: ["selectable", "highlightable"],
      spatial: {
        placementRegions: [
          {
            regionId: "bilge",
            displayName: "Engine room bilge",
            regionKind: "placement-volume",
            transform: { position: [0, 0, -2] },
            dimensions: [1, 1, 1],
          },
        ],
        placementAnchors: [
          {
            anchorId: "bilge-center",
            displayName: "Bilge center",
            transform: { position: [0, 0, -2] },
            placementRegionId: "bilge",
          },
        ],
      },
    },
  ],
}

describe("Spatial Model Explorer", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => manifest }),
    )
  })

  it("places capability representations through vessel area anchors", async () => {
    render(<App />)

    await screen.findByRole("heading", { name: "Hatteras 63 Motor Yacht" })
    fireEvent.click(screen.getByRole("button", { name: "Flybridge" }))
    fireEvent.click(screen.getByRole("button", { name: "Add capability" }))
    expect(screen.getByText("Thermal Camera · Flybridge")).toBeTruthy()

    fireEvent.click(screen.getByRole("button", { name: "Water Sensor" }))
    fireEvent.click(screen.getByRole("button", { name: "Engine Room" }))
    fireEvent.click(screen.getByRole("button", { name: "Add capability" }))
    expect(screen.getByText("Water Sensor · Engine Room")).toBeTruthy()
  })
})
