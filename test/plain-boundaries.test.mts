import { createPlainTextSurface } from '@zixcel/document-structure'
import { textBoundaries } from './value-boundaries.mts'
textBoundaries('plain', createPlainTextSurface)

import assert from 'node:assert/strict'
import test from 'node:test'
test('short plain text keeps its existing local node identity', () => {
  const surface = createPlainTextSurface({ source: 'short', sourceRef: 'fixture' })
  const node=surface.nodes[1];assert.ok(node)
  assert.equal(node.id, 'text')
})
