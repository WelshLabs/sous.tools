import { cn } from "../utils/cn";

/**
 * AuroraBackground — reusable animated neon orb field.
 *
 * Renders drifting, colored radial orbs driven entirely by design tokens.
 * Drop it as the first child of any `relative` container:
 *
 *   <div className="relative">
 *     <AuroraBackground />
 *     ...content...
 *   </div>
 *
 * The animation lives in `.aurora-field` / `.aurora-orb*` in globals.css so it
 * can also be used without React via the plain `.aurora-field` CSS helper.
 */
export function AuroraBackground({
  className,
  fixed = false,
}: {
  className?: string;
  /** Pin to the viewport instead of the nearest positioned ancestor. */
  fixed?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("aurora-field", fixed && "!fixed", className)}
    >
      <span className="aurora-orb aurora-orb--primary" />
      <span className="aurora-orb aurora-orb--accent" />
      <span className="aurora-orb aurora-orb--violet" />
    </div>
  );
}
