Internal implementation dependencies copied from maataa-ui-lib's primitives/ category
(Portal, Stack) because DatePicker/DateRangePicker/Select (Portal) and Radio/ToggleGroup
(Stack) depend on them. Not part of this package's public export surface -- @platform/ui-forms
exports only form components, not general-purpose layout primitives. If a future
@platform/ui-primitives package is extracted, these two files should move there and this
package should depend on it instead of vendoring its own copies.
