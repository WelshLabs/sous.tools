import { describe, expect, it } from "vitest";

import { resolveSocketUrl } from "./use-omni-socket.hook";

describe("resolveSocketUrl", () => {
  it("prefers the configured API URL and converts it to a websocket URL", () => {
    expect(resolveSocketUrl("https://dev-api.sous.tools")).toBe(
      "wss://dev-api.sous.tools/commands",
    );
  });

  it("keeps an existing websocket URL intact", () => {
    expect(resolveSocketUrl("wss://dev-api.sous.tools")).toBe(
      "wss://dev-api.sous.tools/commands",
    );
  });

  it("falls back to the current origin when no API URL is configured", () => {
    expect(resolveSocketUrl("", "https://dev.sous.tools")).toBe(
      "https://dev.sous.tools/commands",
    );
  });
});
