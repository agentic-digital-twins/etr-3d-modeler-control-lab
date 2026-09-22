import { createApp } from "./app.js"

const host = process.env.MODEL_API_HOST ?? "127.0.0.1"
const port = Number(process.env.MODEL_API_PORT ?? 4230)
const app = await createApp()

app.listen(port, host, () => {
  console.log(`Model API listening on http://${host}:${port}`)
})
