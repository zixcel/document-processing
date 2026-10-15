import { parseMarkdownSurface } from '../dist/index.mjs'
import { textBoundaries } from '../../../test/value-boundaries.mjs'
textBoundaries('markdown', parseMarkdownSurface)

import assert from 'node:assert/strict'
import test from 'node:test'
import { validateStructuredSurface, STRUCTURED_SURFACE_LIMITS as limits } from '@zixcel/document-structure'
test('document-markdown: node pressure keeps an ordered prefix and reports truncation', () => {
  const result = parseMarkdownSurface({ source: 'x\n\n'.repeat(3000) + 'y'.repeat(65_537), sourceRef: 'synthetic-node-pressure' })
  validateStructuredSurface(result)
  const text = result.nodes.filter(n => n.kind === 'text').map(n => n.value).join('')
  assert.ok(text.length > 0 && /^x+$/u.test(text))
  assert.ok(result.nodes.length <= limits.nodes && result.relations.length <= limits.relations)
  assert.equal(result.truncated, true)
})
