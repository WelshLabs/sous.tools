import React from "react";
import { SelfShopContainer } from "@soustools/domain-inventory";

interface ShopPageProps {
  params: Promise<{ id: string }>;
}

export default async function ShopPage({ params }: ShopPageProps) {
  const { id } = await params;
  return <SelfShopContainer orderId={id} />;
}
