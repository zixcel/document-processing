import assert from 'node:assert/strict'
import test from 'node:test'
import { STRUCTURED_SURFACE_LIMITS as limits, validateStructuredSurface, visibleSurfaceText } from '@zixcel/document-structure'

export function textBoundaries(format, parse) {
  for (const length of [65_536, 65_537, 262_144, 262_145]) {
    test(`${format}: preserves bounded text and order at ${length} UTF-16 units`, () => {
      const source = 'x'.repeat(length)
      const surface = parse({ source, sourceRef: 'synthetic-boundary' })
      validateStructuredSurface(surface)
      const text = surface.nodes.filter(n => n.kind === 'text')
      const expected = source.slice(0, limits.inputCharacters)
      assert.equal(text.map(n => n.value).join(''), expected)
      assert.equal(visibleSurfaceText(surface), expected)
      assert.equal(surface.truncated, length > limits.inputCharacters)
      assert.ok(text.every(n => n.value.length <= limits.valueCharacters))
      assert.ok(text.every(n => n.span && n.span.start >= 0 && n.span.end <= expected.length))
      for (let i = 1; i < text.length; i++) {
        assert.ok(text[i].traits.includes('text-continuation'))
        assert.ok(surface.relations.some(r => r.kind === 'follows' && r.source === text[i - 1].id && r.target === text[i].id))
      }
      if (format === 'plain') {
        let offset = 0
        for (const node of text) { assert.deepEqual(node.span, { start: offset, end: offset + node.value.length }); offset += node.value.length }
      }
    })
  }
  test(`${format}: chunk boundaries preserve surrogate pairs`, () => {
    const source = 'x'.repeat(65_535) + '😀' + 'end'
    const surface = parse({ source, sourceRef: 'synthetic-unicode' })
    validateStructuredSurface(surface)
    const values = surface.nodes.filter(n => n.kind === 'text').map(n => n.value)
    assert.equal(values.join(''), source)
    assert.ok(values.every(v => !/[\uD800-\uDBFF]$/u.test(v) && !/^[\uDC00-\uDFFF]/u.test(v)))
    assert.equal(surface.truncated, false)
  })
  test(`${format}: input truncation does not introduce half a surrogate pair`, () => {
    const source = 'x'.repeat(limits.inputCharacters - 1) + '😀'
    const surface = parse({ source, sourceRef: 'synthetic-input-unicode' })
    validateStructuredSurface(surface)
    assert.equal(surface.nodes.filter(n => n.kind === 'text').map(n => n.value).join(''), 'x'.repeat(limits.inputCharacters - 1))
    assert.equal(surface.truncated, true)
  })
}
