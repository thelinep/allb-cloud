/**
 * @maataa/ui/forms/TimePicker
 * A styled time-of-day input
 */

import React from "react";
import { colorTokens, radiusTokens, typographyTokens } from "./tokens";

export interface TimePickerProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange" | "value"
> {
  /** Time value as "HH:MM" (controlled), or empty string for no selection. */
  value: string;

  /** Called with the new "HH:MM" value. */
  onChange: (value: string) => void;

  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * TimePicker
 * A time-of-day field built on the native `<input type="time">`, styled to
 * match the rest of the form components. Used standalone, or combined with
 * `DatePicker` inside `DateTimePicker`.
 *
 * @example
 * ```tsx
 * const [time, setTime] = useState("09:00");
 * <TimePicker label="Start time" value={time} onChange={setTime} />
 * ```
 */
export const TimePicker = React.forwardRef<HTMLInputElement, TimePickerProps>(
  ({ value, onChange, label, error, helperText, style, ...props }, ref) => {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "100%" }}>
        {label && (
          <label
            style={{
              fontSize: typographyTokens.fontSize.md,
              fontWeight: typographyTokens.fontWeight.medium,
              color: error ? colorTokens.interactive.error : colorTokens.text.primary,
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: typographyTokens.fontSize.md,
            border: `2px solid ${error ? colorTokens.interactive.error : colorTokens.interactive.secondary}`,
            borderRadius: radiusTokens.md,
            outline: "none",
            backgroundColor: props.disabled
              ? colorTokens.background.tertiary
              : colorTokens.background.primary,
            color: colorTokens.text.primary,
            boxSizing: "border-box",
            ...style,
          }}
          {...props}
        />
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
      </div>
    );
  }
);

TimePicker.displayName = "TimePicker";
