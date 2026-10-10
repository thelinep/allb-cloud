//! Clock sources, wall-clock snapshots, monotonic intervals and the civil
//! UTC representation.
//!
//! Separation rules:
//! - A **wall-clock snapshot** is one reading of a named source. It carries
//!   its source, verification state and uncertainty. It is never "verified"
//!   merely because it was readable or agrees with another clock.
//! - A **monotonic interval** measures elapsed duration on one process-local
//!   monotonic clock. It has no relation to civil time and cannot be compared
//!   across processes or reboots.
//! - **Unix nanoseconds** are a count of 86 400-second days since
//!   1970-01-01T00:00:00 UTC. Unix time does not count leap seconds: it cannot
//!   represent 23:59:60, and the difference between two Unix timestamps that
//!   straddle inserted leap seconds is shorter than the elapsed SI duration by
//!   the number of leap seconds inserted in between (27 between 1972 and
//!   2017). Conversions to TAI/TT/TDB are out of scope here.

use std::time::{Instant, SystemTime, UNIX_EPOCH};

pub const NANOS_PER_SECOND: i128 = 1_000_000_000;
pub const NANOS_PER_DAY: i128 = 86_400 * NANOS_PER_SECOND;

/// Supported civil range: 0001-01-01T00:00:00 UTC (proleptic Gregorian).
pub const MIN_SUPPORTED_UNIX_NANOS: i128 = -62_135_596_800 * NANOS_PER_SECOND;
/// Supported civil range: 9999-12-31T23:59:59.999999999 UTC.
pub const MAX_SUPPORTED_UNIX_NANOS: i128 = 253_402_300_800 * NANOS_PER_SECOND - 1;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TimeScale {
    /// Unix-epoch count of 86 400-second days, expressed as UTC civil time.
    UnixUtc,
}

impl TimeScale {
    pub const fn id(self) -> &'static str {
        match self {
            Self::UnixUtc => "unix-utc-no-leap-seconds",
        }
    }
    pub const fn label(self) -> &'static str {
        match self {
            Self::UnixUtc => "Unix epoch coordinate (UTC representation, leap seconds not counted)",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ClockSource {
    HostSystemWallClock,
    /// Wall-clock milliseconds supplied by the Cloudflare Workers runtime.
    WorkerWallClock,
    SuppliedUnixNanoseconds,
    /// Deterministic source used only by tests and fixtures.
    Fixture,
}

impl ClockSource {
    pub const fn id(self) -> &'static str {
        match self {
            Self::HostSystemWallClock => "host-system-wall-clock",
            Self::WorkerWallClock => "cloudflare-worker-date-now",
            Self::SuppliedUnixNanoseconds => "caller-supplied-unix-nanoseconds",
            Self::Fixture => "test-fixture",
        }
    }
    pub const fn label(self) -> &'static str {
        match self {
            Self::HostSystemWallClock => "host system wall clock",
            Self::WorkerWallClock => "Cloudflare Workers Date.now() (millisecond resolution)",
            Self::SuppliedUnixNanoseconds => "caller-supplied Unix nanoseconds",
            Self::Fixture => "deterministic test fixture",
        }
    }
}

/// Only `Unverified` exists. Adding a verified state requires a source with
/// established provenance, freshness and bounded uncertainty.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Verification {
    Unverified,
}

impl Verification {
    pub const fn label(self) -> &'static str {
        match self {
            Self::Unverified => "unverified",
        }
    }
}

/// `Unknown` means the uncertainty has not been measured, not that it is zero.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Uncertainty {
    Unknown,
}

impl Uncertainty {
    pub const fn label(self) -> &'static str {
        match self {
            Self::Unknown => "unknown",
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ClockReadError {
    BeforeUnixEpoch,
    OutOfRange,
}

impl std::fmt::Display for ClockReadError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::BeforeUnixEpoch => write!(f, "system time is before the Unix epoch"),
            Self::OutOfRange => write!(f, "time value is outside the supported range"),
        }
    }
}

impl std::error::Error for ClockReadError {}

/// A wall-clock source that can be injected (host clock in production,
/// fixed values in tests).
pub trait WallClock {
    fn source(&self) -> ClockSource;
    fn read_unix_nanos(&self) -> Result<i128, ClockReadError>;
}

pub struct HostWallClock;

impl WallClock for HostWallClock {
    fn source(&self) -> ClockSource {
        ClockSource::HostSystemWallClock
    }
    fn read_unix_nanos(&self) -> Result<i128, ClockReadError> {
        system_time_to_unix_nanos(SystemTime::now())
    }
}

/// Deterministic wall clock for tests and fixtures.
pub struct FixedWallClock(pub i128);

impl WallClock for FixedWallClock {
    fn source(&self) -> ClockSource {
        ClockSource::Fixture
    }
    fn read_unix_nanos(&self) -> Result<i128, ClockReadError> {
        Ok(self.0)
    }
}

/// One point reading of a wall-clock source.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct WallClockSnapshot {
    pub unix_nanos: i128,
    pub scale: TimeScale,
    pub source: ClockSource,
    pub verification: Verification,
    pub uncertainty: Uncertainty,
}

/// Retained name from the first increment.
pub type InstantRecord = WallClockSnapshot;

impl WallClockSnapshot {
    pub fn read(clock: &dyn WallClock) -> Result<Self, ClockReadError> {
        let unix_nanos = clock.read_unix_nanos()?;
        ensure_supported(unix_nanos)?;
        Ok(Self {
            unix_nanos,
            scale: TimeScale::UnixUtc,
            source: clock.source(),
            verification: Verification::Unverified,
            uncertainty: Uncertainty::Unknown,
        })
    }

    pub fn from_host_clock() -> Result<Self, ClockReadError> {
        Self::read(&HostWallClock)
    }

    pub fn from_supplied_unix_nanos(unix_nanos: i128) -> Result<Self, ClockReadError> {
        ensure_supported(unix_nanos)?;
        Ok(Self {
            unix_nanos,
            scale: TimeScale::UnixUtc,
            source: ClockSource::SuppliedUnixNanoseconds,
            verification: Verification::Unverified,
            uncertainty: Uncertainty::Unknown,
        })
    }

    /// Construct a point reading from the Cloudflare Workers Date.now() value
    /// supplied across the WebAssembly boundary. The clock remains unverified.
    pub fn from_worker_wall_clock_unix_nanos(unix_nanos: i128) -> Result<Self, ClockReadError> {
        ensure_supported(unix_nanos)?;
        Ok(Self {
            unix_nanos,
            scale: TimeScale::UnixUtc,
            source: ClockSource::WorkerWallClock,
            verification: Verification::Unverified,
            uncertainty: Uncertainty::Unknown,
        })
    }
}

pub fn ensure_supported(unix_nanos: i128) -> Result<(), ClockReadError> {
    if (MIN_SUPPORTED_UNIX_NANOS..=MAX_SUPPORTED_UNIX_NANOS).contains(&unix_nanos) {
        Ok(())
    } else {
        Err(ClockReadError::OutOfRange)
    }
}

pub fn system_time_to_unix_nanos(time: SystemTime) -> Result<i128, ClockReadError> {
    match time.duration_since(UNIX_EPOCH) {
        Ok(duration) => i128::try_from(duration.as_nanos()).map_err(|_| ClockReadError::OutOfRange),
        Err(_) => Err(ClockReadError::BeforeUnixEpoch),
    }
}

// --- Monotonic intervals ----------------------------------------------------

/// Nanoseconds since an arbitrary, process-local monotonic origin.
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub struct MonotonicInstant(pub u128);

pub trait MonotonicClock {
    fn now(&self) -> MonotonicInstant;
}

/// Host monotonic clock (`std::time::Instant`) measured from its creation.
pub struct HostMonotonicClock {
    origin: Instant,
}

impl HostMonotonicClock {
    pub fn new() -> Self {
        Self {
            origin: Instant::now(),
        }
    }
}

impl Default for HostMonotonicClock {
    fn default() -> Self {
        Self::new()
    }
}

impl MonotonicClock for HostMonotonicClock {
    fn now(&self) -> MonotonicInstant {
        MonotonicInstant(self.origin.elapsed().as_nanos())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum IntervalError {
    /// The end reading is earlier than the start reading.
    NotMonotonic,
}

/// Elapsed duration between two readings of the SAME monotonic clock.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct MonotonicInterval {
    pub start: MonotonicInstant,
    pub end: MonotonicInstant,
}

impl MonotonicInterval {
    pub fn new(start: MonotonicInstant, end: MonotonicInstant) -> Result<Self, IntervalError> {
        if end < start {
            Err(IntervalError::NotMonotonic)
        } else {
            Ok(Self { start, end })
        }
    }
    pub fn elapsed_nanos(&self) -> u128 {
        self.end.0 - self.start.0
    }
}

// --- Civil UTC representation -------------------------------------------------

/// Convert Unix nanoseconds to a proleptic-Gregorian UTC string within the
/// supported range (years 0001–9999). Leap seconds are not representable.
pub fn format_unix_utc(unix_nanos: i128) -> Result<String, ClockReadError> {
    ensure_supported(unix_nanos)?;
    let seconds = unix_nanos.div_euclid(NANOS_PER_SECOND);
    let nanos = unix_nanos.rem_euclid(NANOS_PER_SECOND);
    let days = seconds.div_euclid(86_400);
    let second_of_day = seconds.rem_euclid(86_400);
    let days_i64 = i64::try_from(days).map_err(|_| ClockReadError::OutOfRange)?;
    let (year, month, day) = civil_from_days(days_i64);
    let hour = second_of_day / 3600;
    let minute = (second_of_day % 3600) / 60;
    let second = second_of_day % 60;
    Ok(format!(
        "{year:04}-{month:02}-{day:02} {hour:02}:{minute:02}:{second:02}.{nanos:09} UTC"
    ))
}

fn civil_from_days(days_since_unix_epoch: i64) -> (i64, i64, i64) {
    let z = days_since_unix_epoch + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let day_of_era = z - era * 146_097;
    let year_of_era =
        (day_of_era - day_of_era / 1_460 + day_of_era / 36_524 - day_of_era / 146_096) / 365;
    let mut year = year_of_era + era * 400;
    let day_of_year = day_of_era - (365 * year_of_era + year_of_era / 4 - year_of_era / 100);
    let month_prime = (5 * day_of_year + 2) / 153;
    let day = day_of_year - (153 * month_prime + 2) / 5 + 1;
    let month = month_prime + if month_prime < 10 { 3 } else { -9 };
    year += i64::from(month <= 2);
    (year, month, day)
}

#[cfg(test)]
mod tests {
    use super::*;

    struct SequenceClock(std::cell::Cell<usize>, Vec<u128>);
    impl MonotonicClock for SequenceClock {
        fn now(&self) -> MonotonicInstant {
            let i = self.0.get();
            self.0.set(i + 1);
            MonotonicInstant(self.1[i])
        }
    }

    #[test]
    fn injected_wall_clock_is_labelled_by_its_source_and_never_verified() {
        let snapshot = WallClockSnapshot::read(&FixedWallClock(1_000)).unwrap();
        assert_eq!(snapshot.source, ClockSource::Fixture);
        assert_eq!(snapshot.verification, Verification::Unverified);
        assert_eq!(snapshot.uncertainty, Uncertainty::Unknown);
        let supplied = WallClockSnapshot::from_supplied_unix_nanos(1_000).unwrap();
        assert_eq!(supplied.source, ClockSource::SuppliedUnixNanoseconds);
        // Agreement between two sources does not change verification.
        assert_eq!(snapshot.unix_nanos, supplied.unix_nanos);
        assert_eq!(supplied.verification, Verification::Unverified);
    }

    #[test]
    fn host_clock_snapshot_is_unverified_with_unknown_uncertainty() {
        let record = WallClockSnapshot::from_host_clock().unwrap();
        assert_eq!(record.source, ClockSource::HostSystemWallClock);
        assert_eq!(record.verification, Verification::Unverified);
        assert_eq!(record.uncertainty, Uncertainty::Unknown);
    }

    #[test]
    fn negative_and_subsecond_timestamps_format_exactly() {
        assert_eq!(
            format_unix_utc(-1).unwrap(),
            "1969-12-31 23:59:59.999999999 UTC"
        );
        assert_eq!(
            format_unix_utc(-NANOS_PER_DAY).unwrap(),
            "1969-12-31 00:00:00.000000000 UTC"
        );
        assert_eq!(
            format_unix_utc(1).unwrap(),
            "1970-01-01 00:00:00.000000001 UTC"
        );
        assert_eq!(
            format_unix_utc(951_782_400_123_000_000).unwrap(),
            "2000-02-29 00:00:00.123000000 UTC"
        );
    }

    #[test]
    fn range_boundaries_are_inclusive_and_outside_values_are_rejected() {
        assert_eq!(
            format_unix_utc(MIN_SUPPORTED_UNIX_NANOS).unwrap(),
            "0001-01-01 00:00:00.000000000 UTC"
        );
        assert_eq!(
            format_unix_utc(MAX_SUPPORTED_UNIX_NANOS).unwrap(),
            "9999-12-31 23:59:59.999999999 UTC"
        );
        assert_eq!(
            format_unix_utc(MIN_SUPPORTED_UNIX_NANOS - 1),
            Err(ClockReadError::OutOfRange)
        );
        assert_eq!(
            format_unix_utc(MAX_SUPPORTED_UNIX_NANOS + 1),
            Err(ClockReadError::OutOfRange)
        );
        assert_eq!(format_unix_utc(i128::MAX), Err(ClockReadError::OutOfRange));
        assert_eq!(format_unix_utc(i128::MIN), Err(ClockReadError::OutOfRange));
        assert_eq!(
            WallClockSnapshot::from_supplied_unix_nanos(MAX_SUPPORTED_UNIX_NANOS + 1),
            Err(ClockReadError::OutOfRange)
        );
        assert_eq!(
            WallClockSnapshot::read(&FixedWallClock(i128::MIN)),
            Err(ClockReadError::OutOfRange)
        );
    }

    #[test]
    fn leap_second_instants_are_not_representable() {
        // 2016-12-31T23:59:60 UTC (a real leap second) has no Unix value;
        // the following Unix second formats as 2017-01-01 00:00:00.
        assert_eq!(
            format_unix_utc(1_483_228_800 * NANOS_PER_SECOND).unwrap(),
            "2017-01-01 00:00:00.000000000 UTC"
        );
        assert_eq!(
            format_unix_utc(1_483_228_800 * NANOS_PER_SECOND - 1).unwrap(),
            "2016-12-31 23:59:59.999999999 UTC"
        );
    }

    #[test]
    fn monotonic_intervals_order_readings_and_reject_reversal() {
        let clock = SequenceClock(std::cell::Cell::new(0), vec![10, 25, 25, 5]);
        let a = clock.now();
        let b = clock.now();
        let c = clock.now();
        let d = clock.now();
        assert_eq!(MonotonicInterval::new(a, b).unwrap().elapsed_nanos(), 15);
        assert_eq!(MonotonicInterval::new(b, c).unwrap().elapsed_nanos(), 0);
        assert_eq!(
            MonotonicInterval::new(c, d),
            Err(IntervalError::NotMonotonic)
        );
    }

    #[test]
    fn host_monotonic_clock_never_goes_backwards() {
        let clock = HostMonotonicClock::new();
        let mut previous = clock.now();
        for _ in 0..1_000 {
            let next = clock.now();
            assert!(MonotonicInterval::new(previous, next).is_ok());
            previous = next;
        }
    }
}
