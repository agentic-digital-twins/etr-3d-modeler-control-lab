import request from "supertest"
import { describe, expect, it } from "vitest"

import { createApp } from "./app.js"

describe("model API", () => {
  it("serves the validated fixture catalog and rejects unknown models", async () => {
    const app = await createApp()
    const catalog = await request(app).get("/api/models").expect(200)
    const modelId = catalog.body[0].modelId as string

    expect(catalog.body).toHaveLength(1)
    await request(app).get(`/api/models/${modelId}/manifest`).expect(200)
    await request(app).get(`/api/models/${modelId}/artifact`).expect(200)
    await request(app).get("/api/models/not-a-model").expect(404, {
      error: "model_not_found",
    })
  })
})
