/**
 * @maataa/ui/forms/FormSection
 * Groups related fields under a heading and optional description
 */

import React from "react";
import { colorTokens, spacingTokens, typographyTokens } from "./tokens";

export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Section heading
   */
  title?: string;

  /**
   * Supporting text displayed below the heading
   */
  description?: string;

  /**
   * Whether to render a divider line below the heading/description
   * @default true
   */
  divider?: boolean;

  children?: React.ReactNode;
}

/**
 * FormSection
 * Groups a set of related fields under a heading and optional
 * description, separated from the fields by a thin divider.
 *
 * @example
 * ```tsx
 * <FormSection title="Personal details" description="This is shown on your public profile.">
 *   <Input label="Name" />
 *   <Input label="Email" />
 * </FormSection>
 * ```
 */
export const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ title, description, divider = true, children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: spacingTokens.md,
          width: "100%",
          ...style,
        }}
        {...props}
      >
        {(title || description) && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: spacingTokens.xs,
              paddingBottom: divider ? spacingTokens.md : undefined,
              borderBottom: divider ? `1px solid ${colorTokens.border.primary}` : undefined,
            }}
          >
            {title && (
              <h3
                style={{
                  margin: 0,
                  fontSize: typographyTokens.fontSize["2xl"],
                  fontWeight: typographyTokens.fontWeight.semibold,
                  color: colorTokens.text.primary,
                }}
              >
                {title}
              </h3>
            )}
            {description && (
              <p
                style={{
                  margin: 0,
                  fontSize: typographyTokens.fontSize.md,
                  color: colorTokens.text.secondary,
                }}
              >
                {description}
              </p>
            )}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: spacingTokens.md }}>
          {children}
        </div>
      </div>
    );
  }
);

FormSection.displayName = "FormSection";
