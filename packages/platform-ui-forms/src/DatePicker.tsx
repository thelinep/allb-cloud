/**
 * @maataa/ui/forms/DatePicker
 * A single-date input backed by a floating month calendar
 */

import React, { useEffect, useId, useRef, useState } from "react";
import { Portal } from "./_internal/Portal";
import { colorTokens, radiusTokens, spacingTokens, typographyTokens } from "./tokens";
import { CalendarGrid } from "./CalendarGrid";
import { formatDisplayDate } from "./dateUtils";

export interface DatePickerProps {
  /** Currently selected date, or `null` for no selection (controlled). */
  value: Date | null;

  /** Called with the newly selected date. */
  onChange: (date: Date | null) => void;

  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;

  /** Earliest selectable date (inclusive). */
  min?: Date;

  /** Latest selectable date (inclusive). */
  max?: Date;

  placeholder?: string;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * DatePicker
 * A trigger button showing the selected date, opening a floating month
 * calendar on click. Closes on selection, Escape, or an outside click.
 *
 * @example
 * ```tsx
 * const [date, setDate] = useState<Date | null>(null);
 * <DatePicker label="Event date" value={date} onChange={setDate} />
 * ```
 */
export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
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
      placeholder = "Select a date",
      id,
      className,
      style,
    },
    ref
  ) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const [isOpen, setIsOpen] = useState(false);
    const [visibleMonth, setVisibleMonth] = useState(value ?? new Date());
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
      if (!isOpen) return;
      setVisibleMonth(value ?? new Date());
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) setPosition({ x: rect.left, y: rect.bottom + 8 });
    }, [isOpen, value]);

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
      onChange(date);
      setIsOpen(false);
    };

    return (
      <div
        className={className}
        style={{ display: "flex", flexDirection: "column", gap: spacingTokens.xs, ...style }}
      >
        {label && (
          // Deliberately not `<label htmlFor>`-associated with the trigger
          // button below: for a labelable element like `<button>`, the
          // accessible-name algorithm gives an associated `<label>`
          // priority over the element's own text content, which would
          // replace the announced selected date with just the label text.
          // A plain preceding label (matching Select's pattern) keeps the
          // button's own content — the actual selected date — as its name.
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
            color: value ? colorTokens.text.primary : colorTokens.text.tertiary,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <span>{value ? formatDisplayDate(value) : placeholder}</span>
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
                selected={value}
                min={min}
                max={max}
                aria-label={label ? `Choose ${label}` : "Choose a date"}
              />
            </div>
          </Portal>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";
