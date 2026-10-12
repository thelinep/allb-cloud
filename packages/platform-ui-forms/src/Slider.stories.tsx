import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Slider } from "./Slider";

const meta = {
  title: "Forms/Slider",
  component: Slider,
  tags: ["autodocs"],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState(50);
    return <Slider label="Volume" value={value} onChange={setValue} />;
  },
};

export const CustomRange: Story = {
  render: () => {
    const [value, setValue] = useState(5);
    return <Slider label="Rating" value={value} onChange={setValue} min={0} max={10} step={1} />;
  },
};

export const FractionalStep: Story = {
  render: () => {
    const [value, setValue] = useState(1.5);
    return (
      <Slider
        label="Playback speed"
        value={value}
        onChange={setValue}
        min={0.5}
        max={2}
        step={0.25}
      />
    );
  },
};

export const WithoutValueReadout: Story = {
  render: () => {
    const [value, setValue] = useState(30);
    return <Slider label="Brightness" value={value} onChange={setValue} showValue={false} />;
  },
};
