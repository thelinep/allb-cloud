import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TimePicker } from "./TimePicker";

describe("TimePicker", () => {
  it("renders a time input with the given value", () => {
    const { container } = render(<TimePicker value="09:30" onChange={() => {}} />);
    const input = container.querySelector('input[type="time"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.value).toBe("09:30");
  });

  it("renders a label", () => {
    render(<TimePicker value="" onChange={() => {}} label="Start time" />);
    expect(screen.getByText("Start time")).toBeInTheDocument();
  });

  it("calls onChange with the new time value", () => {
    const onChange = vi.fn();
    const { container } = render(<TimePicker value="09:00" onChange={onChange} />);
    const input = container.querySelector('input[type="time"]') as HTMLInputElement;
    fireEvent.change(input, { target: { value: "14:45" } });
    expect(onChange).toHaveBeenCalledWith("14:45");
  });

  it("shows an error message", () => {
    render(<TimePicker value="" onChange={() => {}} error="Time is required" />);
    expect(screen.getByText("Time is required")).toBeInTheDocument();
  });

  it("shows helper text when there is no error", () => {
    render(<TimePicker value="" onChange={() => {}} helperText="24-hour format" />);
    expect(screen.getByText("24-hour format")).toBeInTheDocument();
  });

  it("supports the disabled attribute", () => {
    const { container } = render(<TimePicker value="" onChange={() => {}} disabled />);
    const input = container.querySelector('input[type="time"]') as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it("forwards a ref to the input", () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<TimePicker ref={ref} value="" onChange={() => {}} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("sets displayName", () => {
    expect(TimePicker.displayName).toBe("TimePicker");
  });
});
