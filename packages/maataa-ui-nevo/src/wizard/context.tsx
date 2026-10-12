// NEVO canonical wizard framework -- state engine.
//
// `NevoWizard` owns all navigation/validation/persistence state and exposes
// it through context to the presentational components
// (NevoWizardShell/Header/Progress/Stepper/Step/Body/Actions/Summary/Error/
// SaveIndicator/MobileNav). A domain wizard composes those children itself
// (or omits children entirely for the default layout -- see index.ts's
// `NevoWizardDefaultLayout`), so this file has zero knowledge of any
// specific product flow.

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import type {
  WizardContextValue,
  WizardMode,
  WizardPersistenceAdapter,
  WizardSaveStatus,
  WizardStepDefinition,
  WizardStepStatus,
  WizardValidationResult,
} from "./types.js";

const WizardContext = createContext<WizardContextValue<Record<string, unknown>> | null>(null);

/** The default persistence adapter: in-memory only, scoped to this
 * component instance. Matches the mission constraint "do not persist wizard
 * state to a new backend yet" while still exercising the full
 * save/resume/async-save code path end to end. A domain wizard passes its
 * own `WizardPersistenceAdapter` (e.g. one backed by a real API route) via
 * the `persistence` prop to swap this out without touching any other
 * wizard component. */
export function createMemoryWizardAdapter<TValues extends Record<string, unknown>>(
  initial?: TValues,
): WizardPersistenceAdapter<TValues> {
  let stored: { values: TValues; stepId?: string } | null = initial ? { values: initial } : null;
  return {
    async load() {
      return stored;
    },
    async save(values, stepId) {
      stored = { values, stepId };
    },
  };
}

export interface NevoWizardProps<TValues extends Record<string, unknown>> extends PropsWithChildren {
  steps: WizardStepDefinition<TValues>[];
  /** Seed values before `persistence.load()` resolves (and used if it
   * resolves to nothing). */
  initialValues: TValues;
  persistence?: WizardPersistenceAdapter<TValues>;
  /** "edit" (default): normal interactive flow. "review": every available
   * step is shown via NevoWizardSummary instead of one at a time, still
   * editable via each summary row's Edit action. "readonly": same review
   * layout, but Edit actions and all inputs are disabled -- for a completed
   * wizard someone is only looking back at. */
  mode?: WizardMode;
  /** Called once, after the last step's validate() passes on goNext(). Do
   * not use this as a persistence hook -- use `persistence.save` for that;
   * onComplete is for domain-level side effects (e.g. redirecting). */
  onComplete?(values: TValues): void;
  /** className applied to the root wizard element -- NevoWizardShell reads
   * this indirectly by rendering inside the provider; this is a passthrough
   * for consumers that render their own layout instead of
   * NevoWizardDefaultLayout. */
  className?: string;
}

/** Root orchestrator. Renders nothing on its own beyond `children` --
 * compose NevoWizardShell/Header/Progress/Stepper/Body/Actions yourself, or
 * import `NevoWizardDefaultLayout` from the package root for the standard
 * arrangement. */
export function NevoWizard<TValues extends Record<string, unknown>>({
  steps,
  initialValues,
  persistence,
  mode = "edit",
  onComplete,
  children,
}: NevoWizardProps<TValues>) {
  const adapterRef = useRef(persistence ?? createMemoryWizardAdapter(initialValues));
  const [values, setValuesState] = useState<TValues>(initialValues);
  const [activeStepId, setActiveStepId] = useState<string | undefined>(steps[0]?.id);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [skippedIds, setSkippedIds] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, Record<string, string> | undefined>>({});
  const [stepMessage, setStepMessage] = useState<string | undefined>(undefined);
  const [isValidating, setIsValidating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<WizardSaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | undefined>(undefined);
  const [resumed, setResumed] = useState(false);

  // Resume: run once. A step that no longer exists (domain wizard changed
  // its step list) falls back to the first available step rather than
  // getting stuck on a dangling id.
  useEffect(() => {
    let cancelled = false;
    adapterRef.current.load().then((persisted) => {
      if (cancelled || !persisted) return;
      setValuesState(persisted.values);
      if (persisted.stepId && steps.some((step) => step.id === persisted.stepId)) {
        setActiveStepId(persisted.stepId);
      }
    }).finally(() => {
      if (!cancelled) setResumed(true);
    });
    return () => {
      cancelled = true;
    };
    // Resume is intentionally a mount-only effect -- re-running it on every
    // `steps` identity change would clobber in-progress user input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableSteps = useMemo(
    () => steps.filter((step) => (step.isAvailable ? step.isAvailable(values) : true)),
    [steps, values],
  );

  const activeStepIndex = useMemo(() => {
    const index = availableSteps.findIndex((step) => step.id === activeStepId);
    return index === -1 ? 0 : index;
  }, [availableSteps, activeStepId]);

  const activeStep = availableSteps[activeStepIndex];

  // If the active step became unavailable (a conditional step disappeared
  // because an earlier answer changed), land on the nearest still-available
  // step rather than rendering nothing.
  useEffect(() => {
    if (activeStepId && !availableSteps.some((step) => step.id === activeStepId) && availableSteps[0]) {
      setActiveStepId(availableSteps[0].id);
    }
  }, [availableSteps, activeStepId]);

  const setValues = useCallback((patch: Partial<TValues> | ((current: TValues) => TValues)) => {
    setValuesState((current) => (typeof patch === "function" ? (patch as (c: TValues) => TValues)(current) : { ...current, ...patch }));
  }, []);

  // Async, debounced-by-nature save: fires after resume completes and on
  // every subsequent value/step change. A slow or failing adapter never
  // blocks navigation -- it only ever affects NevoWizardSaveIndicator.
  useEffect(() => {
    if (!resumed || !activeStep) return;
    let cancelled = false;
    setSaveStatus("saving");
    adapterRef.current.save(values, activeStep.id).then(() => {
      if (!cancelled) {
        setSaveStatus("saved");
        setSaveError(undefined);
      }
    }).catch((error: unknown) => {
      if (!cancelled) {
        setSaveStatus("error");
        setSaveError(error instanceof Error ? error.message : "Could not save this step.");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [values, activeStep, resumed]);

  const statuses = useMemo(() => {
    const result: Record<string, WizardStepStatus> = {};
    availableSteps.forEach((step, index) => {
      if (step.id === activeStep?.id) result[step.id] = "current";
      else if (skippedIds.has(step.id)) result[step.id] = "skipped";
      else if (completedIds.has(step.id)) result[step.id] = "complete";
      else if (errors[step.id]) result[step.id] = "invalid";
      else result[step.id] = index < activeStepIndex ? "complete" : "upcoming";
    });
    return result;
  }, [availableSteps, activeStep, activeStepIndex, completedIds, skippedIds, errors]);

  const dismissError = useCallback(() => {
    setStepMessage(undefined);
    if (activeStep) setErrors((current) => ({ ...current, [activeStep.id]: undefined }));
  }, [activeStep]);

  const runValidation = useCallback(async (): Promise<WizardValidationResult> => {
    if (!activeStep?.validate) return { valid: true };
    setIsValidating(true);
    try {
      return await activeStep.validate(values);
    } finally {
      setIsValidating(false);
    }
  }, [activeStep, values]);

  const goNext = useCallback(async () => {
    if (!activeStep) return;
    const result = await runValidation();
    if (!result.valid) {
      setErrors((current) => ({ ...current, [activeStep.id]: result.fieldErrors }));
      setStepMessage(result.message ?? "Please resolve the highlighted fields before continuing.");
      return;
    }
    setErrors((current) => ({ ...current, [activeStep.id]: undefined }));
    setStepMessage(undefined);
    setCompletedIds((current) => new Set(current).add(activeStep.id));
    setSkippedIds((current) => {
      if (!current.has(activeStep.id)) return current;
      const next = new Set(current);
      next.delete(activeStep.id);
      return next;
    });
    const nextStep = availableSteps[activeStepIndex + 1];
    if (nextStep) {
      setActiveStepId(nextStep.id);
    } else {
      onComplete?.(values);
    }
  }, [activeStep, runValidation, availableSteps, activeStepIndex, onComplete, values]);

  const goBack = useCallback(() => {
    const previous = availableSteps[activeStepIndex - 1];
    if (previous) setActiveStepId(previous.id);
  }, [availableSteps, activeStepIndex]);

  const goToStep = useCallback((stepId: string) => {
    // Only allow jumping to a step that is itself available and either
    // already reached (complete/current) or immediately next -- prevents
    // skipping ahead past unvalidated steps via the stepper.
    const targetIndex = availableSteps.findIndex((step) => step.id === stepId);
    if (targetIndex === -1) return;
    const reachable = targetIndex <= activeStepIndex || completedIds.has(availableSteps[targetIndex - 1]?.id ?? "");
    if (reachable || targetIndex === 0) setActiveStepId(stepId);
  }, [availableSteps, activeStepIndex, completedIds]);

  const skipCurrent = useCallback(() => {
    if (!activeStep?.optional) return;
    setSkippedIds((current) => new Set(current).add(activeStep.id));
    const nextStep = availableSteps[activeStepIndex + 1];
    if (nextStep) setActiveStepId(nextStep.id);
    else onComplete?.(values);
  }, [activeStep, availableSteps, activeStepIndex, onComplete, values]);

  const progress = useMemo(() => {
    const total = availableSteps.length;
    const completed = availableSteps.filter((step) => completedIds.has(step.id) || skippedIds.has(step.id)).length;
    return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
  }, [availableSteps, completedIds, skippedIds]);

  const value: WizardContextValue<TValues> = {
    steps,
    availableSteps,
    activeStepIndex,
    activeStep,
    values,
    setValues,
    statuses,
    errors,
    stepMessage,
    mode,
    saveStatus,
    saveError,
    isValidating,
    goNext,
    goBack,
    goToStep,
    skipCurrent,
    canGoBack: activeStepIndex > 0,
    canGoNext: !isValidating,
    isLastStep: activeStepIndex === availableSteps.length - 1,
    isComplete: availableSteps.length > 0 && availableSteps.every((step) => completedIds.has(step.id) || skippedIds.has(step.id)),
    progress,
    dismissError,
  };

  return <WizardContext.Provider value={value as unknown as WizardContextValue<Record<string, unknown>>}>{children}</WizardContext.Provider>;
}

/** Read the active wizard's state. Throws outside a `<NevoWizard>` so a
 * misplaced component fails loudly in development rather than rendering a
 * blank step. */
export function useNevoWizard<TValues extends Record<string, unknown> = Record<string, unknown>>(): WizardContextValue<TValues> {
  const context = useContext(WizardContext);
  if (!context) throw new Error("useNevoWizard must be used within <NevoWizard>.");
  return context as unknown as WizardContextValue<TValues>;
}
