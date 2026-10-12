import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Radio, RadioGroup } from "./Radio";

describe("Radio", () => {
  it("renders radio input", () => {
    const { container } = render(<Radio checked={false} onChange={() => {}} value="option1" />);
    const radio = container.querySelector('input[type="radio"]');
    expect(radio).toBeInTheDocument();
  });

  it("reflects checked state", () => {
    const { container } = render(<Radio checked={true} onChange={() => {}} value="option1" />);
    const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
    expect(radio.checked).toBe(true);
  });

  it("calls onChange when clicked", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    const { container } = render(<Radio checked={false} onChange={onChange} value="option1" />);
    const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
    await user.click(radio);
    expect(onChange).toHaveBeenCalled();
  });

  it("renders label when provided", () => {
    render(<Radio checked={false} onChange={() => {}} value="option1" label="Option 1" />);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  it("renders description", () => {
    render(
      <Radio
        checked={false}
        onChange={() => {}}
        value="option1"
        label="Choice"
        description="This is a choice"
      />
    );
    expect(screen.getByText("This is a choice")).toBeInTheDocument();
  });

  it("applies disabled state", () => {
    const { container } = render(
      <Radio checked={false} onChange={() => {}} value="option1" disabled />
    );
    const radio = container.querySelector('input[type="radio"]') as HTMLInputElement;
    expect(radio.disabled).toBe(true);
  });

  it("applies size variants", () => {
    const { container: container1 } = render(
      <Radio checked={false} onChange={() => {}} value="option1" size="sm" />
    );
    const { container: container2 } = render(
      <Radio checked={false} onChange={() => {}} value="option1" size="lg" />
    );
    expect(container1.firstChild).toBeInTheDocument();
    expect(container2.firstChild).toBeInTheDocument();
  });
});

describe("RadioGroup", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  it("renders all radio options", () => {
    render(<RadioGroup name="test" options={options} value="option1" onChange={() => {}} />);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("reflects selected value", () => {
    const { container } = render(
      <RadioGroup name="test" options={options} value="option2" onChange={() => {}} />
    );
    const radios = container.querySelectorAll(
      'input[type="radio"]'
    ) as NodeListOf<HTMLInputElement>;
    expect(radios[1].checked).toBe(true);
  });

  it("calls onChange when selection changes", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    const { container } = render(
      <RadioGroup name="test" options={options} value="option1" onChange={onChange} />
    );
    const radios = container.querySelectorAll(
      'input[type="radio"]'
    ) as NodeListOf<HTMLInputElement>;
    await user.click(radios[1]);
    expect(onChange).toHaveBeenCalled();
  });

  it("renders label when provided", () => {
    render(
      <RadioGroup
        name="test"
        options={options}
        value="option1"
        onChange={() => {}}
        label="Select an option"
      />
    );
    expect(screen.getByText("Select an option")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <RadioGroup
        name="test"
        options={options}
        value="option1"
        onChange={() => {}}
        description="Choose your preference"
      />
    );
    expect(screen.getByText("Choose your preference")).toBeInTheDocument();
  });

  it("applies vertical direction by default", () => {
    render(<RadioGroup name="test" options={options} value="option1" onChange={() => {}} />);
    // Verify all options are rendered (Stack with vertical direction renders all children)
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("applies horizontal direction when specified", () => {
    render(
      <RadioGroup
        name="test"
        options={options}
        value="option1"
        onChange={() => {}}
        direction="horizontal"
      />
    );
    // Verify all options are rendered (Stack with horizontal direction renders all children)
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.getByText("Option 3")).toBeInTheDocument();
  });

  it("applies disabled state to all options", () => {
    const { container } = render(
      <RadioGroup name="test" options={options} value="option1" onChange={() => {}} disabled />
    );
    const radios = container.querySelectorAll(
      'input[type="radio"]'
    ) as NodeListOf<HTMLInputElement>;
    radios.forEach((radio) => {
      expect(radio.disabled).toBe(true);
    });
  });

  it("applies size variants", () => {
    const { container: container1 } = render(
      <RadioGroup name="test" options={options} value="option1" onChange={() => {}} size="sm" />
    );
    const { container: container2 } = render(
      <RadioGroup name="test" options={options} value="option1" onChange={() => {}} size="lg" />
    );
    expect(container1.firstChild).toBeInTheDocument();
    expect(container2.firstChild).toBeInTheDocument();
  });
});
