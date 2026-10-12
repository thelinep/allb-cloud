import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Forms/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Checkbox checked={checked} onChange={setChecked} />;
  },
};

export const WithLabel: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Checkbox checked={checked} onChange={setChecked} label="Accept terms and conditions" />;
  },
};

export const WithDescription: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        checked={checked}
        onChange={setChecked}
        label="Subscribe to newsletter"
        description="Receive weekly updates about our latest features"
      />
    );
  },
};

export const Indeterminate: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        checked={checked}
        onChange={setChecked}
        indeterminate={!checked}
        label="Parent checkbox (indeterminate)"
      />
    );
  },
};

export const WithError: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Checkbox
        checked={checked}
        onChange={setChecked}
        label="Confirm action"
        error="You must confirm this action"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => <Checkbox checked={true} onChange={() => {}} label="Disabled checked" disabled />,
};

export const Small: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Checkbox checked={checked} onChange={setChecked} size="sm" label="Small checkbox" />;
  },
};

export const Large: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Checkbox checked={checked} onChange={setChecked} size="lg" label="Large checkbox" />;
  },
};

export const AllSizes: Story = {
  render: () => {
    const [smChecked, setSmChecked] = useState(false);
    const [mdChecked, setMdChecked] = useState(false);
    const [lgChecked, setLgChecked] = useState(false);

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Checkbox checked={smChecked} onChange={setSmChecked} size="sm" label="Small" />
        <Checkbox checked={mdChecked} onChange={setMdChecked} size="md" label="Medium" />
        <Checkbox checked={lgChecked} onChange={setLgChecked} size="lg" label="Large" />
      </div>
    );
  },
};
