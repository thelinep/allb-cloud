/**
 * @maataa/ui/primitives/Stack
 * Flexible container for stacking elements with consistent spacing
 */

import React from "react";

const spacingMap: Record<string, string> = {
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "40px",
  "3xl": "48px",
  "4xl": "56px",
};

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Stack direction
   * @default 'vertical'
   */
  direction?: "vertical" | "horizontal";

  /**
   * Spacing between children
   * @default 'md'
   */
  spacing?: keyof typeof spacingMap | string;

  /**
   * Align items cross-axis
   * @default 'start'
   */
  align?: "start" | "center" | "end" | "stretch";

  /**
   * Justify items main-axis
   * @default 'start'
   */
  justify?: "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly";

  /**
   * Whether items can wrap
   * @default false
   */
  wrap?: boolean;

  /**
   * Whether stack takes full width
   * @default false
   */
  fullWidth?: boolean;

  /**
   * Children elements
   */
  children: React.ReactNode;
}

/**
 * Stack
 * Flexible container for stacking elements with consistent spacing
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = "vertical",
      spacing = "md",
      align = "start",
      justify = "start",
      wrap = false,
      fullWidth = false,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const gapValue = spacingMap[spacing as keyof typeof spacingMap] || spacing;

    const alignMap: Record<string, string> = {
      start: "flex-start",
      center: "center",
      end: "flex-end",
      stretch: "stretch",
    };

    const justifyMap: Record<string, string> = {
      start: "flex-start",
      center: "center",
      end: "flex-end",
      "space-between": "space-between",
      "space-around": "space-around",
      "space-evenly": "space-evenly",
    };

    return (
      <div
        ref={ref}
        style={{
          display: "flex",
          flexDirection: direction === "vertical" ? "column" : "row",
          gap: gapValue,
          alignItems: alignMap[align],
          justifyContent: justifyMap[justify],
          flexWrap: wrap ? "wrap" : "nowrap",
          width: fullWidth ? "100%" : "auto",
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Stack.displayName = "Stack";
