"use client";

import React from "react";
import { ApiProvider } from "@soustools/api-client/react";
import { refreshAuthSession } from "@soustools/api-client";
import { useRouter } from "next/navigation";

export function ApiProviderWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <ApiProvider
      config={{
        onTokenRefresh: async () => {
          return await refreshAuthSession();
        },
        onLogout: () => {
          console.warn("[ApiProvider] Hard auth failure. Redirecting to login...");
          router.push("/login");
        },
      }}
    >
      {children}
    </ApiProvider>
  );
}
