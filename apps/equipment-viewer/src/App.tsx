import { Suspense, useEffect, useState } from "react"
import { Bounds, OrbitControls, useGLTF } from "@react-three/drei"
import { Canvas, type ThreeEvent } from "@react-three/fiber"
import type { Object3D } from "three"

import {
  SpatialModelManifestSchema,
  type SpatialModelManifest,
} from "@etr/equipment-model-contracts"

const apiBaseUrl = import.meta.env.VITE_MODEL_API_BASE_URL ?? ""
const defaultModelId = "detroit-diesel-8v92ta-cylinder-prototype"

type VisibilityMode = "all" | "isolated"

function Model({
  manifest,
  selectedSemanticId,
  visibilityMode,
  onSelect,
  onReady,
}: {
  manifest: SpatialModelManifest
  selectedSemanticId?: string
  visibilityMode: VisibilityMode
  onSelect: (semanticId: string) => void
  onReady: () => void
}) {
  const { scene } = useGLTF(
    `${apiBaseUrl}/api/models/${manifest.modelId}/artifact`,
  )

  useEffect(() => {
    scene.traverse((node: Object3D) => {
      const semanticNode = manifest.semanticNodes.find((candidate) =>
        candidate.representation.glbNodes.includes(node.name),
      )
      node.visible =
        visibilityMode === "all" ||
        semanticNode?.semanticId === selectedSemanticId
    })
  }, [manifest.semanticNodes, scene, selectedSemanticId, visibilityMode])

  useEffect(() => {
    onReady()
  }, [onReady])

  return (
    <primitive
      object={scene}
      onClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation()
        const semanticNode = manifest.semanticNodes.find((candidate) =>
          candidate.representation.glbNodes.includes(event.object.name),
        )
        if (semanticNode) {
          onSelect(semanticNode.semanticId)
        }
      }}
    />
  )
}

export function App() {
  const [manifest, setManifest] = useState<SpatialModelManifest>()
  const [selectedSemanticId, setSelectedSemanticId] = useState<string>()
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>("all")
  const [isArtifactReady, setIsArtifactReady] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    const controller = new AbortController()

    async function loadManifest() {
      try {
        const response = await fetch(
          `${apiBaseUrl}/api/models/${defaultModelId}/manifest`,
          { signal: controller.signal },
        )
        if (!response.ok) {
          throw new Error(`Model API returned ${response.status}`)
        }
        setManifest(SpatialModelManifestSchema.parse(await response.json()))
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load model",
          )
        }
      }
    }

    void loadManifest()
    return () => controller.abort()
  }, [])

  const selectedSemanticNode = manifest?.semanticNodes.find(
    (semanticNode) => semanticNode.semanticId === selectedSemanticId,
  )

  if (error) {
    return (
      <main className="state-panel">
        <h1>Equipment Explorer</h1>
        <p>{error}</p>
      </main>
    )
  }

  if (!manifest) {
    return (
      <main className="state-panel">
        <h1>Equipment Explorer</h1>
        <p>Loading validated model artifact...</p>
      </main>
    )
  }

  return (
    <main className="workbench">
      <header>
        <div>
          <p className="eyebrow">Equipment Explorer</p>
          <h1>Detroit Diesel 8V92TA</h1>
        </div>
        <p className="artifact">
          {manifest.artifact.artifactVersion} · validated fixture
        </p>
      </header>
      <section
        className="canvas-shell"
        aria-label="Interactive equipment model"
        data-artifact-ready={isArtifactReady}
      >
        <Canvas camera={{ position: [0, 0, 2.5], fov: 45 }}>
          <color attach="background" args={["#dfe7e5"]} />
          <ambientLight intensity={1.5} />
          <directionalLight position={[2, 3, 4]} intensity={2} />
          <Bounds fit clip observe margin={1.8}>
            <Suspense fallback={null}>
              <Model
                manifest={manifest}
                selectedSemanticId={selectedSemanticId}
                visibilityMode={visibilityMode}
                onSelect={(semanticId) => {
                  setSelectedSemanticId(semanticId)
                  setVisibilityMode("all")
                }}
                onReady={() => setIsArtifactReady(true)}
              />
            </Suspense>
          </Bounds>
          <OrbitControls makeDefault />
        </Canvas>
      </section>
      <aside className="controls">
        <section>
          <h2>Semantic nodes</h2>
          <div className="component-list">
            {manifest.semanticNodes.map((semanticNode) => (
              <button
                className={
                  semanticNode.semanticId === selectedSemanticId
                    ? "selected"
                    : ""
                }
                key={semanticNode.semanticId}
                onClick={() => {
                  setSelectedSemanticId(semanticNode.semanticId)
                  setVisibilityMode("all")
                }}
              >
                {semanticNode.displayName}
              </button>
            ))}
          </div>
        </section>
        <section>
          <h2>View</h2>
          <div className="command-row">
            <button
              disabled={!selectedSemanticId}
              onClick={() => setVisibilityMode("isolated")}
            >
              Isolate
            </button>
            <button onClick={() => setVisibilityMode("all")}>Show all</button>
            <button
              onClick={() => {
                setSelectedSemanticId(undefined)
                setVisibilityMode("all")
              }}
            >
              Reset
            </button>
          </div>
        </section>
        <section className="details">
          <h2>Selection</h2>
          {selectedSemanticNode ? (
            <dl>
              <dt>Semantic node</dt>
              <dd>{selectedSemanticNode.semanticId}</dd>
              <dt>Role</dt>
              <dd>{selectedSemanticNode.semanticRole}</dd>
              <dt>Capabilities</dt>
              <dd>{selectedSemanticNode.interactionCapabilities.join(", ")}</dd>
            </dl>
          ) : (
            <p>Select a semantic node in the canvas or list.</p>
          )}
        </section>
      </aside>
    </main>
  )
}
