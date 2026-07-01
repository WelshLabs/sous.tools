/**
 * Interface representing the structure of programmatic theme color tokens.
 * All values are specified in OKLCH format for perceptual uniformity.
 */
export interface ThemeColorTokens {
  /** Near-black base background — optimised for glare-heavy kitchen environments. */
  background: string;
  /** Near-white foreground content/text color. */
  foreground: string;
  /**
   * Brand primary — cyan/sky band (#4cc9f0).
   * Sourced from: v2/themes/glass-frosted.toml → directory style `#4cc9f0`
   *               v2/packages/ui/src/styles.css → --primary: 206 100% 50%
   */
  primary: string;
  /** Success status — emerald green for active/in-stock states. */
  success: string;
  /** Warning status — vivid amber for low-stock / pending order states. */
  warning: string;
  /** Solar orange highlight for interactive accent elements. */
  accent: string;
  /** Crimson destructive — sold-out states, interrupt actions. */
  destructive: string;
  /** Muted neutral for secondary descriptions and subtle borders. */
  muted: string;
  /**
   * Neon pink accent — sourced from glass-frosted.toml success_symbol `#f72585`.
   * Used as a secondary neon colour in dual-accent neon compositions.
   */
  neonPink: string;
}

/**
 * Dark/Cyan programmatic design token engine — the "glass-frosted" aesthetic.
 *
 * Token derivation:
 *   - Background/Foreground → v2/packages/ui/src/styles.css .dark block
 *   - Primary (cyan)        → v2/themes/glass-frosted.toml `#4cc9f0` + v2 sky-500 usage
 *   - Neon pink             → v2/themes/glass-frosted.toml `#f72585`
 *
 * Optimised for high-contrast visibility in bright, glare-heavy commercial kitchen displays.
 */
export const themeTokens = {
  colors: {
    background:  "oklch(0.12 0.01 240)",   /* zinc-950-equivalent dark plane  */
    foreground:  "oklch(0.98 0.005 240)",  /* near-white                       */
    primary:     "oklch(0.75 0.15 210)",   /* cyan #4cc9f0 band                */
    success:     "oklch(0.70 0.25 150)",   /* emerald green                    */
    warning:     "oklch(0.85 0.20 85)",    /* vivid amber                      */
    accent:      "oklch(0.65 0.25 45)",    /* solar orange                     */
    destructive: "oklch(0.60 0.25 25)",    /* pure crimson                     */
    muted:       "oklch(0.35 0.01 240)",   /* dark muted surface               */
    neonPink:    "oklch(0.58 0.28 340)",   /* #f72585 glass-frosted accent     */
  } as ThemeColorTokens,
};
