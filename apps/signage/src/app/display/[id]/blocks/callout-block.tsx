import React from "react";

interface CalloutBlockProps {
  icon?: string;
  text: string;
  panelStyle?: 'glass' | 'none';
  accentBorder?: boolean;
  orientation?: 'horizontal' | 'vertical';
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
    "p-5 rounded-2xl flex gap-4 text-slate-200 my-2",
    isVertical ? "flex-col items-center justify-center text-center" : "items-center",
    isGlass ? "st-glass-panel" : (panelStyle !== "none" ? "bg-zinc-900 border border-zinc-800" : ""),
    accentBorder ? "border-l-4 border-l-[oklch(0.70_0.25_150)]" : "",
    "st-callout",
    className
  ].filter(Boolean).join(" ");

  const bgStyle = backgroundOpacity !== undefined && !isGlass && panelStyle !== "none" ? { backgroundColor: `rgba(24, 24, 27, ${backgroundOpacity})` } : {};

  return (
    <div className={containerClasses} style={bgStyle}>
      {icon && (
        <span className="text-2xl flex-shrink-0 animate-bounce-slow">
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-1 items-center justify-center flex-grow" style={{ color: textColor }}>
        {title && <span className="font-bold tracking-wide text-lg" style={{ fontSize }}>{title}</span>}
        {message && <span className="leading-snug" style={{ fontSize: fontSize ? `calc(${fontSize} * 0.75)` : undefined }}>{message}</span>}
        {!title && !message && text && (
          <p className={`leading-relaxed ${
            isVertical
              ? "text-[#f8fafc] text-[15px] font-black tracking-widest uppercase leading-snug"
              : "text-sm font-semibold tracking-wide font-sans"
          }`} style={{ fontSize }}>
            {text}
          </p>
        )}
      </div>
      {!isVertical && icon && (
        <span className="text-2xl flex-shrink-0 animate-bounce-slow">
          {icon}
        </span>
      )}
    </div>
  );
}
