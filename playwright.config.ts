import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  webServer: [
    {
      command: "pnpm --filter @etr/model-api dev",
      url: "http://127.0.0.1:4230/health",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: "pnpm --filter @etr/equipment-viewer dev",
      url: "http://127.0.0.1:4231",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
  use: {
    baseURL: "http://127.0.0.1:4231",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
})
