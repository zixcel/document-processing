use zixcel_json_structure::{Decomposition, SourceShape, decompose};

#[test]
fn arbitrary_precision_internal_markers_remain_literal_source_record_keys() {
    let request: Decomposition = serde_json::from_str(
        r#"{
      "reference":"source:fixture", "pointer":"",
      "budget":{"max_nodes":128,"max_depth":16,"max_bytes":65536},
      "document":{"$serde_json::private::Number":"1"}
    }"#,
    )
    .unwrap();
    assert!(request.document.is_object());
    let tree = decompose(&request).unwrap();
    assert!(matches!(tree.nodes[0].shape, SourceShape::Record(_)));
    assert_eq!(
        tree.nodes[1].shape,
        SourceShape::Scalar(serde_json::json!("1"))
    );
}
#[test]
fn duplicate_source_fields_are_rejected_instead_of_silently_overwriting() {
    assert!(
        serde_json::from_str::<Decomposition>(
            r#"{
      "reference":"source:fixture", "pointer":"",
      "budget":{"max_nodes":128,"max_depth":16,"max_bytes":65536},
      "document":{"a":1,"a":2}
    }"#
        )
        .is_err()
    );
}

#[test]
fn typed_value_conversion_uses_the_same_source_object_decoder() {
    let request: Decomposition = serde_json::from_value(serde_json::json!({
        "reference":"source:fixture", "pointer":"",
        "budget":{"max_nodes":128,"max_depth":16,"max_bytes":65536},
        "document":{"$serde_json::private::Number":"1"}
    }))
    .unwrap();
    assert!(request.document.is_object());
    assert!(matches!(
        decompose(&request).unwrap().nodes[0].shape,
        SourceShape::Record(_)
    ));
}
