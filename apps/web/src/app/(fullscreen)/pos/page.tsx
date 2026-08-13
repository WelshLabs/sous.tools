import React, { Suspense } from "react";
import { POSRegisterContainer } from "@soustools/domain-pos";

export default function POSRegisterPage() {
  return (
    <Suspense fallback={<div>Loading POS...</div>}>
      <POSRegisterContainer />
    </Suspense>
  );
}
