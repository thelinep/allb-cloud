/**
 * @maataa/ui/forms/ToggleGroup
 * Mutually exclusive toggle button group
 */

import React from "react";
import { Stack } from "./_internal/Stack";
import { colorTokens, radiusTokens } from "./tokens";

export interface ToggleGroupOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ToggleGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Array of toggle options
   */
  options: ToggleGroupOption[];

  /**
   * Currently selected value
   */
  value?: string;

  /**
   * Callback when selection changes
   */
  onChange?: (value: string) => void;

  /**
   * Layout direction
   * @default 'horizontal'
   */
  direction?: "horizontal" | "vertical";

  /**
   * Group label
   */
  label?: string;

  /**
   * Whether group is disabled
   */
  disabled?: boolean;

  /**
   * Button size
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}

/**
 * ToggleGroup
 * Group of mutually exclusive toggle buttons
 */
export const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  (
    {
      options,
      value,
      onChange,
      direction = "horizontal",
      label,
      disabled = false,
      size = "md",
      ...props
    },
    ref
  ) => {
    const sizeMap = {
      sm: { height: "32px", fontSize: "13px", padding: "6px 12px" },
      md: { height: "40px", fontSize: "14px", padding: "8px 16px" },
      lg: { height: "48px", fontSize: "15px", padding: "10px 20px" },
    };

    const currentSize = sizeMap[size];

    return (
      <div ref={ref} {...props} style={{ width: "100%", ...props.style }}>
        {label && (
          <label
            style={{
              display: "block",
              fontSize: "14px",
              fontWeight: 500,
              marginBottom: "8px",
              color: colorTokens.text.primary,
            }}
          >
            {label}
          </label>
        )}

        <Stack direction={direction} spacing="0">
          {options.map((option, index) => {
            const isSelected = value === option.value;
            const isOptionDisabled = disabled || option.disabled;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => !isOptionDisabled && onChange?.(option.value)}
                disabled={isOptionDisabled}
                aria-pressed={isSelected}
                style={{
                  height: currentSize.height,
                  padding: currentSize.padding,
                  fontSize: currentSize.fontSize,
                  fontWeight: isSelected ? 600 : 500,
                  border: `1px solid ${colorTokens.border.primary}`,
                  backgroundColor: isSelected
                    ? colorTokens.interactive.primary
                    : colorTokens.background.primary,
                  color: isSelected ? colorTokens.background.primary : colorTokens.text.primary,
                  cursor: isOptionDisabled ? "not-allowed" : "pointer",
                  transition: "all 0.2s ease",
                  opacity: isOptionDisabled ? 0.6 : 1,
                  // Remove border between adjacent buttons
                  borderLeft: index === 0 ? `1px solid ${colorTokens.border.primary}` : "none",
                  borderRight:
                    index === options.length - 1
                      ? `1px solid ${colorTokens.border.primary}`
                      : `1px solid ${colorTokens.border.primary}`,
                  // Round corners for first and last buttons
                  borderRadius:
                    index === 0 && index === options.length - 1
                      ? radiusTokens.md
                      : index === 0
                        ? `${radiusTokens.md} 0 0 ${radiusTokens.md}`
                        : index === options.length - 1
                          ? `0 ${radiusTokens.md} ${radiusTokens.md} 0`
                          : "0",
                }}
              >
                {option.label}
              </button>
            );
          })}
        </Stack>
      </div>
    );
  }
);

ToggleGroup.displayName = "ToggleGroup";
