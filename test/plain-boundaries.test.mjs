import { createPlainTextSurface } from '@zixcel/document-structure'
import { textBoundaries } from './value-boundaries.mjs'
textBoundaries('plain', createPlainTextSurface)

import assert from 'node:assert/strict'
import test from 'node:test'
test('short plain text keeps its existing local node identity', () => {
  const surface = createPlainTextSurface({ source: 'short', sourceRef: 'fixture' })
  assert.equal(surface.nodes[1].id, 'text')
})
