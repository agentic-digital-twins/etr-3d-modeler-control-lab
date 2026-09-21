import { z } from "zod"

const BoundaryIdentifierSchema = z.enum([
  "equipment-model-generation",
  "equipment-model-semantic-contracts",
  "equipment-model-validation",
  "equipment-model-inspection",
  "operational-equipment-state",
  "telemetry-truth",
  "alert-lifecycle",
  "maintenance-truth",
  "chief-decision-authority",
])
type BoundaryIdentifier = z.infer<typeof BoundaryIdentifierSchema>

export const RepositoryArchitectureSchema = z
  .object({
    repositoryId: z.literal("etr-3d-modeler-control-lab"),
    repositoryKind: z.literal("control-lab"),
    purpose: z.object({
      capability: z.literal("semantic-equipment-model-generation"),
      statement: z.string().min(1),
    }),
    architecture: z.object({
      realm: z.literal("equipment-modeling"),
      faculty: z.literal("spatial-modeling"),
      maturity: z.literal("experimental"),
    }),
    boundaries: z
      .object({
        owns: z.array(BoundaryIdentifierSchema).min(1),
        doesNotOwn: z.array(BoundaryIdentifierSchema).min(1),
      })
      .superRefine((boundaries, context) => {
        const overlap = boundaries.owns.filter((item) =>
          boundaries.doesNotOwn.includes(item),
        )

        if (overlap.length > 0) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Boundary identifiers cannot be both owned and excluded: ${overlap.join(", ")}`,
          })
        }
      }),
    subjects: z
      .array(z.object({ subjectKind: z.literal("equipment-model") }))
      .min(1),
    firstCustomer: z.literal("Detroit Diesel 8V92TA Equipment Explorer"),
    integrations: z.object({
      current: z.array(z.string()),
      planned: z.array(z.literal("equipment-explorer")).min(1),
    }),
    lifecycle: z.object({
      introducedIn: z.literal("phase-a-slice-1"),
      promotionCondition: z.literal(
        "proven-shared-consumer-or-runtime-requirement",
      ),
    }),
  })
  .superRefine((repository, context) => {
    const requiredOwnedBoundaries: BoundaryIdentifier[] = [
      "equipment-model-generation",
      "equipment-model-semantic-contracts",
      "equipment-model-validation",
      "equipment-model-inspection",
    ]
    const requiredExcludedBoundaries: BoundaryIdentifier[] = [
      "operational-equipment-state",
      "telemetry-truth",
      "alert-lifecycle",
      "maintenance-truth",
      "chief-decision-authority",
    ]

    for (const boundary of requiredOwnedBoundaries) {
      if (!repository.boundaries.owns.includes(boundary)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["boundaries", "owns"],
          message: `Missing required owned boundary: ${boundary}`,
        })
      }
    }

    for (const boundary of requiredExcludedBoundaries) {
      if (!repository.boundaries.doesNotOwn.includes(boundary)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["boundaries", "doesNotOwn"],
          message: `Missing required non-ownership boundary: ${boundary}`,
        })
      }
    }
  })

export type RepositoryArchitecture = z.infer<
  typeof RepositoryArchitectureSchema
>
