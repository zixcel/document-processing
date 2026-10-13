#![forbid(unsafe_code)]
//! Bounded source representation. No semantic context, catalog or execution authority.
mod bytes;
mod model;
mod validation;
pub use bytes::check_bytes;
pub use model::{Decomposition, SourceNode, SourceShape, SourceTree, StructureBudget};

/// Select an explicit JSON pointer and retain keys, ordered sequences and scalar values.
/// # Errors
/// Rejects absent selections, malformed pointers and invalid/exceeded structural budgets.
pub fn decompose(request: &Decomposition) -> Result<SourceTree, &'static str> {
    if request.reference.trim().is_empty()
        || request.reference.len() > 512
        || request.reference.chars().any(char::is_control)
        || request.pointer.len() > 4096
        || (!request.pointer.is_empty() && !request.pointer.starts_with('/'))
    {
        return Err("source-reference-invalid");
    }
    validation::pointer(&request.pointer)?;
    let budget = &request.budget;
    if budget.max_nodes == 0 || budget.max_nodes > 1024 || budget.max_depth > 32 {
        return Err("source-structure-limit");
    }
    check_bytes(&request.document, budget.max_bytes)?;
    let value = request
        .document
        .pointer(&request.pointer)
        .ok_or("source-selection-absent")?;
    let mut nodes = vec![];
    let root = visit(value, &request.pointer, 0, budget, &mut nodes)?;
    let tree = SourceTree {
        reference: request.reference.clone(),
        root,
        nodes,
    };
    tree.validate()?;
    Ok(tree)
}

fn visit(
    value: &serde_json::Value,
    locator: &str,
    depth: usize,
    budget: &StructureBudget,
    nodes: &mut Vec<SourceNode>,
) -> Result<usize, &'static str> {
    if depth > budget.max_depth || nodes.len() >= budget.max_nodes || locator.len() > 4096 {
        return Err("source-structure-limit");
    }
    let index = nodes.len();
    nodes.push(SourceNode {
        locator: locator.to_owned(),
        shape: SourceShape::Scalar(serde_json::Value::Null),
    });
    let shape = match value {
        serde_json::Value::Object(fields) => SourceShape::Record(
            fields
                .iter()
                .map(|(name, child)| {
                    let path = format!("{locator}/{}", name.replace('~', "~0").replace('/', "~1"));
                    Ok((name.clone(), visit(child, &path, depth + 1, budget, nodes)?))
                })
                .collect::<Result<_, &'static str>>()?,
        ),
        serde_json::Value::Array(values) => SourceShape::Sequence(
            values
                .iter()
                .enumerate()
                .map(|(n, child)| visit(child, &format!("{locator}/{n}"), depth + 1, budget, nodes))
                .collect::<Result<_, _>>()?,
        ),
        scalar => SourceShape::Scalar(scalar.clone()),
    };
    nodes[index].shape = shape;
    Ok(index)
}
