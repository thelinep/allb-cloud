import React, { useState } from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DateRangePicker, type DateRange } from "./DateRangePicker";
import { formatDisplayDate } from "./dateUtils";

function ControlledDateRangePicker() {
  const [value, setValue] = useState<DateRange>({ start: null, end: null });
  return <DateRangePicker label="Booking dates" value={value} onChange={setValue} />;
}

/**
 * A day-of-month number can appear twice in a rendered grid: once in the
 * displayed month, once as adjacent-month padding. Picks the in-month cell.
 */
function getInMonthGridCell(name: string): HTMLElement {
  const matches = screen.getAllByRole("gridcell", { name });
  const inMonthCell = matches.find((el) => el.getAttribute("data-in-month") === "true");
  if (!inMonthCell) throw new Error(`No in-month gridcell found for "${name}"`);
  return inMonthCell;
}

describe("DateRangePicker", () => {
  const emptyRange: DateRange = { start: null, end: null };

  it("renders the placeholder when no range is selected", () => {
    render(<DateRangePicker value={emptyRange} onChange={() => {}} placeholder="Pick a range" />);
    expect(screen.getByText("Pick a range")).toBeInTheDocument();
  });

  it("renders a formatted single start date before an end date is chosen", () => {
    render(
      <DateRangePicker value={{ start: new Date(2026, 0, 5), end: null }} onChange={() => {}} />
    );
    expect(screen.getByText("Jan 5, 2026")).toBeInTheDocument();
  });

  it("renders a formatted start–end range", () => {
    render(
      <DateRangePicker
        value={{ start: new Date(2026, 0, 5), end: new Date(2026, 0, 10) }}
        onChange={() => {}}
      />
    );
    expect(screen.getByText("Jan 5, 2026 – Jan 10, 2026")).toBeInTheDocument();
  });

  it("renders a label", () => {
    render(<DateRangePicker value={emptyRange} onChange={() => {}} label="Booking dates" />);
    expect(screen.getByText("Booking dates")).toBeInTheDocument();
  });

  it("opens the calendar popup when the trigger is clicked", async () => {
    render(<DateRangePicker value={emptyRange} onChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Select a date range/ }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
  });

  it("picks a start then an end date across two clicks, normalizing order", async () => {
    render(<ControlledDateRangePicker />);
    fireEvent.click(screen.getByRole("button", { name: /Select a date range/ }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

    // The calendar opens on the current month by default (no initial value).
    // Click the later day first, then the earlier day — order should normalize.
    const now = new Date();
    const day10 = new Date(now.getFullYear(), now.getMonth(), 10);
    const day20 = new Date(now.getFullYear(), now.getMonth(), 20);

    fireEvent.click(getInMonthGridCell("20"));
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    fireEvent.click(getInMonthGridCell("10"));

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(
      screen.getByText(`${formatDisplayDate(day10)} – ${formatDisplayDate(day20)}`)
    ).toBeInTheDocument();
  });

  it("shows an error message", () => {
    render(<DateRangePicker value={emptyRange} onChange={() => {}} error="Range is required" />);
    expect(screen.getByText("Range is required")).toBeInTheDocument();
  });

  it("shows helper text when there is no error", () => {
    render(<DateRangePicker value={emptyRange} onChange={() => {}} helperText="Max 14 nights" />);
    expect(screen.getByText("Max 14 nights")).toBeInTheDocument();
  });

  it("does not open when disabled", () => {
    render(<DateRangePicker value={emptyRange} onChange={() => {}} disabled />);
    fireEvent.click(screen.getByRole("button", { name: /Select a date range/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("forwards a ref to the trigger button", () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<DateRangePicker ref={ref} value={emptyRange} onChange={() => {}} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("closes the popup on Escape", async () => {
    render(<DateRangePicker value={emptyRange} onChange={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Select a date range/ }));
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("sets displayName", () => {
    expect(DateRangePicker.displayName).toBe("DateRangePicker");
  });
});
