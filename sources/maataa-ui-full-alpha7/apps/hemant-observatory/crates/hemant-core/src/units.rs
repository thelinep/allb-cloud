//! Selected reference epoch and the `hemant-traditional-units-v1` convention.

use crate::time::{ClockReadError, NANOS_PER_SECOND};

/// 1979-01-14 07:59:00 UTC, corresponding to the user-selected Kashi
/// Makar-Sankranti reference of 13:29 IST. The source citation and exact
/// astronomical event time remain unverified; the reference is minute precision.
pub const HEMANT_EPOCH_UNIX_NANOS: i128 = 285_148_740_000_000_000;
pub const HEMANT_EPOCH_LOCAL_DESCRIPTION: &str =
    "1979-01-14 13:29 IST · Kashi method · user-selected reference";
pub const HEMANT_EPOCH_PRECISION: &str = "minute";

const MUHURTAS_PER_DAY: i128 = 30;
const KALAS_PER_MUHURTA: i128 = 30;
const KASHTHAS_PER_KALA: i128 = 30;
const NIMESHAS_PER_KASHTHA: i128 = 15;
const NIMESHAS_PER_DAY: i128 =
    MUHURTAS_PER_DAY * KALAS_PER_MUHURTA * KASHTHAS_PER_KALA * NIMESHAS_PER_KASHTHA;

pub const fn units_convention() -> &'static str {
    "hemant-traditional-units-v1: 30 muhurta/ahoratra, 30 kala/muhurta, 30 kastha/kala, 15 nimesha/kastha"
}

/// Elapsed traditional-unit breakdown under the explicitly selected
/// `hemant-traditional-units-v1` convention:
/// 30 muhurtas/day, 30 kalas/muhurta, 30 kasthas/kala, 15 nimeshas/kastha.
///
/// The elapsed duration is the Unix-time difference from the epoch, so leap
/// seconds inserted since 1979 are NOT counted. One nimesha is 16/75 s; whole
/// units are floored and the remainder is reported as `residual_nanoseconds`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ElapsedUnits {
    pub signed_ahoratra: i128,
    pub muhurta: u8,
    pub kala: u8,
    pub kastha: u8,
    pub nimesha: u8,
    pub residual_nanoseconds: u128,
}

impl ElapsedUnits {
    pub fn try_from_unix_nanos(unix_nanos: i128) -> Result<Self, ClockReadError> {
        let elapsed_nanos = unix_nanos
            .checked_sub(HEMANT_EPOCH_UNIX_NANOS)
            .ok_or(ClockReadError::OutOfRange)?;
        let cycle_nanos = 16 * NANOS_PER_SECOND;
        let total_nimeshas = elapsed_nanos
            .div_euclid(cycle_nanos)
            .checked_mul(75)
            .and_then(|whole_cycles| {
                let partial = elapsed_nanos.rem_euclid(cycle_nanos) * 75 / cycle_nanos;
                whole_cycles.checked_add(partial)
            })
            .ok_or(ClockReadError::OutOfRange)?;
        let signed_ahoratra = total_nimeshas.div_euclid(NIMESHAS_PER_DAY);
        let mut day_remainder = total_nimeshas.rem_euclid(NIMESHAS_PER_DAY);
        let muhurta =
            (day_remainder / (KALAS_PER_MUHURTA * KASHTHAS_PER_KALA * NIMESHAS_PER_KASHTHA)) as u8;
        day_remainder %= KALAS_PER_MUHURTA * KASHTHAS_PER_KALA * NIMESHAS_PER_KASHTHA;
        let kala = (day_remainder / (KASHTHAS_PER_KALA * NIMESHAS_PER_KASHTHA)) as u8;
        day_remainder %= KASHTHAS_PER_KALA * NIMESHAS_PER_KASHTHA;
        let kastha = (day_remainder / NIMESHAS_PER_KASHTHA) as u8;
        let nimesha = (day_remainder % NIMESHAS_PER_KASHTHA) as u8;

        let represented_nanos = total_nimeshas
            .checked_mul(cycle_nanos)
            .ok_or(ClockReadError::OutOfRange)?
            / 75;
        let residual_nanoseconds = elapsed_nanos.abs_diff(represented_nanos);

        Ok(Self {
            signed_ahoratra,
            muhurta,
            kala,
            kastha,
            nimesha,
            residual_nanoseconds,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::time::{
        format_unix_utc, MAX_SUPPORTED_UNIX_NANOS, MIN_SUPPORTED_UNIX_NANOS, NANOS_PER_DAY,
    };

    #[test]
    fn epoch_is_the_selected_kashi_reference() {
        assert_eq!(
            format_unix_utc(HEMANT_EPOCH_UNIX_NANOS).unwrap(),
            "1979-01-14 07:59:00.000000000 UTC"
        );
        assert_eq!(
            ElapsedUnits::try_from_unix_nanos(HEMANT_EPOCH_UNIX_NANOS)
                .unwrap()
                .signed_ahoratra,
            0
        );
    }

    #[test]
    fn one_day_breaks_down_to_thirty_muhurta() {
        let units =
            ElapsedUnits::try_from_unix_nanos(HEMANT_EPOCH_UNIX_NANOS + NANOS_PER_DAY).unwrap();
        assert_eq!(units.signed_ahoratra, 1);
        assert_eq!(
            (units.muhurta, units.kala, units.kastha, units.nimesha),
            (0, 0, 0, 0)
        );
        assert_eq!(units.residual_nanoseconds, 0);
    }

    #[test]
    fn one_muhurta_is_forty_eight_minutes_under_the_named_convention() {
        let units =
            ElapsedUnits::try_from_unix_nanos(HEMANT_EPOCH_UNIX_NANOS + 48 * 60 * NANOS_PER_SECOND)
                .unwrap();
        assert_eq!(
            (units.signed_ahoratra, units.muhurta, units.kala),
            (0, 1, 0)
        );
    }

    #[test]
    fn subsecond_input_is_floored_to_whole_nimesha_with_residual() {
        // One nimesha is 16/75 s = 213 333 333.33 ns.
        let units =
            ElapsedUnits::try_from_unix_nanos(HEMANT_EPOCH_UNIX_NANOS + 300_000_000).unwrap();
        assert_eq!(units.nimesha, 1);
        assert_eq!(units.residual_nanoseconds, 300_000_000 - 213_333_333);
        let below = ElapsedUnits::try_from_unix_nanos(HEMANT_EPOCH_UNIX_NANOS + 1).unwrap();
        assert_eq!((below.nimesha, below.residual_nanoseconds), (0, 1));
    }

    #[test]
    fn a_pre_epoch_instant_has_signed_day_and_normal_subday_units() {
        let units =
            ElapsedUnits::try_from_unix_nanos(HEMANT_EPOCH_UNIX_NANOS - NANOS_PER_DAY).unwrap();
        assert_eq!(units.signed_ahoratra, -1);
        assert_eq!(
            (units.muhurta, units.kala, units.kastha, units.nimesha),
            (0, 0, 0, 0)
        );
        let just_before = ElapsedUnits::try_from_unix_nanos(HEMANT_EPOCH_UNIX_NANOS - 1).unwrap();
        assert_eq!(just_before.signed_ahoratra, -1);
        assert_eq!(
            (
                just_before.muhurta,
                just_before.kala,
                just_before.kastha,
                just_before.nimesha
            ),
            (29, 29, 29, 14)
        );
    }

    #[test]
    fn whole_supported_range_converts_and_extremes_report_overflow() {
        assert!(ElapsedUnits::try_from_unix_nanos(MIN_SUPPORTED_UNIX_NANOS).is_ok());
        assert!(ElapsedUnits::try_from_unix_nanos(MAX_SUPPORTED_UNIX_NANOS).is_ok());
        assert_eq!(
            ElapsedUnits::try_from_unix_nanos(i128::MIN),
            Err(ClockReadError::OutOfRange)
        );
    }
}
