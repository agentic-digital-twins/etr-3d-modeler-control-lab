import { Suspense, useEffect, useState } from "react"
import { Bounds, OrbitControls, useGLTF } from "@react-three/drei"
import { Canvas, type ThreeEvent } from "@react-three/fiber"
import { Mesh, MeshStandardMaterial, type Object3D } from "three"

import {
  SpatialModelManifestSchema,
  type SpatialModelManifest,
} from "@etr/equipment-model-contracts"

const apiBaseUrl = import.meta.env.VITE_MODEL_API_BASE_URL ?? ""
const defaultModelId = "hatteras-63-motor-yacht-prototype"

type VisibilityMode = "all" | "isolated"
type CapabilityKind = "camera.thermal" | "audio.speaker" | "sensor.water"
type CapabilityPlacement = {
  capability: CapabilityKind
  areaId: string
  anchorId: string
}

const capabilityDefinitions: Array<{
  capability: CapabilityKind
  displayName: string
}> = [
  { capability: "camera.thermal", displayName: "Thermal Camera" },
  { capability: "audio.speaker", displayName: "Speaker" },
  { capability: "sensor.water", displayName: "Water Sensor" },
]

function CapabilityMarker({
  capability,
  position,
}: {
  capability: CapabilityKind
  position: [number, number, number]
}) {
  if (capability === "camera.thermal") {
    return (
      <group position={position}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.35, 16]} />
          <meshStandardMaterial color="#f4b763" emissive="#6f4219" />
        </mesh>
        <mesh position={[0, 0, 0.22]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color="#152830" emissive="#163f4e" />
        </mesh>
      </group>
    )
  }

  if (capability === "audio.speaker") {
    return (
      <mesh position={position} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.12, 20]} />
        <meshStandardMaterial color="#d76d3e" emissive="#6f2918" />
      </mesh>
    )
  }

  return (
    <mesh position={position}>
      <boxGeometry args={[0.22, 0.12, 0.22]} />
      <meshStandardMaterial color="#58a6a2" emissive="#164442" />
    </mesh>
  )
}

function Model({
  manifest,
  selectedSemanticId,
  activeAreaId,
  activeLevelId,
  visibilityMode,
  onSelect,
  onReady,
}: {
  manifest: SpatialModelManifest
  selectedSemanticId?: string
  activeAreaId?: string
  activeLevelId?: string
  visibilityMode: VisibilityMode
  onSelect: (semanticId: string) => void
  onReady: () => void
}) {
  const { scene } = useGLTF(
    `${apiBaseUrl}/api/models/${manifest.modelId}/artifact`,
  )

  useEffect(() => {
    scene.traverse((node: Object3D) => {
      if (
        node instanceof Mesh &&
        node.material instanceof MeshStandardMaterial
      ) {
        node.material = node.material.clone()
      }
    })
  }, [scene])

  useEffect(() => {
    scene.traverse((node: Object3D) => {
      const semanticNode = manifest.semanticNodes.find((candidate) =>
        candidate.representation.glbNodes.includes(node.name),
      )
      const isSelectedLevel = semanticNode?.semanticId === activeLevelId
      const isSelectedArea = semanticNode?.semanticId === activeAreaId
      const isAreaInSelectedLevel =
        semanticNode?.semanticKind === "area" &&
        semanticNode.parentSemanticId === activeLevelId
      const isInSelectionScope =
        isSelectedLevel || isSelectedArea || isAreaInSelectedLevel
      node.visible = visibilityMode === "all" || isInSelectionScope
      if (
        node instanceof Mesh &&
        node.material instanceof MeshStandardMaterial
      ) {
        if (isSelectedArea) {
          node.material.color.set("#f4b763")
          node.material.emissive.set("#6f4219")
        } else if (isSelectedLevel || isAreaInSelectedLevel) {
          node.material.color.set("#58a6a2")
          node.material.emissive.set("#164442")
        } else {
          node.material.color.set("#418da2")
          node.material.emissive.set("#000000")
        }
      }
    })
  }, [
    activeAreaId,
    activeLevelId,
    manifest.semanticNodes,
    scene,
    visibilityMode,
  ])

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
  const [activeAreaId, setActiveAreaId] = useState<string>()
  const [activeLevelId, setActiveLevelId] = useState<string>()
  const [selectedCapability, setSelectedCapability] =
    useState<CapabilityKind>("camera.thermal")
  const [placements, setPlacements] = useState<CapabilityPlacement[]>([])
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
  const areas = manifest?.semanticNodes.filter(
    (semanticNode) => semanticNode.semanticKind === "area",
  )
  const levels = manifest?.semanticNodes.filter(
    (semanticNode) => semanticNode.semanticKind === "level",
  )
  const activeArea = areas?.find(
    (semanticNode) => semanticNode.semanticId === activeAreaId,
  )

  if (error) {
    return (
      <main className="state-panel">
        <h1>Spatial Model Explorer</h1>
        <p>{error}</p>
      </main>
    )
  }

  if (!manifest || !areas || !levels) {
    return (
      <main className="state-panel">
        <h1>Spatial Model Explorer</h1>
        <p>Loading validated model artifact...</p>
      </main>
    )
  }

  function selectSemanticNode(semanticId: string) {
    const semanticNode = manifest?.semanticNodes.find(
      (candidate) => candidate.semanticId === semanticId,
    )
    setSelectedSemanticId(semanticId)
    setVisibilityMode("all")
    if (semanticNode?.semanticKind === "area") {
      setActiveAreaId(semanticId)
      setActiveLevelId(semanticNode.parentSemanticId)
    } else if (semanticNode?.semanticKind === "level") {
      setActiveAreaId(undefined)
      setActiveLevelId(semanticId)
    } else {
      setActiveAreaId(undefined)
      setActiveLevelId(undefined)
    }
  }

  function addCapability() {
    const anchor = activeArea?.spatial?.placementAnchors[0]
    if (!activeArea || !anchor) {
      return
    }
    setPlacements((current) => [
      ...current,
      {
        capability: selectedCapability,
        areaId: activeArea.semanticId,
        anchorId: anchor.anchorId,
      },
    ])
  }

  return (
    <main className="workbench">
      <header>
        <div>
          <p className="eyebrow">Spatial Model Explorer</p>
          <h1>
            {manifest.semanticNodes[0]?.displayName ?? manifest.modelKind}
          </h1>
        </div>
        <p className="artifact">
          {manifest.modelProfile} · {manifest.artifact.artifactVersion} ·
          validated fixture
        </p>
      </header>
      <section
        className="canvas-shell"
        aria-label="Interactive vessel model"
        data-artifact-ready={isArtifactReady}
      >
        <Canvas camera={{ position: [8, 6, 9], fov: 45 }}>
          <color attach="background" args={["#dfe7e5"]} />
          <ambientLight intensity={1.5} />
          <directionalLight position={[2, 3, 4]} intensity={2} />
          <Bounds fit clip observe margin={1.5}>
            <Suspense fallback={null}>
              <Model
                manifest={manifest}
                selectedSemanticId={selectedSemanticId}
                activeAreaId={activeAreaId}
                activeLevelId={activeLevelId}
                visibilityMode={visibilityMode}
                onSelect={selectSemanticNode}
                onReady={() => setIsArtifactReady(true)}
              />
              {placements.map((placement, index) => {
                const area = areas.find(
                  (candidate) => candidate.semanticId === placement.areaId,
                )
                const anchor = area?.spatial?.placementAnchors.find(
                  (candidate) => candidate.anchorId === placement.anchorId,
                )
                return anchor ? (
                  <CapabilityMarker
                    capability={placement.capability}
                    key={`${placement.capability}-${placement.areaId}-${index}`}
                    position={anchor.transform.position}
                  />
                ) : null
              })}
            </Suspense>
          </Bounds>
          <OrbitControls makeDefault />
        </Canvas>
      </section>
      <aside className="controls">
        <section>
          <h2>Capability</h2>
          <div className="component-list">
            {capabilityDefinitions.map((definition) => (
              <button
                className={
                  definition.capability === selectedCapability ? "selected" : ""
                }
                key={definition.capability}
                onClick={() => setSelectedCapability(definition.capability)}
              >
                {definition.displayName}
              </button>
            ))}
          </div>
        </section>
        <section>
          <h2>Spatial Structure</h2>
          <div className="spatial-structure">
            {levels.map((level) => {
              const levelAreas = areas.filter(
                (area) => area.parentSemanticId === level.semanticId,
              )
              return (
                <div className="level-entry" key={level.semanticId}>
                  <button
                    aria-label={`Level: ${level.displayName}`}
                    className={
                      level.semanticId === selectedSemanticId ? "selected" : ""
                    }
                    onClick={() => selectSemanticNode(level.semanticId)}
                  >
                    {level.displayName}
                  </button>
                  <div className="area-list">
                    {levelAreas.map((area) => (
                      <button
                        aria-label={`Area: ${area.displayName}`}
                        className={
                          area.semanticId === activeAreaId ? "selected" : ""
                        }
                        key={area.semanticId}
                        onClick={() => selectSemanticNode(area.semanticId)}
                      >
                        {area.displayName}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
        <section>
          <h2>Configuration</h2>
          <div className="command-row">
            <button disabled={!activeArea} onClick={addCapability}>
              Add capability
            </button>
            <button onClick={() => setPlacements([])}>Clear placements</button>
          </div>
          {placements.length > 0 ? (
            <ul className="placement-list">
              {placements.map((placement, index) => {
                const definition = capabilityDefinitions.find(
                  (candidate) => candidate.capability === placement.capability,
                )
                const area = areas.find(
                  (candidate) => candidate.semanticId === placement.areaId,
                )
                return (
                  <li
                    key={`${placement.areaId}-${placement.anchorId}-${index}`}
                  >
                    {definition?.displayName} · {area?.displayName}
                  </li>
                )
              })}
            </ul>
          ) : (
            <p>Select a capability and area to create a placement.</p>
          )}
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
                setActiveAreaId(undefined)
                setActiveLevelId(undefined)
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
              <dt>Type</dt>
              <dd>{selectedSemanticNode.semanticKind.toUpperCase()}</dd>
              <dt>Role</dt>
              <dd>{selectedSemanticNode.semanticRole}</dd>
              {selectedSemanticNode.semanticKind === "area" ? (
                <>
                  <dt>Level</dt>
                  <dd>
                    {levels.find(
                      (level) =>
                        level.semanticId ===
                        selectedSemanticNode.parentSemanticId,
                    )?.displayName ?? "None"}
                  </dd>
                </>
              ) : null}
              <dt>Anchor</dt>
              <dd>
                {activeArea?.spatial?.placementAnchors[0]?.anchorId ?? "None"}
              </dd>
            </dl>
          ) : (
            <p>Select a semantic node in the canvas or list.</p>
          )}
        </section>
      </aside>
    </main>
  )
}
