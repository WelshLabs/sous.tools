import React from "react";
import { POSRegisterContainer } from "@soustools/domain-pos";
import { api } from "@/lib/api";
export default function POSRegisterPage() {
  return <POSRegisterContainer apiInstance={api} />;
}

