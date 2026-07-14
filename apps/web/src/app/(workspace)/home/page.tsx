"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  AuroraBackground,
  PrimaryLogo,
  useOmnibarContext,
} from "@soustools/design-system";

export const dynamic = "force-dynamic";

function ShareTargetHandler() {
  const searchParams = useSearchParams();
  const { setInputText, setIsOpen } = useOmnibarContext();

  useEffect(() => {
    const title = searchParams.get("title");
    const text = searchParams.get("text");
    const url = searchParams.get("url");

    if (title || text || url) {
      const shareContent = [
        title ? `Title: ${title}` : "",
        text ? `Text: ${text}` : "",
        url ? `URL: ${url}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      setInputText(
        `I shared this with you:\n${shareContent}\n\nCan you analyze it?`,
      );
      setIsOpen(true);
    }
  }, [searchParams, setInputText, setIsOpen]);

  return null;
}

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
      <AuroraBackground />
      <Suspense fallback={null}>
        <ShareTargetHandler />
      </Suspense>
      <PrimaryLogo gradient className="h-24 w-auto mb-8" />
    </div>
  );
}
