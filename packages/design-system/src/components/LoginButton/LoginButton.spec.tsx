import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoginButton } from "./LoginButton";

describe("LoginButton", () => {
  it("renders without crashing", () => {
    const { container } = render(<LoginButton />);
    expect(container).toBeTruthy();
  });
});
