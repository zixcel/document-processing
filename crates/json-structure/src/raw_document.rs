use serde::{
    Deserialize, Deserializer,
    de::{Error, MapAccess, Visitor},
};
use serde_json::{Value, value::RawValue};

/// Decode objects as objects, including `serde_json`'s otherwise special number marker.
pub(crate) fn decode<'de, D: Deserializer<'de>>(decoder: D) -> Result<Value, D::Error> {
    let raw = Box::<RawValue>::deserialize(decoder)?;
    if raw.get().len() > 65536 {
        return Err(D::Error::custom("source-byte-limit"));
    }
    let mut count = 0;
    parse(&raw, 0, &mut count).map_err(D::Error::custom)
}
fn parse(raw: &RawValue, depth: usize, count: &mut usize) -> Result<Value, &'static str> {
    *count += 1;
    if depth > 32 || *count > 1024 {
        return Err("source-structure-limit");
    }
    match raw.get().as_bytes().first() {
        Some(b'{') => {
            let fields: Fields =
                serde_json::from_str(raw.get()).map_err(|_| "source-object-invalid")?;
            let mut result = serde_json::Map::new();
            for (key, value) in fields.0 {
                result.insert(key, parse(&value, depth + 1, count)?);
            }
            Ok(Value::Object(result))
        }
        Some(b'[') => {
            let values: Vec<Box<RawValue>> =
                serde_json::from_str(raw.get()).map_err(|_| "source-array-invalid")?;
            values
                .into_iter()
                .map(|value| parse(&value, depth + 1, count))
                .collect::<Result<Vec<_>, _>>()
                .map(Value::Array)
        }
        _ => serde_json::from_str(raw.get()).map_err(|_| "source-scalar-invalid"),
    }
}
struct Fields(std::collections::BTreeMap<String, Box<RawValue>>);
impl<'de> Deserialize<'de> for Fields {
    fn deserialize<D: Deserializer<'de>>(decoder: D) -> Result<Self, D::Error> {
        struct FieldsVisitor;
        impl<'de> Visitor<'de> for FieldsVisitor {
            type Value = Fields;
            fn expecting(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                f.write_str("unique bounded source fields")
            }
            fn visit_map<A: MapAccess<'de>>(self, mut access: A) -> Result<Fields, A::Error> {
                let mut fields = std::collections::BTreeMap::new();
                while let Some((key, value)) = access.next_entry::<String, Box<RawValue>>()? {
                    if fields.len() >= 1024 || fields.insert(key, value).is_some() {
                        return Err(A::Error::custom("source-object-invalid"));
                    }
                }
                Ok(Fields(fields))
            }
        }
        decoder.deserialize_map(FieldsVisitor)
    }
}
