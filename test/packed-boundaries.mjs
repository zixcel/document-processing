import { createPlainTextSurface } from '@zixcel/document-structure'
import { parseHtmlSurface } from '@zixcel/document-html'
import { parseMarkdownSurface } from '@zixcel/document-markdown'
import { textBoundaries } from './value-boundaries.mjs'
textBoundaries('plain', createPlainTextSurface)
textBoundaries('html', parseHtmlSurface)
textBoundaries('markdown', parseMarkdownSurface)
