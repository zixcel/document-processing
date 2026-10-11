import type { StructuredSurface } from '@zixcel/sem-lang-structured-surface'

export interface MarkdownSurfaceInput {
  source: string
  sourceRef: string
  sourceRevision?: string | null
  mediaType?: 'text/markdown'
}
export function parseMarkdownSurface(input: MarkdownSurfaceInput): StructuredSurface
