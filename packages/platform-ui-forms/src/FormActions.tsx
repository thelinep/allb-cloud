/**
 * @maataa/ui/forms/FormActions
 * Footer row for form submit/cancel buttons
 */

import React from "react";
import { spacingTokens } from "./tokens";

export interface FormActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Horizontal alignment of the action buttons
   * @default 'end'
   */
  align?: "start" | "center" | "end" | "space-between";

  /**
   * Gap between buttons, from the spacing token scale
   * @default 'sm'
   */
  gap?: keyof typeof spacingTokens;

  children?: React.ReactNode;
}

const justifyMap: Record<NonNullable<FormActionsProps["align"]>, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  "space-between": "space-between",
};

/**
 * FormActions
 * A horizontal footer row for a form's submit/cancel buttons, right-aligned
 * by default to match common form conventions.
 *
 * @example
 * ```tsx
 * <FormActions>
 *   <Button variant="secondary">Cancel</Button>
 *   <Button variant="primary" type="submit">Save</Button>
 * </FormActions>
 * ```
 */
export const FormActions = React.forwardRef<HTMLDivElement, FormActionsProps>(
  ({ align = "end", gap = "sm", children, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: justifyMap[align],
          gap: spacingTokens[gap],
          width: "100%",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

FormActions.displayName = "FormActions";
