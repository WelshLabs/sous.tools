"use client";
import * as React from "react";


export const PreviewMediaCarousel = ({ block }: { block: any }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const slides = block.slides || [];
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
  const classes = [
    "relative overflow-hidden w-full h-full min-h-[200px] bg-zinc-50 dark:bg-zinc-950 rounded border border-black/5 dark:border-white/5 flex items-center justify-center text-[9px] st-media-carousel",
    block.className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} data-unique-id={block.uniqueSelector}>
      {slides.length > 0 ? (
        slides.map((slide: any, i: number) => {
          if (!slide.imageUrl) return null;
          const isActive = i === activeIndex;
          return (
            <img
              key={i}
              src={slide.imageUrl}
              alt={`slide-${i}`}
              className={`absolute inset-0 w-full h-full ${objectFitClass} transition-opacity duration-700 ease-in-out ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"}`}
            />
          );
        })
      ) : (
        <span className="text-zinc-500 italic relative z-20">
          Media Carousel Preview
        </span>
      )}
    </div>
  );
};
