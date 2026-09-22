import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

const viewerHost = process.env.MODEL_VIEWER_HOST ?? "127.0.0.1"
const viewerPort = Number(process.env.MODEL_VIEWER_PORT ?? 4231)
const modelApiUpstream =
  process.env.MODEL_API_UPSTREAM ?? "http://127.0.0.1:4230"

export default defineConfig({
  plugins: [react()],
  server: {
    host: viewerHost,
    port: viewerPort,
    proxy: {
      "/api": modelApiUpstream,
    },
  },
  test: {
    environment: "jsdom",
  },
})
