import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SignagePreviewView } from "./SignagePreview.view";
import { type SignageLayoutConfig } from "@soustools/api-types";

describe("SignagePreviewView", () => {
  it("renders correctly with empty canvas", () => {
    const config: SignageLayoutConfig = {
      id: "preview-1",
      name: "Preview",
      aspectRatio: "16:9",
      slides: [
        {
          id: "slide-1",
          type: "COLUMN_LAYOUT",
          duration: 10,
          columns: [
            {
              id: "col-1",
              width: "100%",
              blocks: [],
            },
          ],
        },
      ],
    };

    render(
      <SignagePreviewView
        config={config}
        items={[]}
        activeSlideIndex={0}
        isPreviewing={false}
        scale={1}
        containerRef={{ current: null }}
        fetchModifiers={vi.fn()}
      />,
    );

    expect(screen.getByText("Empty Column")).toBeDefined();
  });
});
