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
    className
  ].filter(Boolean).join(" ");

  return (
    <div className={containerClasses}>
      <div className="flex justify-between items-start gap-4">
        <h2 className="text-3xl font-extrabold tracking-tight uppercase text-white font-brand" style={{ color, fontSize }}>
          {title}
        </h2>
        {badge && (
          <span className="text-[10px] px-2.5 py-1 font-black bg-red-500 text-white rounded uppercase tracking-wider whitespace-nowrap">
            {badge}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="text-sm font-semibold text-muted-foreground font-sans tracking-wide">
          {subtitle}
        </p>
      )}
    </div>
  );
}
