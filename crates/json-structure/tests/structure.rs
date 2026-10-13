use serde_json::json;
use zixcel_json_structure::{Decomposition, SourceShape, StructureBudget, decompose};
fn request() -> Decomposition {
    Decomposition {
        reference: "source:fixture".into(),
        document: json!({"a/b":{"~key":[false,null,"text"]}}),
        pointer: "/a~1b".into(),
        budget: StructureBudget::default(),
    }
}
#[test]
fn keys_sequences_and_escaped_source_locators_are_retained() {
    let tree = decompose(&request()).unwrap();
    assert_eq!(tree.root, 0);
    assert_eq!(tree.nodes[0].locator, "/a~1b");
    assert_eq!(tree.nodes[1].locator, "/a~1b/~0key");
    assert_eq!(tree.nodes[1].shape, SourceShape::Sequence(vec![2, 3, 4]));
    assert_eq!(tree.nodes[4].shape, SourceShape::Scalar(json!("text")));
}
#[test]
fn precision_survives_without_assigning_numeric_meaning() {
    let mut r = request();
    r.pointer = String::new();
    r.document = serde_json::from_str("123456789012345678901234567890.123456789").unwrap();
    let result = decompose(&r).unwrap();
    match &result.nodes[0].shape {
        SourceShape::Scalar(value) => assert_eq!(
            value.to_string(),
            "123456789012345678901234567890.123456789"
        ),
        _ => panic!("expected source scalar"),
    }
}
#[test]
fn absent_malformed_and_over_budget_sources_fail_closed() {
    let mut r = request();
    r.pointer = "/missing".into();
    assert!(decompose(&r).is_err());
    r.pointer = "/bad~2escape".into();
    assert_eq!(decompose(&r).unwrap_err(), "source-pointer-invalid");
    r = request();
    r.budget.max_nodes = 2;
    assert!(decompose(&r).is_err());
    r = request();
    r.budget.max_depth = 0;
    assert!(decompose(&r).is_err());
    r = request();
    r.budget.max_bytes = 4;
    assert!(decompose(&r).is_err());
    r = request();
    r.budget.max_nodes = 1025;
    assert!(decompose(&r).is_err());
}
