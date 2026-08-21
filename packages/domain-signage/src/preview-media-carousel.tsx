"use client";
import * as React from "react";
import { type MediaSlide } from "@soustools/api-types";

export const PreviewMediaCarousel = ({ block }: { block: any }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const slides: MediaSlide[] = block.slides || [];
  const duration = block.slideDuration || 5000;

  React.useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, duration);
    return () => clearInterval(interval);
  }, [slides.length, duration]);

  const objectFitClass =
    block.objectFit === "contain"
      ? "object-contain"
      : block.objectFit === "fill"
        ? "object-fill"
        : "object-cover";

  const currentSlide = slides[activeIndex] || slides[0];

  return (
    <div
      className="border-border st-media-carousel relative flex h-full min-h-[220px] w-full flex-col justify-end overflow-hidden rounded-2xl border bg-[oklch(0.08_0.01_260)] shadow-2xl"
      data-unique-id={block.uniqueSelector}
    >
      {slides.length > 0 ? (
        <>
          {slides.map((slide, i) => {
            const isActive = i === activeIndex;
            const bgImg =
              slide.imageUrl ||
              "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop&q=80";
            return (
              <div
                key={slide.id || i}
                className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${
                  isActive ? "z-10 opacity-100" : "z-0 opacity-0"
                }`}
              >
                <img
                  src={bgImg}
                  alt={slide.captionTitle || `slide-${i}`}
                  className={`h-full w-full ${objectFitClass}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              </div>
            );
          })}

          {/* Slide Indicator Dots */}
          {slides.length > 1 && (
            <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 backdrop-blur-md">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-4 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                      : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Slide Caption Box */}
          {currentSlide && (
            <div className="relative z-20 w-full p-4">
              {currentSlide.layout === "bottom-bar" ? (
                <div className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/15 bg-black/60 p-3.5 shadow-2xl backdrop-blur-xl">
                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-center gap-2">
                      {currentSlide.badge && (
                        <span className="rounded bg-cyan-500 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-black uppercase">
                          {currentSlide.badge}
                        </span>
                      )}
                      <h4 className="truncate text-sm font-bold tracking-wide text-white">
                        {currentSlide.captionTitle}
                      </h4>
                    </div>
                    {currentSlide.captionSubtitle && (
                      <p className="mt-0.5 line-clamp-1 text-[9px] text-zinc-300">
                        {currentSlide.captionSubtitle}
                      </p>
                    )}
                  </div>
                  {currentSlide.captionPrice && (
                    <span className="shrink-0 font-mono text-base font-bold text-cyan-400">
                      {currentSlide.captionPrice}
                    </span>
                  )}
                </div>
              ) : currentSlide.layout === "split" ? (
                <div className="flex max-w-md flex-col gap-1.5 rounded-xl border border-white/15 bg-black/70 p-4 shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold tracking-wide text-white">
                      {currentSlide.captionTitle}
                    </h4>
                    {currentSlide.captionPrice && (
                      <span className="font-mono text-sm font-bold text-cyan-400">
                        {currentSlide.captionPrice}
                      </span>
                    )}
                  </div>
                  {currentSlide.captionSubtitle && (
                    <p className="text-[9px] leading-relaxed text-zinc-300">
                      {currentSlide.captionSubtitle}
                    </p>
                  )}
                </div>
              ) : currentSlide.layout === "minimal" ? (
                <div className="flex flex-col gap-1 drop-shadow-md">
                  {currentSlide.badge && (
                    <span className="self-start rounded bg-cyan-400 px-2 py-0.5 text-[8px] font-black tracking-wider text-black uppercase">
                      {currentSlide.badge}
                    </span>
                  )}
                  <div className="flex items-baseline gap-3">
                    <h4 className="text-xl font-black tracking-tight text-white">
                      {currentSlide.captionTitle}
                    </h4>
                    {currentSlide.captionPrice && (
                      <span className="font-mono text-lg font-bold text-cyan-400">
                        {currentSlide.captionPrice}
                      </span>
                    )}
                  </div>
                  {currentSlide.captionSubtitle && (
                    <p className="line-clamp-2 max-w-lg text-[10px] text-zinc-200">
                      {currentSlide.captionSubtitle}
                    </p>
                  )}
                </div>
              ) : (
                /* Default "overlay-card" */
                <div className="flex max-w-md flex-col gap-1 rounded-xl border border-cyan-500/30 bg-zinc-950/80 p-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {currentSlide.badge && (
                        <span className="rounded bg-cyan-400 px-1.5 py-0.5 text-[8px] font-black tracking-wider text-black uppercase">
                          {currentSlide.badge}
                        </span>
                      )}
                      <h4 className="truncate text-xs font-bold tracking-wide text-white">
                        {currentSlide.captionTitle}
                      </h4>
                    </div>
                    {currentSlide.captionPrice && (
                      <span className="shrink-0 font-mono text-xs font-bold text-cyan-400">
                        {currentSlide.captionPrice}
                      </span>
                    )}
                  </div>
                  {currentSlide.captionSubtitle && (
                    <p className="line-clamp-2 text-[8px] leading-tight text-zinc-300 opacity-90">
                      {currentSlide.captionSubtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase">
            Media Carousel
          </span>
          <span className="text-muted-foreground mt-1 text-[10px] italic">
            Add slides or link menu items in the block settings inspector.
          </span>
        </div>
      )}
    </div>
  );
};
