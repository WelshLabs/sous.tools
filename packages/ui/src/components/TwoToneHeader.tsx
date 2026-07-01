import * as React from "react";

/**
 * Props for the TwoToneHeader component.
 */
export interface TwoToneHeaderProps {
  /**
   * The full heading string. The first word is rendered in the default
   * foreground color; all remaining words are rendered in `text-primary`
   * (the brand cyan). Example: "Order Manager" → "Order" + " Manager".
   */
  title: string;
  /**
   * Optional breadcrumb line rendered above the heading.
   * Renders in muted-foreground at tiny tracking-widest caps.
   */
  breadcrumb?: string;
  /** Optional additional className applied to the outer wrapper. */
  className?: string;
}

/**
 * A reusable page-level heading that renders the first word of the title in
 * the default text color and all remaining words in the brand cyan (`text-primary`).
 *
 * Designed for the glass-frosted v2 aesthetic where headings use tight italic
 * uppercase tracking with a cyan accent split.
 *
 * @tenant-docs-export
 * # TwoToneHeader
 * Use this component for all primary page headings to maintain the
 * "Order **Manager**" / "Active **Orders**" visual brand pattern.
 *
 * ```tsx
 * import { TwoToneHeader } from "@soustools/ui";
 *
 * <TwoToneHeader breadcrumb="Procurement / Living Order List" title="Order Manager" />
 * ```
 */
export function TwoToneHeader({
  title,
  breadcrumb,
  className = "",
}: TwoToneHeaderProps) {
  const spaceIdx = title.indexOf(" ");
  const firstWord = spaceIdx === -1 ? title : title.slice(0, spaceIdx);
  const rest = spaceIdx === -1 ? "" : title.slice(spaceIdx); // includes leading space

  return (
    <div className={className}>
      {breadcrumb && (
        <p className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em] mb-2">
          {breadcrumb}
        </p>
      )}
      <h1 className="text-4xl font-black uppercase tracking-tighter">
        <span className="text-foreground">{firstWord}</span>
        {rest && <span className="text-primary">{rest}</span>}
      </h1>
    </div>
  );
}
