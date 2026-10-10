//! Instantaneous Panchanga angle classification from apparent geocentric
//! ecliptic longitudes. This does not assign a civil day or infer a tradition.

pub const MICRODEGREES_PER_CIRCLE: i64 = 360_000_000;
const TITHI_WIDTH: i64 = 12_000_000;
const KARANA_WIDTH: i64 = 6_000_000;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct InstantPanchanga {
    pub elongation_microdegrees: i64,
    /// One-based ordinal, 1..=30; a name requires the selected tradition.
    pub tithi: u8,
    pub paksha: &'static str,
    /// Zero-based half-tithi index, 0..=59.
    pub karana_index: u8,
    pub karana_name: &'static str,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PanchangaError {
    InvalidLongitude,
}

pub fn classify_apparent_longitudes(
    sun: i64,
    moon: i64,
) -> Result<InstantPanchanga, PanchangaError> {
    if !(0..MICRODEGREES_PER_CIRCLE).contains(&sun) || !(0..MICRODEGREES_PER_CIRCLE).contains(&moon)
    {
        return Err(PanchangaError::InvalidLongitude);
    }
    let elongation = (moon - sun).rem_euclid(MICRODEGREES_PER_CIRCLE);
    let tithi = (elongation / TITHI_WIDTH + 1) as u8;
    let karana_index = (elongation / KARANA_WIDTH) as u8;
    Ok(InstantPanchanga {
        elongation_microdegrees: elongation,
        tithi,
        paksha: if elongation < 180_000_000 {
            "shukla"
        } else {
            "krishna"
        },
        karana_index,
        karana_name: karana_name(karana_index),
    })
}

fn karana_name(index: u8) -> &'static str {
    const MOVABLE: [&str; 7] = [
        "Bava", "Balava", "Kaulava", "Taitila", "Garaja", "Vanija", "Vishti",
    ];
    match index {
        0 => "Kimstughna",
        1..=56 => MOVABLE[((index - 1) % 7) as usize],
        57 => "Shakuni",
        58 => "Chatushpada",
        _ => "Naga",
    }
}

/// Return a zero-based 27-part sidereal division using integer arithmetic.
/// Caller must supply a documented ayanamsha before interpreting the result.
pub fn sidereal_segment(longitude: i64, ayanamsha: i64) -> Result<u8, PanchangaError> {
    if !(0..MICRODEGREES_PER_CIRCLE).contains(&longitude)
        || !(0..MICRODEGREES_PER_CIRCLE).contains(&ayanamsha)
    {
        return Err(PanchangaError::InvalidLongitude);
    }
    let sidereal = (longitude - ayanamsha).rem_euclid(MICRODEGREES_PER_CIRCLE);
    Ok(((sidereal as i128 * 27) / MICRODEGREES_PER_CIRCLE as i128) as u8)
}

/// Linear interpolation of the next tropical 30-degree solar ingress from
/// two ordered apparent-longitude observations no more than one day apart.
/// Returns fractional Unix milliseconds; use a denser/refined ephemeris bracket
/// for a published event time.
pub fn interpolate_tropical_ingress(
    t0_unix_ms: i64,
    lon0: i64,
    t1_unix_ms: i64,
    lon1: i64,
) -> Result<(i64, u8), PanchangaError> {
    interpolate_sidereal_ingress(t0_unix_ms, lon0, t1_unix_ms, lon1, 0)
}

pub fn interpolate_sidereal_ingress(
    t0_unix_ms: i64,
    lon0: i64,
    t1_unix_ms: i64,
    lon1: i64,
    ayanamsha_microdegrees: i64,
) -> Result<(i64, u8), PanchangaError> {
    if t1_unix_ms <= t0_unix_ms
        || t1_unix_ms - t0_unix_ms > 86_400_000
        || !(0..MICRODEGREES_PER_CIRCLE).contains(&lon0)
        || !(0..MICRODEGREES_PER_CIRCLE).contains(&lon1)
        || !(0..60_000_000).contains(&ayanamsha_microdegrees)
    {
        return Err(PanchangaError::InvalidLongitude);
    }
    let sidereal0 = (lon0 - ayanamsha_microdegrees).rem_euclid(MICRODEGREES_PER_CIRCLE);
    let sidereal1 = (lon1 - ayanamsha_microdegrees).rem_euclid(MICRODEGREES_PER_CIRCLE);
    let delta = (sidereal1 - sidereal0).rem_euclid(MICRODEGREES_PER_CIRCLE);
    if delta <= 0 || delta > 2_000_000 {
        return Err(PanchangaError::InvalidLongitude);
    }
    let boundary = ((sidereal0 / 30_000_000 + 1) * 30_000_000).rem_euclid(MICRODEGREES_PER_CIRCLE);
    let distance = (boundary - sidereal0).rem_euclid(MICRODEGREES_PER_CIRCLE);
    if distance > delta {
        return Err(PanchangaError::InvalidLongitude);
    }
    let elapsed = ((t1_unix_ms - t0_unix_ms) as i128 * distance as i128) / delta as i128;
    Ok((t0_unix_ms + elapsed as i64, (boundary / 30_000_000) as u8))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn wraps_moon_sun_elongation_and_classifies_amavasya_bin() {
        let result = classify_apparent_longitudes(196_708_488, 188_725_018).unwrap();
        assert_eq!(result.elongation_microdegrees, 352_016_530);
        assert_eq!(result.tithi, 30);
        assert_eq!(result.paksha, "krishna");
        assert_eq!(result.karana_index, 58);
        assert_eq!(result.karana_name, "Chatushpada");
    }

    #[test]
    fn tithi_and_karana_boundaries_are_half_open() {
        assert_eq!(
            classify_apparent_longitudes(0, 11_999_999).unwrap().tithi,
            1
        );
        assert_eq!(
            classify_apparent_longitudes(0, 12_000_000).unwrap().tithi,
            2
        );
        assert_eq!(
            classify_apparent_longitudes(0, 5_999_999)
                .unwrap()
                .karana_index,
            0
        );
        assert_eq!(
            classify_apparent_longitudes(0, 6_000_000)
                .unwrap()
                .karana_index,
            1
        );
    }

    #[test]
    fn sidereal_segments_require_explicit_ayanamsha_input() {
        assert_eq!(sidereal_segment(20_000_000, 10_000_000).unwrap(), 0);
        assert!(sidereal_segment(360_000_000, 0).is_err());
    }

    #[test]
    fn tropical_crossing_interpolates_wrap_and_rejects_missing_crossing() {
        assert_eq!(
            interpolate_tropical_ingress(0, 359_000_000, 86_400_000, 1_000_000).unwrap(),
            (43_200_000, 0)
        );
        assert!(interpolate_tropical_ingress(0, 10_000_000, 10_000, 11_000_000).is_err());
    }

    #[test]
    fn sidereal_crossing_applies_only_the_explicit_offset() {
        assert_eq!(
            interpolate_sidereal_ingress(0, 309_500_000, 86_400_000, 310_500_000, 10_000_000)
                .unwrap(),
            (43_200_000, 10)
        );
    }
}
