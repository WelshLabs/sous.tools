import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TopProgress } from "./TopProgress";

describe("TopProgress", () => {
  it("renders without crashing", () => {
    const { container } = render(<TopProgress active={true} />);
    expect(container).toBeTruthy();
  });
});
