# @zixcel/sem-lang-structured-surface

A bounded, format-neutral document structure contract. Use it to preserve source evidence before interpretation.

## Install and use

```sh
npm install @zixcel/sem-lang-structured-surface@0.10.0
```

```typescript
import { createPlainTextSurface, visibleSurfaceText } from '@zixcel/sem-lang-structured-surface'
const surface = createPlainTextSurface({ source: 'A local note', sourceRef: 'urn:example:note' })
console.log(visibleSurfaceText(surface))
```

Type declarations ship with the ESM exports. Node.js 22 or later is required. Source references are identifiers, not instructions to fetch content. Parsing and validation enforce bounded input and output; semantic interpretation and storage belong to the caller.

## Package responsibilities

- `@zixcel/sem-lang-structured-surface`: shared contract, plain-text extraction, validation and structural grouping.
- `@zixcel/sem-lang-surface-html`: HTML adapter using the shared contract.
- `@zixcel/sem-lang-surface-markdown`: CommonMark adapter using the shared contract.

The adapters use an exact public registry version of the contract. Development links that version within this repository; published manifests contain no local paths.

## Development

From the repository root, run `pnpm install --frozen-lockfile --ignore-scripts`, `pnpm run typecheck` and `pnpm -r --include-workspace-root test`.

[License](LICENSE) · [Notices](NOTICE) · [Security reporting](SECURITY.md)

## Package ownership and scope migration

[保守正本と移行条件](docs/package-ownership.ja.md)。The maintained source and npm scope are owned by Zixcel. New `@zixcel` names require their first registry publication before downstream dependency migration. Existing `@hathq` releases remain historical distributions.
