import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { InsightsSidebar } from "./InsightsSidebar";

describe("InsightsSidebar", () => {
  it("renders insights title", () => {
    render(<InsightsSidebar suppliers={[]} />);
    expect(screen.getByText("Insights")).toBeInTheDocument();
  });

  it("renders suppliers", () => {
    const suppliers = [
      { id: "1", name: "Fresh Produce Co", deliveryDays: [1, 3, 5] },
    ];
    render(<InsightsSidebar suppliers={suppliers} />);

    expect(screen.getByText("Fresh Produce Co")).toBeInTheDocument();
  });

  it("triggers onAddVendor callback", () => {
    const handleAdd = vi.fn();
    render(<InsightsSidebar suppliers={[]} onAddVendor={handleAdd} />);

    const btn = screen.getByRole("button", { name: /Add Vendor/i });
    fireEvent.click(btn);

    expect(handleAdd).toHaveBeenCalledTimes(1);
  });
});
