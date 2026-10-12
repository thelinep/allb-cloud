import type { Meta, StoryObj } from "@storybook/react";
import { ValidationMessage } from "./ValidationMessage";

const meta = {
  title: "Forms/ValidationMessage",
  component: ValidationMessage,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["error", "warning", "success", "info"],
    },
  },
} satisfies Meta<typeof ValidationMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {
  args: {
    type: "error",
    children: "Please fix the errors below.",
  },
};

export const Warning: Story = {
  args: {
    type: "warning",
    children: "This action cannot be undone.",
  },
};

export const Success: Story = {
  args: {
    type: "success",
    children: "Changes saved successfully.",
  },
};

export const Info: Story = {
  args: {
    type: "info",
    children: "You can change this later in settings.",
  },
};
