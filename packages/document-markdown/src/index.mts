interface FormatNode { type: string, value?: string, url?: string, alt?: string | null, children?: FormatNode[], position?: { start: { offset?: number }, end: { offset?: number } } }
export interface MarkdownSurfaceInput {
  source: string
  sourceRef: string
  sourceRevision?: string | null
  mediaType?: 'text/markdown'
}

import type { SurfaceNodeKind, SurfaceSpan, StructuredSurface } from '@zixcel/document-structure'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { STRUCTURED_SURFACE_LIMITS, createStructuredSurface, normalizeHttpReference, SurfaceBuilder, boundedSource } from '@zixcel/document-structure'

const GROUPING = new Set(['listItem', 'paragraph', 'blockquote'])
const MAX_DEPTH = 64

function cleanText(value: unknown) { return String(value ?? '').replace(/\s+/gu, ' ').trim() }
function spanOf(node: FormatNode): SurfaceSpan | undefined {
  const start = node.position?.start?.offset
  const end = node.position?.end?.offset
  return typeof start === 'number' && typeof end === 'number' && Number.isSafeInteger(start) && Number.isSafeInteger(end) ? { start, end } : undefined
}
export function parseMarkdownSurface(input: MarkdownSurfaceInput): StructuredSurface {
  if (!input || typeof input.source !== 'string' || typeof input.sourceRef !== 'string' || !input.sourceRef.trim()) {
    throw new TypeError('markdown-surface-invalid-input')
  }
  const bounded = boundedSource(input.source)
  let truncated = bounded.length !== input.source.length
  const root = fromMarkdown(bounded)
  const builder = new SurfaceBuilder({ id: 'document', kind: 'document', formatName: 'commonmark', traits: [], attributes: {}, span: { start: 0, end: bounded.length } }, 'markdown')
  const { nodes, relations } = builder
  const walkChildren = (children: readonly FormatNode[] | undefined, parent: string, depth: number, inheritedTraits: string[] = []): void => {
    if (depth > MAX_DEPTH) { truncated = true; return }
    let previous: string | null = null
    for (const child of children ?? []) {
      let id: string | null = null
      const nodeSpan = spanOf(child)
      if (child.type === 'text' || child.type === 'inlineCode' || child.type === 'code') {
        const value = cleanText(child.value)
        if (value) id = builder.add(parent, 'text', child.type, { value, valueType: 'text', traits: inheritedTraits, span: nodeSpan })
      } else if (child.type === 'html') {
        id = builder.add(parent, 'opaque', 'embedded-html', { traits: ['requires-explicit-format-adapter'], span: nodeSpan })
      } else {
        const traits = GROUPING.has(child.type) ? ['grouping-scope'] : []
        id = builder.add(parent, 'element', child.type, { traits, span: nodeSpan })
        if (id) {
          const subtreeStart = nodes.length
          const childTraits = [...new Set([...inheritedTraits, ...(child.type === 'link' ? ['reference-label'] : [])])]
          walkChildren(child.children, id, depth + 1, childTraits)
          if (child.type === 'link') {
            const reference = normalizeHttpReference(child.url ?? '')
            if (reference) {
              const referenceId = builder.add(id, 'reference', 'link', { value: reference, valueType: 'url', span: nodeSpan })
              if (referenceId && relations.length < STRUCTURED_SURFACE_LIMITS.relations) {
                relations.push({ source: id, target: referenceId, kind: 'references' })
                const labelIds = nodes.slice(subtreeStart)
                  .filter(node => node.kind === 'text' && node.traits.includes('reference-label'))
                  .map(node => node.id)
                for (const labelId of labelIds) {
                  if (relations.length >= STRUCTURED_SURFACE_LIMITS.relations) { truncated = true; break }
                  relations.push({ source: labelId, target: referenceId, kind: 'labels' })
                }
              }
            }
          } else if (child.type === 'image') {
            const alt = cleanText(child.alt)
            if (alt) builder.add(id, 'text', 'alternative-text', { value: alt, valueType: 'text', traits: [...new Set([...inheritedTraits, 'alternative-text'])], span: nodeSpan })
          }
        }
      }
      if (id && previous) builder.follow(previous, id)
      if (id) previous = id
    }
  }
  walkChildren(root.children, 'document', 0)
  return createStructuredSurface({
    source: { reference: input.sourceRef.trim(), revision: input.sourceRevision?.trim() || null, mediaType: 'text/markdown' },
    parser: { artifact: '@zixcel/document-markdown', version: '0.11.0', standard: 'CommonMark via mdast-util-from-markdown@2.1.0' },
    nodes, relations, truncated: truncated || builder.truncated
  })
}
