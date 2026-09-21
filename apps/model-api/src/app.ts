import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

import express, { type Express } from "express"

import { validateModel } from "@etr/model-validation"

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../..",
)
const fixtureDirectory = resolve(repositoryRoot, "fixtures/equipment-models")
const manifestPath = resolve(
  fixtureDirectory,
  "dd-8v92ta-cylinder.manifest.json",
)
const artifactPath = resolve(fixtureDirectory, "dd-8v92ta-cylinder.glb")

export async function createApp(): Promise<Express> {
  const validation = await validateModel(manifestPath, artifactPath)
  if (!validation.valid) {
    throw new Error(`Fixture model is invalid: ${validation.errors.join(" ")}`)
  }

  const manifest = validation.manifest
  const app = express()

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", capability: "equipment-model-catalog" })
  })

  app.get("/api/models", (_request, response) => {
    response.json([
      {
        modelId: manifest.modelId,
        modelKind: manifest.modelKind,
        modelVersion: manifest.modelVersion,
      },
    ])
  })

  app.get("/api/models/:modelId", (request, response) => {
    if (request.params.modelId !== manifest.modelId) {
      response.status(404).json({ error: "model_not_found" })
      return
    }
    response.json(manifest)
  })

  app.get("/api/models/:modelId/manifest", (request, response) => {
    if (request.params.modelId !== manifest.modelId) {
      response.status(404).json({ error: "model_not_found" })
      return
    }
    response.json(manifest)
  })

  app.get("/api/models/:modelId/validation", (request, response) => {
    if (request.params.modelId !== manifest.modelId) {
      response.status(404).json({ error: "model_not_found" })
      return
    }
    response.json({ valid: true, artifactId: manifest.artifact.artifactId })
  })

  app.get("/api/models/:modelId/artifact", (request, response) => {
    if (request.params.modelId !== manifest.modelId) {
      response.status(404).json({ error: "model_not_found" })
      return
    }
    response.type("model/gltf-binary").sendFile(artifactPath)
  })

  return app
}
