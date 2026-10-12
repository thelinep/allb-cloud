import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Radio, RadioGroup } from "./Radio";

const meta = {
  title: "Forms/Radio",
  component: Radio,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Radio checked={checked} onChange={setChecked} value="option" />;
  },
};

export const WithLabel: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Radio checked={checked} onChange={setChecked} value="option" label="Option 1" />;
  },
};

export const WithDescription: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Radio
        checked={checked}
        onChange={setChecked}
        value="option"
        label="Enable notifications"
        description="Receive alerts about important updates"
      />
    );
  },
};

export const Checked: Story = {
  render: () => <Radio checked={true} onChange={() => {}} value="option" label="Selected option" />,
};

export const Disabled: Story = {
  render: () => (
    <Radio checked={false} onChange={() => {}} value="option" label="Disabled option" disabled />
  ),
};

export const Small: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Radio checked={checked} onChange={setChecked} value="option" size="sm" label="Small radio" />
    );
  },
};

export const Large: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <Radio checked={checked} onChange={setChecked} value="option" size="lg" label="Large radio" />
    );
  },
};

export const RadioGroupDefault: Story = {
  render: () => {
    const [selected, setSelected] = useState("option1");
    return (
      <RadioGroup
        name="example"
        options={[
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
          { value: "option3", label: "Option 3" },
        ]}
        value={selected}
        onChange={setSelected}
        label="Select an option"
      />
    );
  },
};

export const RadioGroupHorizontal: Story = {
  render: () => {
    const [selected, setSelected] = useState("option1");
    return (
      <RadioGroup
        name="horizontal"
        options={[
          { value: "option1", label: "Option 1" },
          { value: "option2", label: "Option 2" },
          { value: "option3", label: "Option 3" },
        ]}
        value={selected}
        onChange={setSelected}
        direction="horizontal"
        label="Horizontal selection"
      />
    );
  },
};

export const RadioGroupDisabled: Story = {
  render: () => (
    <RadioGroup
      name="disabled"
      options={[
        { value: "option1", label: "Option 1" },
        { value: "option2", label: "Option 2" },
      ]}
      value="option1"
      onChange={() => {}}
      disabled
      label="Disabled group"
    />
  ),
};

export const RadioGroupWithDescription: Story = {
  render: () => {
    const [selected, setSelected] = useState("email");
    return (
      <RadioGroup
        name="contact"
        options={[
          { value: "email", label: "Email" },
          { value: "sms", label: "SMS" },
          { value: "phone", label: "Phone" },
        ]}
        value={selected}
        onChange={setSelected}
        label="Preferred contact method"
        description="Choose how you'd like to be contacted"
      />
    );
  },
};
