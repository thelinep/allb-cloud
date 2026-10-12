// Convenience composition of the eleven presentational pieces in their
// standard arrangement, for a domain wizard that doesn't need a custom
// layout. Using it is optional -- any consumer can import the named parts
// individually and arrange them (or re-skin them) itself; that is the
// whole point of exposing them separately rather than one opaque
// component.
import { NevoWizardActions } from "./NevoWizardParts.js";
import { NevoWizardBody } from "./NevoWizardParts.js";
import { NevoWizardHeader } from "./NevoWizardParts.js";
import { NevoWizardMobileNav } from "./NevoWizardParts.js";
import { NevoWizardProgress } from "./NevoWizardParts.js";
import { NevoWizardSaveIndicator } from "./NevoWizardParts.js";
import { NevoWizardShell } from "./NevoWizardParts.js";
import { NevoWizardStep } from "./NevoWizardParts.js";
import { NevoWizardStepper } from "./NevoWizardParts.js";
import { NevoWizardSummary } from "./NevoWizardParts.js";

export function NevoWizardDefaultLayout() {
  return (
    <NevoWizardShell>
      <NevoWizardStepper />
      <NevoWizardHeader action={<NevoWizardSaveIndicator />} />
      <NevoWizardProgress />
      <NevoWizardBody>
        <NevoWizardStep />
        <NevoWizardSummary />
      </NevoWizardBody>
      <NevoWizardActions />
      <NevoWizardMobileNav />
    </NevoWizardShell>
  );
}
