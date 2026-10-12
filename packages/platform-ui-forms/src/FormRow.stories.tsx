import type { Meta, StoryObj } from "@storybook/react";
import { FormRow } from "./FormRow";
import { Input } from "../primitives/Input";

const meta = {
  title: "Forms/FormRow",
  component: FormRow,
  tags: ["autodocs"],
} satisfies Meta<typeof FormRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TwoFields: Story = {
  render: () => (
    <FormRow style={{ maxWidth: "480px" }}>
      <Input label="First name" />
      <Input label="Last name" />
    </FormRow>
  ),
};

export const ThreeFields: Story = {
  render: () => (
    <FormRow style={{ maxWidth: "600px" }}>
      <Input label="City" />
      <Input label="State" />
      <Input label="ZIP" />
    </FormRow>
  ),
};

export const NonWrapping: Story = {
  render: () => (
    <FormRow wrap={false} style={{ maxWidth: "300px" }}>
      <Input label="First name" />
      <Input label="Last name" />
    </FormRow>
  ),
};
