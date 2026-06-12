import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { Button } from "./Button";

describe("Button component", () => {
  it("renders correctly with default props", () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByRole("button", { name: /click me/i });
    expect(buttonElement).toBeDefined();
    expect(buttonElement.className).toContain("bg-primary");
  });

  it("renders with custom variant and size", () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>,
    );
    const buttonElement = screen.getByRole("button", { name: /delete/i });
    expect(buttonElement).toBeDefined();
    expect(buttonElement.className).toContain("bg-destructive");
    expect(buttonElement.className).toContain("px-6");
  });
});
