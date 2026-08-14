import { drawBase, drawBadge, drawLoadingFrame } from "./favicon-canvas";

export type FaviconStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "count"; count: number }
  | { type: "completed" }
  | { type: "alert" };

const STATIC_FAVICON = "/icons/favicon.svg";
let loadingFrame: number | null = null;

function stopLoadingAnimation() {
  if (loadingFrame !== null) cancelAnimationFrame(loadingFrame);
  loadingFrame = null;
}

function faviconLink() {
  let link = document.querySelector<HTMLLinkElement>(
    'link[data-runtime-favicon="true"]',
  );

  if (!link) {
    const existing =
      document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]');
    if (existing.length > 0) {
      link = existing[0];
      for (let i = 1; i < existing.length; i++) {
        existing[i].remove();
      }
    } else {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.dataset.runtimeFavicon = "true";
  }
  return link;
}

function startLoadingAnimation(link: HTMLLinkElement) {
  stopLoadingAnimation();
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const startedAt = performance.now();
  let lastUpdate = 0;
  const render = (now: number) => {
    if (now - lastUpdate >= 90) {
      drawLoadingFrame(ctx, 64, ((now - startedAt) % 1200) / 1200);
      link.type = "image/png";
      link.href = canvas.toDataURL("image/png");
      lastUpdate = now;
    }
    loadingFrame = requestAnimationFrame(render);
  };
  loadingFrame = requestAnimationFrame(render);
}

export function setFaviconStatus(status: FaviconStatus) {
  if (typeof document === "undefined") return;
  const link = faviconLink();
  stopLoadingAnimation();

  if (status.type === "idle") {
    link.type = "image/svg+xml";
    link.href = STATIC_FAVICON;
    return;
  }
  if (status.type === "loading") {
    startLoadingAnimation(link);
    return;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  drawBase(ctx, 64);
  drawBadge(ctx, 64, status);
  link.type = "image/png";
  link.href = canvas.toDataURL("image/png");
}

export function resetFaviconStatus() {
  setFaviconStatus({ type: "idle" });
}
