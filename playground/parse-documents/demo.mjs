import assert from 'node:assert/strict'
import { createPlainTextSurface, validateStructuredSurface, visibleSurfaceText } from '@zixcel/document-structure'
import { parseHtmlSurface } from '@zixcel/document-html'
import { parseMarkdownSurface } from '@zixcel/document-markdown'

const surfaces = [
  createPlainTextSurface({ source: 'A synthetic note', sourceRef: 'fixture:plain' }),
  parseHtmlSurface({ source: '<p>A synthetic HTML note</p><script>not executed</script>', sourceRef: 'fixture:html' }),
  parseMarkdownSurface({ source: '# A synthetic Markdown note\n\n[Reference](https://example.test)', sourceRef: 'fixture:markdown' }),
]
for (const surface of surfaces) {
  validateStructuredSurface(surface)
  assert.equal(surface.schemaId, 'zixcel.document.structure')
  assert.equal(surface.schemaVersion, '0.11.0')
  console.log(JSON.stringify({ format: surface.source.mediaType, text: visibleSurfaceText(surface),
    nodes: surface.nodes.length, truncated: surface.truncated }))
}
assert.ok(!visibleSurfaceText(surfaces[1]).includes('not executed'))
const legacy = { ...surfaces[0], schemaId: 'sem.lang.structure.surface', schemaVersion: '0.10.0' }
assert.throws(() => validateStructuredSurface(legacy), /invalid-contract/)
console.log('Only the current document format is admitted; legacy is rejected without conversion')
