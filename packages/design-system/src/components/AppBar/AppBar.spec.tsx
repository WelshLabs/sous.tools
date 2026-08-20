import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AppBar } from "./AppBar";

// Mock next/link to render simple anchor tags
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("AppBar", () => {
  it("renders the primary brand logo link", () => {
    render(<AppBar />);
    const linkElement = screen.getByRole("link", { name: /sous/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute("href", "/home");
  });

  it("displays the notification count badge when notifications exist", () => {
    const notifications = [
      { id: "1", title: "New Item", message: "An item has been added." },
    ];
    render(<AppBar notifications={notifications} />);
    const badgeElement = screen.getByText("1");
    expect(badgeElement).toBeInTheDocument();
  });

  it("toggles the notifications dropdown menu on click", async () => {
    const notifications = [
      { id: "1", title: "New Item", message: "An item has been added." },
    ];
    render(<AppBar notifications={notifications} />);

    // Dropdown should start closed
    expect(screen.queryByText("Notifications")).not.toBeInTheDocument();

    // Click notifications trigger button
    const trigger = screen.getByRole("button", { name: "Notifications" });
    fireEvent.click(trigger);

    // Dropdown should be open
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("New Item")).toBeInTheDocument();
  });

  it("toggles the waffle menu dropdown and renders orders link", () => {
    render(<AppBar />);

    const waffleTrigger = screen.getByRole("button", { name: "App launcher" });
    fireEvent.click(waffleTrigger);

    const ordersLink = screen.getByRole("link", { name: "Orders" });
    expect(ordersLink).toBeInTheDocument();
    expect(ordersLink).toHaveAttribute("href", "/orders");
  });

  it("calls onLogoutAction when logout button is clicked", () => {
    const onLogout = vi.fn();
    render(<AppBar onLogoutAction={onLogout} />);

    // Click user avatar to open profile menu
    const avatar = screen.getByRole("button", { name: "User profile" });
    fireEvent.click(avatar);

    // Click Logout button
    const logoutBtn = screen.getByText("Logout");
    fireEvent.click(logoutBtn);

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
