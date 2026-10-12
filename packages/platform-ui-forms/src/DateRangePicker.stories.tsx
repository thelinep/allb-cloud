import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { DateRangePicker, type DateRange } from "./DateRangePicker";

const meta = {
  title: "Forms/DateRangePicker",
  component: DateRangePicker,
  tags: ["autodocs"],
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange>({ start: null, end: null });
    return <DateRangePicker label="Booking dates" value={value} onChange={setValue} />;
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange>({
      start: new Date(2026, 8, 9),
      end: new Date(2026, 8, 14),
    });
    return <DateRangePicker label="Booking dates" value={value} onChange={setValue} />;
  },
};

export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange>({ start: null, end: null });
    return (
      <DateRangePicker
        label="Booking dates"
        value={value}
        onChange={setValue}
        error="Please choose a date range"
      />
    );
  },
};

export const WithMinMax: Story = {
  render: () => {
    const [value, setValue] = useState<DateRange>({ start: null, end: null });
    return (
      <DateRangePicker
        label="Exhibition run"
        value={value}
        onChange={setValue}
        min={new Date(2026, 8, 1)}
        max={new Date(2026, 8, 30)}
        helperText="Only September 2026 is available"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <DateRangePicker
      label="Booking dates"
      value={{ start: new Date(2026, 8, 9), end: new Date(2026, 8, 14) }}
      onChange={() => {}}
      disabled
    />
  ),
};
