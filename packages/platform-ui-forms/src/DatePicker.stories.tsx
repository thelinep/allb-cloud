import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DatePicker } from "./DatePicker";

const meta = {
  title: "Forms/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return <DatePicker label="Event date" value={value} onChange={setValue} />;
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(new Date(2026, 8, 9));
    return <DatePicker label="Event date" value={value} onChange={setValue} />;
  },
};

export const Required: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return <DatePicker label="Move-in date" value={value} onChange={setValue} required />;
  },
};

export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <DatePicker
        label="Event date"
        value={value}
        onChange={setValue}
        error="Please choose a date"
      />
    );
  },
};

export const WithMinMax: Story = {
  render: () => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <DatePicker
        label="Booking window"
        value={value}
        onChange={setValue}
        min={new Date(2026, 8, 1)}
        max={new Date(2026, 8, 30)}
        helperText="Only September 2026 is bookable"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <DatePicker label="Event date" value={new Date(2026, 8, 9)} onChange={() => {}} disabled />
  ),
};
