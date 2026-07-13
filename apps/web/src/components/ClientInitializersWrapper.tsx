"use client";

import React from "react";
import dynamic from "next/dynamic";

const ClientInitializers = dynamic(
  () => import("./ClientInitializers").then((mod) => mod.ClientInitializers),
  { ssr: false }
);

export function ClientInitializersWrapper() {
  return <ClientInitializers />;
}
