import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

import express, { type Express } from "express"

import type { SpatialModelManifest } from "@etr/equipment-model-contracts"
import { validateModel } from "@etr/model-validation"

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../..",
)
const fixtures = [
  {
    manifestPath: resolve(
      repositoryRoot,
      "fixtures/equipment-models/dd-8v92ta-cylinder.manifest.json",
    ),
    artifactPath: resolve(
      repositoryRoot,
      "fixtures/equipment-models/dd-8v92ta-cylinder.glb",
    ),
  },
  {
    manifestPath: resolve(
      repositoryRoot,
      "fixtures/spatial-models/hatteras-63-motor-yacht.manifest.json",
    ),
    artifactPath: resolve(
      repositoryRoot,
      "fixtures/spatial-models/hatteras-63-motor-yacht.glb",
    ),
  },
  {
    manifestPath: resolve(
      repositoryRoot,
      "fixtures/spatial-models/offshore-center-console.manifest.json",
    ),
    artifactPath: resolve(
      repositoryRoot,
      "fixtures/spatial-models/offshore-center-console.glb",
    ),
  },
]

type ValidatedModel = {
  manifest: SpatialModelManifest
  artifactPath: string
}

export async function createApp(): Promise<Express> {
  const models: ValidatedModel[] = await Promise.all(
    fixtures.map(async ({ manifestPath, artifactPath }) => {
      const validation = await validateModel(manifestPath, artifactPath)
      if (!validation.valid) {
        throw new Error(
          `Fixture model is invalid: ${validation.errors.join(" ")}`,
        )
      }
      return { manifest: validation.manifest, artifactPath }
    }),
  )
  const app = express()

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", capability: "spatial-model-catalog" })
  })

  app.get("/api/models", (_request, response) => {
    response.json(
      models.map(({ manifest }) => ({
        modelId: manifest.modelId,
        modelKind: manifest.modelKind,
        modelVersion: manifest.modelVersion,
      })),
    )
  })

  app.get("/api/models/:modelId", (request, response) => {
    const model = models.find(
      ({ manifest }) => manifest.modelId === request.params.modelId,
    )
    if (!model) {
      response.status(404).json({ error: "model_not_found" })
      return
    }
    response.json(model.manifest)
  })

  app.get("/api/models/:modelId/manifest", (request, response) => {
    const model = models.find(
      ({ manifest }) => manifest.modelId === request.params.modelId,
    )
    if (!model) {
      response.status(404).json({ error: "model_not_found" })
      return
    }
    response.json(model.manifest)
  })

  app.get("/api/models/:modelId/validation", (request, response) => {
    const model = models.find(
      ({ manifest }) => manifest.modelId === request.params.modelId,
    )
    if (!model) {
      response.status(404).json({ error: "model_not_found" })
      return
    }
    response.json({
      valid: true,
      artifactId: model.manifest.artifact.artifactId,
    })
  })

  app.get("/api/models/:modelId/artifact", (request, response) => {
    const model = models.find(
      ({ manifest }) => manifest.modelId === request.params.modelId,
    )
    if (!model) {
      response.status(404).json({ error: "model_not_found" })
      return
    }
    response.type("model/gltf-binary").sendFile(model.artifactPath)
  })

  return app
}
