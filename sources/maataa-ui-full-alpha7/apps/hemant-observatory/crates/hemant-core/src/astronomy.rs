//! Ephemeris interface boundary (design only; see ASTRONOMY-DECISION-001.md).
//!
//! No ephemeris dataset is bundled. The only provider is `NoEphemeris`, which
//! answers every query with `Pending`. A future provider must report the
//! dataset identity, coverage, time scale, frame and corrections it used.

/// NAIF integer body codes for the targets the first increment will support.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Body {
    SolarSystemBarycenter = 0,
    Sun = 10,
    Moon = 301,
    Earth = 399,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Frame {
    /// ICRF-aligned inertial frame (SPICE "J2000"/ICRF as used by JPL DE440).
    Icrf,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Correction {
    /// Instantaneous position; no light-time or aberration.
    Geometric,
}

/// Ephemeris argument. Ephemerides are evaluated in TDB seconds past J2000;
/// converting UTC requires a pinned leap-second table and is not done here.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct TdbSecondsPastJ2000(pub f64);

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct StateQuery {
    pub target: Body,
    pub observer: Body,
    pub epoch: TdbSecondsPastJ2000,
    pub frame: Frame,
    pub correction: Correction,
}

#[derive(Debug, Clone, PartialEq)]
pub struct StateResult {
    pub position_km: [f64; 3],
    pub velocity_km_s: [f64; 3],
    pub dataset_identity: String,
    pub coverage_tdb: (f64, f64),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum EphemerisError {
    /// No dataset is installed; the result is pending, not zero.
    Pending {
        reason: &'static str,
    },
    OutsideCoverage,
}

pub trait EphemerisProvider {
    fn state(&self, query: &StateQuery) -> Result<StateResult, EphemerisError>;
}

/// The only provider in this build.
pub struct NoEphemeris;

impl EphemerisProvider for NoEphemeris {
    fn state(&self, _query: &StateQuery) -> Result<StateResult, EphemerisError> {
        Err(EphemerisError::Pending {
            reason: "no ephemeris dataset is bundled (see ASTRONOMY-DECISION-001.md)",
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_default_provider_never_fabricates_a_position() {
        let query = StateQuery {
            target: Body::Moon,
            observer: Body::Earth,
            epoch: TdbSecondsPastJ2000(0.0),
            frame: Frame::Icrf,
            correction: Correction::Geometric,
        };
        assert!(matches!(
            NoEphemeris.state(&query),
            Err(EphemerisError::Pending { .. })
        ));
    }

    #[test]
    fn body_codes_match_naif_integer_ids() {
        assert_eq!(Body::SolarSystemBarycenter as i32, 0);
        assert_eq!(Body::Sun as i32, 10);
        assert_eq!(Body::Moon as i32, 301);
        assert_eq!(Body::Earth as i32, 399);
    }
}
