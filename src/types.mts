export type SurfaceNodeKind = 'document' | 'element' | 'text' | 'reference' | 'value' | 'opaque'
export type SurfaceRelationKind = 'contains' | 'follows' | 'references' | 'labels'

export interface SurfaceSpan { start: number, end: number }
export interface SurfaceNode {
  id: string
  kind: SurfaceNodeKind
  formatName: string
  value?: string
  /** Producer-declared observation kind; this does not adopt semantic meaning. */
  valueType?: string
  label?: string
  traits: string[]
  attributes: Record<string, string>
  span?: SurfaceSpan
}
export interface SurfaceRelation { source: string, target: string, kind: SurfaceRelationKind }
export interface StructuredSurface {
  schemaId: 'zixcel.document.structure'
  schemaVersion: '0.11.0'
  source: { reference: string, revision: string | null, mediaType: string }
  parser: { artifact: string, version: '0.11.0', standard: string }
  nodes: SurfaceNode[]
  relations: SurfaceRelation[]
  truncated: boolean
}
