import React from "react";
import { OrdersPanelContainer } from "@soustools/domain-inventory";
import { graphqlClient } from "@soustools/api-client";

export const dynamic = "force-dynamic";

const GET_ORDERS_PAGE_QUERY = `
  query GetOrdersData {
    vendors {
      id
      organization_id
      name
      rep_name
      rep_phone
      rep_email
      order_method
      cutoff_time
      minimum_order
      delivery_days
      created_at
      updated_at
    }
    whiteboard {
      id
      organization_id
      item_id
      custom_name
      quantity
      unit
      suggested_vendor_id
      status
      created_by
      created_at
      updated_at
    }
    purchaseOrders {
      id
      organization_id
      vendor_id
      status
      total_amount
      order_date
      delivery_date
      created_at
      updated_at
      purchase_order_items {
        id
        po_id
        item_id
        custom_name
        quantity
        unit
        unit_price
        created_at
      }
    }
  }
`;

export default async function OrdersPage() {
  let vendors = [];
  let whiteboardItems = [];
  let purchaseOrders = [];

  try {
    const res = await graphqlClient.request<{
      vendors: any[];
      whiteboard: any[];
      purchaseOrders: any[];
    }>(GET_ORDERS_PAGE_QUERY);

    if (res.data) {
      vendors = res.data.vendors || [];
      whiteboardItems = res.data.whiteboard || [];
      purchaseOrders = res.data.purchaseOrders || [];
    }
  } catch (err) {
    console.error("Failed to load orders page data via GraphQL:", err);
  }

  return (
    <OrdersPanelContainer
      initialVendors={vendors}
      initialWhiteboardItems={whiteboardItems}
      initialPurchaseOrders={purchaseOrders}
    />
  );
}
