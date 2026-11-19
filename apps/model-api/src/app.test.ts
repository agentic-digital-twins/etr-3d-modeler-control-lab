import { createHash } from "node:crypto"

import request from "supertest"
import { describe, expect, it } from "vitest"

import { createApp } from "./app.js"

describe("model API", () => {
  it("serves the validated model catalog and rejects unknown models", async () => {
    const app = await createApp()
    const catalog = await request(app).get("/api/models").expect(200)
    const currentHatteras = catalog.body.find(
      (model: { modelId: string }) =>
        model.modelId === "hatteras-63-motor-yacht-v2",
    )
    const hatteras = catalog.body.find(
      (model: { modelId: string }) =>
        model.modelId === "hatteras-63-motor-yacht-prototype",
    )
    const centerConsole = catalog.body.find(
      (model: { modelId: string }) =>
        model.modelId === "offshore-center-console",
    )
    const sportfish = catalog.body.find(
      (model: { modelId: string }) => model.modelId === "convertible-sportfish",
    )
    const superyacht = catalog.body.find(
      (model: { modelId: string }) => model.modelId === "tri-deck-superyacht",
    )

    expect(catalog.body).toHaveLength(7)
    expect(currentHatteras).toMatchObject({
      displayName: "Hatteras 63 Motor Yacht (Current)",
      modelKind: "vessel",
      modelVersion: "2.0.0",
    })
    expect(hatteras).toMatchObject({
      modelKind: "hatteras-63-motor-yacht",
      modelVersion: "0.1.0",
    })
    expect(centerConsole).toMatchObject({
      displayName: "Offshore Center Console",
      modelKind: "vessel",
      modelVersion: "0.1.0",
    })
    expect(sportfish).toMatchObject({
      displayName: "Convertible Sportfish",
      modelKind: "vessel",
      modelVersion: "0.1.0",
    })
    expect(superyacht).toMatchObject({
      displayName: "Tri-Deck Superyacht",
      modelKind: "vessel",
      modelVersion: "0.1.0",
    })
    await request(app)
      .get("/api/models/hatteras-63-motor-yacht-prototype/manifest")
      .expect(200)
    await request(app)
      .get("/api/models/hatteras-63-motor-yacht-prototype/artifact")
      .expect(200)
    await request(app)
      .get("/api/models/hatteras-63-motor-yacht-v2/manifest")
      .expect(200)
    await request(app)
      .get("/api/models/hatteras-63-motor-yacht-v2/artifact")
      .expect(200)
    await request(app)
      .get("/api/models/offshore-center-console/manifest")
      .expect(200)
    await request(app)
      .get("/api/models/offshore-center-console/artifact")
      .expect(200)
    await request(app)
      .get("/api/models/convertible-sportfish/manifest")
      .expect(200)
    await request(app)
      .get("/api/models/convertible-sportfish/artifact")
      .expect(200)
    await request(app)
      .get("/api/models/tri-deck-superyacht/manifest")
      .expect(200)
    await request(app)
      .get("/api/models/tri-deck-superyacht/artifact")
      .expect(200)
    await request(app).get("/api/models/not-a-model").expect(404, {
      error: "model_not_found",
    })
  })

  it("serves the authored Center Console and its registered viewer GLB", async () => {
    const app = await createApp()
    const catalog = await request(app).get("/api/models").expect(200)
    expect(catalog.body).toContainEqual({
      modelId: "offshore-center-console-v2",
      displayName: "Offshore Center Console (Authored)",
      modelKind: "vessel",
      modelVersion: "2.0.0",
    })

    const path = "/api/models/offshore-center-console-v2"
    const manifest = await request(app).get(`${path}/manifest`).expect(200)
    const artifact = await request(app)
      .get(`${path}/artifact`)
      .expect("Content-Type", "model/gltf-binary")
      .buffer(true)
      .parse((response, callback) => {
        const chunks: Buffer[] = []
        response.on("data", (chunk: Buffer) => chunks.push(chunk))
        response.on("error", callback)
        response.on("end", () => callback(null, Buffer.concat(chunks)))
      })
      .expect(200)
    expect(manifest.body.artifact.fileName).toBe("center-console-viewer-v1.glb")
    const hash = createHash("sha256").update(artifact.body).digest("hex")
    expect(`sha256:${hash}`).toBe(manifest.body.artifact.contentFingerprint)
  })
})
