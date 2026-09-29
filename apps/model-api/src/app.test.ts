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

    expect(catalog.body).toHaveLength(2)
    expect(hatteras).toMatchObject({
      modelKind: "hatteras-63-motor-yacht",
      modelVersion: "0.1.0",
    })
    await request(app)
      .get("/api/models/hatteras-63-motor-yacht-prototype/manifest")
      .expect(200)
    await request(app)
      .get("/api/models/hatteras-63-motor-yacht-prototype/artifact")
      .expect(200)
    await request(app).get("/api/models/not-a-model").expect(404, {
      error: "model_not_found",
    })
  })
})
