import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("renders a search input", () => {
    render(<SearchInput />);
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("uses the default placeholder", () => {
    render(<SearchInput />);
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
  });

  it("accepts a custom placeholder", () => {
    render(<SearchInput placeholder="Find components" />);
    expect(screen.getByPlaceholderText("Find components")).toBeInTheDocument();
  });

  it("calls onChange with the new value", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchInput value="" onChange={onChange} />);
    await user.type(screen.getByRole("searchbox"), "a");
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("does not render a clear button when the value is empty", () => {
    render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.queryByLabelText("Clear search")).not.toBeInTheDocument();
  });

  it("renders a clear button when there is a value", () => {
    render(<SearchInput value="query" onChange={() => {}} />);
    expect(screen.getByLabelText("Clear search")).toBeInTheDocument();
  });

  it("calls onClear when the clear button is clicked", async () => {
    const onClear = vi.fn();
    const user = userEvent.setup();
    render(<SearchInput value="query" onChange={() => {}} onClear={onClear} />);
    await user.click(screen.getByLabelText("Clear search"));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("forwards ref to the underlying input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<SearchInput ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("sets displayName", () => {
    expect(SearchInput.displayName).toBe("SearchInput");
  });
});
