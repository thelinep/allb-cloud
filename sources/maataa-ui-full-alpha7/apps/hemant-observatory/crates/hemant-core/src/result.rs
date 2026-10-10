//! Versioned, provenance-bearing time result: `hemant.time-result/2`.
//!
//! v2 replaces the flat v1 object (unversioned, first increment) with
//! separate `reading`, `civil`, `epoch`, `elapsed` and `pending` sections,
//! each naming the registry method that produced it.

use crate::json::Json;
use crate::registry::{
    find_method, ASTRONOMY_METHOD_ID, CIVIL_METHOD_ID, CLOCK_METHOD_ID, EPOCH_METHOD_ID,
    METHOD_REGISTRY_SCHEMA, PANCHANGA_METHOD_ID, SUPPLIED_METHOD_ID, UNITS_METHOD_ID,
    WORKER_CLOCK_METHOD_ID,
};
use crate::time::{format_unix_utc, ClockReadError, ClockSource, WallClockSnapshot};
use crate::units::{
    units_convention, ElapsedUnits, HEMANT_EPOCH_LOCAL_DESCRIPTION, HEMANT_EPOCH_PRECISION,
    HEMANT_EPOCH_UNIX_NANOS,
};

pub const TIME_RESULT_SCHEMA: &str = "hemant.time-result/2";

pub fn reading_method_id(source: ClockSource) -> &'static str {
    match source {
        ClockSource::HostSystemWallClock => CLOCK_METHOD_ID,
        ClockSource::WorkerWallClock => WORKER_CLOCK_METHOD_ID,
        // Fixtures are reported as supplied input; they never claim host provenance.
        ClockSource::SuppliedUnixNanoseconds | ClockSource::Fixture => SUPPLIED_METHOD_ID,
    }
}

pub fn time_result_json(snapshot: &WallClockSnapshot) -> Result<String, ClockReadError> {
    let utc = format_unix_utc(snapshot.unix_nanos)?;
    let units = ElapsedUnits::try_from_unix_nanos(snapshot.unix_nanos)?;
    let epoch_utc = format_unix_utc(HEMANT_EPOCH_UNIX_NANOS)?;
    let reading_method = reading_method_id(snapshot.source);
    let used = [
        reading_method,
        CIVIL_METHOD_ID,
        EPOCH_METHOD_ID,
        UNITS_METHOD_ID,
    ];
    debug_assert!(used.iter().all(|id| find_method(id).is_some()));

    Ok(Json::Obj(vec![
        ("schema", Json::s(TIME_RESULT_SCHEMA)),
        ("registry", Json::s(METHOD_REGISTRY_SCHEMA)),
        (
            "reading",
            Json::Obj(vec![
                ("method", Json::s(reading_method)),
                ("kind", Json::s("point-snapshot")),
                ("unix_nanos", Json::s(snapshot.unix_nanos.to_string())),
                ("time_scale", Json::s(snapshot.scale.id())),
                ("time_scale_label", Json::s(snapshot.scale.label())),
                ("source", Json::s(snapshot.source.id())),
                ("source_label", Json::s(snapshot.source.label())),
                ("verification", Json::s(snapshot.verification.label())),
                ("uncertainty", Json::s(snapshot.uncertainty.label())),
            ]),
        ),
        (
            "civil",
            Json::Obj(vec![
                ("method", Json::s(CIVIL_METHOD_ID)),
                ("utc", Json::s(utc)),
            ]),
        ),
        (
            "epoch",
            Json::Obj(vec![
                ("method", Json::s(EPOCH_METHOD_ID)),
                ("unix_nanos", Json::s(HEMANT_EPOCH_UNIX_NANOS.to_string())),
                ("utc", Json::s(epoch_utc)),
                ("description", Json::s(HEMANT_EPOCH_LOCAL_DESCRIPTION)),
                ("precision", Json::s(HEMANT_EPOCH_PRECISION)),
            ]),
        ),
        (
            "elapsed",
            Json::Obj(vec![
                ("method", Json::s(UNITS_METHOD_ID)),
                ("convention", Json::s(units_convention())),
                (
                    "basis",
                    Json::s("unix-time-difference; leap seconds not counted"),
                ),
                ("ahoratra", Json::Int(units.signed_ahoratra)),
                ("muhurta", Json::Int(units.muhurta.into())),
                ("kala", Json::Int(units.kala.into())),
                ("kastha", Json::Int(units.kastha.into())),
                ("nimesha", Json::Int(units.nimesha.into())),
                (
                    "residual_nanoseconds",
                    Json::Int(units.residual_nanoseconds as i128),
                ),
            ]),
        ),
        (
            "pending",
            Json::Arr(vec![
                Json::Obj(vec![
                    ("method", Json::s(ASTRONOMY_METHOD_ID)),
                    ("status", Json::s("pending-method")),
                ]),
                Json::Obj(vec![
                    ("method", Json::s(PANCHANGA_METHOD_ID)),
                    ("status", Json::s("pending-tradition-and-method")),
                ]),
            ]),
        ),
        ("methods_used", Json::strs(&used)),
    ])
    .render())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::time::{FixedWallClock, MAX_SUPPORTED_UNIX_NANOS};

    #[test]
    fn fixture_result_is_versioned_and_names_methods_for_every_section() {
        let snapshot = WallClockSnapshot::read(&FixedWallClock(HEMANT_EPOCH_UNIX_NANOS)).unwrap();
        let json = time_result_json(&snapshot).unwrap();
        assert!(json.starts_with(
            "{\"schema\":\"hemant.time-result/2\",\"registry\":\"hemant.method-registry/1\""
        ));
        assert!(json.contains("\"source\":\"test-fixture\""));
        assert!(json.contains(&format!("\"method\":\"{SUPPLIED_METHOD_ID}\"")));
        assert!(
            !json.contains(CLOCK_METHOD_ID),
            "fixture must not claim host provenance"
        );
        assert!(json.contains("\"utc\":\"1979-01-14 07:59:00.000000000 UTC\""));
        assert!(json.contains("\"ahoratra\":0"));
        assert!(json.contains("\"verification\":\"unverified\""));
        assert!(json.contains("\"uncertainty\":\"unknown\""));
        assert!(json.contains("\"status\":\"pending-method\""));
        assert!(
            !json.contains("\":\"verified\""),
            "no result may claim verified"
        );
    }

    #[test]
    fn maximum_supported_value_produces_a_result_with_string_nanos() {
        let snapshot =
            WallClockSnapshot::from_supplied_unix_nanos(MAX_SUPPORTED_UNIX_NANOS).unwrap();
        let json = time_result_json(&snapshot).unwrap();
        assert!(json.contains(&format!("\"unix_nanos\":\"{MAX_SUPPORTED_UNIX_NANOS}\"")));
        assert!(json.contains("9999-12-31 23:59:59.999999999 UTC"));
    }

    #[test]
    fn worker_clock_is_explicitly_unverified_and_uses_its_own_method() {
        let snapshot =
            WallClockSnapshot::from_worker_wall_clock_unix_nanos(HEMANT_EPOCH_UNIX_NANOS).unwrap();
        let json = time_result_json(&snapshot).unwrap();
        assert!(json.contains("\"method\":\"cloudflare-worker-date-now-v1\""));
        assert!(json.contains("\"source\":\"cloudflare-worker-date-now\""));
        assert!(json.contains("\"verification\":\"unverified\""));
        assert!(json.contains("\"uncertainty\":\"unknown\""));
        assert!(json.contains("millisecond resolution"));
    }
}
