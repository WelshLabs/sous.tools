"use client";

import { type SignageBlock, type GlobalDesignTokens } from "@soustools/api-types";

interface TypographyControlsProps {
  block: SignageBlock;
  onUpdate: (updates: Partial<SignageBlock>) => void;
  globalTokens?: GlobalDesignTokens;
  context?: "heading" | "subtitle" | "body";
  targetField?: "typography" | "subtitleTypography" | "badgeTypography";
}

export function TypographyControls({
  block,
  onUpdate,
  globalTokens,
  context = "body",
  targetField = "typography",
}: TypographyControlsProps) {
  const visuals = block.visuals || {};
  const typo = (visuals as any)[targetField] || {};

  const updateTypo = (updates: Partial<typeof typo>) => {
    onUpdate({
      visuals: { ...visuals, [targetField]: { ...typo, ...updates } },
    });
  };

  const defaultFontFamily =
    context === "heading"
      ? globalTokens?.headingFont
      : context === "subtitle"
        ? globalTokens?.subtitleFont
        : globalTokens?.bodyFont;
  const defaultColor =
    context === "heading"
      ? globalTokens?.headingColor
      : context === "subtitle"
        ? globalTokens?.subtitleColor
        : globalTokens?.bodyColor;
  const defaultWeight =
    context === "heading"
      ? globalTokens?.headingWeight
      : context === "subtitle"
        ? globalTokens?.subtitleWeight
        : globalTokens?.bodyWeight;

  const defaultHexFallback = /^#[0-9A-Fa-f]{6}$/i.test(defaultColor || "")
    ? defaultColor
    : "#ffffff";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-muted-foreground uppercase block mb-1">
            Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={
                /^#[0-9A-Fa-f]{6}$/i.test(typo.color || "")
                  ? typo.color
                  : defaultHexFallback
              }
              onChange={(e) => updateTypo({ color: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0"
            />
            <input
              type="text"
              placeholder={`Global Default ${defaultColor ? `(${defaultColor})` : ""}`}
              value={typo.color || ""}
              onChange={(e) => updateTypo({ color: e.target.value })}
              className="w-full bg-card border border-border rounded px-2 py-1 text-xs text-foreground placeholder:text-zinc-600"
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] text-muted-foreground uppercase block">
              Font Size
            </label>
            <span className="text-[10px] text-cyan-400 font-mono">
              {typo.fontSize || "Default"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="8"
              max="144"
              step="1"
              value={typo.fontSize ? parseInt(typo.fontSize) : 24}
              onChange={(e) => updateTypo({ fontSize: `${e.target.value}px` })}
              className="w-full accent-cyan-500 h-1.5 bg-secondary rounded appearance-none cursor-pointer"
            />
            {typo.fontSize && (
              <button
                onClick={() => updateTypo({ fontSize: undefined })}
                className="text-[10px] text-muted-foreground hover:text-muted-foreground shrink-0"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-muted-foreground uppercase block mb-1">
            Font Weight
          </label>
          <select
            value={typo.fontWeight || ""}
            onChange={(e) => updateTypo({ fontWeight: e.target.value })}
            className="w-full bg-card border border-border rounded px-2 py-1.5 text-xs text-foreground"
          >
            <option value="">
              Global Default {defaultWeight ? `(${defaultWeight})` : ""}
            </option>
            <option value="normal">Normal</option>
            <option value="bold">Bold</option>
            <option value="100">100 - Thin</option>
            <option value="300">300 - Light</option>
            <option value="500">500 - Medium</option>
            <option value="700">700 - Bold</option>
            <option value="900">900 - Black</option>
          </select>
        </div>
        <div>
          <label className="text-[10px] text-muted-foreground uppercase block mb-1">
            Alignment
          </label>
          <select
            value={typo.textAlign || ""}
            onChange={(e) => updateTypo({ textAlign: e.target.value as any })}
            className="w-full bg-card border border-border rounded px-2 py-1.5 text-xs text-foreground"
          >
            <option value="">Default</option>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-[10px] text-muted-foreground uppercase block mb-1">
          Font Family
        </label>
        <select
          value={typo.fontFamily || ""}
          onChange={(e) => updateTypo({ fontFamily: e.target.value })}
          className="w-full bg-card border border-border rounded px-2 py-1.5 text-xs text-foreground"
        >
          <option value="">
            Global Default {defaultFontFamily ? `(${defaultFontFamily})` : ""}
          </option>
          <option value="Inter">Inter</option>
          <option value="Roboto">Roboto</option>
          <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
          <option value="Outfit">Outfit</option>
          <option value="Oswald">Oswald</option>
          <option value="Playfair Display">Playfair Display</option>
          <option value="Merriweather">Merriweather</option>
          <option value="Montserrat">Montserrat</option>
          <option value="Lora">Lora</option>
          <option value="Lato">Lato</option>
          <option value="Poppins">Poppins</option>
          <option value="Nunito">Nunito</option>
          <option value="Raleway">Raleway</option>
        </select>
      </div>
    </div>
  );
}
