import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnswerViewView } from "./AnswerView.view";
import { type OmniMessage } from "@soustools/api-types";

// Mock child components
vi.mock("@soustools/design-system", async (importOriginal) => {
  const actual: any = await importOriginal();
  return {
    ...actual,
    OmniTranscriptTimeline: ({ messages }: { messages: OmniMessage[] }) => (
      <div data-testid="transcript-timeline">
        {messages.map((m) => (
          <div key={m.id}>{m.content}</div>
        ))}
      </div>
    ),
  };
});

describe("AnswerViewView", () => {
  beforeEach(() => {
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("renders conversation transcript column", () => {
    const messages: OmniMessage[] = [
      { id: "1", role: "user", content: "Show me today's sales" },
    ];

    render(
      <AnswerViewView
        chatHistory={messages}
        isProcessing={false}
        track2Type={null}
        realRevenueData={[]}
        realTicketTimeData={[]}
        prepListItems={[]}
        onTogglePrepItem={vi.fn()}
      />,
    );

    expect(screen.getByTestId("transcript-timeline")).toBeInTheDocument();
    expect(screen.getByText("Show me today's sales")).toBeInTheDocument();
  });

  it("renders ArtifactColumn when track2Type is provided", () => {
    render(
      <AnswerViewView
        chatHistory={[]}
        isProcessing={false}
        track2Type="REVENUE_CHART"
        realRevenueData={[{ name: "Mon", value: 100 }]}
        realTicketTimeData={[]}
        prepListItems={[]}
        onTogglePrepItem={vi.fn()}
      />,
    );

    expect(screen.getAllByText("Revenue Chart").length).toBeGreaterThan(0);
    expect(
      screen.getByText("Weekly Revenue & Sales Metrics"),
    ).toBeInTheDocument();
  });

  it("renders ArtifactColumn when a render_component directive message is in chatHistory", () => {
    const directiveMsg: OmniMessage = {
      id: "dir-1",
      role: "render_component" as any,
      content: JSON.stringify({
        componentName: "INGESTION_REVIEW",
        props: { reviewId: "rev-abc" },
      }),
    };

    render(
      <AnswerViewView
        chatHistory={[directiveMsg]}
        isProcessing={false}
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
