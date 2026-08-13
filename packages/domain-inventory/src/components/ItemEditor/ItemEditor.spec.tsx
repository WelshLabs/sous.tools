import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ItemEditor } from "./ItemEditor.container";

describe("ItemEditor", () => {
  it("renders correctly", () => {
    render(<ItemEditor item={null} onClose={vi.fn()} onSave={vi.fn()} />);
    expect(screen.getByText("New Ledger Item")).toBeInTheDocument();
  });
});
