import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Select } from "./Select";

const meta = {
  title: "Forms/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicOptions = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return <Select options={basicOptions} value={value} onChange={setValue} />;
  },
};

export const WithLabel: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <Select
        options={basicOptions}
        value={value}
        onChange={setValue}
        label="Choose a fruit"
        placeholder="Select a fruit"
      />
    );
  },
};

export const WithDescription: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <Select
        options={basicOptions}
        value={value}
        onChange={setValue}
        label="Favorite Fruit"
        description="Pick your favorite fruit from the list"
        placeholder="Select one"
      />
    );
  },
};

export const Searchable: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <Select
        options={basicOptions}
        value={value}
        onChange={setValue}
        label="Search Fruits"
        searchable
        placeholder="Type to search..."
      />
    );
  },
};

export const MultiSelect: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <Select
        options={basicOptions}
        value={value}
        onChange={setValue}
        label="Select Fruits"
        placeholder="Choose one or more"
        multiSelect
        searchable
      />
    );
  },
};

export const WithError: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <Select
        options={basicOptions}
        value={value}
        onChange={setValue}
        label="Choose a fruit"
        error="This field is required"
        placeholder="Select a fruit"
      />
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <Select
      options={basicOptions}
      value=""
      label="Choose a fruit"
      disabled
      placeholder="Disabled"
    />
  ),
};

export const Small: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <Select
        options={basicOptions}
        value={value}
        onChange={setValue}
        size="sm"
        placeholder="Small select"
      />
    );
  },
};

export const Large: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <Select
        options={basicOptions}
        value={value}
        onChange={setValue}
        size="lg"
        placeholder="Large select"
      />
    );
  },
};
