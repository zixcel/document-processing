# Parse documents through public APIs

[日本語](README.ja.md)

Run a plain-text, HTML and Markdown example using the three real package archives in an isolated consumer. Input is synthetic. HTML scripts are not executed, source references are retained, and legacy product schema IDs are rejected without conversion.

```sh
pnpm install --frozen-lockfile --ignore-scripts
pnpm -r --include-workspace-root test
pnpm test:consumer
```

The runner uses empty npm configuration, public dependencies and package exports. It checks public TypeScript declarations including rejection of the old schema type, then executes demo.mts. It removes only its generated temporary consumer. It never opens a product DB, account or provider connection.

Package release 0.12.0 supports the sole current wire model zixcel.document.structure/0.11.0. Package release and model versions are separate: the current model's fields are unchanged; legacy acceptance was removed. Product currency/candidate interpretation remains product-owned. Existing historical releases remain immutable.
