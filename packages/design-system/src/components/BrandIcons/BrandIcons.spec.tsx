import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GoogleIcon } from "./BrandIcons";

describe("BrandIcons", () => {
  it("renders without crashing", () => {
    const { container } = render(<GoogleIcon />);
    expect(container).toBeTruthy();
  });
});
