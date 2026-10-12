import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { FormSection } from "./FormSection";

describe("FormSection", () => {
  it("renders children", () => {
    render(
      <FormSection>
        <input aria-label="name" />
      </FormSection>
    );
    expect(screen.getByLabelText("name")).toBeInTheDocument();
  });

  it("renders the title as a heading", () => {
    render(<FormSection title="Personal details">Content</FormSection>);
    expect(screen.getByRole("heading", { name: "Personal details" })).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<FormSection description="Shown on your public profile">Content</FormSection>);
    expect(screen.getByText("Shown on your public profile")).toBeInTheDocument();
  });

  it("does not render a heading section when no title or description is given", () => {
    render(<FormSection>Content</FormSection>);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("renders a divider under the heading by default", () => {
    const { container } = render(<FormSection title="Details">Content</FormSection>);
    const headingWrapper = container.querySelector(":scope > div > div");
    expect(headingWrapper).toHaveStyle({ borderBottom: "1px solid rgb(212, 175, 159)" });
  });

  it("omits the divider when divider is false", () => {
    const { container } = render(
      <FormSection title="Details" divider={false}>
        Content
      </FormSection>
    );
    const headingWrapper = container.querySelector(":scope > div > div");
    expect(headingWrapper?.style.borderBottom).toBe("");
  });

  it("forwards ref to the underlying div", () => {
    const ref = createRef<HTMLDivElement>();
    render(<FormSection ref={ref}>Content</FormSection>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("sets displayName", () => {
    expect(FormSection.displayName).toBe("FormSection");
  });
});
