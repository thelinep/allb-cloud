import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Toggle } from "./Toggle";

const meta = {
  title: "Forms/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Toggle checked={checked} onChange={setChecked} />;
  },
};

export const WithLabel: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Toggle checked={checked} onChange={setChecked} label="Enable feature" />;
  },
};

export const WithDescription: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Toggle
        checked={checked}
        onChange={setChecked}
        label="Dark mode"
        description="Enable dark theme for better visibility at night"
      />
    );
  },
};

export const Checked: Story = {
  render: () => <Toggle checked={true} onChange={() => {}} label="Feature enabled" />,
};

export const Disabled: Story = {
  render: () => <Toggle checked={false} onChange={() => {}} label="Disabled toggle" disabled />,
};

export const Small: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Toggle checked={checked} onChange={setChecked} size="sm" label="Small toggle" />;
  },
};

export const Large: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Toggle checked={checked} onChange={setChecked} size="lg" label="Large toggle" />;
  },
};

export const ColorPrimary: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Toggle checked={checked} onChange={setChecked} color="primary" label="Primary color" />;
  },
};

export const ColorSuccess: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Toggle checked={checked} onChange={setChecked} color="success" label="Success color" />;
  },
};

export const ColorWarning: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Toggle checked={checked} onChange={setChecked} color="warning" label="Warning color" />;
  },
};

export const ColorError: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Toggle checked={checked} onChange={setChecked} color="error" label="Error color" />;
  },
};
