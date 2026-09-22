import { createServer } from "node:http"

import express from "express"
import request from "supertest"
import { afterEach, describe, expect, it } from "vitest"

import { createApiProxy } from "./api-proxy.js"

const servers: ReturnType<typeof createServer>[] = []

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()))
        }),
    ),
  )
})

describe("createApiProxy", () => {
  it("forwards same-origin /api requests to the configured upstream", async () => {
    const upstream = express()
    upstream.get("/api/models", (_request, response) => {
      response.json({ owner: "configured-upstream" })
    })
    const server = createServer(upstream)
    servers.push(server)
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve))
    const address = server.address()
    if (!address || typeof address === "string") {
      throw new Error("Test upstream did not bind a TCP port.")
    }

    const viewer = express()
    viewer.use("/api", createApiProxy(`http://127.0.0.1:${address.port}`))

    await request(viewer)
      .get("/api/models")
      .expect(200, { owner: "configured-upstream" })
  })
})
