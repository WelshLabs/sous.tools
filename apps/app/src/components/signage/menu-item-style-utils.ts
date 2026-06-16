import React from "react";
import { MenuItemStateStyle, MenuItemStyles, HighlightAnimation, PosItem } from "@soustools/api-types";
import { HighlightItemConfig } from "@soustools/api-types";

/** Build inline card container styles from a state style object. */
export function buildCardStyle(style: MenuItemStateStyle): React.CSSProperties {
  const css: React.CSSProperties = {};
  if (style.backgroundColor) css.backgroundColor = style.backgroundColor;
  if (style.borderColor) css.borderColor = style.borderColor;
  if (style.borderWidth !== undefined) css.borderWidth = `${style.borderWidth}px`;
  if (style.borderRadius) css.borderRadius = style.borderRadius;
  if (style.shadow) css.boxShadow = style.shadow;
  if (style.cardPadding) css.padding = style.cardPadding;
  if (style.dimOpacity !== undefined) css.opacity = style.dimOpacity;
  if (style.grayscale) css.filter = "grayscale(1)";
  if (style.animation && style.animation !== "none") {
    css.animationName = style.animation;
    css.animationDuration = "2s";
    css.animationIterationCount = "infinite";
    css.animationTimingFunction = "ease-in-out";
  }
  return css;
}

/** Build inline title text styles from a state style object. */
export function buildTitleStyle(style: MenuItemStateStyle): React.CSSProperties {
  const css: React.CSSProperties = {};
  if (style.titleFont) css.fontFamily = style.titleFont;
  if (style.titleColor) css.color = style.titleColor;
  if (style.titleSize) css.fontSize = `${style.titleSize}rem`;
  if (style.titleWeight) css.fontWeight = style.titleWeight;
  if (style.strikethrough) css.textDecoration = "line-through";
  return css;
}

/** Build inline price text styles from a state style object. */
export function buildPriceStyle(style: MenuItemStateStyle): React.CSSProperties {
  const css: React.CSSProperties = {};
  if (style.priceFont) css.fontFamily = style.priceFont;
  if (style.priceColor) css.color = style.priceColor;
  if (style.priceSize) css.fontSize = `${style.priceSize}rem`;
  if (style.priceWeight) css.fontWeight = style.priceWeight;
  return css;
}

/** Build inline description text styles from a state style object. */
export function buildDescriptionStyle(style: MenuItemStateStyle): React.CSSProperties {
  const css: React.CSSProperties = {};
  if (style.descriptionFont) css.fontFamily = style.descriptionFont;
  if (style.descriptionColor) css.color = style.descriptionColor;
  if (style.descriptionSize) css.fontSize = `${style.descriptionSize}rem`;
  return css;
}

/** Resolve which state style applies to a given item. */
export function resolveItemState(
  item: PosItem,
  isHighlighted: boolean,
  styles: MenuItemStyles
): MenuItemStateStyle {
  if (item.isSoldOut) return styles.soldOut;
  if (isHighlighted) return styles.highlighted;
  return styles.regular;
}

/** Check if an item matches the highlight list. */
export function isItemHighlighted(
  item: PosItem,
  highlightItems?: (string | HighlightItemConfig)[]
): boolean {
  if (!highlightItems) return false;
  return highlightItems.some((h) => {
    if (!h) return false;
    if (typeof h === "string") {
      return h === item.id || h === item.squareId || h.toLowerCase() === item.name.toLowerCase();
    }
    return h.itemId === item.id || h.itemId === item.squareId;
  });
}

/** Return CSS @keyframes for the given animation preset. */
export function buildAnimationCss(animation?: HighlightAnimation): string {
  if (!animation || animation === "none") return "";
  const keyframes: Record<Exclude<HighlightAnimation, "none">, string> = {
    "pulse-glow": `@keyframes pulse-glow {
  0%,100% { box-shadow: 0 0 12px -3px oklch(0.60 0.25 250); }
  50% { box-shadow: 0 0 28px -2px oklch(0.60 0.25 250); }
}`,
    shimmer: `@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}`,
    "bounce-scale": `@keyframes bounce-scale {
  0%,100% { transform: scale(1); }
  50% { transform: scale(1.025); }
}`,
    "border-flash": `@keyframes border-flash {
  0%,100% { border-color: oklch(0.60 0.25 250); }
  50% { border-color: oklch(0.80 0.30 250); }
}`,
  };
  return keyframes[animation as Exclude<HighlightAnimation, "none">] ?? "";
}

/** Collect CSS for all animations used in a MenuItemStyles config. */
export function buildAllAnimationCss(styles: MenuItemStyles): string {
  const animations = new Set<HighlightAnimation>();
  if (styles.regular.animation) animations.add(styles.regular.animation);
  if (styles.highlighted.animation) animations.add(styles.highlighted.animation);
  if (styles.soldOut.animation) animations.add(styles.soldOut.animation);
  return Array.from(animations).map(buildAnimationCss).filter(Boolean).join("\n");
}
