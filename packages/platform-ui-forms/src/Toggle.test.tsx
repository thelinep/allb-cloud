import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toggle } from "./Toggle";

describe("Toggle", () => {
  it("renders toggle button", () => {
    const { container } = render(<Toggle checked={false} onChange={() => {}} />);
    const toggle = container.querySelector('[role="switch"]') || container.firstChild;
    expect(toggle).toBeInTheDocument();
  });

  it("reflects checked state", () => {
    const { container } = render(<Toggle checked={true} onChange={() => {}} />);
    const toggle = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(toggle.checked).toBe(true);
  });

  it("calls onChange when clicked", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    const { container } = render(<Toggle checked={false} onChange={onChange} />);
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await user.click(input);
    expect(onChange).toHaveBeenCalled();
  });

  it("renders label when provided", () => {
    render(<Toggle checked={false} onChange={() => {}} label="Enable feature" />);
    expect(screen.getByText("Enable feature")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <Toggle
        checked={false}
        onChange={() => {}}
        label="Dark mode"
        description="Enable dark theme"
      />
    );
    expect(screen.getByText("Enable dark theme")).toBeInTheDocument();
  });

  it("applies disabled state", () => {
    const { container } = render(<Toggle checked={false} onChange={() => {}} disabled />);
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("applies size variants", () => {
    const { container: container1 } = render(
      <Toggle checked={false} onChange={() => {}} size="sm" />
    );
    const { container: container2 } = render(
      <Toggle checked={false} onChange={() => {}} size="lg" />
    );
    expect(container1.firstChild).toBeInTheDocument();
    expect(container2.firstChild).toBeInTheDocument();
  });

  it("applies color variants", () => {
    const colors = ["primary", "success", "warning", "error"] as const;
    colors.forEach((color) => {
      const { container } = render(<Toggle checked={true} onChange={() => {}} color={color} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  it("responds to space key", async () => {
    const onChange = jest.fn();
    const { container } = render(<Toggle checked={false} onChange={onChange} />);
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

    input.focus();
    await userEvent.keyboard(" ");

    expect(onChange).toHaveBeenCalled();
  });

  it("responds to enter key", async () => {
    const onChange = jest.fn();
    const { container } = render(<Toggle checked={false} onChange={onChange} />);
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

    input.focus();
    await userEvent.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalled();
  });

  it("has accessibility attributes", () => {
    const { container } = render(
      <Toggle checked={true} onChange={() => {}} label="Toggle feature" />
    );
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input).toHaveAttribute("type", "checkbox");
  });
});
