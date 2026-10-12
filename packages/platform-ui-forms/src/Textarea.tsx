/**
 * @maataa/ui/forms/Textarea
 * Multi-line text input with label, error, and helper text support
 */

import React, { useId, useState } from "react";
import { colorTokens, radiusTokens } from "./tokens";
import { FieldShell } from "./FieldShell";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;

  /**
   * Whether the textarea can be resized by the user
   * @default 'vertical'
   */
  resize?: "none" | "vertical" | "horizontal" | "both";
}

/**
 * Textarea
 * A multi-line text input built on `FieldShell` for consistent
 * label/error/helper-text presentation.
 *
 * @example
 * ```tsx
 * <Textarea label="Bio" placeholder="Tell us about yourself" rows={4} />
 * <Textarea label="Notes" error="Notes are required" />
 * ```
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, helperText, required, resize = "vertical", id, className, style, ...props },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const [focused, setFocused] = useState(false);

    return (
      <FieldShell
        label={label}
        htmlFor={textareaId}
        required={required}
        error={error}
        helperText={helperText}
      >
        <textarea
          ref={ref}
          id={textareaId}
          className={className}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "14px",
            fontFamily: "inherit",
            border: `2px solid ${
              error
                ? colorTokens.interactive.error
                : focused
                  ? colorTokens.interactive.primary
                  : colorTokens.interactive.secondary
            }`,
            borderRadius: radiusTokens.md,
            outline: "none",
            transition: "all 0.2s ease",
            backgroundColor: colorTokens.background.primary,
            color: colorTokens.text.primary,
            boxSizing: "border-box",
            resize,
            ...style,
          }}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />
      </FieldShell>
    );
  }
);

Textarea.displayName = "Textarea";
