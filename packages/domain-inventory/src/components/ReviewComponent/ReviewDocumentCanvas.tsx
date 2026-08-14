"use client";

export interface BoundingBox {
  id: string;
  type: "PROSE" | "RECIPE" | "INVOICE";
  bbox: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000 normalized
}

export interface ReviewDocumentCanvasProps {
  pageNumber: number;
  totalPages: number;
  imageUrl?: string;
  boxes?: BoundingBox[];
  activeBlockId?: string | null;
  onSelectBlock?: (id: string) => void;
}

export function ReviewDocumentCanvas({
  pageNumber,
  imageUrl,
  boxes = [],
  activeBlockId,
  onSelectBlock,
}: ReviewDocumentCanvasProps) {
  return (
    <div className="relative flex aspect-[1/1.4] max-h-[70vh] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Document Page ${pageNumber}`}
          className="h-full w-full object-contain"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-lg bg-zinc-900/40 p-6 text-zinc-600">
          <svg
            className="mb-2 h-16 w-16 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="font-mono text-xs tracking-wider text-zinc-400 uppercase">
            Document Page {pageNumber} Rendering
          </span>
        </div>
      )}

      {/* 2D Bounding Boxes Overlay */}
      <div className="pointer-events-none absolute inset-0 p-4">
        {boxes.map((box) => {
          const [ymin, xmin, ymax, xmax] = box.bbox;
          const top = `${ymin / 10}%`;
          const left = `${xmin / 10}%`;
          const width = `${(xmax - xmin) / 10}%`;
          const height = `${(ymax - ymin) / 10}%`;
          const isActive = box.id === activeBlockId;

          const colorClass =
            box.type === "RECIPE"
              ? "border-amber-400/80 bg-amber-400/10"
              : box.type === "INVOICE"
                ? "border-blue-400/80 bg-blue-400/10"
                : "border-emerald-400/80 bg-emerald-400/10";

          return (
            <div
              key={box.id}
              onClick={() => onSelectBlock?.(box.id)}
              style={{ top, left, width, height }}
              className={`pointer-events-auto absolute cursor-pointer rounded border-2 transition-all ${colorClass} ${
                isActive
                  ? "z-20 scale-[1.01] ring-2 ring-white"
                  : "z-10 opacity-75 hover:opacity-100"
              }`}
            >
              <span className="absolute -top-5 left-0 rounded border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 text-[9px] font-bold text-zinc-100 uppercase">
                {box.type}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
