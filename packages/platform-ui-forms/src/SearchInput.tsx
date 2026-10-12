/**
 * @maataa/ui/forms/SearchInput
 * Text input specialized for search, with a search icon and clear button
 */

import React, { useState } from "react";
import { colorTokens, radiusTokens } from "./tokens";

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> {
  /**
   * Current search value (controlled)
   */
  value?: string;

  /**
   * Called with the new value on every keystroke
   */
  onChange?: (value: string) => void;

  /**
   * Called when the clear button is pressed. Also clears the input's own value.
   */
  onClear?: () => void;

  /**
   * Placeholder text
   * @default 'Search...'
   */
  placeholder?: string;
}

/**
 * SearchInput
 * A text input pre-configured for search: a search icon on the left
 * and a clear ("×") button that appears once there's a value.
 *
 * @example
 * ```tsx
 * const [query, setQuery] = useState("");
 * <SearchInput value={query} onChange={setQuery} onClear={() => setQuery("")} />
 * ```
 */
export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    { value = "", onChange, onClear, placeholder = "Search...", className, style, ...props },
    ref
  ) => {
    const [focused, setFocused] = useState(false);

    return (
      <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            color: colorTokens.text.secondary,
            fontSize: "14px",
          }}
        >
          🔍
        </span>
        <input
          ref={ref}
          type="search"
          role="searchbox"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          className={className}
          style={{
            width: "100%",
            padding: value ? "10px 36px 10px 32px" : "10px 10px 10px 32px",
            fontSize: "14px",
            border: `2px solid ${focused ? colorTokens.interactive.primary : colorTokens.interactive.secondary}`,
            borderRadius: radiusTokens.md,
            outline: "none",
            transition: "all 0.2s ease",
            backgroundColor: colorTokens.background.primary,
            color: colorTokens.text.primary,
            boxSizing: "border-box",
            ...style,
          }}
          {...props}
        />
        {value && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={onClear}
            style={{
              position: "absolute",
              right: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "20px",
              height: "20px",
              padding: 0,
              border: "none",
              borderRadius: radiusTokens.full,
              background: "none",
              color: colorTokens.text.secondary,
              cursor: "pointer",
              fontSize: "16px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
