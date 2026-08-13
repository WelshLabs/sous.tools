import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ItemsLedgerView } from "./ItemsLedger.view";

describe("ItemsLedgerView", () => {
  it("renders correctly empty", () => {
    render(
      <ItemsLedgerView
        items={[]}
        loading={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );
    expect(screen.getByText("No items found in ledger.")).toBeInTheDocument();
  });
});
