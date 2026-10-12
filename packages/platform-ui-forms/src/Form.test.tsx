import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Form } from "./Form";

describe("Form", () => {
  it("renders children", () => {
    render(
      <Form>
        <input aria-label="name" />
      </Form>
    );
    expect(screen.getByLabelText("name")).toBeInTheDocument();
  });

  it("renders a form element", () => {
    render(<Form data-testid="form">Content</Form>);
    expect(screen.getByTestId("form").tagName).toBe("FORM");
  });

  it("prevents the default submit and calls onSubmit", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(
      <Form onSubmit={onSubmit} data-testid="form">
        <button type="submit">Save</button>
      </Form>
    );
    await user.click(screen.getByText("Save"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0].defaultPrevented).toBe(true);
  });

  it("does not throw when submitted without an onSubmit handler", async () => {
    const user = userEvent.setup();
    render(
      <Form data-testid="form">
        <button type="submit">Save</button>
      </Form>
    );
    await user.click(screen.getByText("Save"));
  });

  it("applies vertical stack spacing from the token scale", () => {
    render(<Form data-testid="form">Content</Form>);
    expect(screen.getByTestId("form")).toHaveStyle({
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    });
  });

  it("applies a custom spacing token", () => {
    render(
      <Form spacing="xs" data-testid="form">
        Content
      </Form>
    );
    expect(screen.getByTestId("form")).toHaveStyle({ gap: "4px" });
  });

  it("forwards ref to the underlying form", () => {
    const ref = createRef<HTMLFormElement>();
    render(<Form ref={ref}>Content</Form>);
    expect(ref.current).toBeInstanceOf(HTMLFormElement);
  });

  it("sets displayName", () => {
    expect(Form.displayName).toBe("Form");
  });
});
