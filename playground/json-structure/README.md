# JSON structure playground

The executable examples in `crates/json-structure/tests/structure.rs` demonstrate:

- selecting an explicitly supplied source by JSON pointer;
- keeping record keys and ordered array elements distinct;
- preserving escaped locators and high-precision JSON numbers;
- rejecting missing selections and byte/node/depth overflows.

Run `cargo test --locked -p zixcel-json-structure`. All data is synthetic and in memory. No language product, account or external action is needed. See the crate README for an independent-consumer example.
