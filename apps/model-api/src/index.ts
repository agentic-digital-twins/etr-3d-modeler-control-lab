import { createApp } from "./app.js"

const port = Number(process.env.PORT ?? 4310)
const app = await createApp()

app.listen(port, () => {
  console.log(`Model API listening on http://localhost:${port}`)
})
