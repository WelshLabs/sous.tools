import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { VendorsPanel } from "./VendorsPanel.container";

describe("VendorsPanel", () => {
  it("renders correctly with empty data", () => {
    render(
      <VendorsPanel
        vendors={[]}
        onSave={vi.fn()}
        onDelete={vi.fn()}
      />
    );
    expect(screen.getByRole("heading", { name: /Vendor\s+Management/i })).toBeInTheDocument();
  });
});
