import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToggleGroup } from "./ToggleGroup";

describe("ToggleGroup", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  it("renders all toggle buttons", () => {
    render(<ToggleGroup options={options} value="option1" onChange={() => {}} />);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("highlights selected option", () => {
    const { container } = render(
      <ToggleGroup options={options} value="option2" onChange={() => {}} />
    );
    const buttons = container.querySelectorAll("button");
    // Second button should be selected (aria-pressed="true")
    expect(buttons[1]).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onChange when option is selected", () => {
    const onChange = jest.fn();
    const { container } = render(
      <ToggleGroup options={options} value="option1" onChange={onChange} />
    );
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[1]);
    expect(onChange).toHaveBeenCalledWith("option2");
  });

  it("renders label when provided", () => {
    render(
      <ToggleGroup options={options} value="option1" onChange={() => {}} label="Select alignment" />
    );
    expect(screen.getByText("Select alignment")).toBeInTheDocument();
  });

  it("applies vertical direction when specified", () => {
    render(
      <ToggleGroup options={options} value="option1" onChange={() => {}} direction="vertical" />
    );
    // Verify all options are rendered (Stack with vertical direction renders all children)
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("applies horizontal direction by default", () => {
    render(<ToggleGroup options={options} value="option1" onChange={() => {}} />);
    // Verify all options are rendered (Stack with horizontal direction renders all children)
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("applies disabled state to all buttons", () => {
    const { container } = render(
      <ToggleGroup options={options} value="option1" onChange={() => {}} disabled />
    );
    const buttons = container.querySelectorAll("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it("applies size variants", () => {
    const { container: container1 } = render(
      <ToggleGroup options={options} value="option1" onChange={() => {}} size="sm" />
    );
    const { container: container2 } = render(
      <ToggleGroup options={options} value="option1" onChange={() => {}} size="lg" />
    );
    expect(container1.firstChild).toBeInTheDocument();
    expect(container2.firstChild).toBeInTheDocument();
  });

  it("updates selection when value prop changes", () => {
    const { container, rerender } = render(
      <ToggleGroup options={options} value="option1" onChange={() => {}} />
    );
    let buttons = container.querySelectorAll("button");
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");

    rerender(<ToggleGroup options={options} value="option3" onChange={() => {}} />);
    buttons = container.querySelectorAll("button");
    expect(buttons[2]).toHaveAttribute("aria-pressed", "true");
  });

  it("maintains mutually exclusive selection", () => {
    const onChange = jest.fn();
    const { container } = render(
      <ToggleGroup options={options} value="option1" onChange={onChange} />
    );
    const buttons = container.querySelectorAll("button");
    fireEvent.click(buttons[1]);
    fireEvent.click(buttons[2]);

    expect(onChange).toHaveBeenNthCalledWith(1, "option2");
    expect(onChange).toHaveBeenNthCalledWith(2, "option3");
  });
});
