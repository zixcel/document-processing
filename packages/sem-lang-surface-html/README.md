# @hathq/sem-lang-surface-html

Parse HTML into bounded structural evidence with parse5. Parsing is inert: scripts, remote resources and browser navigation are not executed.

## Install and use

```sh
npm install @hathq/sem-lang-surface-html@0.10.0
```

```typescript
import { parseHtmlSurface } from '@hathq/sem-lang-surface-html'
const surface = parseHtmlSurface({ source: '<p>Hello</p>', sourceRef: 'https://example.org/page' })
console.log(surface.nodes)
```

Type declarations ship with the ESM exports. Node.js 22 or later is required. Source references are identifiers, not instructions to fetch content. Parsing and validation enforce bounded input and output; semantic interpretation and storage belong to the caller.

## Package responsibilities

- `@hathq/sem-lang-structured-surface`: shared contract, plain-text extraction, validation and structural grouping.
- `@hathq/sem-lang-surface-html`: HTML adapter using the shared contract.
- `@hathq/sem-lang-surface-markdown`: CommonMark adapter using the shared contract.

The adapters use an exact public registry version of the contract. Development links that version within this repository; published manifests contain no local paths.

## Development

From the repository root, run `pnpm install --frozen-lockfile --ignore-scripts`, `pnpm run typecheck` and `pnpm -r --include-workspace-root test`.

[License](LICENSE) · [Notices](NOTICE) · [Security reporting](../../SECURITY.md)
