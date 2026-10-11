# @zixcel/document-markdown

Parse CommonMark into bounded structural evidence. Parsing does not execute embedded HTML or retrieve linked resources.

## Install and use

```sh
npm install @zixcel/document-markdown@0.11.0
```

```typescript
import { parseMarkdownSurface } from '@zixcel/document-markdown'
const surface = parseMarkdownSurface({ source: '# Hello', sourceRef: 'urn:example:note' })
console.log(surface.nodes)
```

Type declarations ship with the ESM exports. Node.js 22 or later is required. Source references are identifiers, not instructions to fetch content. Parsing and validation enforce bounded input and output; semantic interpretation and storage belong to the caller.

## Package responsibilities

- `@zixcel/document-structure`: shared contract, plain-text extraction, validation and structural grouping.
- `@zixcel/document-html`: HTML adapter using the shared contract.
- `@zixcel/document-markdown`: CommonMark adapter using the shared contract.

The adapters use an exact public registry version of the contract. Development links that version within this repository; published manifests contain no local paths.

## Development

From the repository root, run `pnpm install --frozen-lockfile --ignore-scripts`, `pnpm run typecheck` and `pnpm -r --include-workspace-root test`.

[License](LICENSE) · [Notices](NOTICE) · [Security reporting](../../SECURITY.md)
