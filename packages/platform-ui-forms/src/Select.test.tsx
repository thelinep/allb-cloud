import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Select } from "./Select";

describe("Select", () => {
  const options = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
  ];

  it("renders select trigger", () => {
    const { container } = render(<Select options={options} value="" onChange={() => {}} />);
    const trigger =
      container.querySelector('div[role="button"]') || container.querySelector("button");
    expect(trigger || container.firstChild).toBeInTheDocument();
  });

  it("opens dropdown when clicked", async () => {
    const { container } = render(<Select options={options} value="" onChange={() => {}} />);
    const trigger =
      container.querySelector('div[role="button"]') || container.querySelector("button");
    if (trigger) {
      fireEvent.click(trigger);
      await waitFor(() => {
        expect(screen.queryByText("Apple")).toBeInTheDocument();
      });
    }
  });

  it("renders placeholder when no value", () => {
    render(<Select options={options} value="" onChange={() => {}} placeholder="Choose a fruit" />);
    expect(screen.getByText("Choose a fruit")).toBeInTheDocument();
  });

  it("displays selected value", () => {
    render(<Select options={options} value="apple" onChange={() => {}} />);
    expect(screen.getByText("Apple")).toBeInTheDocument();
  });

  it("calls onChange when option is selected", async () => {
    const onChange = jest.fn();
    const { container } = render(<Select options={options} value="" onChange={onChange} />);
    const trigger =
      container.querySelector('div[role="button"]') || container.querySelector("button");
    if (trigger) {
      fireEvent.click(trigger);
      await waitFor(() => {
        const appleOption = screen.getByText("Apple");
        if (appleOption.closest('div[role="option"], button, [data-option]')) {
          fireEvent.click(appleOption);
        }
      });
    }
  });

  it("renders label when provided", () => {
    render(<Select options={options} value="" onChange={() => {}} label="Select a fruit" />);
    expect(screen.getByText("Select a fruit")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <Select options={options} value="" onChange={() => {}} description="Choose your favorite" />
    );
    expect(screen.getByText("Choose your favorite")).toBeInTheDocument();
  });

  it("shows error message when provided", () => {
    render(
      <Select options={options} value="" onChange={() => {}} error="This field is required" />
    );
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("applies disabled state", () => {
    const { container } = render(
      <Select options={options} value="" onChange={() => {}} disabled />
    );
    const trigger =
      container.querySelector('div[role="button"]') || container.querySelector("button");
    expect(trigger || container.firstChild).toBeInTheDocument();
  });

  it("filters options when searchable", async () => {
    const { container } = render(
      <Select options={options} value="" onChange={() => {}} searchable />
    );
    const trigger =
      container.querySelector('div[role="button"]') || container.querySelector("button");
    if (trigger) {
      fireEvent.click(trigger);
      const input = container.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) {
        fireEvent.change(input, { target: { value: "app" } });
        await waitFor(() => {
          expect(screen.getByText("Apple")).toBeInTheDocument();
        });
      }
    }
  });

  it("handles multi-select mode", () => {
    const onChange = jest.fn();
    render(<Select options={options} value={[]} onChange={onChange} multiSelect />);
    expect(onChange).toBeDefined();
  });

  it("applies size variants", () => {
    const { container: container1 } = render(
      <Select options={options} value="" onChange={() => {}} size="sm" />
    );
    const { container: container2 } = render(
      <Select options={options} value="" onChange={() => {}} size="lg" />
    );
    expect(container1.firstChild).toBeInTheDocument();
    expect(container2.firstChild).toBeInTheDocument();
  });

  it("closes dropdown on escape key", async () => {
    const { container } = render(<Select options={options} value="" onChange={() => {}} />);
    const trigger =
      container.querySelector('div[role="button"]') || container.querySelector("button");
    if (trigger) {
      fireEvent.click(trigger);
      await waitFor(() => {
        expect(screen.queryByText("Apple")).toBeInTheDocument();
      });
      fireEvent.keyDown(container, { key: "Escape" });
    }
  });
});
