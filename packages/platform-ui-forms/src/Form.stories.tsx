import type { Meta, StoryObj } from "@storybook/react";
import { Form } from "./Form";
import { FormRow } from "./FormRow";
import { FormSection } from "./FormSection";
import { FormActions } from "./FormActions";
import { Input } from "../primitives/Input";
import { Button } from "../primitives/Button";

const meta = {
  title: "Forms/Form",
  component: Form,
  tags: ["autodocs"],
} satisfies Meta<typeof Form>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  render: () => (
    <Form onSubmit={() => alert("Submitted!")} style={{ maxWidth: "400px" }}>
      <Input label="Email" type="email" placeholder="you@example.com" />
      <Input label="Password" type="password" />
      <FormActions>
        <Button variant="primary" type="submit">
          Sign in
        </Button>
      </FormActions>
    </Form>
  ),
};

export const FullExample: Story = {
  render: () => (
    <Form onSubmit={() => alert("Submitted!")} style={{ maxWidth: "560px" }}>
      <FormSection title="Personal details" description="This is shown on your public profile.">
        <FormRow>
          <Input label="First name" />
          <Input label="Last name" />
        </FormRow>
        <Input label="Email" type="email" />
      </FormSection>
      <FormSection title="Preferences" divider={false}>
        <Input label="Timezone" />
      </FormSection>
      <FormActions>
        <Button variant="secondary" type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          Save
        </Button>
      </FormActions>
    </Form>
  ),
};
