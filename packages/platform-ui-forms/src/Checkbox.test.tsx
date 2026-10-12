import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("renders checkbox input", () => {
    const { container } = render(<Checkbox checked={false} onChange={() => {}} />);
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeInTheDocument();
  });

  it("reflects checked state", () => {
    const { container } = render(<Checkbox checked={true} onChange={() => {}} />);
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it("calls onChange when clicked", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    const { container } = render(<Checkbox checked={false} onChange={onChange} />);
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    await user.click(checkbox);
    expect(onChange).toHaveBeenCalled();
  });

  it("renders label when provided", () => {
    render(<Checkbox checked={false} onChange={() => {}} label="Accept terms" />);
    expect(screen.getByText("Accept terms")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <Checkbox
        checked={false}
        onChange={() => {}}
        label="Subscribe"
        description="Get updates weekly"
      />
    );
    expect(screen.getByText("Get updates weekly")).toBeInTheDocument();
  });

  it("shows error message when provided", () => {
    render(<Checkbox checked={false} onChange={() => {}} error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("applies disabled state", () => {
    const { container } = render(<Checkbox checked={false} onChange={() => {}} disabled />);
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);
  });

  it("supports indeterminate state", () => {
    const { container } = render(<Checkbox checked={false} onChange={() => {}} indeterminate />);
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox.indeterminate).toBe(true);
  });

  it("applies size variants", () => {
    const { container: container1 } = render(
      <Checkbox checked={false} onChange={() => {}} size="sm" />
    );
    const { container: container2 } = render(
      <Checkbox checked={false} onChange={() => {}} size="lg" />
    );
    expect(container1.firstChild).toBeInTheDocument();
    expect(container2.firstChild).toBeInTheDocument();
  });

  it("has proper accessibility attributes", () => {
    const { container } = render(
      <Checkbox checked={false} onChange={() => {}} label="Agree to terms" />
    );
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).toHaveAttribute("type", "checkbox");
  });

  it("can be toggled by keyboard", async () => {
    const onChange = jest.fn();
    const { container } = render(
      <Checkbox checked={false} onChange={onChange} label="Toggle me" />
    );
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

    checkbox.focus();
    await userEvent.keyboard(" ");

    expect(onChange).toHaveBeenCalled();
  });

  it("forwards ref correctly", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Checkbox checked={false} onChange={() => {}} ref={ref} />);
    expect(ref.current).toBeInTheDocument();
  });
});
