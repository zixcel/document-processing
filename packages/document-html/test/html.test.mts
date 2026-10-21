import test from 'node:test'
import assert from 'node:assert/strict'
import { visibleSurfaceText } from '@zixcel/document-structure'
import { parseHtmlSurface } from '../dist/index.mjs'

test('multiple links in the same scope stay unresolved and executable content is absent', () => {
  const html = '<script>private()</script><section><a href="https://shop.test/a">A</a><a href="https://shop.test/b">B</a><span>¥1,200</span></section>'
  const surface = parseHtmlSurface({ source: html, sourceRef: 'mail:2' })
  assert.equal(surface.nodes.filter(node => node.kind === 'reference').length, 2)
  assert.equal(surface.nodes.some(node => node.kind === 'value'), false)
  assert.equal(visibleSurfaceText(surface).includes('private'), false)
})

test('link labels are classified structurally without phrase-specific rules', () => {
  const surface = parseHtmlSurface({
    source: '<p>Primary explanation <a href="https://example.test/details?tracking=1">詳しくはこちら</a></p>',
    sourceRef: 'mail:label'
  })
  assert.equal(visibleSurfaceText(surface), 'Primary explanation')
  assert.equal(surface.nodes.find(node => node.kind === 'reference')?.value, 'https://example.test/details')
  assert.equal(surface.nodes.find(node => node.value === '詳しくはこちら')?.traits.includes('reference-label'), true)
  const label = surface.nodes.find(node => node.value === '詳しくはこちら')
  const reference = surface.nodes.find(node => node.kind === 'reference')
  assert.equal(surface.relations.some(relation => relation.kind === 'labels' && relation.source === label?.id && relation.target === reference?.id), true)
})

test('input and node growth are bounded', () => {
  const html = '<div>x</div>'.repeat(5000)
  const surface = parseHtmlSurface({ source: html, sourceRef: 'mail:3' })
  assert.ok(surface.nodes.length <= 4096)
  assert.equal(surface.truncated, true)
})
