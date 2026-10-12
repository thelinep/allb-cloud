import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { FormActions } from "./FormActions";

describe("FormActions", () => {
  it("renders children", () => {
    render(
      <FormActions>
        <button>Save</button>
      </FormActions>
    );
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("right-aligns actions by default", () => {
    render(<FormActions data-testid="actions">Content</FormActions>);
    expect(screen.getByTestId("actions")).toHaveStyle({ justifyContent: "flex-end" });
  });

  it("supports other alignments", () => {
    render(
      <FormActions align="space-between" data-testid="actions">
        Content
      </FormActions>
    );
    expect(screen.getByTestId("actions")).toHaveStyle({ justifyContent: "space-between" });
  });

  it("applies a spacing token gap", () => {
    render(
      <FormActions gap="lg" data-testid="actions">
        Content
      </FormActions>
    );
    expect(screen.getByTestId("actions")).toHaveStyle({ gap: "24px" });
  });

  it("wraps onto multiple lines", () => {
    render(<FormActions data-testid="actions">Content</FormActions>);
    expect(screen.getByTestId("actions")).toHaveStyle({ flexWrap: "wrap" });
  });

  it("forwards ref to the underlying div", () => {
    const ref = createRef<HTMLDivElement>();
    render(<FormActions ref={ref}>Content</FormActions>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("sets displayName", () => {
    expect(FormActions.displayName).toBe("FormActions");
  });
});
