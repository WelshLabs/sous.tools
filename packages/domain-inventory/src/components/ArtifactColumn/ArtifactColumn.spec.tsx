import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ArtifactColumnView } from "./ArtifactColumn.view";
import { ArtifactColumnContainer } from "./ArtifactColumn.container";
import { type OmniMessage } from "@soustools/api-types";

describe("ArtifactColumn", () => {
  it("renders ArtifactColumnView with header and children when open", () => {
    const onClose = vi.fn();
    const onToggleMobile = vi.fn();

    render(
      <ArtifactColumnView
        content={{ type: "REVENUE_CHART", label: "Weekly Revenue" }}
        isOpen={true}
        isMobileExpanded={false}
        onClose={onClose}
        onToggleMobile={onToggleMobile}
      >
        <div data-testid="chart-content">Chart Content Here</div>
      </ArtifactColumnView>,
    );

    expect(screen.getAllByText("Weekly Revenue").length).toBeGreaterThan(0);
    expect(screen.getByTestId("chart-content")).toBeInTheDocument();

    const closeBtn = screen.getByLabelText("Close artifact panel");
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it("renders null when isOpen is false", () => {
    const { container } = render(
      <ArtifactColumnView
        content={{ type: "REVENUE_CHART" }}
        isOpen={false}
        isMobileExpanded={false}
        onClose={vi.fn()}
        onToggleMobile={vi.fn()}
      >
        <div>Content</div>
      </ArtifactColumnView>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders ArtifactColumnContainer with PREP_LIST content and allows toggling items", () => {
    const onTogglePrep = vi.fn();
    const prepItems = [
      { id: "prep-1", text: "Slice 10lb onions", done: false },
      { id: "prep-2", text: "Portion 5lb ribeye", done: true },
    ];

    render(
      <ArtifactColumnContainer
        renderDirectiveMessage={null}
        track2Type="PREP_LIST"
        realRevenueData={[]}
        realTicketTimeData={[]}
        prepListItems={prepItems}
        onTogglePrepItem={onTogglePrep}
      />,
    );

    expect(screen.getByText("Kitchen Prep Checklist")).toBeInTheDocument();
    expect(screen.getByText("Slice 10lb onions")).toBeInTheDocument();

    const item = screen.getByText("Slice 10lb onions");
    fireEvent.click(item);
    expect(onTogglePrep).toHaveBeenCalledWith("prep-1");
  });

  it("renders ArtifactColumnContainer with INGESTION_REVIEW directive message", () => {
    const directiveMsg: OmniMessage = {
      id: "m-1",
      role: "render_component" as any,
      content: JSON.stringify({
        componentName: "INGESTION_REVIEW",
        props: { reviewId: "rev-999" },
      }),
    };

    render(
      <ArtifactColumnContainer
        renderDirectiveMessage={directiveMsg}
        track2Type={null}
        realRevenueData={[]}
        realTicketTimeData={[]}
        prepListItems={[]}
        onTogglePrepItem={vi.fn()}
      />,
    );

    expect(screen.getAllByText("Ingestion Review").length).toBeGreaterThan(0);
  });
});
