import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("renders a textarea", () => {
    render(<Textarea label="Bio" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("associates the label with the textarea", () => {
    render(<Textarea label="Bio" />);
    expect(screen.getByLabelText("Bio")).toBeInTheDocument();
  });

  it("accepts typed input", async () => {
    const user = userEvent.setup();
    render(<Textarea label="Bio" />);
    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Hello world");
    expect(textarea).toHaveValue("Hello world");
  });

  it("shows an error message and error border color", () => {
    render(<Textarea label="Bio" error="Bio is required" />);
    expect(screen.getByText("Bio is required")).toBeInTheDocument();
  });

  it("shows helper text when there is no error", () => {
    render(<Textarea label="Bio" helperText="Max 200 characters" />);
    expect(screen.getByText("Max 200 characters")).toBeInTheDocument();
  });

  it("applies the resize style", () => {
    render(<Textarea label="Bio" resize="none" />);
    expect(screen.getByRole("textbox")).toHaveStyle({ resize: "none" });
  });

  it("defaults to vertical resize", () => {
    render(<Textarea label="Bio" />);
    expect(screen.getByRole("textbox")).toHaveStyle({ resize: "vertical" });
  });

  it("calls onFocus and onBlur handlers", async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const user = userEvent.setup();
    render(<Textarea label="Bio" onFocus={onFocus} onBlur={onBlur} />);
    const textarea = screen.getByRole("textbox");
    await user.click(textarea);
    await user.tab();
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("forwards ref to the underlying textarea", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea label="Bio" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
  });

  it("forwards arbitrary textarea props", () => {
    render(<Textarea label="Bio" rows={6} data-testid="bio" />);
    expect(screen.getByTestId("bio")).toHaveAttribute("rows", "6");
  });

  it("sets displayName", () => {
    expect(Textarea.displayName).toBe("Textarea");
  });
});
