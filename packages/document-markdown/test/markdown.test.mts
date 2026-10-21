import test from 'node:test'
import assert from 'node:assert/strict'
import { visibleSurfaceText } from '@zixcel/document-structure'
import { parseMarkdownSurface } from '../dist/index.mjs'

test('embedded HTML remains opaque and is not recursively interpreted', () => {
  const surface = parseMarkdownSurface({ source: '<a href="https://outside.test">not a CommonMark link</a>', sourceRef: 'chat:2' })
  assert.equal(surface.nodes.some(node => node.kind === 'opaque' && node.formatName === 'embedded-html'), true)
  assert.equal(surface.nodes.some(node => node.kind === 'reference'), false)
})
