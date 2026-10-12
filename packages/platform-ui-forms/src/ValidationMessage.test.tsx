import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { ValidationMessage } from "./ValidationMessage";

describe("ValidationMessage", () => {
  it("renders its message", () => {
    render(<ValidationMessage>Please fix the errors below.</ValidationMessage>);
    expect(screen.getByText("Please fix the errors below.")).toBeInTheDocument();
  });

  it("defaults to the error type with an alert role", () => {
    render(<ValidationMessage>Something went wrong</ValidationMessage>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("uses a status role for non-error types", () => {
    render(<ValidationMessage type="success">Saved</ValidationMessage>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("applies the error color", () => {
    render(<ValidationMessage type="error">Error text</ValidationMessage>);
    expect(screen.getByRole("alert")).toHaveStyle({ color: "#8B3A2B" });
  });

  it("applies the success color", () => {
    render(<ValidationMessage type="success">Success text</ValidationMessage>);
    expect(screen.getByRole("status")).toHaveStyle({ color: "#2D6A3E" });
  });

  it("applies the warning color", () => {
    render(<ValidationMessage type="warning">Warning text</ValidationMessage>);
    expect(screen.getByRole("status")).toHaveStyle({ color: "#7A6100" });
  });

  it("applies the info color", () => {
    render(<ValidationMessage type="info">Info text</ValidationMessage>);
    expect(screen.getByRole("status")).toHaveStyle({ color: "#1E3A5F" });
  });

  it("allows overriding the role", () => {
    render(
      <ValidationMessage role="note" type="info">
        Note text
      </ValidationMessage>
    );
    expect(screen.getByRole("note")).toBeInTheDocument();
  });

  it("forwards ref to the underlying div", () => {
    const ref = createRef<HTMLDivElement>();
    render(<ValidationMessage ref={ref}>Text</ValidationMessage>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("sets displayName", () => {
    expect(ValidationMessage.displayName).toBe("ValidationMessage");
  });
});
