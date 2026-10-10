//! Dependency-free primitives for the Hemant Samwat Observatory.
//!
//! This crate is not an astronomical clock, Panchanga engine, or time
//! authority. It reads a named wall-clock source without calling it verified,
//! represents Unix nanoseconds as UTC civil time, converts elapsed duration
//! from a user-selected reference epoch under a named unit convention, and
//! describes every result through a versioned method registry.

pub mod astronomy;
pub mod json;
pub mod panchanga;
pub mod registry;
pub mod result;
pub mod time;
pub mod units;

pub use registry::{
    find_method, registry_json, EvidenceClass, MethodRecord, MethodStatus, ASTRONOMY_METHOD_ID,
    CIVIL_METHOD_ID, CLOCK_METHOD_ID, EPOCH_METHOD_ID, METHOD_REGISTRY, METHOD_REGISTRY_SCHEMA,
    PANCHANGA_METHOD_ID, SUPPLIED_METHOD_ID, UNITS_METHOD_ID, WORKER_CLOCK_METHOD_ID,
};
pub use result::{time_result_json, TIME_RESULT_SCHEMA};
pub use time::{
    format_unix_utc, system_time_to_unix_nanos, ClockReadError, ClockSource, FixedWallClock,
    HostMonotonicClock, HostWallClock, InstantRecord, MonotonicClock, MonotonicInterval, TimeScale,
    Uncertainty, Verification, WallClock, WallClockSnapshot, MAX_SUPPORTED_UNIX_NANOS,
    MIN_SUPPORTED_UNIX_NANOS, NANOS_PER_DAY,
};
pub use units::{
    units_convention, ElapsedUnits, HEMANT_EPOCH_LOCAL_DESCRIPTION, HEMANT_EPOCH_UNIX_NANOS,
};
