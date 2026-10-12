/**
 * Ported from nevo-ui (2026-09-13) as part of the @platform/ui-forms extraction.
 * NOTE: this component uses Tailwind utility classes, unlike the rest of this
 * package which uses inline styles driven by ./tokens. Left as-is to avoid
 * behavior changes on port; reconciling the two styling conventions is a
 * follow-up, not part of this extraction.
 */
import type {
  LabelHTMLAttributes,
  ReactNode,
} from 'react';

export interface LabelProps
  extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
}

export function Label({
  children,
  required = false,
  className = '',
  ...props
}: LabelProps) {
  return (
    <label
      className={[
        'mb-1.5 block text-sm font-medium text-gray-200',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}

      {required ? (
        <span
          aria-hidden="true"
          className="ml-1 text-red-400"
        >
          *
        </span>
      ) : null}
    </label>
  );
}