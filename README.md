# Document Processing

| Location | Public package / crate | Responsibility |
| --- | --- | --- |
| repository root | @zixcel/document-structure | Validate format-neutral structured documents |
| packages/document-html | @zixcel/document-html | Parse bounded HTML into the current structure |
| packages/document-markdown | @zixcel/document-markdown | Parse bounded Markdown into the current structure |
| crates/document-output | zixcel-document-output (source-only) | Inspect PDFs and render local document output with separate read/write capabilities |
| playground/parse-documents | development only | Public import parsing and legacy refusal example |

Existing package names and wire/schema identifiers remain unchanged. The repository is the maintenance unit; each package owns its exports, validation and release. Product SQL, identity, business policy and hosting belong to their consumers. Imported Git history, LICENSE and NOTICE are preserved.

The repository-metadata patch versions in this branch are release candidates until official registry verification. The Node packages use public registry dependencies; Rust document-output remains `publish=false`. CI and publication are independent of a private central checkout. OIDC publishes only the immutable reviewed archives built by the separate verification job.

## Run the examples and checks

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm -r --include-workspace-root test
pnpm test:consumer
node playground/parse-documents/demo.mjs
cargo +1.97 test --locked --all-features
```

## Package-specific interface

# @zixcel/document-structure

[日本語](README.ja.md)

A bounded, format-neutral document structure contract. Use it to preserve source evidence before interpretation.

## Install and use

```sh
npm install @zixcel/document-structure@0.12.0
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
Release 0.12.0 admits only the current `zixcel.document.structure` wire model
`0.11.0`. Package versions and wire-model versions are separate. Current fields
are unchanged; legacy `sem.lang.structure.surface` acceptance and types are removed.
Historical distributions remain immutable. Update owned consumers to the current
formal artifacts before adoption. Product DB conversion is a separate operation.

[Public API playground](playground/parse-documents/README.md) packs all three
packages into an isolated consumer, checks public types and runs plain/HTML/Markdown
examples including legacy refusal. Owner CI runs this gate before publication.

## Development

From the repository root, run `pnpm install --frozen-lockfile --ignore-scripts`, `pnpm run typecheck` and `pnpm -r --include-workspace-root test`.

[License](LICENSE) · [Notices](NOTICE) · [Security reporting](SECURITY.md)

## Package ownership and scope migration

[保守正本と移行条件](docs/package-ownership.ja.md)。The maintained source and npm scope are owned by Zixcel. Current dependencies use the official registry. Historical `@hathq` releases retain their provenance; new breaking releases are verified before consumer updates.

## Release provenance

Starting with 0.11.1, releases use GitHub Actions OIDC trusted publishing from `zixcel/document-structure` (`publish-npm.yml`), without a stored npm publishing token. The workflow verifies reviewed archive hashes and requires npm provenance metadata. Check the published version on npm and verify registry signatures and provenance with `npm audit signatures` in an installed consumer project. Release 0.12.0 removes legacy product-schema acceptance; current generic fields and validation bounds are retained.

## Source structure

`crates/json-structure` owns bounded, source-linked JSON structure without language meaning or authority. [API and example](crates/json-structure/README.md) · [Playground](playground/json-structure/README.md) · [OSS source contract](docs/oss-source-contract.md). The public crate is source-only; an exact Git revision is required until a separately accepted registry release.
