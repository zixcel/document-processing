use crate::{SourceShape, SourceTree};
use std::collections::BTreeSet;
impl SourceTree {
    /// Validate a tree received from an external source adapter before interpretation.
    /// # Errors
    /// Rejects dangling/cyclic/aliased/orphan nodes, wrong locators and non-scalar values.
    pub fn validate(&self) -> Result<(), &'static str> {
        if self.reference.trim().is_empty()
            || self.reference.len() > 512
            || self.reference.chars().any(char::is_control)
            || self.root != 0
            || self.nodes.is_empty()
            || self.nodes.len() > 1024
        {
            return Err("source-tree-invalid");
        }
        let mut seen = BTreeSet::new();
        self.visit(self.root, 0, &mut seen)?;
        if seen.len() != self.nodes.len() {
            return Err("source-tree-orphan");
        }
        Ok(())
    }
    fn visit(
        &self,
        id: usize,
        depth: usize,
        seen: &mut BTreeSet<usize>,
    ) -> Result<(), &'static str> {
        if depth > 32 || !seen.insert(id) {
            return Err("source-tree-cycle-or-alias");
        }
        let node = self.nodes.get(id).ok_or("source-tree-dangling")?;
        if node.locator.len() > 4096 {
            return Err("source-tree-locator");
        }
        let children: Vec<(String, usize)> = match &node.shape {
            SourceShape::Record(fields) => fields
                .iter()
                .map(|(key, child)| {
                    (
                        format!(
                            "{}/{}",
                            node.locator,
                            key.replace('~', "~0").replace('/', "~1")
                        ),
                        *child,
                    )
                })
                .collect(),
            SourceShape::Sequence(items) => items
                .iter()
                .enumerate()
                .map(|(n, child)| (format!("{}/{n}", node.locator), *child))
                .collect(),
            SourceShape::Scalar(value) => {
                if value.is_object() || value.is_array() {
                    return Err("source-tree-not-scalar");
                }
                vec![]
            }
        };
        for (expected, child) in children {
            if self.nodes.get(child).is_none_or(|n| n.locator != expected) {
                return Err("source-tree-locator");
            }
            self.visit(child, depth + 1, seen)?;
        }
        Ok(())
    }
}
