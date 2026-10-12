import type { Meta, StoryObj } from "@storybook/react";
import { FormActions } from "./FormActions";
import { Button } from "../primitives/Button";

const meta = {
  title: "Forms/FormActions",
  component: FormActions,
  tags: ["autodocs"],
  argTypes: {
    align: {
      control: "select",
      options: ["start", "center", "end", "space-between"],
    },
  },
} satisfies Meta<typeof FormActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RightAligned: Story = {
  render: (args) => (
    <FormActions {...args} style={{ width: "400px" }}>
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Save</Button>
    </FormActions>
  ),
};

export const SpaceBetween: Story = {
  render: (args) => (
    <FormActions {...args} align="space-between" style={{ width: "400px" }}>
      <Button variant="tertiary">Delete</Button>
      <Button variant="primary">Save</Button>
    </FormActions>
  ),
};

export const SingleAction: Story = {
  render: (args) => (
    <FormActions {...args} style={{ width: "400px" }}>
      <Button variant="primary">Continue</Button>
    </FormActions>
  ),
};
