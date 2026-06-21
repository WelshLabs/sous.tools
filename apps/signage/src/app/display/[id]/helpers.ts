import { PosItem } from "@soustools/api-types";

export interface RawDbPosItem {
  id: string;
  organization_id: string;
  pos_provider: "SQUARE" | "TOAST" | "MANUAL";
  external_id: string | null;
  name: string;
  description: string | null;
  price: string | number;
  image_url: string | null;
  is_sold_out: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Maps a database representation of a POS item to a standard POS item.
 *
 * @param item - The raw database POS item.
 * @returns The standard typed POS item.
 */
export function mapDbItemToPosItem(item: RawDbPosItem): PosItem {
  return {
    id: item.id,
    organizationId: item.organization_id,
    posProvider: item.pos_provider,
    externalId: item.external_id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    imageUrl: item.image_url,
    isSoldOut: item.is_sold_out,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

/**
 * Registers a display device with the backend service.
 *
 * @param displayId - The custom name or ID of the display device.
 * @returns The registered display ID, or null if registration fails.
 */
export async function registerDisplayDevice(displayId: string): Promise<string | null> {
  const registerUrl = `${window.location.protocol}//${window.location.hostname}:6000/signage/displays/pair/register`;
  try {
    const res = await fetch(registerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `Display ${displayId}` }),
    });
    const result = await res.json();
    if (result.success && result.data?.id) {
      return result.data.id;
    }
  } catch (err) {
    console.error("Device registration request failed", err);
  }
  return null;
}

/**
 * Injects Google Fonts, custom CSS, and item animations into the document head.
 *
 * @param config - The signage layout configuration.
 * @param animCss - Optional pre-computed animations CSS string.
 */
export function injectSignageHead(config: any, animCss?: string | null): void {
  if (!config) return;

  const fontsToLoad = new Set<string>();
  if (config.googleFont) fontsToLoad.add(config.googleFont);
  if (config.designTokens?.headingFont) fontsToLoad.add(config.designTokens.headingFont);
  if (config.designTokens?.subtitleFont) fontsToLoad.add(config.designTokens.subtitleFont);
  if (config.designTokens?.bodyFont) fontsToLoad.add(config.designTokens.bodyFont);
  if (config.typography) {
    const { menuItemTitle, menuItemPrice, menuItemDescription, marketingText } = config.typography;
    if (menuItemTitle) fontsToLoad.add(menuItemTitle);
    if (menuItemPrice) fontsToLoad.add(menuItemPrice);
    if (menuItemDescription) fontsToLoad.add(menuItemDescription);
    if (marketingText) fontsToLoad.add(marketingText);
  }

  const fontIdPrefix = "signage-dynamic-font";
  document.querySelectorAll(`[id^='${fontIdPrefix}']`).forEach((el) => el.remove());
  Array.from(fontsToLoad).forEach((font, idx) => {
    const link = document.createElement("link");
    link.id = `${fontIdPrefix}-${idx}`;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${font.replace(/\s+/g, "+")}&display=swap`;
    document.head.appendChild(link);
  });

  const styleId = "signage-custom-css";
  document.getElementById(styleId)?.remove();
  const cssVars = `
    .st-signage-root {
      --global-primary: ${config.designTokens?.primaryColor || "#06b6d4"};
      --global-accent: ${config.designTokens?.accentColor || "#3b82f6"};
      --global-heading-font: ${config.designTokens?.headingFont ? `'${config.designTokens.headingFont}', sans-serif` : "inherit"};
      --global-subtitle-font: ${config.designTokens?.subtitleFont ? `'${config.designTokens.subtitleFont}', sans-serif` : "inherit"};
      --global-body-font: ${config.designTokens?.bodyFont ? `'${config.designTokens.bodyFont}', sans-serif` : "inherit"};
    }
  `;

  let finalCss = cssVars;
  if (config.designTokens?.globalCss) {
    finalCss += `\n@scope (.st-signage-root) {\n${config.designTokens.globalCss}\n}\n`;
  }
  if (config.customCss) {
    finalCss += `\n@scope (.st-signage-root) {\n${config.customCss}\n}\n`;
  }
  if (finalCss) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = finalCss;
    document.head.appendChild(style);
  }

  const animStyleId = "signage-item-animations";
  document.getElementById(animStyleId)?.remove();
  if (animCss) {
    const animStyle = document.createElement("style");
    animStyle.id = animStyleId;
    animStyle.textContent = animCss;
    document.head.appendChild(animStyle);
  }
}
