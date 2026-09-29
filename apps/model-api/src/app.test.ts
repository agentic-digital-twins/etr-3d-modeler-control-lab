import request from "supertest"
import { describe, expect, it } from "vitest"

import { createApp } from "./app.js"

describe("model API", () => {
  it("serves the validated fixture catalog and rejects unknown models", async () => {
    const app = await createApp()
    const catalog = await request(app).get("/api/models").expect(200)
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

    expect(catalog.body).toHaveLength(5)
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
})
