import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

import express from "express"

import { createApp } from "./app.js"

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../..",
)
const viewerDirectory = resolve(repositoryRoot, "apps/equipment-viewer/dist")
const apiHost = process.env.MODEL_API_HOST ?? "127.0.0.1"
const apiPort = Number(process.env.MODEL_API_PORT ?? 4230)
const viewerHost = process.env.MODEL_VIEWER_HOST ?? "0.0.0.0"
const viewerPort = Number(process.env.MODEL_VIEWER_PORT ?? 4231)

if (!existsSync(viewerDirectory)) {
  throw new Error(
    `Viewer build is missing at ${viewerDirectory}. Run pnpm --filter @etr/equipment-viewer build first.`,
  )
}

const api = await createApp()
const viewer = express()

viewer.use(api)
viewer.use(express.static(viewerDirectory))
viewer.use((_request, response) => {
  response.sendFile(resolve(viewerDirectory, "index.html"))
})

api.listen(apiPort, apiHost, () => {
  console.log(`Model API listening on http://${apiHost}:${apiPort}`)
})
viewer.listen(viewerPort, viewerHost, () => {
  console.log(
    `Equipment Explorer listening on http://${viewerHost}:${viewerPort}`,
  )
})
