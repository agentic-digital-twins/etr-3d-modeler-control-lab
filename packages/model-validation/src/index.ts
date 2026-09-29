import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import { basename } from "node:path"

import {
  SpatialModelManifestSchema,
  type SpatialModelManifest,
} from "@etr/equipment-model-contracts"

export type ValidationReport =
  | { valid: true; manifest: SpatialModelManifest }
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
  manifest: SpatialModelManifest,
  errors: string[],
): void {
  const semanticNodes = new Map(
    manifest.semanticNodes.map((node) => [node.semanticId, node]),
  )

  for (const node of manifest.semanticNodes) {
    if (!node.parentSemanticId) {
      continue
    }
    if (node.parentSemanticId === node.semanticId) {
      errors.push(`Semantic node cannot parent itself: ${node.semanticId}`)
      continue
    }
    if (!semanticNodes.has(node.parentSemanticId)) {
      errors.push(
        `Parent semantic node not found: ${node.semanticId} -> ${node.parentSemanticId}`,
      )
    }
  }

  for (const node of manifest.semanticNodes) {
    const visited = new Set<string>()
    let current = node
    while (current.parentSemanticId) {
      if (visited.has(current.semanticId)) {
        errors.push(
          `Containment cycle detected at semantic node: ${node.semanticId}`,
        )
        break
      }
      visited.add(current.semanticId)
      const parent = semanticNodes.get(current.parentSemanticId)
      if (!parent) {
        break
      }
      current = parent
    }
  }

  for (const reference of manifest.modelReferences) {
    if (!semanticNodes.has(reference.parentSemanticId)) {
      errors.push(
        `Model reference parent not found: ${reference.instanceId} -> ${reference.parentSemanticId}`,
      )
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
  const parsed = SpatialModelManifestSchema.safeParse(
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

  const semanticIds = new Set<string>()
  const nodeNames = new Set<string>()
  let artifactNodeNames = new Set<string>()
  try {
    artifactNodeNames = readGlbNodeNames(artifactContents)
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : "Unable to inspect GLB nodes.",
    )
  }
  for (const semanticNode of manifest.semanticNodes) {
    if (semanticIds.has(semanticNode.semanticId)) {
      errors.push(`Duplicate semanticId: ${semanticNode.semanticId}`)
    }
    for (const glbNodeName of semanticNode.representation.glbNodes) {
      if (nodeNames.has(glbNodeName)) {
        errors.push(`Duplicate GLB node binding: ${glbNodeName}`)
      }
      if (!artifactNodeNames.has(glbNodeName)) {
        errors.push(`GLB node not found: ${glbNodeName}`)
      }
      nodeNames.add(glbNodeName)
    }
    semanticIds.add(semanticNode.semanticId)

    const placementRegionIds = new Set<string>()
    for (const placementRegion of semanticNode.spatial?.placementRegions ??
      []) {
      if (placementRegionIds.has(placementRegion.regionId)) {
        errors.push(
          `Duplicate placement region: ${semanticNode.semanticId} -> ${placementRegion.regionId}`,
        )
      }
      placementRegionIds.add(placementRegion.regionId)
    }
    const placementAnchorIds = new Set<string>()
    for (const placementAnchor of semanticNode.spatial?.placementAnchors ??
      []) {
      if (placementAnchorIds.has(placementAnchor.anchorId)) {
        errors.push(
          `Duplicate placement anchor: ${semanticNode.semanticId} -> ${placementAnchor.anchorId}`,
        )
      }
      if (
        placementAnchor.placementRegionId &&
        !placementRegionIds.has(placementAnchor.placementRegionId)
      ) {
        errors.push(
          `Placement anchor region not found: ${semanticNode.semanticId} -> ${placementAnchor.placementRegionId}`,
        )
      }
      placementAnchorIds.add(placementAnchor.anchorId)
    }
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
