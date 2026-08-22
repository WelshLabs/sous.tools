"use client";
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ComplianceSearchView } from "./ComplianceSearch.view";

describe("ComplianceSearchView", () => {
  it("renders when isOpen is true", () => {
    render(
      <ComplianceSearchView
        isOpen={true}
        onClose={vi.fn()}
        query=""
        setQuery={vi.fn()}
        results={[]}
        loading={false}
        error=""
        onSearch={vi.fn()}
        onSelectProduct={vi.fn()}
      />,
    );
    expect(
      screen.getByText("Compliance Search (Open Food Facts)"),
    ).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <ComplianceSearchView
        isOpen={false}
        onClose={vi.fn()}
        query=""
        setQuery={vi.fn()}
        results={[]}
        loading={false}
        error=""
        onSearch={vi.fn()}
        onSelectProduct={vi.fn()}
      />,
    );
    expect(
      screen.queryByText("Compliance Search (Open Food Facts)"),
    ).not.toBeInTheDocument();
  });

  it("renders results correctly", () => {
    render(
      <ComplianceSearchView
        isOpen={true}
        onClose={vi.fn()}
        query="Milk"
        setQuery={vi.fn()}
        results={[
          {
            code: "123",
            product_name: "Whole Milk",
            brands: "Dairy Co",
          },
        ]}
        loading={false}
        error=""
        onSearch={vi.fn()}
        onSelectProduct={vi.fn()}
      />,
    );
    expect(screen.getByText("Whole Milk")).toBeInTheDocument();
    expect(screen.getByText("Dairy Co")).toBeInTheDocument();
  });
});
