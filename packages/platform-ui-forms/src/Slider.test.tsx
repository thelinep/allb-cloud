import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import { Slider } from "./Slider";

describe("Slider", () => {
  it("renders a range input", () => {
    render(<Slider value={50} onChange={() => {}} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
  });

  it("renders the label", () => {
    render(<Slider label="Volume" value={50} onChange={() => {}} />);
    expect(screen.getByText("Volume")).toBeInTheDocument();
  });

  it("shows the current value by default", () => {
    render(<Slider label="Volume" value={42} onChange={() => {}} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("hides the value when showValue is false", () => {
    render(<Slider label="Volume" value={42} onChange={() => {}} showValue={false} />);
    expect(screen.queryByText("42")).not.toBeInTheDocument();
  });

  it("uses default min/max/step of 0/100/1", () => {
    render(<Slider value={50} onChange={() => {}} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "100");
    expect(slider).toHaveAttribute("step", "1");
  });

  it("accepts custom min/max/step", () => {
    render(<Slider value={5} onChange={() => {}} min={0} max={10} step={0.5} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "10");
    expect(slider).toHaveAttribute("step", "0.5");
  });

  it("calls onChange with a numeric value", () => {
    const onChange = vi.fn();
    render(<Slider value={50} onChange={onChange} />);
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "75" } });
    expect(onChange).toHaveBeenCalledWith(75);
  });

  it("associates the label with the slider", () => {
    render(<Slider label="Volume" value={50} onChange={() => {}} />);
    expect(screen.getByLabelText("Volume")).toBeInTheDocument();
  });

  it("forwards ref to the underlying input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Slider value={50} onChange={() => {}} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("sets displayName", () => {
    expect(Slider.displayName).toBe("Slider");
  });
});
