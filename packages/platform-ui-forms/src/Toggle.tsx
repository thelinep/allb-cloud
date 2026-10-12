/**
 * @maataa/ui/forms/Toggle
 * Boolean toggle switch component
 */

import React from "react";
import { colorTokens, spacingTokens } from "./tokens";

export interface ToggleProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "onChange"
> {
  /**
   * Whether toggle is checked
   */
  checked?: boolean;

  /**
   * Callback when toggle state changes
   */
  onChange?: (checked: boolean) => void;

  /**
   * Label text displayed next to toggle
   */
  label?: string;

  /**
   * Description text displayed below toggle
   */
  description?: string;

  /**
   * Toggle size
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";

  /**
   * Color variant
   * @default 'primary'
   */
  color?: "primary" | "success" | "warning" | "error";
}

/**
 * Toggle
 * Boolean toggle switch with animated thumb
 */
export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  (
    {
      checked = false,
      onChange,
      label,
      description,
      size = "md",
      color = "primary",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const sizeMap = {
      sm: { width: "36px", height: "20px", thumbSize: "16px", fontSize: "13px" },
      md: { width: "48px", height: "24px", thumbSize: "20px", fontSize: "14px" },
      lg: { width: "56px", height: "28px", thumbSize: "24px", fontSize: "15px" },
    };

    const colorMap = {
      primary: colorTokens.interactive.primary,
      success: colorTokens.interactive.success,
      warning: colorTokens.interactive.warning,
      error: colorTokens.interactive.error,
    };

    const currentSize = sizeMap[size];
    const currentColor = colorMap[color];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        onChange?.(!checked);
      }
    };

    return (
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: spacingTokens.sm }}>
          <div style={{ position: "relative", display: "flex", marginTop: "2px" }}>
            {/* Hidden input */}
            <input
              ref={ref}
              type="checkbox"
              checked={checked}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              style={{
                position: "absolute",
                opacity: 0,
                width: 0,
                height: 0,
              }}
              {...props}
            />

            {/* Toggle background */}
            <div
              style={{
                width: currentSize.width,
                height: currentSize.height,
                minWidth: currentSize.width,
                minHeight: currentSize.height,
                display: "flex",
                alignItems: "center",
                paddingLeft: checked ? "auto" : spacingTokens.xs,
                paddingRight: checked ? spacingTokens.xs : "auto",
                borderRadius: currentSize.height,
                backgroundColor: checked ? currentColor : colorTokens.background.secondary,
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "background-color 0.3s ease",
                opacity: disabled ? 0.6 : 1,
                position: "relative",
              }}
            >
              {/* Animated thumb */}
              <div
                style={{
                  width: currentSize.thumbSize,
                  height: currentSize.thumbSize,
                  borderRadius: "50%",
                  backgroundColor: colorTokens.background.primary,
                  position: "absolute",
                  left: checked
                    ? `calc(${currentSize.width} - ${currentSize.thumbSize} - ${spacingTokens.xs})`
                    : spacingTokens.xs,
                  transition: "left 0.3s ease",
                  boxShadow: colorTokens.shadow.sm,
                }}
              />
            </div>
          </div>

          {/* Label and description */}
          {(label || description) && (
            <div style={{ flex: 1 }}>
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
                    fontSize: "calc(" + currentSize.fontSize + " * 0.857)",
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
      </div>
    );
  }
);

Toggle.displayName = "Toggle";
