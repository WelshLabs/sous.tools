import { describe, expect, it } from "vitest";
import { useOmniSocket } from "./use-omni-socket.hook";

describe("useOmniSocket", () => {
  it("exports useOmniSocket hook function", () => {
    expect(typeof useOmniSocket).toBe("function");
  });
});
