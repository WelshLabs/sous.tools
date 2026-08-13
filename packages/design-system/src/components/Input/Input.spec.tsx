import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Input } from "./Input";

describe("Input", () => {
  it("renders correctly", () => {
    render(<Input placeholder="Test input" />);
    expect(screen.getByPlaceholderText("Test input")).toBeInTheDocument();
  });

  it("displays label and hint", () => {
    render(<Input label="Username" hint="Required field" />);
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Required field")).toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<Input error="Invalid input" />);
    expect(screen.getByText("Invalid input")).toBeInTheDocument();
  });

  it("handles onChange", () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Type" onChange={handleChange} />);
    fireEvent.change(screen.getByPlaceholderText("Type"), {
      target: { value: "Hello" },
    });
    expect(handleChange).toHaveBeenCalled();
  });
});
