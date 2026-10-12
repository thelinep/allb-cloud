import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { FormRow } from "./FormRow";

describe("FormRow", () => {
  it("renders children", () => {
    render(
      <FormRow>
        <input aria-label="first" />
        <input aria-label="last" />
      </FormRow>
    );
    expect(screen.getByLabelText("first")).toBeInTheDocument();
    expect(screen.getByLabelText("last")).toBeInTheDocument();
  });

  it("lays fields out in a row", () => {
    render(<FormRow data-testid="row">Content</FormRow>);
    expect(screen.getByTestId("row")).toHaveStyle({ display: "flex", flexDirection: "row" });
  });

  it("wraps by default", () => {
    render(<FormRow data-testid="row">Content</FormRow>);
    expect(screen.getByTestId("row")).toHaveStyle({ flexWrap: "wrap" });
  });

  it("does not wrap when wrap is false", () => {
    render(
      <FormRow wrap={false} data-testid="row">
        Content
      </FormRow>
    );
    expect(screen.getByTestId("row")).toHaveStyle({ flexWrap: "nowrap" });
  });

  it("applies a spacing token gap", () => {
    render(
      <FormRow gap="lg" data-testid="row">
        Content
      </FormRow>
    );
    expect(screen.getByTestId("row")).toHaveStyle({ gap: "24px" });
  });

  it("wraps each element child in an equal flex-basis wrapper", () => {
    const { container } = render(
      <FormRow>
        <input aria-label="first" />
        <input aria-label="last" />
      </FormRow>
    );
    const wrappers = container.querySelectorAll(":scope > div > div");
    expect(wrappers.length).toBe(2);
  });

  it("forwards ref to the underlying div", () => {
    const ref = createRef<HTMLDivElement>();
    render(<FormRow ref={ref}>Content</FormRow>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("sets displayName", () => {
    expect(FormRow.displayName).toBe("FormRow");
  });
});
