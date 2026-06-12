"use client";

import React from "react";
import { SignageLayoutConfig } from "@soustools/api-types";
import { Eye } from "lucide-react";

/**
 * Props for the LayoutPreview component.
 */
export interface LayoutPreviewProps {
  /** The current layout configuration to render in the preview canvas. */
  config: SignageLayoutConfig;
}

/**
 * LayoutPreview renders a 16:9 preview canvas representing the signage screen output.
 *
 * @tenant-docs-export
 * View a live representation of the configured font, custom styles, active slides, and overlays in the 16:9 preview canvas.
 */
export const LayoutPreview: React.FC<LayoutPreviewProps> = ({ config }) => {
  return (
    <div className="xl:col-span-5 space-y-4">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-300">
        <Eye className="w-4 h-4 text-primary" /> Live Preview (16:9 Canvas)
      </div>

      <div className="relative aspect-video w-full rounded-xl bg-black border border-slate-800 shadow-2xl overflow-hidden flex flex-col justify-center items-center text-center p-4">
        {config.googleFont && (
          <link
            rel="stylesheet"
            href={`https://fonts.googleapis.com/css2?family=${config.googleFont.replace(
              /\s+/g,
              "+",
            )}&display=swap`}
          />
        )}
        <style>{config.customCss || ""}</style>

        <div
          className="w-full h-full flex flex-col justify-center items-center slide-container relative"
          style={{ fontFamily: config.googleFont || "inherit" }}
        >
          {config.slides.length === 0 ? (
            <p className="text-slate-600 text-xs font-mono">
              No Slides added to Playlist
            </p>
          ) : (
            <div className="text-center p-4">
              <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">
                Active Slide Preview
              </span>
              {config.slides[0].type === "MENU" && (
                <div>
                  <h3 className="text-lg font-bold text-white category-title">
                    Dinner Specials
                  </h3>
                  <div className="mt-2 p-3 bg-white/5 border border-white/10 rounded-lg menu-item">
                    <div className="flex justify-between items-center text-sm">
                      <span>Truffle Burger</span>
                      <span className="price-tag font-mono text-emerald-400">
                        $24.00
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 item-description mt-0.5">
                      Wagyu, black truffle aioli, gruyère
                    </p>
                  </div>
                </div>
              )}
              {config.slides[0].type === "IMAGE" && (
                <p className="text-xs text-blue-400 italic">
                  Image Slide: {config.slides[0].imageUrl || "empty url"}
                </p>
              )}
              {config.slides[0].type === "VIDEO" && (
                <p className="text-xs text-purple-400 italic">
                  Video Slide: {config.slides[0].videoUrl || "empty url"}
                </p>
              )}
              {config.slides[0].type === "IFRAME" && (
                <p className="text-xs text-yellow-400 italic">
                  Iframe URL: {config.slides[0].url || "empty url"}
                </p>
              )}
            </div>
          )}

          {(config.overlays || []).map((o) => (
            <div
              key={o.id}
              className={`absolute text-xs bg-slate-900/80 border border-slate-700 px-2 py-0.5 rounded shadow signage-overlay ${
                o.customCssClass || ""
              }`}
              style={{
                top: o.position.top || "auto",
                bottom: o.position.bottom || "auto",
                left: o.position.left || "auto",
                right: o.position.right || "auto",
              }}
            >
              {o.type === "BADGE" && (
                <span className="bg-red-500 text-white font-bold px-1 rounded mr-1">
                  SOLD OUT
                </span>
              )}
              {o.content}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
