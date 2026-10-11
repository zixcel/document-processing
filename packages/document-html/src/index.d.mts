import type { StructuredSurface } from '@zixcel/document-structure'

export interface HtmlSurfaceInput {
  source: string
  sourceRef: string
  sourceRevision?: string | null
  mediaType?: 'text/html'
}
export function parseHtmlSurface(input: HtmlSurfaceInput): StructuredSurface
