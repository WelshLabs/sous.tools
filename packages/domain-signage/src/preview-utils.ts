"use client";

export const getTypoStyle = (
  block: any,
  context: "heading" | "subtitle" | "body",
  field: string = "typography",
) => {
  const typo = block.visuals?.[field] || {};
  return {
    fontFamily: typo.fontFamily
      ? `'${typo.fontFamily}', sans-serif`
      : `var(--global-${context}-font)`,
    color: typo.color || `var(--global-${context}-color)`,
    fontWeight: typo.fontWeight || `var(--global-${context}-weight)`,
    fontSize: typo.fontSize || undefined,
    textAlign: typo.textAlign || undefined,
  };
};
