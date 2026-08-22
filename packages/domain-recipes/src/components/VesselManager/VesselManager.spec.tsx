"use client";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VesselManagerView } from "./VesselManager.view";

describe("VesselManagerView", () => {
  it("renders the header and vessels", () => {
    const vessels = [
      {
        id: "1",
        organizationId: "org-1",
        name: "Test Pan",
        shape: "RECTANGULAR" as const,
        length: 20,
        width: 10,
        height: 5,
        diameter: null,
        volumeMl: 1000,
        createdAt: new Date(),
      },
    ];

    render(
      <VesselManagerView
        isOpen={true}
        onClose={() => {}}
        vessels={vessels}
        loading={false}
        dialogOpen={false}
        setDialogOpen={() => {}}
        activeVessel={null}
        setActiveVessel={() => {}}
        unitSystem="cm"
        setUnitSystem={() => {}}
        volumeUnit="ml"
        setVolumeUnit={() => {}}
        onSaveVessel={async () => {}}
        onDeleteVessel={async () => {}}
      />,
    );

    expect(screen.getByText("Vessels Manager")).toBeInTheDocument();
    expect(screen.getByText("Test Pan")).toBeInTheDocument();
    expect(screen.getByText(/1000 ml Capacity/)).toBeInTheDocument();
  });

  it("calls onClose when the background or X is clicked", () => {
    const handleClose = vi.fn();
    render(
      <VesselManagerView
        isOpen={true}
        onClose={handleClose}
        vessels={[]}
        loading={false}
        dialogOpen={false}
        setDialogOpen={() => {}}
        activeVessel={null}
        setActiveVessel={() => {}}
        unitSystem="cm"
        setUnitSystem={() => {}}
        volumeUnit="ml"
        setVolumeUnit={() => {}}
        onSaveVessel={async () => {}}
        onDeleteVessel={async () => {}}
      />,
    );

    // The overlay is the first div.
    const buttons = screen.getAllByRole("button");
    // Find close button in header
    fireEvent.click(buttons[0]);
    expect(handleClose).toHaveBeenCalled();
  });
});
