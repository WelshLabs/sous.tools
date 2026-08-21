import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OmniTranscriptTimeline } from "./OmniTranscriptTimeline";
import { type OmniMessage } from "@soustools/api-types";

describe("OmniTranscriptTimeline", () => {
  beforeEach(() => {
    // Mock scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  it("renders nothing when no messages are provided and not processing", () => {
    render(<OmniTranscriptTimeline messages={[]} isProcessing={false} />);
    expect(
      screen.queryByText(/Heard, Chef\. Systems are online and ready\./),
    ).toBeNull();
  });

  it("renders message bubbles for user and model messages", () => {
    const messages: OmniMessage[] = [
      {
        id: "1",
        role: "user",
        content: "What are our weekly sales?",
        timestamp: new Date(),
      },
      {
        id: "2",
        role: "model",
        content: "Weekly revenue is up 12% across all POS channels.",
        timestamp: new Date(),
      },
    ];

    render(<OmniTranscriptTimeline messages={messages} />);
    expect(screen.getByText("What are our weekly sales?")).toBeDefined();
    expect(
      screen.getByText("Weekly revenue is up 12% across all POS channels."),
    ).toBeDefined();
  });

  it("renders custom directive via renderComponentDirective callback", () => {
    const messages: OmniMessage[] = [
      {
        id: "dir-1",
        role: "render_component" as any,
        content: JSON.stringify({
          componentName: "INGESTION_REVIEW",
          props: { reviewId: "rev-123" },
        }),
      },
    ];

    render(
      <OmniTranscriptTimeline
        messages={messages}
        renderComponentDirective={(m) => (
          <div data-testid="custom-directive">
            Directive review: {JSON.parse(m.content).props.reviewId}
          </div>
        )}
      />,
    );

    expect(screen.getByTestId("custom-directive")).toBeDefined();
    expect(screen.getByText("Directive review: rev-123")).toBeDefined();
  });

  it("renders processing indicator when isProcessing is true", () => {
    render(
      <OmniTranscriptTimeline
        messages={[{ id: "1", role: "user", content: "Hold on" }]}
        isProcessing={true}
      />,
    );
    expect(
      screen.getByText(
        /Heard, Chef\. Systems online and processing your prompt\.\.\./,
      ),
    ).toBeDefined();
  });
});
