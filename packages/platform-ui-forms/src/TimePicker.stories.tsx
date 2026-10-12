import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TimePicker } from "./TimePicker";

const meta = {
  title: "Forms/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
} satisfies Meta<typeof TimePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("09:00");
    return <TimePicker label="Start time" value={value} onChange={setValue} />;
  },
};

export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <TimePicker label="Start time" value={value} onChange={setValue} error="Time is required" />
    );
  },
};

export const WithHelperText: Story = {
  render: () => {
    const [value, setValue] = useState("14:30");
    return (
      <TimePicker
        label="Doors open"
        value={value}
        onChange={setValue}
        helperText="Venue local time"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => <TimePicker label="Start time" value="09:00" onChange={() => {}} disabled />,
};
