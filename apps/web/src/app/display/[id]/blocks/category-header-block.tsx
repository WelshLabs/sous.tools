import React from "react";

interface CategoryHeaderBlockProps {
  title: string;
  subtitle?: string;
  panelStyle?: string;
  badge?: string;
  className?: string;
  color?: string;
  fontSize?: string;
}

export function CategoryHeaderBlock({
  title,
  subtitle,
  panelStyle,
  badge,
  className,
  color,
  fontSize,
}: CategoryHeaderBlockProps) {
  const isGlass = panelStyle === "glass";
  const containerClasses = [
    isGlass
      ? " p-6 rounded-2xl relative my-4 flex flex-col gap-1.5"
      : "py-4 flex flex-col gap-1",
    "st-category-header",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      <div className="flex items-start justify-between gap-4">
        <h2
          className="font-brand text-3xl font-extrabold tracking-tight text-white uppercase"
          style={{ color, fontSize }}
        >
          {title}
        </h2>
        {badge && (
          <span className="rounded bg-red-500 px-2.5 py-1 text-[10px] font-black tracking-wider whitespace-nowrap text-white uppercase">
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-muted-foreground font-sans text-sm font-semibold tracking-wide">
          {subtitle}
        </p>
      )}
    </div>
  );
}
