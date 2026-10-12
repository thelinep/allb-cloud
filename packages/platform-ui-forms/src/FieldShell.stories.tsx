import type { Meta, StoryObj } from "@storybook/react";
import { FieldShell } from "./FieldShell";

const meta = {
  title: "Forms/FieldShell",
  component: FieldShell,
  tags: ["autodocs"],
} satisfies Meta<typeof FieldShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const plainInput = (id: string) => (
  <input
    id={id}
    style={{
      padding: "10px",
      border: "2px solid #D4AF9F",
      borderRadius: "6px",
      boxSizing: "border-box",
    }}
  />
);

export const Default: Story = {
  args: {
    label: "Email",
    htmlFor: "field-shell-email",
    children: plainInput("field-shell-email"),
  },
};

export const Required: Story = {
  args: {
    label: "Email",
    htmlFor: "field-shell-required",
    required: true,
    children: plainInput("field-shell-required"),
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Password",
    htmlFor: "field-shell-helper",
    helperText: "Must be at least 8 characters",
    children: plainInput("field-shell-helper"),
  },
};

export const WithError: Story = {
  args: {
    label: "Password",
    htmlFor: "field-shell-error",
    error: "Password is required",
    children: plainInput("field-shell-error"),
  },
};
