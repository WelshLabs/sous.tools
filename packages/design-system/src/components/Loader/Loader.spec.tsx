import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { BrandLoader } from "./Loader";

describe("Loader", () => {
  it("renders without crashing", () => {
    const { container } = render(<BrandLoader />);
    expect(container).toBeTruthy();
  });
});
