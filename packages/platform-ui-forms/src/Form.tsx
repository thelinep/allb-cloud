/**
 * @maataa/ui/forms/Form
 * Form wrapper with consistent vertical field spacing
 */

import React from "react";
import { spacingTokens } from "./tokens";

export interface FormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit"> {
  /**
   * Called on submit, after `preventDefault()` has already been applied
   */
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;

  /**
   * Vertical gap between direct children, from the spacing token scale
   * @default 'lg'
   */
  spacing?: keyof typeof spacingTokens;

  children?: React.ReactNode;
}

/**
 * Form
 * A `<form>` wrapper that prevents the default full-page submit and
 * lays its children out in a vertical stack with consistent spacing —
 * pair it with `FormRow`, `FormSection`, and `FormActions`.
 *
 * @example
 * ```tsx
 * <Form onSubmit={handleSubmit}>
 *   <Input label="Name" />
 *   <FormActions>
 *     <Button type="submit">Save</Button>
 *   </FormActions>
 * </Form>
 * ```
 */
export const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ onSubmit, spacing = "lg", children, style, ...props }, ref) => {
    return (
      <form
        ref={ref}
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.(e);
        }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: spacingTokens[spacing],
          width: "100%",
          ...style,
        }}
        {...props}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = "Form";
