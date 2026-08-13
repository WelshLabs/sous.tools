import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TwoToneHeader } from "./TwoToneHeader";

describe("TwoToneHeader", () => {
  it("renders without crashing", () => {
    const { container } = render(<TwoToneHeader title="Hello" />);
    expect(container).toBeTruthy();
  });
});
