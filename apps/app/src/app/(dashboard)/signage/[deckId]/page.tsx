"use client";

import React, { use } from "react";
import TVSignageEditorClient from "./tv-signage-editor-client";

interface PageProps {
  params: Promise<{ deckId: string }>;
}

export default function TVSignageEditorPage({ params }: PageProps) {
  const { deckId } = use(params);
  return <TVSignageEditorClient deckId={deckId} />;
}
