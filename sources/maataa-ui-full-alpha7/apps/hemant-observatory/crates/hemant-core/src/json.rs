//! Minimal JSON writer (std only). Produces compact, valid JSON with string
//! escaping per RFC 8259.

pub fn escape(value: &str) -> String {
    let mut out = String::with_capacity(value.len() + 2);
    out.push('"');
    for ch in value.chars() {
        match ch {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\r' => out.push_str("\\r"),
            '\t' => out.push_str("\\t"),
            c if (c as u32) < 0x20 => out.push_str(&format!("\\u{:04x}", c as u32)),
            c => out.push(c),
        }
    }
    out.push('"');
    out
}

/// A JSON value built from owned parts.
pub enum Json {
    Null,
    Bool(bool),
    /// Integer emitted as a JSON number. Callers must keep it within ±2^53
    /// when consumers are JavaScript; larger values are emitted as strings.
    Int(i128),
    Str(String),
    Arr(Vec<Json>),
    Obj(Vec<(&'static str, Json)>),
}

impl Json {
    pub fn s(value: impl Into<String>) -> Self {
        Self::Str(value.into())
    }
    pub fn strs(values: &[&str]) -> Self {
        Self::Arr(values.iter().map(|v| Self::s(*v)).collect())
    }
    pub fn render(&self) -> String {
        let mut out = String::new();
        self.write(&mut out);
        out
    }
    fn write(&self, out: &mut String) {
        match self {
            Self::Null => out.push_str("null"),
            Self::Bool(b) => out.push_str(if *b { "true" } else { "false" }),
            Self::Int(i) => {
                const SAFE: i128 = 9_007_199_254_740_991;
                if (-SAFE..=SAFE).contains(i) {
                    out.push_str(&i.to_string());
                } else {
                    out.push_str(&escape(&i.to_string()));
                }
            }
            Self::Str(s) => out.push_str(&escape(s)),
            Self::Arr(items) => {
                out.push('[');
                for (i, item) in items.iter().enumerate() {
                    if i > 0 {
                        out.push(',');
                    }
                    item.write(out);
                }
                out.push(']');
            }
            Self::Obj(fields) => {
                out.push('{');
                for (i, (key, value)) in fields.iter().enumerate() {
                    if i > 0 {
                        out.push(',');
                    }
                    out.push_str(&escape(key));
                    out.push(':');
                    value.write(out);
                }
                out.push('}');
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn escapes_quotes_backslashes_and_control_characters() {
        assert_eq!(escape("a\"b\\c\nd\u{1}"), "\"a\\\"b\\\\c\\nd\\u0001\"");
        assert_eq!(escape("मुहूर्त · ok"), "\"मुहूर्त · ok\"");
    }

    #[test]
    fn integers_beyond_javascript_safe_range_become_strings() {
        assert_eq!(Json::Int(42).render(), "42");
        assert_eq!(
            Json::Int(9_007_199_254_740_992).render(),
            "\"9007199254740992\""
        );
        let obj = Json::Obj(vec![
            ("a", Json::Null),
            ("b", Json::Arr(vec![Json::Bool(true), Json::s("x")])),
        ]);
        assert_eq!(obj.render(), "{\"a\":null,\"b\":[true,\"x\"]}");
    }
}
