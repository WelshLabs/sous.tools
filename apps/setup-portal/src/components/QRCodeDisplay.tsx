"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface QRCodeDisplayProps {
  text: string;
  size?: number;
  label?: string;
}

export function QRCodeDisplay({
  text,
  size = 160,
  label,
}: QRCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: "#05070e",
        light: "#ffffff",
      },
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => console.error("QR Code Generation Error:", err));

    return () => {
      isMounted = false;
    };
  }, [text, size]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/50"
      >
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#00FFFF] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="rounded-xl border border-white/10 bg-white p-2.5 shadow-lg">
        <img
          src={dataUrl}
          alt={label || "QR Code"}
          width={size}
          height={size}
          className="rounded-lg"
        />
      </div>
      {label && (
        <span className="text-xs font-medium text-zinc-400">{label}</span>
      )}
    </div>
  );
}
