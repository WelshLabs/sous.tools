"use client";

import React from "react";
import { ApiProvider } from "@soustools/api-client/react";

export function ApiProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApiProvider config={{}}>{children}</ApiProvider>;
}
