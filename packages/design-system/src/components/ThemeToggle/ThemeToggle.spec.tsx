import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ThemeToggle } from "./ThemeToggle";

describe("ThemeToggle", () => {
  it("renders without crashing", () => {
    const { container } = render(<ThemeToggle />);
    expect(container).toBeTruthy();
  });
});
