import { parseHtmlSurface } from '../dist/index.mjs'
import { textBoundaries } from '../../../test/value-boundaries.mjs'
textBoundaries('html', parseHtmlSurface)

import assert from 'node:assert/strict'
import test from 'node:test'
import { validateStructuredSurface, STRUCTURED_SURFACE_LIMITS as limits } from '@zixcel/document-structure'
test('document-html: node pressure keeps an ordered prefix and reports truncation', () => {
  const result = parseHtmlSurface({ source: '<span>x</span>'.repeat(3000) + 'y'.repeat(65_537), sourceRef: 'synthetic-node-pressure' })
  validateStructuredSurface(result)
  const text = result.nodes.filter(n => n.kind === 'text').map(n => n.value).join('')
  assert.ok(text.length > 0 && /^x+$/u.test(text))
  assert.ok(result.nodes.length <= limits.nodes && result.relations.length <= limits.relations)
  assert.equal(result.truncated, true)
})
