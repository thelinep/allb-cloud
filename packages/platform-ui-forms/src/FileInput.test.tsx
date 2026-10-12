import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { FileInput } from "./FileInput";

describe("FileInput", () => {
  it("renders a file input", () => {
    render(<FileInput label="Attachment" />);
    expect(screen.getByLabelText("Attachment", { selector: "input" })).toBeInTheDocument();
  });

  it("uses the default button label", () => {
    render(<FileInput label="Attachment" />);
    expect(screen.getByText("Choose file")).toBeInTheDocument();
  });

  it("accepts a custom button label", () => {
    render(<FileInput label="Attachment" buttonLabel="Upload" />);
    expect(screen.getByText("Upload")).toBeInTheDocument();
  });

  it("shows the error message", () => {
    render(<FileInput label="Attachment" error="A file is required" />);
    expect(screen.getByText("A file is required")).toBeInTheDocument();
  });

  it("shows helper text when there is no error", () => {
    render(<FileInput label="Attachment" helperText="PDF up to 10MB" />);
    expect(screen.getByText("PDF up to 10MB")).toBeInTheDocument();
  });

  it("displays the provided file names", () => {
    render(<FileInput label="Attachment" fileNames={["resume.pdf", "cover.pdf"]} />);
    expect(screen.getByText("resume.pdf, cover.pdf")).toBeInTheDocument();
  });

  it("does not render a file name list when none are provided", () => {
    render(<FileInput label="Attachment" />);
    expect(screen.queryByText(/\.pdf/)).not.toBeInTheDocument();
  });

  it("calls onChange with the selected FileList", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<FileInput label="Attachment" onChange={onChange} data-testid="file-input" />);
    const file = new File(["hello"], "hello.png", { type: "image/png" });
    const input = screen.getByLabelText("Attachment", { selector: "input" });
    await user.upload(input, file);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0][0]).toBe(file);
  });

  it("forwards ref to the underlying input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<FileInput label="Attachment" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("sets displayName", () => {
    expect(FileInput.displayName).toBe("FileInput");
  });
});
