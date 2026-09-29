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
    console.error("Spatial model contract: invalid")
    console.error(report.errors.join("\n"))
    process.exitCode = 1
  } else {
    console.log("Spatial model contract: valid")
    console.log(`Model kind: ${report.manifest.modelKind}`)
    console.log(`Semantic nodes: ${report.manifest.semanticNodes.length}`)
    console.log("READY")
  }
}
