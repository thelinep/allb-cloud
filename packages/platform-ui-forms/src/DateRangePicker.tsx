/**
 * @maataa/ui/forms/DateRangePicker
 * A start/end date range input backed by a floating month calendar
 */

import React, { useEffect, useId, useRef, useState } from "react";
import { Portal } from "./_internal/Portal";
import { colorTokens, radiusTokens, spacingTokens, typographyTokens } from "./tokens";
import { CalendarGrid } from "./CalendarGrid";
import { formatDisplayDate } from "./dateUtils";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerProps {
  /** Currently selected range (controlled). */
  value: DateRange;

  /** Called with the updated range. Fires once per endpoint picked. */
  onChange: (range: DateRange) => void;

  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  min?: Date;
  max?: Date;
  placeholder?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * DateRangePicker
 * Click one day to set the range start, click a second day to set the end
 * (order is normalized automatically) and close the popup. Click the start
 * day again to restart the selection.
 *
 * @example
 * ```tsx
 * const [range, setRange] = useState<DateRange>({ start: null, end: null });
 * <DateRangePicker label="Booking dates" value={range} onChange={setRange} />
 * ```
 */
export const DateRangePicker = React.forwardRef<HTMLButtonElement, DateRangePickerProps>(
  (
    {
      value,
      onChange,
      label,
      error,
      helperText,
      required = false,
      disabled = false,
      min,
      max,
      placeholder = "Select a date range",
      id,
      className,
      style,
    },
    ref
  ) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const [isOpen, setIsOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(value.start ?? new Date());
    const [pendingStart, setPendingStart] = useState<Date | null>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    // Resets the visible month and any in-progress selection only when the
    // popup transitions from closed to open — deliberately NOT re-running
    // when `value` changes while it's already open, since committing the
    // first click of a two-click range selection updates `value.start`
    // (in a real controlled usage) and must not wipe `pendingStart`.
    useEffect(() => {
      if (!isOpen) return;
      setVisibleMonth(value.start ?? new Date());
      setPendingStart(null);
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) setPosition({ x: rect.left, y: rect.bottom + 8 });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    useEffect(() => {
      if (!isOpen) return;
      const handleOutside = (e: MouseEvent) => {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(e.target as Node) &&
          popupRef.current &&
          !popupRef.current.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") setIsOpen(false);
      };
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("keydown", handleKey);
      return () => {
        document.removeEventListener("mousedown", handleOutside);
        document.removeEventListener("keydown", handleKey);
      };
    }, [isOpen]);

    const handleSelectDay = (date: Date) => {
      if (!pendingStart) {
        setPendingStart(date);
        onChange({ start: date, end: null });
        return;
      }
      const [start, end] =
        date.getTime() < pendingStart.getTime() ? [date, pendingStart] : [pendingStart, date];
      onChange({ start, end });
      setPendingStart(null);
      setIsOpen(false);
    };

    const displayText = value.start
      ? value.end
        ? `${formatDisplayDate(value.start)} – ${formatDisplayDate(value.end)}`
        : formatDisplayDate(value.start)
      : placeholder;

    return (
      <div
        className={className}
        style={{ display: "flex", flexDirection: "column", gap: spacingTokens.xs, ...style }}
      >
        {label && (
          // Not `<label htmlFor>`-associated with the trigger button — see
          // the identical note in DatePicker.tsx: association would replace
          // the button's own accessible name (the selected range) with just
          // the label text.
          <span
            style={{
              fontSize: typographyTokens.fontSize.md,
              fontWeight: typographyTokens.fontWeight.medium,
              color: error ? colorTokens.interactive.error : colorTokens.text.primary,
            }}
          >
            {label}
            {required && (
              <span
                style={{ color: colorTokens.interactive.error, marginLeft: "2px" }}
                aria-hidden="true"
              >
                *
              </span>
            )}
          </span>
        )}
        <button
          ref={(node) => {
            (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node;
          }}
          id={fieldId}
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "10px",
            fontSize: typographyTokens.fontSize.md,
            border: `2px solid ${error ? colorTokens.interactive.error : colorTokens.interactive.secondary}`,
            borderRadius: radiusTokens.md,
            backgroundColor: disabled
              ? colorTokens.background.tertiary
              : colorTokens.background.primary,
            color: value.start ? colorTokens.text.primary : colorTokens.text.tertiary,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <span>{displayText}</span>
          <span aria-hidden="true" style={{ color: colorTokens.text.secondary }}>
            📅
          </span>
        </button>
        {error && (
          <span
            style={{ fontSize: typographyTokens.fontSize.xs, color: colorTokens.interactive.error }}
          >
            {error}
          </span>
        )}
        {helperText && !error && (
          <span
            style={{ fontSize: typographyTokens.fontSize.xs, color: colorTokens.text.secondary }}
          >
            {helperText}
          </span>
        )}
        {isOpen && (
          <Portal>
            <div
              ref={popupRef}
              style={{
                position: "fixed",
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: 1000,
                padding: spacingTokens.md,
                backgroundColor: colorTokens.background.primary,
                border: `1px solid ${colorTokens.border.primary}`,
                borderRadius: radiusTokens.lg,
                boxShadow: colorTokens.shadow.lg,
              }}
            >
              <CalendarGrid
                month={visibleMonth}
                onMonthChange={setVisibleMonth}
                onSelectDay={handleSelectDay}
                rangeStart={pendingStart ?? value.start}
                rangeEnd={pendingStart ? null : value.end}
                min={min}
                max={max}
                aria-label={label ? `Choose ${label}` : "Choose a date range"}
              />
            </div>
          </Portal>
        )}
      </div>
    );
  }
);

DateRangePicker.displayName = "DateRangePicker";
