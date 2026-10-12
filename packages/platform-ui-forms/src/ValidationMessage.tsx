/**
 * @maataa/ui/forms/ValidationMessage
 * Standalone inline validation feedback message
 */

import React from "react";
import { colorTokens, spacingTokens, typographyTokens } from "./tokens";

export type ValidationMessageType = "error" | "warning" | "success" | "info";

export interface ValidationMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Message severity, controlling icon and color
   * @default 'error'
   */
  type?: ValidationMessageType;

  /**
   * The message text
   */
  children: React.ReactNode;
}

const iconByType: Record<ValidationMessageType, string> = {
  error: "⊗",
  warning: "⚠",
  success: "✓",
  info: "ⓘ",
};

const colorByType: Record<ValidationMessageType, { text: string }> = {
  error: { text: colorTokens.semantic.error.text },
  warning: { text: colorTokens.semantic.warning.text },
  success: { text: colorTokens.semantic.success.text },
  info: { text: colorTokens.semantic.info.text },
};

/**
 * ValidationMessage
 * A standalone inline feedback message with a severity icon, for use
 * anywhere a field's own `error`/`helperText` prop isn't sufficient —
 * for example, form-level validation summaries.
 *
 * @example
 * ```tsx
 * <ValidationMessage type="error">Please fix the errors below.</ValidationMessage>
 * <ValidationMessage type="success">Changes saved.</ValidationMessage>
 * ```
 */
export const ValidationMessage = React.forwardRef<HTMLDivElement, ValidationMessageProps>(
  ({ type = "error", children, style, role, ...props }, ref) => {
    const color = colorByType[type].text;

    return (
      <div
        ref={ref}
        role={role ?? (type === "error" ? "alert" : "status")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: spacingTokens.xs,
          fontSize: typographyTokens.fontSize.sm,
          color,
          ...style,
        }}
        {...props}
      >
        <span aria-hidden="true">{iconByType[type]}</span>
        <span>{children}</span>
      </div>
    );
  }
);

ValidationMessage.displayName = "ValidationMessage";
