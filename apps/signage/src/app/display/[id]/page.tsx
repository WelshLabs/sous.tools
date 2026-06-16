import React from "react";
import { DisplayPlayer } from "./display-player";

export interface DisplayPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DisplayPage({ params }: DisplayPageProps) {
  const resolvedParams = await params;
  const displayId = resolvedParams.id;

  return <DisplayPlayer displayId={displayId} />;
}
