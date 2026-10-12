/**
 * @platform/ui-forms
 * Shared form-primitive components, extracted 2026-09-13 from maataa-ui-lib's
 * forms/ category (the more complete, tested implementation) and consumed by
 * both @maataa/ui (re-exported under its ./forms subpath) and @nevo/ui.
 */

// Select
export { Select, type SelectProps, type SelectOption } from "./Select";

// Checkbox
export { Checkbox, type CheckboxProps } from "./Checkbox";

// Radio
export { Radio, RadioGroup, type RadioProps, type RadioGroupProps } from "./Radio";

// Toggle
export { Toggle, type ToggleProps } from "./Toggle";

// ToggleGroup
export { ToggleGroup, type ToggleGroupProps, type ToggleGroupOption } from "./ToggleGroup";

// Core form components (MUI-03)
export { FieldShell, type FieldShellProps } from "./FieldShell";
export { Textarea, type TextareaProps } from "./Textarea";
export { SearchInput, type SearchInputProps } from "./SearchInput";
export { Slider, type SliderProps } from "./Slider";
export { FileInput, type FileInputProps } from "./FileInput";
export { Form, type FormProps } from "./Form";
export { FormRow, type FormRowProps } from "./FormRow";
export { FormSection, type FormSectionProps } from "./FormSection";
export {
  ValidationMessage,
  type ValidationMessageProps,
  type ValidationMessageType,
} from "./ValidationMessage";
export { FormActions, type FormActionsProps } from "./FormActions";

// Date & time components (MUI-03 extension)
export { DatePicker, type DatePickerProps } from "./DatePicker";
export { TimePicker, type TimePickerProps } from "./TimePicker";
export { DateTimePicker, type DateTimePickerProps } from "./DateTimePicker";
export { DateRangePicker, type DateRangePickerProps, type DateRange } from "./DateRangePicker";

// Component metadata for Storybook and docs
export const formComponents = [
  {
    id: "field-shell",
    name: "FieldShell",
    component: "FieldShell",
    category: "Forms",
    description: "Shared label / helper-text / error-message wrapper for custom form controls",
  },
  {
    id: "textarea",
    name: "Textarea",
    component: "Textarea",
    category: "Forms",
    description: "A multi-line text input with label, error, and helper text support",
  },
  {
    id: "search-input",
    name: "SearchInput",
    component: "SearchInput",
    category: "Forms",
    description: "A text input specialized for search, with a search icon and clear button",
  },
  {
    id: "slider",
    name: "Slider",
    component: "Slider",
    category: "Forms",
    description: "A range slider input with an optional live value readout",
  },
  {
    id: "file-input",
    name: "FileInput",
    component: "FileInput",
    category: "Forms",
    description: "A styled file picker button backed by a native, visually-hidden input",
  },
  {
    id: "form",
    name: "Form",
    component: "Form",
    category: "Forms",
    description:
      "A form wrapper with consistent vertical field spacing and default-submit prevention",
  },
  {
    id: "form-row",
    name: "FormRow",
    component: "FormRow",
    category: "Forms",
    description: "Lays multiple fields out side by side, wrapping on narrow widths",
  },
  {
    id: "form-section",
    name: "FormSection",
    component: "FormSection",
    category: "Forms",
    description: "Groups related fields under a heading and optional description",
  },
  {
    id: "validation-message",
    name: "ValidationMessage",
    component: "ValidationMessage",
    category: "Forms",
    description: "A standalone inline validation feedback message",
    variants: ["error", "warning", "success", "info"],
  },
  {
    id: "form-actions",
    name: "FormActions",
    component: "FormActions",
    category: "Forms",
    description: "A footer row for a form's submit/cancel buttons",
  },
  {
    id: "date-picker",
    name: "DatePicker",
    component: "DatePicker",
    category: "Forms",
    description: "A single-date field backed by a floating month calendar",
  },
  {
    id: "time-picker",
    name: "TimePicker",
    component: "TimePicker",
    category: "Forms",
    description: "A time-of-day field built on the native time input",
  },
  {
    id: "date-time-picker",
    name: "DateTimePicker",
    component: "DateTimePicker",
    category: "Forms",
    description: "Combines DatePicker and TimePicker into a single date+time value",
  },
  {
    id: "date-range-picker",
    name: "DateRangePicker",
    component: "DateRangePicker",
    category: "Forms",
    description: "A start/end date range field backed by a floating month calendar",
  },
];

// Ported from nevo-ui: no equivalent existed in this package
export { MultiSelect, type MultiSelectOption, type MultiSelectProps } from "./MultiSelect";
export { Label, type LabelProps } from "./Label";
