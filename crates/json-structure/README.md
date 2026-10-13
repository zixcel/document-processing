# zixcel-json-structure

Bounded JSON source structure without a language context, semantic catalog, inferred types or operational authority. Select one explicit JSON pointer and retain source locators, record keys, ordered arrays and exact JSON numeric representation.

`Decomposition` contains a source reference, JSON document, pointer and `StructureBudget`. The hard limits are 64 KiB serialized input, 1024 nodes, depth 32 and 4096-byte locators. Invalid pointer escapes and absent selections fail closed. Returned `SourceTree` nodes refer to other nodes by indices; scalar values remain source data. The supplied source reference is attribution, not an authenticated signature or permission.

The crate is source-only (`publish=false`) inside `zixcel/document-processing`. Consumers use an exact public Git revision until a registry release is independently reviewed. Dependencies resolve from public crates.io; no adjacent/private checkout or language implementation is required.

```rust
use zixcel_json_structure::{Decomposition, StructureBudget, decompose};
let request = Decomposition {
    reference: "source:fixture".into(), document: serde_json::json!({"items":[true,"text"]}),
    pointer: String::new(), budget: StructureBudget::default(),
};
let tree = decompose(&request)?;
assert_eq!(tree.nodes.len(), 4);
# Ok::<(), &'static str>(())
```

Run `cargo test --locked -p zixcel-json-structure` and `cargo clippy --locked -p zixcel-json-structure --all-targets -- -D warnings` from the repository root. The caller bounds untrusted raw decoding before constructing a JSON value. Product/language adapters own their interpretation context, additional graph constraints and unsupported semantic forms. Apache-2.0; preserve LICENSE and NOTICE.
