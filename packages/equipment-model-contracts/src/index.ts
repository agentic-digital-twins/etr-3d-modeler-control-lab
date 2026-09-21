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

export const EquipmentComponentSchema = z.object({
  componentId: z.string().min(1),
  componentKind: z.string().min(1),
  semanticRole: z.string().min(1),
  displayName: z.string().min(1),
  parentComponentId: z.string().min(1).optional(),
  glbNodeName: z.string().min(1),
  capabilities: z
    .array(z.enum(["selectable", "highlightable", "isolatable", "animatable"]))
    .default([]),
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
