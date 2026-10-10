//! Versioned method registry: the single source for what each result means.
//!
//! Adding output: add a new `MethodRecord` with a NEW id (or bump `version`)
//! instead of changing the meaning of an existing id. Bump
//! `METHOD_REGISTRY_SCHEMA` only when the record shape itself changes.

use crate::json::Json;

pub const METHOD_REGISTRY_SCHEMA: &str = "hemant.method-registry/1";

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EvidenceClass {
    HostReported,
    UserSupplied,
    DerivedRepresentation,
    UserSelected,
    ConventionDerived,
    PendingMethod,
}

impl EvidenceClass {
    pub const fn label(self) -> &'static str {
        match self {
            Self::HostReported => "host-reported",
            Self::UserSupplied => "user-supplied-input",
            Self::DerivedRepresentation => "derived-representation",
            Self::UserSelected => "user-selected-reference",
            Self::ConventionDerived => "derived-under-named-convention",
            Self::PendingMethod => "pending-method",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MethodStatus {
    Active,
    Pending,
}

impl MethodStatus {
    pub const fn label(self) -> &'static str {
        match self {
            Self::Active => "active",
            Self::Pending => "pending",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct MethodRecord {
    pub id: &'static str,
    pub version: &'static str,
    pub kind: &'static str,
    pub title: &'static str,
    pub status: MethodStatus,
    pub evidence_class: EvidenceClass,
    /// Only "unverified" or "not-applicable" exist today.
    pub verification: &'static str,
    pub inputs: &'static [&'static str],
    pub source_identity: &'static str,
    pub time_scale: &'static str,
    pub frame_or_location: &'static str,
    pub output_units: &'static str,
    pub uncertainty: &'static str,
    pub limitations: &'static [&'static str],
}

pub const CLOCK_METHOD_ID: &str = "host-system-wall-clock-v1";
pub const WORKER_CLOCK_METHOD_ID: &str = "cloudflare-worker-date-now-v1";
pub const SUPPLIED_METHOD_ID: &str = "caller-supplied-unix-nanoseconds-v1";
pub const CIVIL_METHOD_ID: &str = "unix-nanos-to-gregorian-utc-v1";
pub const EPOCH_METHOD_ID: &str = "user-selected-kashi-sankranti-minute-reference-v1";
pub const UNITS_METHOD_ID: &str = "hemant-traditional-units-v1";
pub const ASTRONOMY_METHOD_ID: &str = "astronomy-solar-system-positions";
pub const PANCHANGA_METHOD_ID: &str = "panchanga-ruleset";
pub const JPL_ANGLES_METHOD_ID: &str = "jpl-geocentric-apparent-sun-moon-longitude-v1";
pub const INSTANT_PANCHANGA_METHOD_ID: &str =
    "instantaneous-tithi-karana-from-apparent-longitudes-v1";

pub const METHOD_REGISTRY: &[MethodRecord] = &[
    MethodRecord {
        id: CLOCK_METHOD_ID,
        version: "1",
        kind: "clock-source",
        title: "Host system wall clock",
        status: MethodStatus::Active,
        evidence_class: EvidenceClass::HostReported,
        verification: "unverified",
        inputs: &["operating-system wall clock"],
        source_identity: "Rust std::time::SystemTime on the host running hemant-shell",
        time_scale: "unix-utc-no-leap-seconds",
        frame_or_location: "not-applicable",
        output_units: "integer nanoseconds since 1970-01-01T00:00:00 UTC (Unix count)",
        uncertainty: "unknown (synchronization source, offset and drift are not measured)",
        limitations: &[
            "A point snapshot; its age grows after it is read.",
            "Not verified: readable or agreeing with another clock is not verification.",
            "Supported range 0001-01-01 to 9999-12-31 UTC; values before 1970 cannot come from the host clock.",
        ],
    },
    MethodRecord {
        id: WORKER_CLOCK_METHOD_ID,
        version: "1",
        kind: "clock-source",
        title: "Cloudflare Workers wall clock",
        status: MethodStatus::Active,
        evidence_class: EvidenceClass::HostReported,
        verification: "unverified",
        inputs: &["Cloudflare Workers Date.now() milliseconds"],
        source_identity: "Date.now() supplied by the Cloudflare Workers runtime; converted to integer nanoseconds with millisecond resolution",
        time_scale: "unix-utc-no-leap-seconds",
        frame_or_location: "not-applicable",
        output_units: "integer nanoseconds since 1970-01-01T00:00:00 UTC (Unix count; millisecond resolution)",
        uncertainty: "unknown (runtime clock synchronization source, offset and drift are not measured)",
        limitations: &[
            "A point snapshot; its age grows after it is read.",
            "Not verified: runtime clock may be readable without having known accuracy.",
            "The source has millisecond resolution; lower decimal places are zero padding, not measured precision.",
            "Leap seconds are not represented; values before 1970 are not accepted by the Worker API.",
        ],
    },
    MethodRecord {
        id: SUPPLIED_METHOD_ID,
        version: "1",
        kind: "clock-source",
        title: "Caller-supplied Unix nanoseconds",
        status: MethodStatus::Active,
        evidence_class: EvidenceClass::UserSupplied,
        verification: "unverified",
        inputs: &["signed integer nanoseconds from the caller"],
        source_identity: "hemant-shell --unix-nanos argument",
        time_scale: "unix-utc-no-leap-seconds",
        frame_or_location: "not-applicable",
        output_units: "integer nanoseconds since 1970-01-01T00:00:00 UTC (Unix count)",
        uncertainty: "unknown (as supplied by the caller)",
        limitations: &["Accepted only within 0001-01-01 to 9999-12-31 UTC."],
    },
    MethodRecord {
        id: CIVIL_METHOD_ID,
        version: "1",
        kind: "civil-representation",
        title: "Unix nanoseconds to proleptic Gregorian UTC",
        status: MethodStatus::Active,
        evidence_class: EvidenceClass::DerivedRepresentation,
        verification: "not-applicable",
        inputs: &["unix_nanos"],
        source_identity: "civil-from-days integer algorithm (proleptic Gregorian), std only",
        time_scale: "unix-utc-no-leap-seconds",
        frame_or_location: "not-applicable",
        output_units: "YYYY-MM-DD hh:mm:ss.nnnnnnnnn UTC",
        uncertainty: "exact representation of the input; inherits the input's uncertainty",
        limitations: &[
            "Leap seconds are not representable (no 23:59:60).",
            "Years 0001 to 9999 only.",
            "Not TAI, TT or TDB.",
        ],
    },
    MethodRecord {
        id: EPOCH_METHOD_ID,
        version: "reference-minute-precision",
        kind: "reference-epoch",
        title: "Selected Hemant reference epoch",
        status: MethodStatus::Active,
        evidence_class: EvidenceClass::UserSelected,
        verification: "unverified",
        inputs: &["1979-01-14 13:29 IST (07:59 UTC), Kashi Makar Sankranti, as selected by the user"],
        source_identity: "user selection recorded in hemant-core; no independent citation yet",
        time_scale: "unix-utc-no-leap-seconds",
        frame_or_location: "Kashi (Varanasi), as described; no coordinates recorded",
        output_units: "Unix nanoseconds (285148740000000000)",
        uncertainty: "minute precision; exact astronomical Sankranti instant not established",
        limitations: &[
            "Not an astronomical calculation of the Sankranti instant.",
            "A calendar reference, not a clock source.",
        ],
    },
    MethodRecord {
        id: UNITS_METHOD_ID,
        version: "v1",
        kind: "unit-convention",
        title: "Hemant traditional time units",
        status: MethodStatus::Active,
        evidence_class: EvidenceClass::ConventionDerived,
        verification: "unverified",
        inputs: &["unix_nanos", "selected reference epoch"],
        source_identity: "named convention: 30 muhurta/ahoratra, 30 kala/muhurta, 30 kastha/kala, 15 nimesha/kastha",
        time_scale: "unix-utc-no-leap-seconds (difference)",
        frame_or_location: "not-applicable",
        output_units: "signed ahoratra + muhurta, kala, kastha, nimesha; residual in nanoseconds",
        uncertainty: "arithmetic is exact under the convention; whole-nimesha flooring residual is reported",
        limitations: &[
            "Elapsed duration is a Unix-time difference: leap seconds since the epoch are not counted.",
            "One convention among several traditions; not asserted as universal.",
        ],
    },
    MethodRecord {
        id: JPL_ANGLES_METHOD_ID,
        version: "1",
        kind: "astronomy-observer-ephemeris",
        title: "JPL Horizons geocentric apparent Sun and Moon angles",
        status: MethodStatus::Active,
        evidence_class: EvidenceClass::ConventionDerived,
        verification: "unverified",
        inputs: &["UTC instant", "target body", "geocenter", "observer ephemeris quantity 31"],
        source_identity: "NASA/JPL Horizons API; runtime response includes provider metadata and ephemeris identity",
        time_scale: "UTC request; Horizons observer ephemeris time handling",
        frame_or_location: "Earth geocenter; apparent ecliptic and equinox of date",
        output_units: "degrees longitude and latitude",
        uncertainty: "not independently quantified; displayed decimal precision is not an uncertainty bound",
        limitations: &["Only Sun and Moon angles are returned.", "Single provider; no independent ephemeris comparison.", "Not spacecraft navigation or an onboard clock."],
    },
    MethodRecord {
        id: INSTANT_PANCHANGA_METHOD_ID,
        version: "1",
        kind: "instantaneous-calendar-angle-classification",
        title: "Instantaneous tithi, paksha and karana angle bins",
        status: MethodStatus::Active,
        evidence_class: EvidenceClass::ConventionDerived,
        verification: "not-applicable",
        inputs: &["apparent geocentric ecliptic Sun longitude", "apparent geocentric ecliptic Moon longitude"],
        source_identity: "integer-microdegree angle arithmetic in hemant-core; 12-degree tithi and 6-degree karana bins",
        time_scale: "input instant supplied in UTC to Horizons",
        frame_or_location: "geocentric apparent ecliptic/equinox of date; no local sunrise assignment",
        output_units: "elongation degrees, ordinal tithi, paksha, karana index and name",
        uncertainty: "inherited from ephemeris and input time; not quantified by this method",
        limitations: &["Instant classification only; no civil-day assignment.", "Tradition-specific named labels require independent Panchanga test vectors.", "Nakshatra and yoga require a selected ayanamsha and are not emitted."],
    },
    MethodRecord {
        id: ASTRONOMY_METHOD_ID,
        version: "pending",
        kind: "astronomy",
        title: "Solar-system positions (ephemeris)",
        status: MethodStatus::Pending,
        evidence_class: EvidenceClass::PendingMethod,
        verification: "not-applicable",
        inputs: &["target", "observer", "time (TDB)", "frame"],
        source_identity: "none selected; see ASTRONOMY-DECISION-001.md",
        time_scale: "pending (TDB for ephemeris arguments)",
        frame_or_location: "pending (ICRF-aligned)",
        output_units: "pending",
        uncertainty: "not available",
        limitations: &["No ephemeris dataset or library is bundled locally.", "A separate JPL Horizons adapter supplies only geocentric apparent Sun/Moon angles.", "No wider planetary state vectors are produced by this method."],
    },
    MethodRecord {
        id: PANCHANGA_METHOD_ID,
        version: "pending",
        kind: "calendar-tradition",
        title: "Panchanga ruleset",
        status: MethodStatus::Pending,
        evidence_class: EvidenceClass::PendingMethod,
        verification: "not-applicable",
        inputs: &["tradition", "location", "ayanamsha", "sunrise rule", "astronomical inputs"],
        source_identity: "none selected; product-owner decision required",
        time_scale: "pending",
        frame_or_location: "pending (observer location policy)",
        output_units: "pending",
        uncertainty: "not available",
        limitations: &["Instant tithi/paksha/karana angle bins are exposed by a separate narrow method.", "No complete sunrise-assigned Panchanga ruleset is selected.", "Nakshatra and yoga need an explicit ayanamsha; other fields need location and calendar rules."],
    },
];

pub fn find_method(id: &str) -> Option<&'static MethodRecord> {
    METHOD_REGISTRY.iter().find(|m| m.id == id)
}

pub fn method_json(m: &MethodRecord) -> Json {
    Json::Obj(vec![
        ("id", Json::s(m.id)),
        ("version", Json::s(m.version)),
        ("kind", Json::s(m.kind)),
        ("title", Json::s(m.title)),
        ("status", Json::s(m.status.label())),
        ("evidence", Json::s(m.evidence_class.label())),
        ("verification", Json::s(m.verification)),
        ("inputs", Json::strs(m.inputs)),
        ("source", Json::s(m.source_identity)),
        ("time_scale", Json::s(m.time_scale)),
        ("frame_or_location", Json::s(m.frame_or_location)),
        ("output_units", Json::s(m.output_units)),
        ("uncertainty", Json::s(m.uncertainty)),
        ("limitations", Json::strs(m.limitations)),
    ])
}

pub fn registry_json() -> String {
    Json::Obj(vec![
        ("schema", Json::s(METHOD_REGISTRY_SCHEMA)),
        (
            "methods",
            Json::Arr(METHOD_REGISTRY.iter().map(method_json).collect()),
        ),
    ])
    .render()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashSet;

    #[test]
    fn every_method_has_complete_provenance_fields_and_unique_id() {
        let mut ids = HashSet::new();
        for m in METHOD_REGISTRY {
            assert!(ids.insert(m.id), "duplicate id {}", m.id);
            for (name, value) in [
                ("version", m.version),
                ("kind", m.kind),
                ("title", m.title),
                ("source", m.source_identity),
                ("time_scale", m.time_scale),
                ("frame_or_location", m.frame_or_location),
                ("output_units", m.output_units),
                ("uncertainty", m.uncertainty),
            ] {
                assert!(!value.trim().is_empty(), "{} has empty {name}", m.id);
            }
            assert!(!m.inputs.is_empty(), "{} has no inputs", m.id);
            assert!(!m.limitations.is_empty(), "{} has no limitations", m.id);
            assert!(
                matches!(m.verification, "unverified" | "not-applicable"),
                "{} claims {}",
                m.id,
                m.verification
            );
        }
    }

    #[test]
    fn pending_methods_are_marked_pending_and_produce_nothing() {
        for id in [ASTRONOMY_METHOD_ID, PANCHANGA_METHOD_ID] {
            let m = find_method(id).unwrap();
            assert_eq!(m.status, MethodStatus::Pending);
            assert_eq!(m.evidence_class, EvidenceClass::PendingMethod);
            assert_eq!(m.uncertainty, "not available");
        }
        for m in METHOD_REGISTRY
            .iter()
            .filter(|m| m.status == MethodStatus::Active)
        {
            assert_ne!(m.evidence_class, EvidenceClass::PendingMethod, "{}", m.id);
        }
    }

    #[test]
    fn clock_epoch_and_units_keep_distinct_evidence() {
        assert_eq!(
            find_method(CLOCK_METHOD_ID).unwrap().evidence_class,
            EvidenceClass::HostReported
        );
        assert_eq!(
            find_method(EPOCH_METHOD_ID).unwrap().evidence_class,
            EvidenceClass::UserSelected
        );
        assert_eq!(
            find_method(UNITS_METHOD_ID).unwrap().evidence_class,
            EvidenceClass::ConventionDerived
        );
        assert_eq!(
            find_method(CIVIL_METHOD_ID).unwrap().evidence_class,
            EvidenceClass::DerivedRepresentation
        );
    }

    #[test]
    fn registry_json_names_its_schema_and_every_method() {
        let json = registry_json();
        assert!(json.starts_with("{\"schema\":\"hemant.method-registry/1\",\"methods\":["));
        for m in METHOD_REGISTRY {
            assert!(json.contains(&format!("\"id\":\"{}\"", m.id)));
        }
    }
}
