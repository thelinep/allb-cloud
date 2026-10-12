import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DateTimePicker } from "./DateTimePicker";

const meta = {
  title: "Forms/DateTimePicker",
  component: DateTimePicker,
  tags: ["autodocs"],
} satisfies Meta<typeof DateTimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return <DateTimePicker label="Starts at" value={value} onChange={setValue} />;
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(new Date(2026, 8, 9, 18, 30));
    return <DateTimePicker label="Starts at" value={value} onChange={setValue} />;
  },
};

export const Required: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return <DateTimePicker label="Load-in begins" value={value} onChange={setValue} required />;
  },
};

export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <DateTimePicker
        label="Starts at"
        value={value}
        onChange={setValue}
        error="Please choose a date and time"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <DateTimePicker
      label="Starts at"
      value={new Date(2026, 8, 9, 18, 30)}
      onChange={() => {}}
      disabled
    />
  ),
};
