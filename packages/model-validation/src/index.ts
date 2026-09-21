import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { basename } from "node:path"

import {
  EquipmentModelManifestSchema,
  type EquipmentModelManifest,
} from "@etr/equipment-model-contracts"

export type ValidationReport =
  | { valid: true; manifest: EquipmentModelManifest }
  | { valid: false; errors: string[] }

function readGlbNodeNames(contents: Buffer): Set<string> {
  if (contents.length < 20) {
    throw new Error("GLB is too short to contain a header and JSON chunk.")
  }
  if (contents.readUInt32LE(0) !== 0x46546c67) {
    throw new Error("Artifact is not a GLB file.")
  }
  if (contents.readUInt32LE(4) !== 2) {
    throw new Error("GLB must use version 2.")
  }
  if (contents.readUInt32LE(8) !== contents.length) {
    throw new Error("GLB header length does not match artifact length.")
  }

  const jsonLength = contents.readUInt32LE(12)
  if (contents.readUInt32LE(16) !== 0x4e4f534a) {
    throw new Error("GLB is missing its JSON chunk.")
  }
  if (jsonLength > contents.length - 20) {
    throw new Error("GLB JSON chunk exceeds artifact bounds.")
  }

  const document = JSON.parse(
    contents.subarray(20, 20 + jsonLength).toString("utf8"),
  ) as { nodes?: Array<{ name?: string }> }
  return new Set(
    document.nodes?.flatMap((node) => (node.name ? [node.name] : [])),
  )
}

function validateContainment(
  manifest: EquipmentModelManifest,
  errors: string[],
): void {
  const components = new Map(
    manifest.components.map((component) => [component.componentId, component]),
  )

  for (const component of manifest.components) {
    if (!component.parentComponentId) {
      continue
    }
    if (component.parentComponentId === component.componentId) {
      errors.push(`Component cannot parent itself: ${component.componentId}`)
      continue
    }
    if (!components.has(component.parentComponentId)) {
      errors.push(
        `Parent component not found: ${component.componentId} -> ${component.parentComponentId}`,
      )
    }
  }

  for (const component of manifest.components) {
    const visited = new Set<string>()
    let current = component
    while (current.parentComponentId) {
      if (visited.has(current.componentId)) {
        errors.push(
          `Containment cycle detected at component: ${component.componentId}`,
        )
        break
      }
      visited.add(current.componentId)
      const parent = components.get(current.parentComponentId)
      if (!parent) {
        break
      }
      current = parent
    }
  }
}

export async function validateModel(
  manifestPath: string,
  artifactPath: string,
): Promise<ValidationReport> {
  const errors: string[] = []
  const [manifestContents, artifactContents] = await Promise.all([
    readFile(manifestPath, "utf8"),
    readFile(artifactPath),
  ])
  const parsed = EquipmentModelManifestSchema.safeParse(
    JSON.parse(manifestContents),
  )

  if (!parsed.success) {
    return {
      valid: false,
      errors: parsed.error.issues.map((issue) => issue.message),
    }
  }

  const manifest = parsed.data
  const fingerprint = `sha256:${createHash("sha256").update(artifactContents).digest("hex")}`

  if (fingerprint !== manifest.artifact.contentFingerprint) {
    errors.push(
      "Artifact fingerprint does not match manifest contentFingerprint.",
    )
  }
  if (manifest.artifact.fileName !== basename(artifactPath)) {
    errors.push("Artifact file name does not match the supplied artifact path.")
  }

  const componentIds = new Set<string>()
  const nodeNames = new Set<string>()
  let artifactNodeNames = new Set<string>()
  try {
    artifactNodeNames = readGlbNodeNames(artifactContents)
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : "Unable to inspect GLB nodes.",
    )
  }
  for (const component of manifest.components) {
    if (componentIds.has(component.componentId)) {
      errors.push(`Duplicate componentId: ${component.componentId}`)
    }
    if (nodeNames.has(component.glbNodeName)) {
      errors.push(`Duplicate glbNodeName: ${component.glbNodeName}`)
    }
    if (!artifactNodeNames.has(component.glbNodeName)) {
      errors.push(`GLB node not found: ${component.glbNodeName}`)
    }
    componentIds.add(component.componentId)
    nodeNames.add(component.glbNodeName)
  }
  validateContainment(manifest, errors)

  const timestamps = [
    manifest.createdAt,
    manifest.generatedAt,
    manifest.exportedAt,
    manifest.validatedAt,
  ].map((value) => Date.parse(value))
  if (
    timestamps.some(
      (value, index) => index > 0 && value < timestamps[index - 1],
    )
  ) {
    errors.push("Lifecycle timestamps must be in nondecreasing order.")
  }

  return errors.length > 0
    ? { valid: false, errors }
    : { valid: true, manifest }
}
