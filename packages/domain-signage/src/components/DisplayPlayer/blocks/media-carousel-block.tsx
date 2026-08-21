import { useState, useEffect } from "react";
import { type MediaSlide } from "@soustools/api-types";

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
      <div className="bg-card flex h-64 w-full items-center justify-center rounded-2xl border border-zinc-800 text-zinc-600 italic">
        Media Carousel: No Slides
      </div>
    );
  }

  const activeSlide = slides[currentIndex];
  const isKenBurns = style?.imageEffect === "ken-burns";

  return (
    <div className="bg-card relative my-3 h-72 w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
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
          className="h-full w-full object-cover"
        />
      ) : activeSlide.imageUrl ? (
        <div className="relative h-full w-full overflow-hidden">
          <img
            src={activeSlide.imageUrl}
            alt="Carousel Slide"
            className={`h-full w-full object-cover ${isKenBurns ? "animate-ken-burns" : ""}`}
          />
        </div>
      ) : null}

      {(activeSlide.captionTitle ||
        activeSlide.description ||
        activeSlide.captionSubtitle ||
        activeSlide.captionPrice) && (
        <div className="st-glass-pill absolute bottom-4 left-4 z-10 flex max-w-[85%] items-center justify-between gap-4 rounded-xl p-4 text-white">
          <div className="flex flex-col">
            {activeSlide.captionSubtitle && (
              <span className="mb-1 block text-[11px] font-black tracking-widest text-[#00f0ff] uppercase">
                {activeSlide.captionSubtitle}
              </span>
            )}
            {activeSlide.captionTitle && (
              <h4 className="font-brand text-[20px] leading-tight font-bold text-white">
                {activeSlide.captionTitle}
              </h4>
            )}
            {activeSlide.description && (
              <p className="mt-0.5 font-sans text-xs leading-relaxed text-zinc-300">
                {activeSlide.description}
              </p>
            )}
          </div>
          {activeSlide.captionPrice && (
            <span className="flex-shrink-0 rounded-lg bg-[#00f0ff] px-3.5 py-1.5 text-[16px] font-black text-[#030712] shadow-md">
              {activeSlide.captionPrice}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
