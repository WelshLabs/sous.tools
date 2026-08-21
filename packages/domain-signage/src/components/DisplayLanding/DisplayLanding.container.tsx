"use client";

import { DisplayLandingView } from "./DisplayLanding.view";

export function DisplayLandingContainer() {
  const handleLaunch = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/display/default-tv";
    }
  };

  return <DisplayLandingView onLaunch={handleLaunch} />;
}

export { DisplayLandingContainer as DisplayLanding };
