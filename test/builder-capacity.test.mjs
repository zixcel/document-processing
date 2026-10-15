import assert from 'node:assert/strict'
import test from 'node:test'
import { SurfaceBuilder, STRUCTURED_SURFACE_LIMITS as limits, createStructuredSurface } from '@zixcel/document-structure'
const root = { id: 'document', kind: 'document', formatName: 'synthetic', traits: [], attributes: {} }
const surface = builder => createStructuredSurface({ source: { reference: 'fixture', revision: null, mediaType: 'text/plain' }, parser: { artifact: '@zixcel/document-structure', version: '0.11.0', standard: 'synthetic' }, nodes: builder.nodes, relations: builder.relations, truncated: builder.truncated })
test('a long value reaching the node limit keeps only a valid ordered prefix', () => {
  const b = new SurfaceBuilder(root, 'test')
  for (let i = 0; i < limits.nodes - 2; i++) b.add('document', 'element', 'synthetic')
  b.add('document', 'text', 'synthetic', { value: 'z'.repeat(65_537) })
  const result = surface(b)
  assert.equal(result.nodes.length, limits.nodes)
  assert.equal(result.truncated, true)
  assert.equal(result.nodes.at(-1).value, 'z'.repeat(65_536))
})
test('relation capacity is checked before attaching another continuation node', () => {
  const b = new SurfaceBuilder(root, 'test')
  const first = b.add('document', 'element', 'one')
  const second = b.add('document', 'element', 'two')
  // Populate distinct observable relations, leaving exactly one slot for containment.
  for (let i = 0; i < 2729; i++) {
    const id = b.add('document', 'element', 'synthetic')
    b.relations.push({ source: id, target: first, kind: 'references' }, { source: id, target: second, kind: 'references' })
  }
  b.relations.push({ source: root.id, target: first, kind: 'references' }, { source: root.id, target: second, kind: 'references' })
  assert.equal(b.relations.length, 8191)
  b.add('document', 'text', 'synthetic', { value: 'z'.repeat(65_537) })
  assert.equal(surface(b).truncated, true)
  assert.equal(b.relations.length, limits.relations)
})
