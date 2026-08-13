import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SettingsPanel } from "./SettingsPanel.container";

describe("SettingsPanel", () => {
  it("renders all sections successfully", () => {
    render(
      <SettingsPanel
        initialData={{
          name: "Test User",
          email: "test@example.com",
          role: "admin",
        }}
        onSaveGeneral={vi.fn()}
        initialTokens={{}}
        onSaveTokens={vi.fn()}
        integrations={[]}
        onConnectIntegration={vi.fn()}
        onDisconnectIntegration={vi.fn()}
        onSquareAction={vi.fn()}
      />,
    );

    // Verify sections render by checking for standard texts
    expect(screen.getByText("General Settings")).toBeInTheDocument();
    expect(screen.getByText("Global Styling")).toBeInTheDocument();
    expect(screen.getByText("Integrations")).toBeInTheDocument();
    expect(screen.getByText("OS Downloads")).toBeInTheDocument();
  });
});
