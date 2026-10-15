import type { StructuredSurface, SurfaceNode, SurfaceRelation } from './types.mjs'
import { STRUCTURED_SURFACE_SCHEMA_ID, STRUCTURED_SURFACE_VERSION, STRUCTURED_SURFACE_LIMITS } from './limits.mjs'
import { SurfaceBuilder, boundedSource } from './surface-builder.mjs'
export { STRUCTURED_SURFACE_SCHEMA_ID, STRUCTURED_SURFACE_VERSION, STRUCTURED_SURFACE_LIMITS, SurfaceBuilder, boundedSource }
export type * from './types.mjs'

const NODE_KINDS = new Set(['document', 'element', 'text', 'reference', 'value', 'opaque'])
const RELATION_KINDS = new Set(['contains', 'follows', 'references', 'labels'])

function boundedText(value: unknown, maximum: number, name: string) {
  if (typeof value !== 'string' || !value || value.trim() !== value || value.includes('\0') || value.length > maximum) {
    throw new TypeError(`structured-surface-invalid-${name}`)
  }
}

export function validateStructuredSurface(input: unknown): asserts input is StructuredSurface {
  const surface = input as StructuredSurface | null | undefined
  if (!surface || typeof surface !== 'object' || !(surface.schemaId === STRUCTURED_SURFACE_SCHEMA_ID && surface.schemaVersion === STRUCTURED_SURFACE_VERSION) || !surface.source || !surface.parser ||
      !Array.isArray(surface.nodes) || !Array.isArray(surface.relations) || typeof surface.truncated !== 'boolean') {
    throw new TypeError('structured-surface-invalid-contract')
  }
  boundedText(surface.source.reference, 512, 'source-reference')
  if (surface.source.revision !== null) boundedText(surface.source.revision, 512, 'source-revision')
  boundedText(surface.source.mediaType, 128, 'media-type')
  boundedText(surface.parser.artifact, 256, 'parser-artifact')
  boundedText(surface.parser.version, 32, 'parser-version')
  boundedText(surface.parser.standard, 256, 'parser-standard')
  if (surface.parser.version !== surface.schemaVersion) throw new TypeError('structured-surface-parser-version-mismatch')
  if (surface.nodes.length < 1 || surface.nodes.length > STRUCTURED_SURFACE_LIMITS.nodes ||
      surface.relations.length > STRUCTURED_SURFACE_LIMITS.relations) throw new RangeError('structured-surface-capacity-exceeded')
  const ids = new Set<string>()
  for (const node of surface.nodes) {
    if (!node || typeof node !== 'object') throw new TypeError('structured-surface-invalid-node')
    boundedText(node.id, 128, 'node-id')
    boundedText(node.formatName, 128, 'format-name')
    if (node.valueType !== undefined) boundedText(node.valueType, 64, 'node-value-type')
    if (ids.has(node.id) || !NODE_KINDS.has(node.kind) || !Array.isArray(node.traits) || !node.attributes || typeof node.attributes !== 'object') {
      throw new TypeError('structured-surface-invalid-node')
    }
    ids.add(node.id)
    if (node.traits.length > 16 || new Set(node.traits).size !== node.traits.length ||
        node.traits.some(value => typeof value !== 'string' || !value || value.length > 128 || value.includes('\0'))) {
      throw new TypeError('structured-surface-invalid-traits')
    }
    const attributes = Object.entries(node.attributes)
    if (attributes.length > 32 || attributes.some(([key, value]) => !key || key.length > 128 ||
      typeof value !== 'string' || value.length > 512 || key.includes('\0') || value.includes('\0'))) {
      throw new TypeError('structured-surface-invalid-attributes')
    }
    if (node.value !== undefined && (typeof node.value !== 'string' || node.value.length > STRUCTURED_SURFACE_LIMITS.valueCharacters || node.value.includes('\0'))) {
      throw new TypeError('structured-surface-invalid-value')
    }
    if (node.span && (!Number.isSafeInteger(node.span.start) || !Number.isSafeInteger(node.span.end) || node.span.start < 0 || node.span.end < node.span.start)) {
      throw new TypeError('structured-surface-invalid-span')
    }
  }
  const documents = surface.nodes.filter(node => node.kind === 'document')
  if (documents.length !== 1) throw new TypeError('structured-surface-document-required')
  const documentId = documents[0].id
  const relations = new Set()
  const containsParent = new Map<string, string>()
  const containsChildren = new Map<string, string[]>()
  for (const relation of surface.relations) {
    if (!relation || !ids.has(relation.source) || !ids.has(relation.target) || !RELATION_KINDS.has(relation.kind)) {
      throw new TypeError('structured-surface-invalid-relation')
    }
    const key = `${relation.source}\0${relation.kind}\0${relation.target}`
    if (relations.has(key)) throw new TypeError('structured-surface-duplicate-relation')
    relations.add(key)
    if (relation.kind === 'contains') {
      if (relation.target === documentId || containsParent.has(relation.target)) throw new TypeError('structured-surface-invalid-containment')
      containsParent.set(relation.target, relation.source)
      const children = containsChildren.get(relation.source) ?? []
      children.push(relation.target)
      containsChildren.set(relation.source, children)
    }
  }
  const reached = new Set([documentId])
  const pending = [documentId]
  while (pending.length) {
    const current = pending.shift()!
    for (const child of containsChildren.get(current) ?? []) {
      if (reached.has(child)) throw new TypeError('structured-surface-containment-cycle')
      reached.add(child)
      pending.push(child)
    }
  }
  if (reached.size !== ids.size) throw new TypeError('structured-surface-detached-node')
}

export function createStructuredSurface(input: Omit<StructuredSurface, 'schemaId' | 'schemaVersion'>) {
  const surface: StructuredSurface = { ...input, schemaId: STRUCTURED_SURFACE_SCHEMA_ID, schemaVersion: STRUCTURED_SURFACE_VERSION }
  validateStructuredSurface(surface)
  return surface
}

export function normalizeHttpReference(value: string) {
  try {
    const parsed = new URL(value)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`
  } catch { return null }
}

export function createPlainTextSurface(input: { source: string, sourceRef: string, sourceRevision?: string | null }) {
  if (!input || typeof input.source !== 'string' || typeof input.sourceRef !== 'string' || !input.sourceRef.trim()) {
    throw new TypeError('plain-text-surface-invalid-input')
  }
  const bounded = boundedSource(input.source)
  const builder = new SurfaceBuilder({ id: 'document', kind: 'document', formatName: 'plain-text', traits: [], attributes: {}, span: { start: 0, end: bounded.length } }, 'text', 'text')
  if (bounded) builder.add('document', 'text', 'text', { value: bounded, valueType: 'text', span: { start: 0, end: bounded.length } }, true)
  const { nodes, relations } = builder
  return createStructuredSurface({
    source: { reference: input.sourceRef.trim(), revision: input.sourceRevision?.trim() || null, mediaType: 'text/plain' },
    parser: { artifact: '@zixcel/document-structure', version: STRUCTURED_SURFACE_VERSION, standard: 'Unicode plain text' },
    nodes, relations, truncated: bounded.length !== input.source.length || builder.truncated
  })
}

export function visibleSurfaceText(surface: StructuredSurface) {
  validateStructuredSurface(surface)
  return surface.nodes
    .filter(node => node.kind === 'text' && node.value && !node.traits.includes('reference-label'))
    .reduce((text, node) => text + (text && !node.traits.includes('text-continuation') ? ' ' : '') + node.value, '').replace(/\s+/gu, ' ').trim()
}
