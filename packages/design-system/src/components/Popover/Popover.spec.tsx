import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Popover, PopoverTrigger, PopoverContent } from "./Popover";

describe("Popover", () => {
  it("opens on click", () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>
          <div>Popover content</div>
        </PopoverContent>
      </Popover>,
    );

    expect(screen.queryByText("Popover content")).not.toBeInTheDocument();
    fireEvent.click(screen.getByText("Open"));
    expect(screen.getByText("Popover content")).toBeInTheDocument();
  });
});
