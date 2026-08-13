import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AnimatedLettermark } from "./Logo";

describe("Logos", () => {
  it("renders without crashing", () => {
    const { container } = render(<AnimatedLettermark />);
    expect(container).toBeTruthy();
  });
});
