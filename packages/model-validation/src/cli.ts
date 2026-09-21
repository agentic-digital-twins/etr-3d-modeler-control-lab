import { resolve } from "node:path"

import { validateModel } from "./index.js"

const [manifestPath, artifactPath] = process.argv.slice(2)

if (!manifestPath || !artifactPath) {
  console.error("Usage: validate-model <manifest.json> <artifact.glb>")
  process.exitCode = 1
} else {
  const report = await validateModel(
    resolve(manifestPath),
    resolve(artifactPath),
  )

  if (!report.valid) {
    console.error("Equipment model contract: invalid")
    console.error(report.errors.join("\n"))
    process.exitCode = 1
  } else {
    console.log("Equipment model contract: valid")
    console.log(`Model kind: ${report.manifest.modelKind}`)
    console.log(`Components: ${report.manifest.components.length}`)
    console.log("READY")
  }
}
