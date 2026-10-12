import type { Meta, StoryObj } from "@storybook/react";
import { FormSection } from "./FormSection";
import { Input } from "../primitives/Input";

const meta = {
  title: "Forms/FormSection",
  component: FormSection,
  tags: ["autodocs"],
} satisfies Meta<typeof FormSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <FormSection
      title="Personal details"
      description="This is shown on your public profile."
      style={{ maxWidth: "480px" }}
    >
      <Input label="Name" />
      <Input label="Email" />
    </FormSection>
  ),
};

export const NoDivider: Story = {
  render: () => (
    <FormSection title="Preferences" divider={false} style={{ maxWidth: "480px" }}>
      <Input label="Timezone" />
    </FormSection>
  ),
};

export const TitleOnly: Story = {
  render: () => (
    <FormSection title="Security" style={{ maxWidth: "480px" }}>
      <Input label="Current password" type="password" />
      <Input label="New password" type="password" />
    </FormSection>
  ),
};
