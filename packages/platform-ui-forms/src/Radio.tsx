/**
 * @maataa/ui/forms/Radio
 * Accessible radio button components
 */

import React from "react";
import { Stack } from "./_internal/Stack";
import { colorTokens, spacingTokens } from "./tokens";

export interface RadioProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "size" | "onChange"
> {
  /**
   * Radio button value
   */
  value: string;

  /**
   * Whether radio is selected
   */
  checked?: boolean;

  /**
   * Callback when radio state changes
   */
  onChange?: (checked: boolean) => void;

  /**
   * Label text displayed next to radio
   */
  label?: string;

  /**
   * Description text displayed below radio
   */
  description?: string;

  /**
   * Radio button size
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}

export interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Radio group name (for native grouping)
   */
  name: string;

  /**
   * Array of radio options
   */
  options: Array<{
    value: string;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;

  /**
   * Currently selected value
   */
  value?: string;

  /**
   * Callback when selection changes
   */
  onChange?: (value: string) => void;

  /**
   * Group label
   */
  label?: string;

  /**
   * Group description
   */
  description?: string;

  /**
   * Layout direction
   * @default 'vertical'
   */
  direction?: "vertical" | "horizontal";

  /**
   * Whether group is disabled
   */
  disabled?: boolean;

  /**
   * Radio button size
   * @default 'md'
   */
  size?: "sm" | "md" | "lg";
}

/**
 * Radio
 * Individual radio button component
 */
export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  (
    {
      value,
      checked = false,
      onChange,
      label,
      description,
      size = "md",
      disabled = false,
      ...props
    },
    ref
  ) => {
    const sizeMap = {
      sm: { size: "16px", fontSize: "13px" },
      md: { size: "20px", fontSize: "14px" },
      lg: { size: "24px", fontSize: "15px" },
    };

    const currentSize = sizeMap[size];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <div style={{ width: "100%" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: spacingTokens.sm }}>
          <div style={{ position: "relative", display: "flex", marginTop: "2px" }}>
            {/* Hidden input */}
            <input
              ref={ref}
              type="radio"
              value={value}
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

            {/* Custom radio visual */}
            <div
              style={{
                width: currentSize.size,
                height: currentSize.size,
                minWidth: currentSize.size,
                minHeight: currentSize.size,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: `2px solid ${checked ? colorTokens.interactive.primary : colorTokens.border.primary}`,
                borderRadius: "50%",
                backgroundColor: colorTokens.background.primary,
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: disabled ? 0.6 : 1,
              }}
            >
              {/* Inner dot */}
              {checked && (
                <div
                  style={{
                    width: "calc(" + currentSize.size + " * 0.5)",
                    height: "calc(" + currentSize.size + " * 0.5)",
                    borderRadius: "50%",
                    backgroundColor: colorTokens.interactive.primary,
                  }}
                />
              )}
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

Radio.displayName = "Radio";

/**
 * RadioGroup
 * Group of radio buttons with label and state management
 */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      options,
      value,
      onChange,
      label,
      description,
      direction = "vertical",
      disabled = false,
      size = "md",
      ...props
    },
    ref
  ) => {
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

        {description && (
          <p
            style={{
              fontSize: "12px",
              color: colorTokens.text.secondary,
              marginBottom: "8px",
            }}
          >
            {description}
          </p>
        )}

        <Stack direction={direction === "vertical" ? "vertical" : "horizontal"} spacing="sm">
          {options.map((option) => (
            <Radio
              key={option.value}
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange?.(option.value)}
              label={option.label}
              description={option.description}
              disabled={disabled || option.disabled}
              size={size}
            />
          ))}
        </Stack>
      </div>
    );
  }
);

RadioGroup.displayName = "RadioGroup";
