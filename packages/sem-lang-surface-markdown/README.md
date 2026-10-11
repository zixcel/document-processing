# @zixcel/sem-lang-surface-markdown

Parse CommonMark into bounded structural evidence. Parsing does not execute embedded HTML or retrieve linked resources.

## Install and use

```sh
npm install @zixcel/sem-lang-surface-markdown@0.10.0
```

```typescript
import { parseMarkdownSurface } from '@zixcel/sem-lang-surface-markdown'
const surface = parseMarkdownSurface({ source: '# Hello', sourceRef: 'urn:example:note' })
console.log(surface.nodes)
```

Type declarations ship with the ESM exports. Node.js 22 or later is required. Source references are identifiers, not instructions to fetch content. Parsing and validation enforce bounded input and output; semantic interpretation and storage belong to the caller.

## Package responsibilities

- `@zixcel/sem-lang-structured-surface`: shared contract, plain-text extraction, validation and structural grouping.
- `@zixcel/sem-lang-surface-html`: HTML adapter using the shared contract.
- `@zixcel/sem-lang-surface-markdown`: CommonMark adapter using the shared contract.

The adapters use an exact public registry version of the contract. Development links that version within this repository; published manifests contain no local paths.

## Development

From the repository root, run `pnpm install --frozen-lockfile --ignore-scripts`, `pnpm run typecheck` and `pnpm -r --include-workspace-root test`.

[License](LICENSE) · [Notices](NOTICE) · [Security reporting](../../SECURITY.md)
