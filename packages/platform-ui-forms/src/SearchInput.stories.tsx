import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SearchInput } from "./SearchInput";

const meta = {
  title: "Forms/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
} satisfies Meta<typeof SearchInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return <SearchInput value={value} onChange={setValue} onClear={() => setValue("")} />;
  },
};

export const WithValue: Story = {
  render: () => {
    const [value, setValue] = useState("design tokens");
    return <SearchInput value={value} onChange={setValue} onClear={() => setValue("")} />;
  },
};

export const CustomPlaceholder: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <SearchInput
        value={value}
        onChange={setValue}
        onClear={() => setValue("")}
        placeholder="Search components..."
      />
    );
  },
};
