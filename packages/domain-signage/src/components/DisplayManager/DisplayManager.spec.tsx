import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DisplayManagerView } from "./DisplayManager.view";

describe("DisplayManagerView", () => {
  it("renders displays and handles basic interactions", () => {
    const handleAddBrowserDisplay = vi.fn();
    const setShowPairModal = vi.fn();
    const handleDeleteDisplay = vi.fn();
    
    render(
      <DisplayManagerView
        displays={[
          {
            id: "disp1",
            name: "Test Display",
            deckId: null,
            lastSeenAt: new Date().toISOString(),
          } as any
        ]}
        layouts={[]}
        showPairModal={false}
        selectedDeviceId={null}
        handleAddBrowserDisplay={handleAddBrowserDisplay}
        setShowPairModal={setShowPairModal}
        setSelectedDeviceId={vi.fn()}
        onAssignDeck={vi.fn()}
        handleDeleteDisplay={handleDeleteDisplay}
      />
    );

    // Should render the title
    expect(screen.getByText("Display Manager")).toBeDefined();
    
    // Should render the display
    expect(screen.getByText("Test Display")).toBeDefined();

    // Click add browser display
    const addBrowserBtn = screen.getByText(/Browser Display/i);
    fireEvent.click(addBrowserBtn);
    expect(handleAddBrowserDisplay).toHaveBeenCalled();
    
    // Click pair TV device
    const pairTvBtn = screen.getByText(/Pair TV Device/i);
    fireEvent.click(pairTvBtn);
    expect(setShowPairModal).toHaveBeenCalledWith(true);
  });
});
