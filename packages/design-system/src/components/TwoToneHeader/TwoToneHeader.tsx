/**
 * Props for the TwoToneHeader component.
 */
export interface TwoToneHeaderProps {
  /**
   * The full heading string. The first word is rendered in `text-foreground`
   * (zinc-50); all remaining words are rendered in `text-primary`
   * (Neon-Glass cyan #4cc9f0).
   *
   * @example "Order Manager" → "Order" (white) + " Manager" (cyan)
   */
  title: string;
  /**
   * Optional breadcrumb line rendered above the heading in muted uppercase
   * tracking. E.g. "Procurement / Living Order List".
   */
  breadcrumb?: string;
  /**
   * Optional right-side slot — render a badge, tag, or icon cluster here.
   */
  trailing?: React.ReactNode;
  /** Additional className applied to the outer wrapper `<div>`. */
  className?: string;
}

/**
 * Page-level heading component for the Neon-Glass design language.
 *
 * Renders the first word of `title` in the default foreground color and all
 * remaining words in the brand cyan (`--color-primary: #4cc9f0`). Pairs with
 * an optional breadcrumb line and a trailing slot for actions or badges.
 *
 * Used on every primary route page to enforce the "Order **Manager**" /
 * "Active **Orders**" brand split pattern.
 *
 * @tenant-docs-export
 * # TwoToneHeader
 * ```tsx
 * import { TwoToneHeader } from "@soustools/design-system";
 *
 * <TwoToneHeader
 *   breadcrumb="Procurement / Living Order List"
 *   title="Order Manager"
 * />
 * ```
 */
export function TwoToneHeader({
  title,
  breadcrumb,
  trailing,
  className = "",
}: TwoToneHeaderProps) {
  const spaceIdx = title.indexOf(" ");
  const firstWord = spaceIdx === -1 ? title : title.slice(0, spaceIdx);
  const rest = spaceIdx === -1 ? "" : title.slice(spaceIdx); // leading space preserved

  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div>
        {breadcrumb && (
          <p
            className="mb-2 text-[10px] font-black tracking-[0.2em] uppercase"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {breadcrumb}
          </p>
        )}
        <h1 className="text-4xl leading-none font-black tracking-tighter uppercase">
          <span style={{ color: "var(--color-foreground)" }}>{firstWord}</span>
          {rest && (
            <span className="bg-[linear-gradient(110deg,var(--primary),var(--accent),var(--violet))] bg-clip-text text-transparent">
              {rest}
            </span>
          )}
        </h1>
        <span
          aria-hidden="true"
          className="mt-3 block h-px w-16 bg-[linear-gradient(90deg,var(--primary),var(--accent),transparent)] shadow-[0_0_14px_rgb(var(--ds-neon-accent-rgb)/0.45)]"
        />
      </div>
      {trailing && (
        <div className="mt-1 flex shrink-0 items-center gap-2">{trailing}</div>
      )}
    </div>
  );
}
