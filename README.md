# @zixcel/document-structure

A bounded, format-neutral document structure contract. Use it to preserve source evidence before interpretation.

## Install and use

```sh
npm install @zixcel/document-structure@0.11.0
```

```typescript
import { createPlainTextSurface, visibleSurfaceText } from '@zixcel/document-structure'
const surface = createPlainTextSurface({ source: 'A local note', sourceRef: 'urn:example:note' })
console.log(visibleSurfaceText(surface))
```

Type declarations ship with the ESM exports. Node.js 22 or later is required. Source references are identifiers, not instructions to fetch content. Parsing and validation enforce bounded input and output; semantic interpretation and storage belong to the caller.

## Package responsibilities

- `@zixcel/document-structure`: shared contract, plain-text extraction and validation.
- `@zixcel/document-html`: HTML adapter using the shared contract.
- `@zixcel/document-markdown`: CommonMark adapter using the shared contract.

The adapters use an exact public registry version of the contract. Development links that version within this repository; published manifests contain no local paths.

Currency extraction and item-candidate rules belong to the consuming product.
New output uses `zixcel.document.structure` version `0.11.0`; validation also
reads the historical `sem.lang.structure.surface` version `0.10.0` without
rewriting its source or parser provenance. The historical schema is not emitted
by the new parsers. Publication is pending source and consumer verification.

## Development

From the repository root, run `pnpm install --frozen-lockfile --ignore-scripts`, `pnpm run typecheck` and `pnpm -r --include-workspace-root test`.

[License](LICENSE) · [Notices](NOTICE) · [Security reporting](SECURITY.md)

## Package ownership and scope migration

[保守正本と移行条件](docs/package-ownership.ja.md)。The maintained source and npm scope are owned by Zixcel. New `@zixcel` names require their first registry publication before downstream dependency migration. Existing `@hathq` releases remain historical distributions.
