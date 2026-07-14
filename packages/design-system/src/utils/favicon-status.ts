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
    link = document.createElement("link");
    link.rel = "icon";
    link.dataset.runtimeFavicon = "true";
    document.head.appendChild(link);
  }
  return link;
}

function drawBase(ctx: CanvasRenderingContext2D, size: number) {
  const scale = size / 64;
  ctx.fillStyle = "#050816";
  ctx.beginPath();
  ctx.roundRect(1, 1, size - 2, size - 2, 14 * scale);
  ctx.fill();
  ctx.strokeStyle = "#3867ff";
  ctx.lineWidth = 2 * scale;
  ctx.stroke();

  ctx.strokeStyle = "#48dfff";
  ctx.fillStyle = "#48dfff";
  ctx.lineWidth = 5.5 * scale;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(14 * scale, 43 * scale);
  ctx.bezierCurveTo(
    5 * scale,
    42 * scale,
    7 * scale,
    27 * scale,
    17 * scale,
    22 * scale,
  );
  ctx.bezierCurveTo(
    15 * scale,
    10 * scale,
    29 * scale,
    8 * scale,
    32 * scale,
    19 * scale,
  );
  ctx.bezierCurveTo(
    35 * scale,
    8 * scale,
    49 * scale,
    10 * scale,
    47 * scale,
    22 * scale,
  );
  ctx.bezierCurveTo(
    57 * scale,
    27 * scale,
    59 * scale,
    42 * scale,
    50 * scale,
    43 * scale,
  );
  ctx.closePath();
  ctx.stroke();
  ctx.fillRect(15 * scale, 49 * scale, 34 * scale, 7 * scale);
}

function drawLoadingFrame(
  ctx: CanvasRenderingContext2D,
  size: number,
  progress: number,
) {
  const scale = size / 64;
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#050816";
  ctx.beginPath();
  ctx.roundRect(1, 1, size - 2, size - 2, 14 * scale);
  ctx.fill();
  ctx.strokeStyle = "#172554";
  ctx.lineWidth = 2 * scale;
  ctx.stroke();

  const start = -Math.PI / 2;
  const sweep = Math.PI * 2 * 0.28;
  const angle = start + progress * Math.PI * 2;
  const gradient = ctx.createLinearGradient(
    8 * scale,
    8 * scale,
    56 * scale,
    56 * scale,
  );
  gradient.addColorStop(0, "#3867ff");
  gradient.addColorStop(1, "#48dfff");
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 4 * scale;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(32 * scale, 32 * scale, 28 * scale, angle, angle + sweep);
  ctx.stroke();

  ctx.strokeStyle = "#48dfff";
  ctx.lineWidth = 4.5 * scale;
  ctx.beginPath();
  ctx.moveTo(16 * scale, 42 * scale);
  ctx.bezierCurveTo(
    8 * scale,
    40 * scale,
    10 * scale,
    29 * scale,
    19 * scale,
    24 * scale,
  );
  ctx.bezierCurveTo(
    18 * scale,
    15 * scale,
    28 * scale,
    14 * scale,
    32 * scale,
    22 * scale,
  );
  ctx.bezierCurveTo(
    36 * scale,
    14 * scale,
    46 * scale,
    15 * scale,
    45 * scale,
    24 * scale,
  );
  ctx.bezierCurveTo(
    54 * scale,
    29 * scale,
    56 * scale,
    40 * scale,
    48 * scale,
    42 * scale,
  );
  ctx.stroke();
  ctx.fillStyle = "#48dfff";
  ctx.fillRect(18 * scale, 47 * scale, 28 * scale, 5 * scale);
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

function drawBadge(
  ctx: CanvasRenderingContext2D,
  size: number,
  status: Exclude<FaviconStatus, { type: "idle" } | { type: "loading" }>,
) {
  const scale = size / 64;
  const x = 48 * scale;
  const y = 16 * scale;
  const radius = 14 * scale;
  ctx.fillStyle =
    status.type === "completed"
      ? "#22c55e"
      : status.type === "alert"
        ? "#ff3d71"
        : "#3867ff";
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#050816";
  ctx.lineWidth = 3 * scale;
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3 * scale;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (status.type === "completed") {
    ctx.beginPath();
    ctx.moveTo(41 * scale, 16 * scale);
    ctx.lineTo(46 * scale, 21 * scale);
    ctx.lineTo(55 * scale, 11 * scale);
    ctx.stroke();
  } else if (status.type === "alert") {
    ctx.beginPath();
    ctx.arc(x, y, 3.2 * scale, 0, Math.PI * 2);
    ctx.fill();
  } else {
    const label = status.count > 99 ? "99+" : String(Math.max(0, status.count));
    ctx.font = `700 ${label.length > 2 ? 12 : 17 * scale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, x, y + 0.5 * scale);
  }
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
