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
  modelId: "detroit-diesel-8v92ta-cylinder-prototype",
  modelKind: "detroit-diesel-8v92ta-cylinder-assembly",
  modelVersion: "0.1.0",
  subjectId: "equipment-model:detroit-diesel-8v92ta-cylinder-prototype",
  subjectKind: "equipment-model",
  artifact: {
    artifactId: "fixture",
    artifactVersion: "0.1.0",
    fileName: "fixture.glb",
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
  components: [
    {
      componentId: "piston.l1",
      componentKind: "piston",
      semanticRole: "reciprocating-element",
      displayName: "Piston L1",
      glbNodeName: "Piston_L1",
      capabilities: ["selectable", "isolatable"],
    },
  ],
}

describe("Equipment Explorer", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => manifest }),
    )
  })

  it("loads a manifest and exposes semantic selection controls", async () => {
    render(<App />)

    const component = await screen.findByRole("button", { name: "Piston L1" })
    fireEvent.click(component)

    expect(screen.getByText("piston.l1")).toBeTruthy()
    expect(screen.getByRole("button", { name: "Isolate" })).toHaveProperty(
      "disabled",
      false,
    )
    fireEvent.click(screen.getByRole("button", { name: "Reset" }))
    expect(
      screen.getByText("Select a semantic component in the canvas or list."),
    ).toBeTruthy()
  })
})
