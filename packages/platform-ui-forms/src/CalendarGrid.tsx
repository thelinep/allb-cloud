/**
 * @maataa/ui/forms/CalendarGrid
 * Internal month-grid calendar UI shared by DatePicker and DateRangePicker.
 * Not part of the public API.
 */

import React from "react";
import { colorTokens, radiusTokens, spacingTokens, typographyTokens } from "./tokens";
import {
  WEEKDAY_LABELS,
  addMonths,
  formatMonthYear,
  getMonthGrid,
  isSameDay,
  isWithinRange,
} from "./dateUtils";

export interface CalendarGridProps {
  /** The month currently displayed (any date within it). */
  month: Date;
  onMonthChange: (month: Date) => void;
  onSelectDay: (date: Date) => void;
  /** Single-selection mode: the selected date. */
  selected?: Date | null;
  /** Range-selection mode: highlights every day between start and end (inclusive). */
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  min?: Date;
  max?: Date;
  /** Injectable "today" for deterministic tests. Defaults to `new Date()`. */
  today?: Date;
  "aria-label"?: string;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  month,
  onMonthChange,
  onSelectDay,
  selected = null,
  rangeStart = null,
  rangeEnd = null,
  min,
  max,
  today = new Date(),
  "aria-label": ariaLabel = "Choose a date",
}) => {
  const cells = getMonthGrid(month);

  const isInRange = (date: Date): boolean => {
    if (!rangeStart || !rangeEnd) return false;
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const rangeStartTime = new Date(
      rangeStart.getFullYear(),
      rangeStart.getMonth(),
      rangeStart.getDate()
    ).getTime();
    const rangeEndTime = new Date(
      rangeEnd.getFullYear(),
      rangeEnd.getMonth(),
      rangeEnd.getDate()
    ).getTime();
    return dayStart >= rangeStartTime && dayStart <= rangeEndTime;
  };

  return (
    <div role="dialog" aria-label={ariaLabel} style={{ width: "280px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: spacingTokens.sm,
        }}
      >
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => onMonthChange(addMonths(month, -1))}
          style={navButtonStyle}
        >
          ‹
        </button>
        <span
          style={{
            fontSize: typographyTokens.fontSize.md,
            fontWeight: typographyTokens.fontWeight.semibold,
            color: colorTokens.text.primary,
          }}
        >
          {formatMonthYear(month)}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => onMonthChange(addMonths(month, 1))}
          style={navButtonStyle}
        >
          ›
        </button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "2px",
          marginBottom: spacingTokens.xs,
        }}
      >
        {WEEKDAY_LABELS.map((day) => (
          <span
            key={day}
            style={{
              textAlign: "center",
              fontSize: typographyTokens.fontSize.xs,
              color: colorTokens.text.secondary,
              fontWeight: typographyTokens.fontWeight.medium,
            }}
          >
            {day}
          </span>
        ))}
      </div>
      <div
        role="grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "2px",
        }}
      >
        {cells.map(({ date, inMonth }) => {
          const disabled = !isWithinRange(date, min, max);
          const isSelected =
            isSameDay(date, selected) || isSameDay(date, rangeStart) || isSameDay(date, rangeEnd);
          const inRange = isInRange(date) && !isSelected;
          const isToday = isSameDay(date, today);

          return (
            <button
              key={date.toISOString()}
              type="button"
              role="gridcell"
              disabled={disabled}
              aria-current={isToday ? "date" : undefined}
              aria-selected={isSelected}
              // Distinguishes an in-month cell from the previous/next month's
              // padding cells, which can share the same day-of-month number
              // (e.g. day 10 in-month vs. day 10 of next month's lead-in) —
              // used by tests to target the right cell unambiguously.
              data-in-month={inMonth}
              onClick={() => onSelectDay(date)}
              style={{
                width: "100%",
                aspectRatio: "1",
                border:
                  isToday && !isSelected
                    ? `1px solid ${colorTokens.interactive.primary}`
                    : "1px solid transparent",
                borderRadius: radiusTokens.sm,
                backgroundColor: isSelected
                  ? colorTokens.interactive.primary
                  : inRange
                    ? colorTokens.background.tertiary
                    : "transparent",
                color: isSelected
                  ? colorTokens.text.inverse
                  : inMonth
                    ? colorTokens.text.primary
                    : colorTokens.text.tertiary,
                fontSize: typographyTokens.fontSize.sm,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.4 : 1,
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

CalendarGrid.displayName = "CalendarGrid";

const navButtonStyle: React.CSSProperties = {
  border: "none",
  background: "none",
  cursor: "pointer",
  fontSize: typographyTokens.fontSize["2xl"],
  lineHeight: 1,
  padding: spacingTokens.xs,
  color: colorTokens.text.primary,
  borderRadius: radiusTokens.sm,
};
