// NEVO canonical wizard framework -- typed contracts.
//
// This module defines the shape every domain wizard (booking, event-builder,
// onboarding, etc.) plugs into. Nothing here talks to a backend: persistence
// is expressed as an adapter interface (WizardPersistenceAdapter) so a real
// domain workflow can supply its own save/load implementation later without
// the framework changing. The default adapter (see context.tsx) is in-memory
// only, per the UI-FOUNDATION-1 mission's "do not persist to a new backend
// yet" constraint.

import type { ReactNode } from "react";

/** A step's validation outcome. Mirrors the shape most NEVO API routes
 * already return for field-level errors, so a domain wizard can pass its
 * server response straight through without remapping. */
export interface WizardValidationResult {
  valid: boolean;
  /** Field-level messages, keyed by field name, for inline display. */
  fieldErrors?: Record<string, string>;
  /** A single step-level message shown in NevoWizardError when not
   * attributable to one field. */
  message?: string;
}

export const WIZARD_VALID: WizardValidationResult = { valid: true };

export type WizardStepStatus = "upcoming" | "current" | "complete" | "invalid" | "skipped";

/** Props handed to a step's `render`. `values`/`setValues` are the whole
 * wizard's value bag (not just this step's slice) because later steps
 * routinely need earlier answers (e.g. a guest-count step reading the
 * event-type chosen two steps back). */
export interface WizardStepRenderProps<TValues extends Record<string, unknown>> {
  values: TValues;
  setValues(patch: Partial<TValues> | ((current: TValues) => TValues)): void;
  errors: Record<string, string> | undefined;
  readOnly: boolean;
}

export interface WizardStepDefinition<TValues extends Record<string, unknown> = Record<string, unknown>> {
  /** Stable identifier. Used for guards, resume, and the `stepId` query/URL
   * hook a domain wizard may want to wire up itself -- NevoWizard does not
   * touch routing. */
  id: string;
  title: string;
  description?: string;
  /** Steps the user may explicitly skip (NevoWizardActions renders a "Skip"
   * control). A skipped step never blocks completion. */
  optional?: boolean;
  /** Conditional steps: return false to remove this step from the active
   * sequence entirely (it is hidden from the stepper and never validated).
   * Re-evaluated on every value change, so a step can appear or disappear
   * as the user answers earlier steps. */
  isAvailable?(values: TValues): boolean;
  /** Step guard: return false (or a validation result with valid:false) to
   * block forward navigation past this step. May be async (e.g. a
   * server-side availability check) -- NevoWizard awaits it and shows
   * NevoWizardSaveIndicator's busy state while it resolves. */
  validate?(values: TValues): WizardValidationResult | Promise<WizardValidationResult>;
  /** The step's own content. Receives the whole value bag, not a slice --
   * see WizardStepRenderProps. */
  render(props: WizardStepRenderProps<TValues>): ReactNode;
  /** Optional short label used by NevoWizardSummary's review list when the
   * full render() output is too heavy to reuse read-only (e.g. a step whose
   * render() is a complex picker). Falls back to a generic "Provided" /
   * "Not provided" line when omitted. */
  summarize?(values: TValues): ReactNode;
}

export type WizardMode = "edit" | "review" | "readonly";

export type WizardSaveStatus = "idle" | "saving" | "saved" | "error";

/** Everything a domain workflow needs to persist and resume a wizard.
 * NevoWizard never assumes a shape for `TValues` beyond
 * `Record<string, unknown>`, so this adapter is the only integration point
 * with a real backend. Swap `createMemoryWizardAdapter` (context.tsx) for a
 * real one when a domain wizard is ready to persist for real. */
export interface WizardPersistenceAdapter<TValues extends Record<string, unknown> = Record<string, unknown>> {
  /** Called once on mount to resume a prior session. Return `null`/`undefined`
   * for a fresh wizard. */
  load(): Promise<{ values: TValues; stepId?: string } | null | undefined>;
  /** Called after every committed value change (debounced by the caller if
   * desired) and on explicit step completion. Errors surface through
   * NevoWizardSaveIndicator/NevoWizardError without losing in-memory state. */
  save(values: TValues, stepId: string): Promise<void>;
}

export interface WizardContextValue<TValues extends Record<string, unknown> = Record<string, unknown>> {
  steps: WizardStepDefinition<TValues>[];
  availableSteps: WizardStepDefinition<TValues>[];
  activeStepIndex: number;
  activeStep: WizardStepDefinition<TValues> | undefined;
  values: TValues;
  setValues(patch: Partial<TValues> | ((current: TValues) => TValues)): void;
  statuses: Record<string, WizardStepStatus>;
  errors: Record<string, Record<string, string> | undefined>;
  stepMessage: string | undefined;
  mode: WizardMode;
  saveStatus: WizardSaveStatus;
  saveError: string | undefined;
  isValidating: boolean;
  goNext(): Promise<void>;
  goBack(): void;
  goToStep(stepId: string): void;
  skipCurrent(): void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
  isComplete: boolean;
  progress: { completed: number; total: number; percent: number };
  dismissError(): void;
}
