import test from 'node:test'
import assert from 'node:assert/strict'
import { createPlainTextSurface, createStructuredSurface, validateStructuredSurface } from '../src/index.mjs'

function fixture(extraReferences = false) {
  const nodes = [
    { id: 'document', kind: 'document', formatName: 'document', traits: [], attributes: {} },
    { id: 'scope', kind: 'element', formatName: 'item', traits: ['grouping-scope'], attributes: {} },
    { id: 'text', kind: 'text', formatName: 'text', value: 'Alpha ¥1,200', valueType: 'text', traits: [], attributes: {}, span: { start: 0, end: 12 } },
    { id: 'reference', kind: 'reference', formatName: 'link', value: 'https://example.test/a', valueType: 'url', label: 'Alpha', traits: [], attributes: {} }
  ]
  const relations = [
    { source: 'document', target: 'scope', kind: 'contains' },
    { source: 'scope', target: 'text', kind: 'contains' },
    { source: 'scope', target: 'reference', kind: 'contains' }
  ]
  if (extraReferences) {
    nodes.push({ id: 'other', kind: 'reference', formatName: 'link', value: 'https://example.test/b', valueType: 'url', label: 'Beta', traits: [], attributes: {} })
    relations.push({ source: 'scope', target: 'other', kind: 'contains' })
  }
  return createStructuredSurface({ source: { reference: 'source', revision: null, mediaType: 'text/test' },
    parser: { artifact: 'test', version: '0.11.0', standard: 'test' }, nodes, relations, truncated: false })
}




test('invalid graph endpoints are rejected', () => {
  const value = fixture()
  value.relations.push({ source: 'missing', target: 'scope', kind: 'contains' })
  assert.throws(() => validateStructuredSurface(value), /invalid-relation/)
})


test('detached nodes and parser version drift are rejected', () => {
  const detached = fixture()
  detached.nodes.push({ id: 'detached', kind: 'text', formatName: 'text', traits: [], attributes: {} })
  assert.throws(() => validateStructuredSurface(detached), /detached-node/)
  const drifted = fixture()
  drifted.parser.version = '0.9.0'
  assert.throws(() => validateStructuredSurface(drifted), /parser-version-mismatch/)
})

test('new producers use a generic schema and do not extract currency or candidates', () => {
  const surface = createPlainTextSurface({ source: '1200 JPY https://example.test', sourceRef: 'fixture:generic' })
  assert.equal(surface.schemaId, 'zixcel.document.structure')
  assert.equal(surface.schemaVersion, '0.11.0')
  assert.equal(surface.parser.artifact, '@zixcel/document-structure')
  assert.deepEqual(surface.nodes.map(node => node.kind), ['document', 'text'])
})

test('only the current document contract is admitted; rejected legacy input is not rewritten', () => {
  const legacy = fixture()
  legacy.schemaId = 'sem.lang.structure.surface'
  legacy.schemaVersion = '0.10.0'
  legacy.parser = { artifact: '@hathq/sem-lang-structured-surface', version: '0.10.0', standard: 'legacy' }
  const before = JSON.stringify(legacy)
  assert.throws(() => validateStructuredSurface(legacy), /invalid-contract/)
  assert.equal(JSON.stringify(legacy), before)
  assert.throws(() => validateStructuredSurface({ ...legacy, schemaVersion: '0.11.0' }), /invalid-contract/)
})

test('observation kinds are extensible and bounded rather than currency-specific', () => {
  const surface = fixture()
  surface.nodes.find(node => node.id === 'text').valueType = 'calendar-date'
  validateStructuredSurface(surface)
  surface.nodes.find(node => node.id === 'text').valueType = 'x'.repeat(65)
  assert.throws(() => validateStructuredSurface(surface), /node-value-type/)
})
