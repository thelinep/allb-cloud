/**
 * @maataa/ui/forms/FieldShell
 * Shared label / helper-text / error-message wrapper for form controls
 */

import React from "react";
import { colorTokens, spacingTokens, typographyTokens } from "./tokens";

export interface FieldShellProps {
  /**
   * Label text displayed above the control
   */
  label?: string;

  /**
   * The `id` of the control this label/messages apply to
   */
  htmlFor?: string;

  /**
   * Marks the field as required, appending a visual indicator to the label
   * @default false
   */
  required?: boolean;

  /**
   * Error message displayed below the control. Takes priority over `helperText`.
   */
  error?: string;

  /**
   * Helper text displayed below the control when there is no error
   */
  helperText?: string;

  /**
   * The form control itself
   */
  children: React.ReactNode;

  className?: string;
  style?: React.CSSProperties;
}

/**
 * FieldShell
 * Wraps any form control with a consistent label, required indicator,
 * and helper/error message — the same visual contract `Input` applies
 * internally, made reusable for custom controls like `Textarea`,
 * `SearchInput`, `FileInput`, and `Slider`.
 *
 * @example
 * ```tsx
 * <FieldShell label="Bio" htmlFor="bio" helperText="Max 200 characters">
 *   <textarea id="bio" />
 * </FieldShell>
 * ```
 */
export const FieldShell: React.FC<FieldShellProps> = ({
  label,
  htmlFor,
  required = false,
  error,
  helperText,
  children,
  className,
  style,
}) => {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: spacingTokens.xs,
        width: "100%",
        ...style,
      }}
    >
      {label && (
        <label
          htmlFor={htmlFor}
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
        </label>
      )}
      {children}
      {error && (
        <span
          style={{ fontSize: typographyTokens.fontSize.xs, color: colorTokens.interactive.error }}
        >
          {error}
        </span>
      )}
      {helperText && !error && (
        <span style={{ fontSize: typographyTokens.fontSize.xs, color: colorTokens.text.secondary }}>
          {helperText}
        </span>
      )}
    </div>
  );
};

FieldShell.displayName = "FieldShell";
