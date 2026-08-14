import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Chip } from "./Chip";
import { Star } from "lucide-react";

describe("Chip", () => {
  it("renders default chip", () => {
    render(<Chip>Test Chip</Chip>);
    expect(screen.getByText("Test Chip")).toBeInTheDocument();
  });

  it("renders with icon", () => {
    render(
      <Chip icon={<Star data-testid="icon" className="w-4 h-4" />}>
        Icon Chip
      </Chip>,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("handles remove action", () => {
    const handleRemove = vi.fn();
    render(<Chip onRemove={handleRemove}>Removable</Chip>);

    const removeBtn = screen.getByRole("button", { name: /remove/i });
    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it("applies disabled styles and disables click", () => {
    const handleClick = vi.fn();
    render(
      <Chip disabled onClick={handleClick}>
        Disabled
      </Chip>,
    );

    const chip = screen.getByRole("button");
    expect(chip).toBeDisabled();
    fireEvent.click(chip);
    expect(handleClick).not.toHaveBeenCalled();
  });
});
