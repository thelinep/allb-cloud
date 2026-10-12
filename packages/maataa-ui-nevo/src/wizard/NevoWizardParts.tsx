// NEVO canonical wizard framework -- presentational components.
//
// All eleven pieces below are dumb with respect to state: everything they
// render comes from `useNevoWizard()`. They compose NEVO's existing
// branded primitives (./nevo.js -- Button, Card, StatusBadge, EmptyState,
// LoadingState) rather than introducing new visual primitives, per
// UI-FOUNDATION-1 rule 1 ("existing NEVO components ... first source of
// truth") and rule 9 ("preserve NEVO's existing theme/token architecture").
// No Tailwind, no shadcn, no MUI: this repo has neither Tailwind nor a
// shadcn registry configured (confirmed by audit -- no tailwind.config.*,
// no components.json), so the wizard's own CSS (./wizard.css) follows the
// same plain, BEM-ish, token-driven convention as packages/maataa-ui's
// existing styles.css.

import { useCallback, useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";
import { Button, Card, EmptyState, IconButton, LoadingState, StatusBadge } from "../nevo.js";
import { VisuallyHidden } from "../components.js";
import { useNevoWizard } from "./context.js";
import type { WizardStepStatus } from "./types.js";

function classes(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

const STATUS_LABEL: Record<WizardStepStatus, string> = {
  upcoming: "Not started",
  current: "In progress",
  complete: "Complete",
  invalid: "Needs attention",
  skipped: "Skipped",
};

/** Overall responsive frame: sidebar stepper + main column on desktop,
 * stacked single column with NevoWizardMobileNav pinned to the bottom on
 * narrow viewports (breakpoint matches packages/maataa-ui's existing
 * .maataa-ui__shell convention: 760px). Must be the outermost element
 * inside <NevoWizard>.
 *
 * Also owns the Alt+ArrowLeft / Alt+ArrowRight keyboard shortcuts (same
 * actions as NevoWizardActions' Back/Next buttons). They are attached here
 * -- the outermost wizard element -- rather than on NevoWizardActions
 * itself, so they fire from focus anywhere inside the wizard (a step's own
 * inputs, the stepper, ...), matching what a real keyboard user expects
 * from a "global" shortcut instead of only firing when focus happens to
 * already be on the actions row. Edit-mode only, mirroring
 * NevoWizardActions (which renders nothing outside edit mode). */
export function NevoWizardShell({ children, className }: { children: ReactNode; className?: string }) {
  const { mode, canGoBack, goNext, goBack } = useNevoWizard();

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (mode !== "edit" || !event.altKey) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      void goNext();
    } else if (event.key === "ArrowLeft" && canGoBack) {
      event.preventDefault();
      goBack();
    }
  }, [mode, goNext, goBack, canGoBack]);

  return (
    <div
      className={classes("maataa-ui", "nevo-wizard", mode !== "edit" && "nevo-wizard--readonly", className)}
      data-wizard-mode={mode}
      onKeyDown={onKeyDown}
    >
      {children}
    </div>
  );
}

/** Title/subtitle row plus a slot for NevoWizardSaveIndicator. Renders the
 * active step's title by default so a domain wizard never has to keep a
 * page <h1> in sync with wizard state by hand. */
export function NevoWizardHeader({ title, subtitle, action }: { title?: string; subtitle?: string; action?: ReactNode }) {
  const { activeStep, availableSteps, activeStepIndex, mode } = useNevoWizard();
  const heading = title ?? (mode === "edit" ? activeStep?.title : "Review");
  const sub = subtitle ?? activeStep?.description;
  return (
    <header className="nevo-wizard__header">
      <div>
        {mode === "edit" && availableSteps.length > 0 && (
          <p className="nevo-wizard__eyebrow">
            Step {activeStepIndex + 1} of {availableSteps.length}
          </p>
        )}
        <h1 className="nevo-wizard__title" id="nevo-wizard-step-heading">{heading}</h1>
        {sub && <p className="nevo-wizard__subtitle">{sub}</p>}
      </div>
      {action}
    </header>
  );
}

/** Linear percent-complete indicator. A completed/skipped step counts
 * toward progress; the current step does not until it validates. */
export function NevoWizardProgress({ label = "Wizard progress" }: { label?: string }) {
  const { progress } = useNevoWizard();
  return (
    <div className="nevo-wizard__progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress.percent}>
      <div className="nevo-wizard__progress-track">
        <div className="nevo-wizard__progress-fill" style={{ width: `${progress.percent}%` }} />
      </div>
      <VisuallyHidden>{progress.percent}% complete, {progress.completed} of {progress.total} steps</VisuallyHidden>
    </div>
  );
}

/** Desktop/tablet step list. Supports Up/Down arrow-key navigation between
 * step buttons (roving tabindex) in addition to Tab, per the mission's
 * keyboard-navigation requirement. Hidden below the mobile breakpoint in
 * favor of NevoWizardMobileNav (see wizard.css). */
export function NevoWizardStepper() {
  const { availableSteps, statuses, activeStep, goToStep } = useNevoWizard();
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const buttons = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-step-id]") ?? []);
    const currentIndex = buttons.findIndex((button) => button === document.activeElement);
    if (currentIndex === -1) return;
    event.preventDefault();
    const nextIndex = event.key === "ArrowDown" ? Math.min(currentIndex + 1, buttons.length - 1) : Math.max(currentIndex - 1, 0);
    buttons[nextIndex]?.focus();
  }, []);

  return (
    <nav className="nevo-wizard__stepper" aria-label="Wizard steps" ref={listRef} onKeyDown={onKeyDown}>
      <ol>
        {availableSteps.map((step, index) => {
          const status = statuses[step.id] ?? "upcoming";
          return (
            <li key={step.id}>
              <button
                type="button"
                data-step-id={step.id}
                className={classes("nevo-wizard__step-nav", status === "current" && "nevo-wizard__step-nav--current")}
                aria-current={step.id === activeStep?.id ? "step" : undefined}
                onClick={() => goToStep(step.id)}
              >
                <span className={classes("nevo-wizard__step-index", `nevo-wizard__step-index--${status}`)} aria-hidden="true">
                  {status === "complete" ? "✓" : index + 1}
                </span>
                <span className="nevo-wizard__step-nav-text">
                  <span className="nevo-wizard__step-nav-title">{step.title}{step.optional ? <span className="nevo-wizard__muted"> (optional)</span> : null}</span>
                  <VisuallyHidden>{STATUS_LABEL[status]}</VisuallyHidden>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Renders the active step's own content in edit mode. In review/readonly
 * mode, defers to NevoWizardSummary instead (a domain wizard that renders
 * both unconditionally gets the right one automatically). */
export function NevoWizardStep() {
  const { activeStep, values, setValues, errors, mode } = useNevoWizard();
  if (mode !== "edit") return null;
  if (!activeStep) {
    return <EmptyState title="Nothing to show" description="This wizard has no available steps." />;
  }
  return (
    <div className="nevo-wizard__step" role="group" aria-labelledby="nevo-wizard-step-heading">
      {activeStep.render({ values, setValues, errors: errors[activeStep.id], readOnly: false })}
    </div>
  );
}

/** Scrollable content region wrapping whatever NevoWizardStep /
 * NevoWizardSummary render, plus the error banner. Keeps scroll position
 * local to the step body so the header/stepper/actions stay put -- matters
 * most on mobile where vertical space is tight. */
export function NevoWizardBody({ children }: { children: ReactNode }) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const { activeStep } = useNevoWizard();
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 });
  }, [activeStep?.id]);
  return (
    <div className="nevo-wizard__body" ref={bodyRef}>
      <NevoWizardError />
      {children}
    </div>
  );
}

/** Back / Skip / Next(-or-Finish) row. Alt+ArrowLeft / Alt+ArrowRight
 * global shortcuts for these same actions are handled by NevoWizardShell,
 * not here (see its doc comment). Disabled states follow context exactly
 * -- there is no separate notion of "disabled" here beyond
 * canGoBack/canGoNext/isValidating. */
export function NevoWizardActions({ finishLabel = "Finish", nextLabel = "Continue", backLabel = "Back", skipLabel = "Skip for now" }: { finishLabel?: string; nextLabel?: string; backLabel?: string; skipLabel?: string }) {
  const { activeStep, mode, canGoBack, canGoNext, goBack, goNext, skipCurrent, isLastStep, isValidating } = useNevoWizard();
  if (mode !== "edit") return null;

  // Alt+ArrowLeft / Alt+ArrowRight are handled by NevoWizardShell (fires
  // from anywhere inside the wizard) -- see its doc comment.

  return (
    <div className="nevo-wizard__actions">
      <Button type="button" variant="secondary" onClick={goBack} disabled={!canGoBack}>
        {backLabel}
      </Button>
      <div className="nevo-wizard__actions-end">
        {activeStep?.optional && (
          <Button type="button" variant="secondary" onClick={skipCurrent}>
            {skipLabel}
          </Button>
        )}
        <Button type="button" variant="primary" onClick={() => void goNext()} disabled={!canGoNext}>
          {isValidating ? "Checking…" : isLastStep ? finishLabel : nextLabel}
        </Button>
      </div>
    </div>
  );
}

/** Review/readonly-mode summary: every available step, its captured
 * answer (via `summarize()` when provided, otherwise a generic
 * provided/not-provided line), and an Edit action that jumps back into
 * edit mode at that step -- suppressed entirely in "readonly" mode. */
export function NevoWizardSummary() {
  const { availableSteps, values, mode, goToStep, statuses } = useNevoWizard();
  if (mode === "edit") return null;
  return (
    <div className="nevo-wizard__summary">
      {availableSteps.map((step) => {
        const status = statuses[step.id];
        return (
          <Card key={step.id} className="nevo-wizard__summary-row">
            <div className="nevo-wizard__summary-row-head">
              <h2>{step.title}</h2>
              <StatusBadge status={status === "complete" ? "complete" : status === "skipped" ? "skipped" : "pending"} />
              {mode === "review" && (
                <Button type="button" variant="secondary" onClick={() => goToStep(step.id)}>
                  Edit
                </Button>
              )}
            </div>
            <div className="nevo-wizard__summary-row-body">
              {status === "skipped"
                ? <p className="nevo-wizard__muted">Skipped.</p>
                : step.summarize
                  ? step.summarize(values)
                  : step.render({ values, setValues: () => {}, errors: undefined, readOnly: true })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/** Step-level error banner. Reads the active step's message; also renders
 * field-error count so a long form's scattered inline errors have one
 * place a screen-reader user is told to look. Escape dismisses it. */
export function NevoWizardError() {
  const { stepMessage, activeStep, errors, dismissError } = useNevoWizard();
  const fieldErrorCount = activeStep ? Object.keys(errors[activeStep.id] ?? {}).length : 0;
  if (!stepMessage) return null;
  return (
    <div className="nevo-wizard__error" role="alert" onKeyDown={(event) => event.key === "Escape" && dismissError()}>
      <p>{stepMessage}{fieldErrorCount > 0 ? ` (${fieldErrorCount} field${fieldErrorCount === 1 ? "" : "s"})` : ""}</p>
      <IconButton label="Dismiss error" onClick={dismissError}>
        ×
      </IconButton>
    </div>
  );
}

const SAVE_LABEL: Record<string, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Save failed",
};

/** "Saving… / Saved / Save failed" pill, meant for NevoWizardHeader's
 * `action` slot. aria-live so a status change is announced without moving
 * focus. */
export function NevoWizardSaveIndicator() {
  const { saveStatus, saveError } = useNevoWizard();
  if (saveStatus === "idle") return null;
  return (
    <div className="nevo-wizard__save-indicator" aria-live="polite">
      {saveStatus === "saving" ? <LoadingState label={SAVE_LABEL.saving} /> : <StatusBadge status={saveStatus === "error" ? (saveError ?? SAVE_LABEL.error) : SAVE_LABEL.saved} />}
    </div>
  );
}

/** Fixed bottom bar shown only below the mobile breakpoint (see
 * wizard.css): condensed progress + Back/Skip/Next, so the full
 * NevoWizardStepper sidebar doesn't need to exist on small screens at all.
 *
 * Forward/back use compact icon-button labels ("Next"/"Finish"/"Back")
 * rather than NevoWizardActions' full-width text ("Continue"/"Finish"/
 * "Back") -- an intentional difference for a condensed bar, not a bug (a
 * consumer/test must not assume the two navs share identical accessible
 * names for those two). The Skip control reuses NevoWizardActions' exact
 * "Skip for now" label/behavior on purpose, though: it was previously
 * missing from this component entirely, which meant an optional step could
 * not be skipped at all below the mobile breakpoint -- undermining
 * @maataa/ui/wizard's own documented "optional steps" + "responsive
 * layout" contract. Fixed here rather than left as a naming difference. */
export function NevoWizardMobileNav() {
  const { mode, activeStep, canGoBack, canGoNext, goBack, goNext, skipCurrent, isLastStep, progress } = useNevoWizard();
  if (mode !== "edit") return null;
  return (
    <div className="nevo-wizard__mobile-nav">
      <div className="nevo-wizard__mobile-nav-progress">
        <div className="nevo-wizard__progress-track">
          <div className="nevo-wizard__progress-fill" style={{ width: `${progress.percent}%` }} />
        </div>
      </div>
      <div className="nevo-wizard__mobile-nav-actions">
        <IconButton label="Back" onClick={goBack} disabled={!canGoBack}>
          ‹
        </IconButton>
        {activeStep?.optional && (
          <IconButton label="Skip for now" onClick={skipCurrent}>
            ⤼
          </IconButton>
        )}
        <IconButton label={isLastStep ? "Finish" : "Next"} onClick={() => void goNext()} disabled={!canGoNext}>
          {isLastStep ? "✓" : "›"}
        </IconButton>
      </div>
    </div>
  );
}
