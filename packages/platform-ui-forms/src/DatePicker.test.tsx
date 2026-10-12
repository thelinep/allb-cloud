import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DatePicker } from "./DatePicker";

describe("DatePicker", () => {
  const jan15 = new Date(2026, 0, 15);

  it("renders the placeholder when no value is selected", () => {
    render(<DatePicker value={null} onChange={() => {}} placeholder="Pick a date" />);
    expect(screen.getByText("Pick a date")).toBeInTheDocument();
  });

  it("renders the formatted date when a value is selected", () => {
    render(<DatePicker value={jan15} onChange={() => {}} />);
    expect(screen.getByText("Jan 15, 2026")).toBeInTheDocument();
  });

  it("renders a label", () => {
    render(<DatePicker value={null} onChange={() => {}} label="Event date" />);
    expect(screen.getByText("Event date")).toBeInTheDocument();
  });

  it("shows a required indicator", () => {
    render(<DatePicker value={null} onChange={() => {}} label="Event date" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("shows an error message", () => {
    render(<DatePicker value={null} onChange={() => {}} error="Date is required" />);
    expect(screen.getByText("Date is required")).toBeInTheDocument();
  });

  it("shows helper text when there is no error", () => {
    render(<DatePicker value={null} onChange={() => {}} helperText="Format: month/day/year" />);
    expect(screen.getByText("Format: month/day/year")).toBeInTheDocument();
  });

  it("opens the calendar popup when the trigger is clicked", async () => {
    render(<DatePicker value={jan15} onChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Jan 15, 2026/ }));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByText("January 2026")).toBeInTheDocument();
  });

  it("calls onChange and closes the popup when a day is selected", async () => {
    const onChange = vi.fn();
    render(<DatePicker value={jan15} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /Jan 15, 2026/ }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("gridcell", { name: "20" }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const calledWith = onChange.mock.calls[0][0] as Date;
    expect(calledWith.getDate()).toBe(20);
    expect(calledWith.getMonth()).toBe(0);
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("navigates to the next month", async () => {
    render(<DatePicker value={jan15} onChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Jan 15, 2026/ }));
    await waitFor(() => expect(screen.getByText("January 2026")).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText("February 2026")).toBeInTheDocument();
  });

  it("disables days outside the min/max range", async () => {
    render(
      <DatePicker
        value={jan15}
        onChange={() => {}}
        min={new Date(2026, 0, 10)}
        max={new Date(2026, 0, 20)}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /Jan 15, 2026/ }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    expect(screen.getByRole("gridcell", { name: "25" })).toBeDisabled();
    expect(screen.getByRole("gridcell", { name: "15" })).not.toBeDisabled();
  });

  it("closes the popup on Escape", async () => {
    render(<DatePicker value={jan15} onChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Jan 15, 2026/ }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("does not open when disabled", () => {
    render(<DatePicker value={jan15} onChange={() => {}} disabled />);
    fireEvent.click(screen.getByRole("button", { name: /Jan 15, 2026/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("forwards a ref to the trigger button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<DatePicker ref={ref} value={null} onChange={() => {}} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("sets displayName", () => {
    expect(DatePicker.displayName).toBe("DatePicker");
  });
});
