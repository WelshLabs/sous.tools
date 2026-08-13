import * as React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./Card";

describe("Card", () => {
  it("renders fully composed card", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Test Title</CardTitle>
          <CardDescription>Test Description</CardDescription>
        </CardHeader>
        <CardContent>
          <div>Content</div>
        </CardContent>
        <CardFooter>
          <button>Footer Btn</button>
        </CardFooter>
      </Card>,
    );
    expect(screen.getByText("Test Title")).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
    expect(screen.getByText("Footer Btn")).toBeInTheDocument();
  });

  it("respects glass and glow props", () => {
    render(<Card data-testid="card" glass={false} glow={true} />);
    const card = screen.getByTestId("card");
    expect(card).not.toHaveClass("ds-glass");
    expect(card).toHaveClass("shadow-glow-sm");
  });
});
