/**
 * @maataa/ui/forms/Slider
 * Range slider input with an optional live value readout
 */

import React, { useId } from "react";
import { colorTokens, spacingTokens, typographyTokens } from "./tokens";

export interface SliderProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange" | "value"
> {
  /**
   * Current value (controlled)
   */
  value: number;

  /**
   * Called with the new numeric value as the slider moves
   */
  onChange: (value: number) => void;

  /**
   * Minimum value
   * @default 0
   */
  min?: number;

  /**
   * Maximum value
   * @default 100
   */
  max?: number;

  /**
   * Step increment
   * @default 1
   */
  step?: number;

  /**
   * Label text displayed above the slider
   */
  label?: string;

  /**
   * Whether to show the current numeric value next to the label
   * @default true
   */
  showValue?: boolean;
}

/**
 * Slider
 * A styled range input with an accessible label and an optional
 * live-updating value readout.
 *
 * @example
 * ```tsx
 * const [volume, setVolume] = useState(50);
 * <Slider label="Volume" value={volume} onChange={setVolume} />
 * ```
 */
export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    { value, onChange, min = 0, max = 100, step = 1, label, showValue = true, id, style, ...props },
    ref
  ) => {
    const generatedId = useId();
    const sliderId = id ?? generatedId;
    const percent = max > min ? ((value - min) / (max - min)) * 100 : 0;

    return (
      <div style={{ width: "100%" }}>
        {(label || showValue) && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: spacingTokens.xs,
            }}
          >
            {label && (
              <label
                htmlFor={sliderId}
                style={{
                  fontSize: typographyTokens.fontSize.md,
                  fontWeight: typographyTokens.fontWeight.medium,
                  color: colorTokens.text.primary,
                }}
              >
                {label}
              </label>
            )}
            {showValue && (
              <span
                style={{
                  fontSize: typographyTokens.fontSize.sm,
                  color: colorTokens.text.secondary,
                }}
              >
                {value}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          id={sliderId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: "100%",
            height: "4px",
            borderRadius: "2px",
            appearance: "none",
            outline: "none",
            cursor: "pointer",
            background: `linear-gradient(to right, ${colorTokens.interactive.primary} ${percent}%, ${colorTokens.interactive.secondary} ${percent}%)`,
            ...style,
          }}
          {...props}
        />
      </div>
    );
  }
);

Slider.displayName = "Slider";
