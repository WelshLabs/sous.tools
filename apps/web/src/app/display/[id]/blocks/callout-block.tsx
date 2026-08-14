import React from "react";

interface CalloutBlockProps {
  icon?: string;
  text: string;
  panelStyle?: "glass" | "none";
  accentBorder?: boolean;
  orientation?: "horizontal" | "vertical";
  className?: string;
  textColor?: string;
  fontSize?: string;
  backgroundOpacity?: number;
  title?: string;
  message?: string;
}

export function CalloutBlock({
  icon,
  text,
  panelStyle,
  accentBorder,
  orientation = "horizontal",
  className,
  textColor,
  fontSize,
  backgroundOpacity,
  title,
  message,
}: CalloutBlockProps) {
  const isGlass = panelStyle === "glass";
  const isVertical = orientation === "vertical";

  const containerClasses = [
    "p-5 rounded-2xl flex gap-4 text-zinc-200 my-2",
    isVertical
      ? "flex-col items-center justify-center text-center"
      : "items-center",
    isGlass
      ? ""
      : panelStyle !== "none"
        ? "bg-card border border-zinc-800"
        : "",
    accentBorder ? "border-l-4 border-l-[oklch(0.70_0.25_150)]" : "",
    "st-callout",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const bgStyle =
    backgroundOpacity !== undefined && !isGlass && panelStyle !== "none"
      ? { backgroundColor: `rgba(24, 24, 27, ${backgroundOpacity})` }
      : {};

  return (
    <div className={containerClasses} style={bgStyle}>
      {icon && (
        <span className="animate-bounce-slow flex-shrink-0 text-2xl">
          {icon}
        </span>
      )}
      <div
        className="flex flex-grow flex-col items-center justify-center gap-1"
        style={{ color: textColor }}
      >
        {title && (
          <span
            className="text-lg font-bold tracking-wide"
            style={{ fontSize }}
          >
            {title}
          </span>
        )}
        {message && (
          <span
            className="leading-snug"
            style={{
              fontSize: fontSize ? `calc(${fontSize} * 0.75)` : undefined,
            }}
          >
            {message}
          </span>
        )}
        {!title && !message && text && (
          <p
            className={`leading-relaxed ${
              isVertical
                ? "text-[15px] leading-snug font-black tracking-widest text-[#f8fafc] uppercase"
                : "font-sans text-sm font-semibold tracking-wide"
            }`}
            style={{ fontSize }}
          >
            {text}
          </p>
        )}
      </div>
      {!isVertical && icon && (
        <span className="animate-bounce-slow flex-shrink-0 text-2xl">
          {icon}
        </span>
      )}
    </div>
  );
}
