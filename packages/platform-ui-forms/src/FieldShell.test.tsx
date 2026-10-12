import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FieldShell } from "./FieldShell";

describe("FieldShell", () => {
  it("renders children", () => {
    render(
      <FieldShell>
        <input aria-label="test-input" />
      </FieldShell>
    );
    expect(screen.getByLabelText("test-input")).toBeInTheDocument();
  });

  it("renders a label associated with the control via htmlFor", () => {
    render(
      <FieldShell label="Email" htmlFor="email-field">
        <input id="email-field" />
      </FieldShell>
    );
    const label = screen.getByText("Email");
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", "email-field");
  });

  it("shows a required indicator when required is true", () => {
    render(
      <FieldShell label="Email" required>
        <input />
      </FieldShell>
    );
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("does not show a required indicator by default", () => {
    render(
      <FieldShell label="Email">
        <input />
      </FieldShell>
    );
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("renders an error message", () => {
    render(
      <FieldShell error="This field is required">
        <input />
      </FieldShell>
    );
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("renders helper text when there is no error", () => {
    render(
      <FieldShell helperText="Enter your email">
        <input />
      </FieldShell>
    );
    expect(screen.getByText("Enter your email")).toBeInTheDocument();
  });

  it("prefers the error message over helper text", () => {
    render(
      <FieldShell error="Invalid email" helperText="Enter your email">
        <input />
      </FieldShell>
    );
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
    expect(screen.queryByText("Enter your email")).not.toBeInTheDocument();
  });

  it("applies a custom className", () => {
    const { container } = render(
      <FieldShell className="custom-shell">
        <input />
      </FieldShell>
    );
    expect(container.firstChild).toHaveClass("custom-shell");
  });

  it("sets displayName", () => {
    expect(FieldShell.displayName).toBe("FieldShell");
  });
});
