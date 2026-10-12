import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { FileInput } from "./FileInput";

const meta = {
  title: "Forms/FileInput",
  component: FileInput,
  tags: ["autodocs"],
} satisfies Meta<typeof FileInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [fileNames, setFileNames] = useState<string[]>([]);
    return (
      <FileInput
        label="Attachment"
        onChange={(files) => setFileNames(files ? Array.from(files).map((f) => f.name) : [])}
        fileNames={fileNames}
      />
    );
  },
};

export const Multiple: Story = {
  render: () => {
    const [fileNames, setFileNames] = useState<string[]>([]);
    return (
      <FileInput
        label="Supporting documents"
        buttonLabel="Upload files"
        multiple
        onChange={(files) => setFileNames(files ? Array.from(files).map((f) => f.name) : [])}
        fileNames={fileNames}
      />
    );
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Resume",
    helperText: "PDF up to 10MB",
  },
};

export const WithError: Story = {
  args: {
    label: "Resume",
    error: "A resume is required",
  },
};
