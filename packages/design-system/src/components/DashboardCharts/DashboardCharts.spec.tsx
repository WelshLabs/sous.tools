import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { RevenueChart } from "./DashboardCharts";

describe("DashboardCharts", () => {
  it("renders without crashing", () => {
    const { container } = render(<RevenueChart data={[]} />);
    expect(container).toBeTruthy();
  });
});
