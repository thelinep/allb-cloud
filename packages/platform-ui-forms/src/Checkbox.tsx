/**
 * @maataa/ui/forms/Checkbox
 * Accessible checkbox component with indeterminate state support
 */

import React from "react";
import { colorTokens, spacingTokens, radiusTokens } from "./tokens";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "onChange"
> {
  /**
   * Whether checkbox is checked
   */
  checked?: boolean;

  /**
   * Callback when checkbox state changes
   */
  onChange?: (checked: boolean) => void;

  /**
   * Label text displayed next to checkbox
   */
  label?: string;

  /**
   * Description text displayed below checkbox
   */
  description?: string;

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Whether checkbox is in indeterminate state (shows dash)
   */
  indeterminate?: boolean;

  /**
   * Checkbox size
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}

/**
 * Checkbox
 * Accessible checkbox input with support for indeterminate state
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked = false,
      onChange,
      label,
      description,
      error,
      indeterminate = false,
      size = "md",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const mergedRef = React.useMemo(() => (ref || inputRef) as React.Ref<HTMLInputElement>, [ref]);

    const sizeMap = {
      sm: { size: "16px", fontSize: "13px" },
      md: { size: "20px", fontSize: "14px" },
      lg: { size: "24px", fontSize: "15px" },
    };

    const currentSize = sizeMap[size];

    React.useEffect(() => {
      const input = (mergedRef as any)?.current;
      if (input) {
        input.indeterminate = indeterminate;
      }
    }, [indeterminate, mergedRef]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    const getCheckmarkContent = () => {
      if (indeterminate) return "−";
      if (checked) return "✓";
      return "";
    };

    return (
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: spacingTokens.sm }}>
          <div style={{ position: "relative", display: "flex", marginTop: "2px" }}>
            {/* Hidden input */}
            <input
              ref={mergedRef as any}
              type="checkbox"
              checked={checked}
              onChange={handleChange}
              disabled={disabled}
              style={{
                position: "absolute",
                opacity: 0,
                width: 0,
                height: 0,
              }}
              {...props}
            />

            {/* Custom checkbox visual */}
            <div
              style={{
                width: currentSize.size,
                height: currentSize.size,
                minWidth: currentSize.size,
                minHeight: currentSize.size,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px solid ${error ? colorTokens.interactive.error : checked || indeterminate ? colorTokens.interactive.success : colorTokens.border.primary}`,
                borderRadius: radiusTokens.sm,
                backgroundColor:
                  checked || indeterminate
                    ? colorTokens.interactive.success
                    : colorTokens.background.primary,
                color: colorTokens.background.primary,
                fontWeight: "bold",
                fontSize: "calc(" + currentSize.size + " * 0.6)",
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: disabled ? 0.6 : 1,
              }}
            >
              {getCheckmarkContent()}
            </div>
          </div>

          {/* Label and description */}
          {(label || description) && (
            <div
              style={{
                flex: 1,
              }}
            >
              {label && (
                <label
                  style={{
                    display: "block",
                    fontSize: currentSize.fontSize,
                    fontWeight: 500,
                    color: colorTokens.text.primary,
                    cursor: disabled ? "not-allowed" : "pointer",
                    opacity: disabled ? 0.6 : 1,
                  }}
                  htmlFor={props.id}
                >
                  {label}
                </label>
              )}
              {description && (
                <p
                  style={{
                    fontSize: "calc(" + currentSize.fontSize + " * 0.857)", // ~12px for md
                    color: colorTokens.text.secondary,
                    marginTop: "4px",
                  }}
                >
                  {description}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <p
            style={{
              fontSize: "calc(" + currentSize.fontSize + " * 0.857)",
              color: colorTokens.interactive.error,
              marginTop: "4px",
              marginLeft: "calc(" + currentSize.size + " + " + spacingTokens.sm + ")",
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
