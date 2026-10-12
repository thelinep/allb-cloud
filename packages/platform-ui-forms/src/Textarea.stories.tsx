import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./Textarea";

const meta = {
  title: "Forms/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    resize: {
      control: "select",
      options: ["none", "vertical", "horizontal", "both"],
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Bio",
    placeholder: "Tell us about yourself",
    rows: 4,
  },
};

export const Required: Story = {
  args: {
    label: "Feedback",
    required: true,
    placeholder: "What did you think?",
    rows: 4,
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Bio",
    helperText: "Max 200 characters",
    rows: 4,
  },
};

export const WithError: Story = {
  args: {
    label: "Notes",
    error: "Notes are required",
    rows: 4,
  },
};

export const NonResizable: Story = {
  args: {
    label: "Fixed size",
    resize: "none",
    rows: 4,
  },
};
