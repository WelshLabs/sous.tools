import React from "react";

interface CalloutBlockProps {
  icon?: string;
  text: string;
  panelStyle?: 'glass' | 'none';
  accentBorder?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function CalloutBlock({
  icon,
  text,
  panelStyle,
  accentBorder,
  orientation = "horizontal",
  className,
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

  return (
    <div className={containerClasses}>
      {icon && (
        <span className="text-2xl flex-shrink-0 animate-bounce-slow">
          {icon}
        </span>
      )}
      <p className={`leading-relaxed flex-grow ${
        isVertical
          ? "text-[#f8fafc] text-[15px] font-black tracking-widest uppercase leading-snug"
          : "text-sm font-semibold tracking-wide font-sans"
      }`}>
        {text}
      </p>
      {!isVertical && icon && (
        <span className="text-2xl flex-shrink-0 animate-bounce-slow">
          {icon}
        </span>
      )}
    </div>
  );
}
