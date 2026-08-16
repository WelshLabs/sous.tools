/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import {
  ChatMessageBubble,
  ProcessingBubble,
  EmptyStateBubble,
} from "./ChatMessageBubble";
import { type OmniMessage } from "@soustools/api-types";

describe("ChatMessageBubble", () => {
  it("renders user message with right alignment and correct content", () => {
    const userMsg: OmniMessage = {
      id: "msg-1",
      role: "user",
      content: "Can you create a prep list for tomorrow?",
      timestamp: new Date("2026-08-16T12:00:00Z"),
    };

    const { container } = render(
      <ChatMessageBubble message={userMsg} isLastMessage={true} />,
    );

    expect(screen.getByText("Can you create a prep list for tomorrow?")).toBeDefined();
    // User message container should have flex-row-reverse
    const outerRow = container.querySelector(".flex-row-reverse");
    expect(outerRow).toBeTruthy();
  });

  it("renders assistant message with left alignment and Sparkles icon", () => {
    const modelMsg: OmniMessage = {
      id: "msg-2",
      role: "model",
      content: "Heard, Chef. Here is your prep list.",
      timestamp: new Date("2026-08-16T12:01:00Z"),
    };

    const { container } = render(
      <ChatMessageBubble message={modelMsg} isLastMessage={false} />,
    );

    expect(screen.getByText("Heard, Chef. Here is your prep list.")).toBeDefined();
    const outerRow = container.querySelector(".flex-row");
    expect(outerRow).toBeTruthy();
  });

  it("renders attachments when present", () => {
    const msgWithAttachment: OmniMessage = {
      id: "msg-3",
      role: "user",
      content: "Check this invoice",
      attachments: [{ url: "https://example.com/invoice.jpg" } as any],
    };

    render(<ChatMessageBubble message={msgWithAttachment} />);
    const img = screen.getByRole("img", { name: "Attachment" });
    expect(img).toBeDefined();
    expect(img.getAttribute("src")).toBe("https://example.com/invoice.jpg");
  });

  it("returns null for render_component messages (handled by timeline layer)", () => {
    const renderMsg: OmniMessage = {
      id: "msg-4",
      role: "render_component" as any,
      content: JSON.stringify({ componentName: "INGESTION_REVIEW" }),
    };

    const { container } = render(<ChatMessageBubble message={renderMsg} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders markdown elements including bold, lists, and code blocks in assistant messages", () => {
    const markdownMsg: OmniMessage = {
      id: "msg-5",
      role: "model",
      content: "### Daily Prep\nHere is what to do:\n- **Chop** onions\n- Simmer `chicken broth`\n```typescript\nconst prepDone = true;\n```",
      timestamp: new Date("2026-08-16T12:02:00Z"),
    };

    render(<ChatMessageBubble message={markdownMsg} />);
    expect(screen.getByText("Daily Prep")).toBeDefined();
    expect(screen.getByText("Chop")).toBeDefined();
    expect(screen.getByText("chicken broth")).toBeDefined();
    expect(screen.getByText("const prepDone = true;")).toBeDefined();
    expect(screen.getByText("Copy")).toBeDefined();
  });

  it("renders ProcessingBubble and EmptyStateBubble", () => {
    const { rerender } = render(<ProcessingBubble label="Cooking up response..." />);
    expect(screen.getByText("Cooking up response...")).toBeDefined();

    rerender(<EmptyStateBubble message="Ready for orders" />);
    expect(screen.getByText("Ready for orders")).toBeDefined();
  });
});
