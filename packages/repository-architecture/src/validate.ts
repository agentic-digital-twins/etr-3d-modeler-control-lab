import { readFile } from "node:fs/promises"
import { resolve } from "node:path"
import { parse } from "yaml"

import { RepositoryArchitectureSchema } from "./schema.js"

const [repositoryFile] = process.argv.slice(2)

if (!repositoryFile) {
  console.error("Usage: tsx src/validate.ts <repository.yaml>")
  process.exitCode = 1
} else {
  const filePath = resolve(repositoryFile)
  const contents = await readFile(filePath, "utf8")
  const result = RepositoryArchitectureSchema.safeParse(parse(contents))

  if (!result.success) {
    console.error(`Repository architecture validation failed: ${filePath}`)
    console.error(result.error.issues.map((issue) => issue.message).join("\n"))
    process.exitCode = 1
  } else {
    console.log("Repository architecture: valid")
    console.log(`Repository: ${result.data.repositoryId}`)
    console.log(`Capability: ${result.data.purpose.capability}`)
    console.log("AiGDC repository acceptance: architecture PASS")
  }
}
