"use client";

import React, { useEffect, useState } from "react";

interface ScaleWrapperProps {
  children: React.ReactNode;
}

export function ScaleWrapper({ children }: ScaleWrapperProps) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const scaleX = window.innerWidth / 1920;
      const scaleY = window.innerHeight / 1080;
      setScale(Math.min(scaleX, scaleY));
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-black flex items-center justify-center relative">
      <div
        className="w-[1920px] h-[1080px] shrink-0 origin-center transform-gpu"
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
