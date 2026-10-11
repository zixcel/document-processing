export type SurfaceNodeKind = 'document' | 'element' | 'text' | 'reference' | 'value' | 'opaque'
export type SurfaceRelationKind = 'contains' | 'follows' | 'references' | 'labels'

export interface SurfaceSpan { start: number, end: number }
export interface SurfaceNode {
  id: string
  kind: SurfaceNodeKind
  formatName: string
  value?: string
  valueType?: 'text' | 'url' | 'amount'
  label?: string
  traits: string[]
  attributes: Record<string, string>
  span?: SurfaceSpan
}
export interface SurfaceRelation { source: string, target: string, kind: SurfaceRelationKind }
export interface StructuredSurface {
  schemaId: 'zixcel.document.structure' | 'sem.lang.structure.surface'
  schemaVersion: '0.11.0' | '0.10.0'
  source: { reference: string, revision: string | null, mediaType: string }
  parser: { artifact: string, version: '0.11.0' | '0.10.0', standard: string }
  nodes: SurfaceNode[]
  relations: SurfaceRelation[]
  truncated: boolean
}
export const STRUCTURED_SURFACE_SCHEMA_ID: 'zixcel.document.structure'
export const STRUCTURED_SURFACE_VERSION: '0.11.0'
export const STRUCTURED_SURFACE_LIMITS: Readonly<{ nodes: number, relations: number, inputCharacters: number }>
export function createStructuredSurface(input: Omit<StructuredSurface, 'schemaId' | 'schemaVersion'>): StructuredSurface
export function validateStructuredSurface(surface: unknown): asserts surface is StructuredSurface
export function normalizeHttpReference(value: string): string | null
export function createPlainTextSurface(input: { source: string, sourceRef: string, sourceRevision?: string | null }): StructuredSurface
export function visibleSurfaceText(surface: StructuredSurface): string
