import React, { useState, useEffect } from "react";
import { MediaSlide } from "@soustools/api-types";

interface MediaCarouselBlockProps {
  slides: MediaSlide[];
  style?: {
    imageEffect?: string;
  };
}

export function MediaCarouselBlock({ slides, style }: MediaCarouselBlockProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides]);

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-64 bg-zinc-950 flex items-center justify-center rounded-2xl border border-zinc-800 text-zinc-600 italic">
        Media Carousel: No Slides
      </div>
    );
  }

  const activeSlide = slides[currentIndex];
  const isKenBurns = style?.imageEffect === "ken-burns";

  return (
    <div className="w-full h-72 relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-zinc-950 my-3">
      <style>{`
        @keyframes st-ken-burns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.08) translate(1%, -1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        .animate-ken-burns {
          animation: st-ken-burns 16s ease-in-out infinite;
        }
      `}</style>

      {activeSlide.videoUrl ? (
        <video
          src={activeSlide.videoUrl}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : activeSlide.imageUrl ? (
        <div className="w-full h-full overflow-hidden relative">
          <img
            src={activeSlide.imageUrl}
            alt="Carousel Slide"
            className={`w-full h-full object-cover ${isKenBurns ? "animate-ken-burns" : ""}`}
          />
        </div>
      ) : null}

      {(activeSlide.captionTitle || activeSlide.description || activeSlide.captionSubtitle || activeSlide.captionPrice) && (
        <div className="absolute bottom-4 left-4 p-4 st-glass-pill flex items-center justify-between gap-4 text-white max-w-[85%] z-10 rounded-xl">
          <div className="flex flex-col">
            {activeSlide.captionSubtitle && (
              <span className="text-[#00f0ff] text-[11px] font-black tracking-widest uppercase mb-1 block">
                {activeSlide.captionSubtitle}
              </span>
            )}
            {activeSlide.captionTitle && (
              <h4 className="text-[20px] font-bold text-white leading-tight font-brand">
                {activeSlide.captionTitle}
              </h4>
            )}
            {activeSlide.description && (
              <p className="text-xs text-zinc-300 font-sans leading-relaxed mt-0.5">
                {activeSlide.description}
              </p>
            )}
          </div>
          {activeSlide.captionPrice && (
            <span className="bg-[#00f0ff] text-[#030712] px-3.5 py-1.5 rounded-lg font-black text-[16px] flex-shrink-0 shadow-md">
              {activeSlide.captionPrice}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
