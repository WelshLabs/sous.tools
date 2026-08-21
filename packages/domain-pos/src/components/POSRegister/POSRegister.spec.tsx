/* eslint-disable max-lines */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { POSRegisterView } from "./pos.view";
import { POSCatalog } from "./components/pos-catalog";
import { POSTicket } from "./components/pos-ticket";
import { POSModifiersModal } from "./components/pos-modifiers-modal";
import { type CartItem } from "./pos.types";
import {
  calculateTotals,
  buildCartWithAddedItem,
  parseCatalogPayload,
} from "./pos.helpers";

describe("POS Register View & Core Features", () => {
  it("renders POSRegisterView with slots without crashing", () => {
    const { getByText } = render(
      <POSRegisterView
        header={<div>Header Content</div>}
        catalog={<div>Catalog Content</div>}
        ticket={<div>Ticket Content</div>}
      />,
    );
    expect(getByText("Header Content")).toBeInTheDocument();
    expect(getByText("Catalog Content")).toBeInTheDocument();
    expect(getByText("Ticket Content")).toBeInTheDocument();
  });

  describe("pos.helpers", () => {
    it("calculates totals with default 6% tax rate", () => {
      const cart = [
        {
          id: "item-1",
          name: "Burger",
          basePrice: 10,
          price: 10,
          quantity: 2,
          modifiers: [],
        },
      ];
      const { subtotal, tax, total, taxRate } = calculateTotals(cart, 0.06);
      expect(subtotal).toBe(20);
      expect(tax).toBe(1.2);
      expect(total).toBe(21.2);
      expect(taxRate).toBe(0.06);
    });

    it("builds cart item with modifiers and preserves base price", () => {
      const initialCart: CartItem[] = [];
      const item = {
        id: "item-1",
        name: "Deluxe Burger",
        price: 12.0,
        category: "Mains",
      };
      const mods = [{ id: "m1", name: "Bacon", price: 2.0 }];

      const updated = buildCartWithAddedItem(initialCart, item, mods);
      expect(updated).toHaveLength(1);
      expect(updated[0].basePrice).toBe(12.0);
      expect(updated[0].price).toBe(14.0);
      expect(updated[0].quantity).toBe(1);
      expect(updated[0].modifiers).toHaveLength(1);
    });

    it("parses catalog payload and filters inactive items", () => {
      const mockRawData = {
        categories: [
          { id: "c1", name: "Mains", is_active: true },
          { id: "c2", name: "Old Category", is_active: false },
        ],
        items: [
          {
            id: "i1",
            name: "Classic Burger",
            price: 10,
            category_id: "c1",
            is_active: true,
            available_in_pos: true,
          },
          {
            id: "i2",
            name: "Secret Item",
            price: 5,
            category_id: "c1",
            is_active: false,
          },
        ],
        modifierGroups: [
          {
            id: "mg1",
            name: "Cheese",
            min_selected_modifiers: 1,
            max_selected_modifiers: 1,
            pos_modifier_options: [{ id: "opt1", name: "Cheddar", price: 0 }],
          },
        ],
      };

      const parsed = parseCatalogPayload(mockRawData);
      expect(parsed.items).toHaveLength(1);
      expect(parsed.items[0].name).toBe("Classic Burger");
      expect(parsed.categoryItems).toBeDefined();
      expect(parsed.modifierGroups).toHaveLength(1);
      expect(parsed.modifierGroups[0].required).toBe(true);
    });
  });

  describe("POSCatalog (Square-style category grid)", () => {
    it("renders category grid when root is selected and navigates on click", () => {
      const onCategorySelect = vi.fn();
      render(
        <POSCatalog
          items={[
            { id: "1", name: "Burger", price: 10, category: "Mains" },
            { id: "2", name: "Fries", price: 5, category: "Sides" },
          ]}
          categories={["Mains", "Sides"]}
          categoryItems={[
            { id: "mains", name: "Mains", itemCount: 1 },
            { id: "sides", name: "Sides", itemCount: 1 },
          ]}
          selectedCategory=""
          searchQuery=""
          onSearchChange={vi.fn()}
          onCategorySelect={onCategorySelect}
          onItemClick={vi.fn()}
        />,
      );

      expect(screen.getByText("Categories")).toBeInTheDocument();
      expect(screen.getByText("Mains")).toBeInTheDocument();
      expect(screen.getByText("Sides")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Mains"));
      expect(onCategorySelect).toHaveBeenCalledWith("Mains");
    });
  });

  describe("POSTicket", () => {
    it("renders order type toggle, base cost breakdown, and totals", () => {
      const onSetOrderType = vi.fn();
      const onCheckout = vi.fn();

      render(
        <POSTicket
          items={[
            {
              id: "item-1",
              name: "Burger",
              basePrice: 10,
              price: 12,
              quantity: 1,
              modifiers: [{ id: "m1", name: "Cheddar", price: 2 }],
            },
          ]}
          orderType="for_here"
          taxRate={0.06}
          onSetOrderType={onSetOrderType}
          onUpdateQuantity={vi.fn()}
          onRemoveItem={vi.fn()}
          onClearCart={vi.fn()}
          onSaveCheck={vi.fn()}
          onCheckout={onCheckout}
        />,
      );

      expect(screen.getByText("Current Ticket")).toBeInTheDocument();
      expect(screen.getByText("For Here")).toBeInTheDocument();
      expect(screen.getByText("To Go")).toBeInTheDocument();
      expect(screen.getByText("Base: $10.00")).toBeInTheDocument();
      expect(screen.getByText("$12.00 each")).toBeInTheDocument();
      expect(screen.getByText("Sales Tax (6.0%)")).toBeInTheDocument();

      fireEvent.click(screen.getByText("To Go"));
      expect(onSetOrderType).toHaveBeenCalledWith("to_go");
    });
  });

  describe("POSModifiersModal", () => {
    it("renders required modifier groups and requires selection before submission", () => {
      const onSubmit = vi.fn();
      const item = {
        id: "b1",
        name: "Burger",
        price: 10,
        category: "Mains",
        modifierGroupIds: ["mg1"],
      };
      const groups = [
        {
          id: "mg1",
          name: "Choose Bun",
          required: true,
          minSelections: 1,
          maxSelections: 1,
          options: [{ id: "opt1", name: "Brioche", price: 0 }],
        },
      ];

      render(
        <POSModifiersModal
          isOpen={true}
          onClose={vi.fn()}
          item={item}
          groups={groups}
          onSubmit={onSubmit}
        />,
      );

      expect(screen.getByText("Choose Bun")).toBeInTheDocument();
      expect(screen.getByText("Brioche")).toBeInTheDocument();

      // Submit should be disabled until option is selected
      const addButton = screen.getByRole("button", { name: /Add to Ticket/i });
      expect(addButton).toBeDisabled();

      fireEvent.click(screen.getByText("Brioche"));
      expect(addButton).not.toBeDisabled();

      fireEvent.click(addButton);
      expect(onSubmit).toHaveBeenCalledWith(
        [{ id: "opt1", name: "Brioche", price: 0 }],
        undefined,
      );
    });
  });
});
