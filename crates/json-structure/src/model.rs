use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct StructureBudget {
    pub max_nodes: usize,
    pub max_depth: usize,
    pub max_bytes: usize,
}
impl Default for StructureBudget {
    fn default() -> Self {
        Self {
            max_nodes: 1024,
            max_depth: 32,
            max_bytes: 65536,
        }
    }
}

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct Decomposition {
    pub reference: String,
    pub document: serde_json::Value,
    pub pointer: String,
    pub budget: StructureBudget,
}

/// Structure describes source shape, never a semantic type, inference or authorization.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
pub enum SourceShape {
    Record(BTreeMap<String, usize>),
    Sequence(Vec<usize>),
    Scalar(serde_json::Value),
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SourceNode {
    pub locator: String,
    pub shape: SourceShape,
}
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(deny_unknown_fields)]
pub struct SourceTree {
    pub reference: String,
    pub root: usize,
    pub nodes: Vec<SourceNode>,
}
