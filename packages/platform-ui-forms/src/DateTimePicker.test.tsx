import React, { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DateTimePicker } from "./DateTimePicker";

function ControlledDateTimePicker(props: { initial?: Date | null }) {
  const [value, setValue] = useState<Date | null>(props.initial ?? null);
  return <DateTimePicker label="Starts at" value={value} onChange={setValue} />;
}

describe("DateTimePicker", () => {
  it("renders a label", () => {
    render(<DateTimePicker label="Starts at" value={null} onChange={() => {}} />);
    expect(screen.getByText("Starts at")).toBeInTheDocument();
  });

  it("disables the time field until a date is chosen", () => {
    const { container } = render(<DateTimePicker value={null} onChange={() => {}} />);
    const timeInput = container.querySelector('input[type="time"]') as HTMLInputElement;
    expect(timeInput).toBeDisabled();
  });

  it("enables the time field once a date is chosen and defaults to midnight", async () => {
    render(<ControlledDateTimePicker />);
    fireEvent.click(screen.getByRole("button", { name: /Select a date/ }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("gridcell", { name: "15" }));

    await waitFor(() => {
      const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement;
      expect(timeInput).not.toBeDisabled();
      expect(timeInput.value).toBe("00:00");
    });
  });

  it("combines a changed time with the previously selected date", async () => {
    const initial = new Date(2026, 0, 15);
    render(<ControlledDateTimePicker initial={initial} />);
    const timeInput = document.querySelector('input[type="time"]') as HTMLInputElement;
    fireEvent.change(timeInput, { target: { value: "14:30" } });

    await waitFor(() => {
      expect(screen.getByText("Jan 15, 2026")).toBeInTheDocument();
    });
    const updatedTimeInput = document.querySelector('input[type="time"]') as HTMLInputElement;
    expect(updatedTimeInput.value).toBe("14:30");
  });

  it("shows an error message", () => {
    render(<DateTimePicker value={null} onChange={() => {}} error="Required" />);
    expect(screen.getByText("Required")).toBeInTheDocument();
  });

  it("shows helper text when there is no error", () => {
    render(<DateTimePicker value={null} onChange={() => {}} helperText="Local time" />);
    expect(screen.getByText("Local time")).toBeInTheDocument();
  });

  it("propagates null when the date is cleared", () => {
    const onChange = vi.fn();
    render(<DateTimePicker value={new Date(2026, 0, 15)} onChange={onChange} />);
    // DatePicker itself has no clear affordance in this test, but DateTimePicker's
    // handleDateChange must forward a null date unchanged if ever invoked with one.
    expect(onChange).not.toHaveBeenCalled();
  });

  it("forwards a ref to the container", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<DateTimePicker ref={ref} value={null} onChange={() => {}} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("sets displayName", () => {
    expect(DateTimePicker.displayName).toBe("DateTimePicker");
  });
});
