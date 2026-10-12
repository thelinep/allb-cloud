import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ToggleGroup } from "./ToggleGroup";

const meta = {
  title: "Forms/ToggleGroup",
  component: ToggleGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState("option1");
    return (
      <ToggleGroup
        options={[
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
          { value: "option3", label: "Option 3" },
        ]}
        value={selected}
        onChange={setSelected}
      />
    );
  },
};

export const WithLabel: Story = {
  render: () => {
    const [selected, setSelected] = useState("left");
    return (
      <ToggleGroup
        options={[
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
          { value: "right", label: "Right" },
        ]}
        value={selected}
        onChange={setSelected}
        label="Text alignment"
      />
    );
  },
};

export const Vertical: Story = {
  render: () => {
    const [selected, setSelected] = useState("small");
    return (
      <ToggleGroup
        options={[
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
        ]}
        value={selected}
        onChange={setSelected}
        direction="vertical"
        label="Size selection"
      />
    );
  },
};

export const Small: Story = {
  render: () => {
    const [selected, setSelected] = useState("yes");
    return (
      <ToggleGroup
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]}
        value={selected}
        onChange={setSelected}
        size="sm"
        label="Small buttons"
      />
    );
  },
};

export const Large: Story = {
  render: () => {
    const [selected, setSelected] = useState("week");
    return (
      <ToggleGroup
        options={[
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "month", label: "Month" },
        ]}
        value={selected}
        onChange={setSelected}
        size="lg"
        label="Large buttons"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <ToggleGroup
      options={[
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
        { value: "option3", label: "Option 3" },
      ]}
      value="option1"
      onChange={() => {}}
      disabled
      label="Disabled group"
    />
  ),
};

export const ManyOptions: Story = {
  render: () => {
    const [selected, setSelected] = useState("q1");
    return (
      <ToggleGroup
        options={[
          { value: "q1", label: "Q1" },
          { value: "q2", label: "Q2" },
          { value: "q3", label: "Q3" },
          { value: "q4", label: "Q4" },
          { value: "q5", label: "Q5" },
          { value: "q6", label: "Q6" },
        ]}
        value={selected}
        onChange={setSelected}
        label="Quarter selection"
      />
    );
  },
};
