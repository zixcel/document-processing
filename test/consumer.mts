import { createPlainTextSurface, type StructuredSurface } from '@zixcel/document-structure'
import { parseHtmlSurface } from '@zixcel/document-html'
import { parseMarkdownSurface } from '@zixcel/document-markdown'
const surfaces: StructuredSurface[] = [createPlainTextSurface({ source: 'note', sourceRef: 'fixture:plain' }),
  parseHtmlSurface({ source: '<p>note</p>', sourceRef: 'fixture:html' }),
  parseMarkdownSurface({ source: '# note', sourceRef: 'fixture:markdown' })]
// @ts-expect-error Legacy product IDs are not part of the current generic contract.
const legacy: StructuredSurface['schemaId'] = 'sem.lang.structure.surface'
void surfaces; void legacy
