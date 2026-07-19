import type { Meta, StoryObj } from "@storybook/react";
import { ComplianceSearchView } from "./ComplianceSearch.view";

const meta = {
  title: "Domain Recipes/ComplianceSearch",
  component: ComplianceSearchView,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof ComplianceSearchView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isOpen: true,
    query: "",
    setQuery: () => {},
    results: [],
    loading: false,
    error: "",
    onSearch: (e) => e.preventDefault(),
    onSelectProduct: () => {},
    onClose: () => {},
  },
};

export const WithResults: Story = {
  args: {
    isOpen: true,
    query: "Milk",
    setQuery: () => {},
    results: [
      {
        code: "123",
        product_name: "Whole Milk",
        brands: "Dairy Co",
      },
      {
        code: "456",
        product_name: "Almond Milk",
        brands: "Nutty Farms",
      },
    ],
    loading: false,
    error: "",
    onSearch: (e) => e.preventDefault(),
    onSelectProduct: () => {},
    onClose: () => {},
  },
};

export const Loading: Story = {
  args: {
    isOpen: true,
    query: "Milk",
    setQuery: () => {},
    results: [],
    loading: true,
    error: "",
    onSearch: (e) => e.preventDefault(),
    onSelectProduct: () => {},
    onClose: () => {},
  },
};

export const ErrorState: Story = {
  args: {
    isOpen: true,
    query: "Milk",
    setQuery: () => {},
    results: [],
    loading: false,
    error: "Network error occurred while searching.",
    onSearch: (e) => e.preventDefault(),
    onSelectProduct: () => {},
    onClose: () => {},
  },
};
