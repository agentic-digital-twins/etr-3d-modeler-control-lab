import { z } from "zod"

export const CompatibilityClassificationSchema = z.enum([
  "backward-compatible",
  "coordinated",
  "breaking",
])

export const SourceReferenceSchema = z.object({
  referenceId: z.string().min(1),
  kind: z.enum([
    "service-manual",
    "engineering-drawing",
    "measured-dimension",
    "photograph",
    "manufacturer-specification",
    "operator-measurement",
    "reference-mesh",
  ]),
  title: z.string().min(1),
  revision: z.string().min(1).optional(),
  locator: z.string().min(1),
  acquiredAt: z.string().datetime(),
  role: z.string().min(1),
})

const InteractionCapabilitySchema = z.enum([
  "selectable",
  "highlightable",
  "isolatable",
  "animatable",
])

export const SpatialTransformSchema = z.object({
  position: z.tuple([z.number(), z.number(), z.number()]),
  rotation: z.tuple([z.number(), z.number(), z.number()]).optional(),
  scale: z.tuple([z.number(), z.number(), z.number()]).optional(),
})

export const PlacementRegionSchema = z.object({
  regionId: z.string().min(1),
  displayName: z.string().min(1),
  regionKind: z.string().min(1),
  transform: SpatialTransformSchema,
  dimensions: z.tuple([
    z.number().positive(),
    z.number().positive(),
    z.number().positive(),
  ]),
})

export const PlacementAnchorSchema = z.object({
  anchorId: z.string().min(1),
  displayName: z.string().min(1),
  transform: SpatialTransformSchema,
  placementRegionId: z.string().min(1).optional(),
})

export const SpatialSemanticNodeSchema = z.object({
  semanticId: z.string().min(1),
  semanticKind: z.string().min(1),
  semanticRole: z.string().min(1),
  displayName: z.string().min(1),
  parentSemanticId: z.string().min(1).optional(),
  representation: z.object({
    glbNodes: z.array(z.string().min(1)).min(1),
  }),
  interactionCapabilities: z.array(InteractionCapabilitySchema).default([]),
  spatial: z
    .object({
      placementRegions: z.array(PlacementRegionSchema).default([]),
      placementAnchors: z.array(PlacementAnchorSchema).default([]),
    })
    .optional(),
})

export const SpatialModelReferenceSchema = z.object({
  modelId: z.string().min(1),
  instanceId: z.string().min(1),
  parentSemanticId: z.string().min(1),
  transform: SpatialTransformSchema,
})

export const SpatialModelManifestSchema = z.object({
  modelId: z.string().min(1),
  modelKind: z.string().min(1),
  modelProfile: z.string().min(1),
  modelVersion: z.string().min(1),
  subject: z.object({
    subjectId: z.string().min(1),
    subjectKind: z.string().min(1),
  }),
  artifact: z.object({
    artifactId: z.string().min(1),
    artifactVersion: z.string().min(1),
    fileName: z.string().endsWith(".glb"),
    contentFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  }),
  generator: z.object({
    name: z.string().min(1),
    version: z.string().min(1),
    sourceRevision: z.string().min(1),
  }),
  sourceReferences: z.array(SourceReferenceSchema).default([]),
  coordinateFrame: z.string().min(1),
  placementCoordinateFrame: z.literal("model").default("model"),
  units: z.string().min(1),
  createdAt: z.string().datetime(),
  generatedAt: z.string().datetime(),
  exportedAt: z.string().datetime(),
  validatedAt: z.string().datetime(),
  semanticNodes: z.array(SpatialSemanticNodeSchema).min(1),
  modelReferences: z.array(SpatialModelReferenceSchema).default([]),
})

export type SpatialModelManifest = z.infer<typeof SpatialModelManifestSchema>
export type SpatialSemanticNode = z.infer<typeof SpatialSemanticNodeSchema>
export type PlacementRegion = z.infer<typeof PlacementRegionSchema>
export type PlacementAnchor = z.infer<typeof PlacementAnchorSchema>

export const EquipmentComponentSchema = z.object({
  componentId: z.string().min(1),
  componentKind: z.string().min(1),
  semanticRole: z.string().min(1),
  displayName: z.string().min(1),
  parentComponentId: z.string().min(1).optional(),
  glbNodeName: z.string().min(1),
  capabilities: z.array(InteractionCapabilitySchema).default([]),
})

export const EquipmentModelManifestSchema = z.object({
  modelId: z.string().min(1),
  modelKind: z.string().min(1),
  modelVersion: z.string().min(1),
  subjectId: z.string().min(1),
  subjectKind: z.literal("equipment-model"),
  artifact: z.object({
    artifactId: z.string().min(1),
    artifactVersion: z.string().min(1),
    fileName: z.string().endsWith(".glb"),
    contentFingerprint: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  }),
  generator: z.object({
    name: z.string().min(1),
    version: z.string().min(1),
    sourceRevision: z.string().min(1),
  }),
  sourceReferences: z.array(SourceReferenceSchema).default([]),
  coordinateFrame: z.string().min(1),
  units: z.string().min(1),
  createdAt: z.string().datetime(),
  generatedAt: z.string().datetime(),
  exportedAt: z.string().datetime(),
  validatedAt: z.string().datetime(),
  components: z.array(EquipmentComponentSchema).min(1),
})

export type EquipmentModelManifest = z.infer<
  typeof EquipmentModelManifestSchema
>
export type EquipmentComponent = z.infer<typeof EquipmentComponentSchema>
export type CompatibilityClassification = z.infer<
  typeof CompatibilityClassificationSchema
>
