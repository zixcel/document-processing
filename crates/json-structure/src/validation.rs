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
        if self.nodes.iter().any(|node| matches!(&node.shape, SourceShape::Scalar(value) if value.is_object() || value.is_array())) {
            return Err("source-tree-not-scalar");
        }
        crate::check_bytes(self, 65536)?;
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
        pointer(&node.locator)?;
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

pub(crate) fn pointer(value: &str) -> Result<(), &'static str> {
    if value.len() > 4096 || (!value.is_empty() && !value.starts_with('/')) {
        return Err("source-pointer-invalid");
    }
    for segment in value.split('/').skip(1) {
        let mut bytes = segment.bytes();
        while let Some(byte) = bytes.next() {
            if byte == b'~' && !matches!(bytes.next(), Some(b'0' | b'1')) {
                return Err("source-pointer-invalid");
            }
        }
    }
    Ok(())
}
