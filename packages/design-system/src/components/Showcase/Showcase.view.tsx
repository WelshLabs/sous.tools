/* eslint-disable max-lines */
"use client";

import {
  AuroraBackground,
  MicroIcon,
  Lettermark,
  PrimaryLogo,
  Button,
  Card,
  cn,
  Chip,
  Input,
  resetFaviconStatus,
  setFaviconStatus,
  type FaviconStatus,
  BrandLoader,
  Spinner,
  DotsLoader,
  ProgressBar,
  TopProgress,
} from "../..";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Mail,
  Lock,
  Search,
  Heart,
  Star,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CircleAlert,
  Download,
  Monitor,
  Smartphone,
} from "lucide-react";

const colorRoles = [
  { name: "background", fg: "foreground" },
  { name: "card", fg: "card-foreground" },
  { name: "primary", fg: "primary-foreground" },
  { name: "secondary", fg: "secondary-foreground" },
  { name: "accent", fg: "accent-foreground" },
  { name: "violet", fg: "violet-foreground" },
  { name: "muted", fg: "muted-foreground" },
  { name: "destructive", fg: "destructive-foreground" },
  { name: "success", fg: "success-foreground" },
  { name: "warning", fg: "warning-foreground" },
];

const typeScale = [
  {
    cls: "font-display text-5xl font-bold tracking-tight",
    label: "Display / Space Grotesk 700",
    sample: "Mise en place",
  },
  {
    cls: "font-display text-3xl font-semibold tracking-tight",
    label: "Heading / Space Grotesk 600",
    sample: "Sharpen the knives",
  },
  {
    cls: "font-sans text-xl font-medium",
    label: "Title / Inter 500",
    sample: "Balanced acidity and heat",
  },
  {
    cls: "font-sans text-base",
    label: "Body / Inter 400",
    sample: "Season in layers, taste as you go, and never crowd the pan.",
  },
  {
    cls: "font-sans text-sm text-muted-foreground",
    label: "Caption / Inter 400",
    sample: "Serves four. Prep twenty minutes.",
  },
  {
    cls: "font-mono text-sm",
    label: "Mono / JetBrains Mono",
    sample: "const heat = simmer(0.4)",
  },
];

const radii = [
  { name: "sm", cls: "rounded-[var(--radius-sm)]" },
  { name: "md", cls: "rounded-[var(--radius-md)]" },
  { name: "lg", cls: "rounded-[var(--radius-lg)]" },
  { name: "xl", cls: "rounded-[var(--radius-xl)]" },
  { name: "full", cls: "rounded-full" },
];

const glows = [
  { name: "glow-sm", cls: "shadow-glow-sm" },
  { name: "glow", cls: "shadow-glow" },
  { name: "glow-lg", cls: "shadow-glow-lg" },
  { name: "glow-accent", cls: "shadow-glow-accent" },
];

const filters = ["Recipes", "Techniques", "Plating", "Pairings"];

const platforms = [
  {
    name: "iOS / iPadOS",
    detail: "180 px touch icon",
    src: "/icons/apple-touch-icon.png",
    frame: "rounded-[22%]",
  },
  {
    name: "Android / PWA",
    detail: "512 px standard",
    src: "/icons/pwa-512.png",
    frame: "rounded-[22%]",
  },
  {
    name: "Android maskable",
    detail: "Safe through launcher crops",
    src: "/icons/maskable-512.png",
    frame: "rounded-full",
  },
  {
    name: "macOS",
    detail: "1024 px source",
    src: "/icons/macos-1024.png",
    frame: "rounded-[24%]",
  },
  {
    name: "Windows",
    detail: "Multi-resolution ICO",
    src: "/icons/windows-256.png",
    frame: "rounded-[18%]",
  },
  {
    name: "Linux",
    detail: "16–512 px PNG set",
    src: "/icons/linux-512.png",
    frame: "rounded-[20%]",
  },
];

const inventory = [
  ["Browser", "SVG · 16 · 32 · ICO", "/icons/favicon.svg"],
  ["Apple", "180 · 1024", "/icons/apple-touch-icon.png"],
  ["PWA", "192 · 512", "/icons/pwa-512.png"],
  ["Maskable", "192 · 512", "/icons/maskable-512.png"],
  ["Windows", "16–256 · ICO", "/icons/windows.ico"],
  ["Linux", "16 · 32 · 48 · 64 · 128 · 256 · 512", "/icons/linux-512.png"],
];

const fade = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      delay: i * 0.09,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "mx-auto w-full max-w-6xl scroll-mt-24 px-5 py-14",
        className,
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8 flex flex-col gap-2"
      >
        {eyebrow && (
          <span className="text-primary font-mono text-xs tracking-[0.2em] uppercase">
            {eyebrow}
          </span>
        )}
        <h2 className="font-display text-foreground text-2xl font-bold tracking-tight text-balance sm:text-3xl">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground max-w-2xl text-pretty">
            {description}
          </p>
        )}
      </motion.div>
      {children}
    </section>
  );
}

function SubLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground mb-3 font-mono text-xs tracking-[0.15em] uppercase">
      {children}
    </p>
  );
}

function statusLabel(status: FaviconStatus) {
  if (status.type === "loading") return "Working";
  if (status.type === "count") return `${status.count} unread`;
  if (status.type === "completed") return "Task completed";
  if (status.type === "alert") return "Attention needed";
  return "Idle";
}

export function ShowcaseView() {
  const [selected, setSelected] = useState<string[]>(["Recipes"]);
  const [tags, setTags] = useState(["braise", "sear", "sous-vide"]);

  function toggle(f: string) {
    setSelected((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );
  }

  const [status, setStatus] = useState<FaviconStatus>({ type: "idle" });

  useEffect(() => () => resetFaviconStatus(), []);

  function update(next: FaviconStatus) {
    setStatus(next);
    setFaviconStatus(next);
  }

  const [progress, setProgress] = useState(30);
  const [routeLoading, setRouteLoading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 10));
    }, 900);
    return () => clearInterval(id);
  }, []);

  function simulateRoute() {
    setRouteLoading(true);
    setTimeout(() => setRouteLoading(false), 2200);
  }

  return (
    <div className="relative min-h-dvh overflow-x-hidden">
      <AuroraBackground fixed />
      <div className="relative z-10">
        <main>
          <section className="relative mx-auto flex max-w-6xl flex-col items-center px-5 pt-16 pb-16 text-center sm:pt-24">
            <motion.div
              custom={0}
              variants={fade}
              initial="hidden"
              animate="show"
            >
              <span className="ds-glass text-muted-foreground inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm">
                <Sparkles className="text-primary h-4 w-4" />
                Neon-glass design system
              </span>
            </motion.div>

            <motion.div
              custom={1}
              variants={fade}
              initial="hidden"
              animate="show"
              className="mt-8"
            >
              <PrimaryLogo gradient className="mx-auto h-16 w-auto sm:h-20" />
            </motion.div>

            <motion.h1
              custom={2}
              variants={fade}
              initial="hidden"
              animate="show"
              className="font-display text-foreground mt-8 max-w-3xl text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-6xl"
            >
              Where the <span className="ds-text-neon">engineer</span> meets the{" "}
              <span className="ds-text-neon">chef</span>.
            </motion.h1>

            <motion.p
              custom={3}
              variants={fade}
              initial="hidden"
              animate="show"
              className="text-muted-foreground mt-5 max-w-xl text-lg text-pretty"
            >
              A token-driven system with a blue-neon glow, frosted glass
              surfaces, and motion that feels alive — engineered for both light
              and dark.
            </motion.p>

            <motion.div
              custom={4}
              variants={fade}
              initial="hidden"
              animate="show"
              className="mt-9 flex flex-wrap items-center justify-center gap-3"
            >
              <Button size="lg" variant="gradient">
                Explore the system
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="glass">
                View components
              </Button>
            </motion.div>
          </section>
          <Section
            id="foundations"
            eyebrow="Foundations"
            title="Tokens, not hardcoded values"
            description="Every surface pulls from semantic CSS variables. Flip the theme and all of it re-tunes — colors, glass, and glow included."
          >
            {/* Color swatches */}
            <SubLabel>Color roles</SubLabel>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {colorRoles.map((role) => (
                <div
                  key={role.name}
                  className="border-border flex aspect-[4/3] flex-col justify-between rounded-[var(--radius-md)] border p-3"
                  style={{
                    backgroundColor: `var(--${role.name})`,
                    color: `var(--${role.fg})`,
                  }}
                >
                  <span className="font-mono text-xs opacity-90">
                    --{role.name}
                  </span>
                  <span className="text-sm font-medium">Aa</span>
                </div>
              ))}
            </div>

            {/* Typography */}
            <div className="mt-12">
              <SubLabel>Typography</SubLabel>
              <Card className="flex flex-col gap-6">
                {typeScale.map((t) => (
                  <div
                    key={t.label}
                    className="border-border/60 flex flex-col gap-1 border-b pb-5 last:border-0 last:pb-0"
                  >
                    <span className="text-muted-foreground font-mono text-xs tracking-[0.15em] uppercase">
                      {t.label}
                    </span>
                    <span className={cn("text-foreground", t.cls)}>
                      {t.sample}
                    </span>
                  </div>
                ))}
              </Card>
            </div>

            {/* Radii + Glow */}
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <div>
                <SubLabel>Radius scale</SubLabel>
                <Card className="flex flex-wrap items-end gap-4">
                  {radii.map((r) => (
                    <div
                      key={r.name}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className={cn(
                          "border-primary/40 bg-primary/15 h-16 w-16 border",
                          r.cls,
                        )}
                      />
                      <span className="text-muted-foreground font-mono text-xs">
                        {r.name}
                      </span>
                    </div>
                  ))}
                </Card>
              </div>
              <div>
                <SubLabel>Elevation / glow</SubLabel>
                <Card className="flex flex-wrap items-center gap-5">
                  {glows.map((g) => (
                    <div
                      key={g.name}
                      className="flex flex-col items-center gap-3"
                    >
                      <div
                        className={cn(
                          "bg-card h-16 w-16 rounded-[var(--radius-md)]",
                          g.cls,
                        )}
                      />
                      <span className="text-muted-foreground font-mono text-xs">
                        {g.name}
                      </span>
                    </div>
                  ))}
                </Card>
              </div>
            </div>
          </Section>
          <Section
            id="components"
            eyebrow="Components"
            title="Components that feel alive"
            description="Rebuilt from scratch on React + Framer Motion. Subtle spring physics, a sheen sweep on buttons, animated selection, and floating-label inputs with a neon underline."
          >
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Buttons */}
              <Card>
                <SubLabel>Buttons</SubLabel>
                <div className="flex flex-wrap gap-3">
                  <Button variant="gradient">Gradient</Button>
                  <Button variant="primary">Primary</Button>
                  <Button variant="glass">Glass</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <Button size="sm" variant="gradient">
                    <Zap className="h-4 w-4" />
                    Small
                  </Button>
                  <Button size="md" variant="gradient">
                    Medium
                  </Button>
                  <Button size="lg" variant="gradient">
                    Large
                  </Button>
                  <Button size="icon" variant="glass" aria-label="Favorite">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </Card>

              {/* Chips */}
              <Card>
                <SubLabel>Filter chips</SubLabel>
                <div className="flex flex-wrap gap-2.5">
                  {filters.map((f) => (
                    <Chip
                      key={f}
                      selected={selected.includes(f)}
                      onClick={() => toggle(f)}
                    >
                      {f}
                    </Chip>
                  ))}
                </div>
                <SubLabel>Input chips (removable)</SubLabel>
                <div className="flex flex-wrap gap-2.5">
                  {tags.map((t) => (
                    <Chip
                      key={t}
                      icon={<Star className="h-3.5 w-3.5" />}
                      onRemove={() =>
                        setTags((prev) => prev.filter((x) => x !== t))
                      }
                    >
                      {t}
                    </Chip>
                  ))}
                  {tags.length === 0 && (
                    <span className="text-muted-foreground text-sm">
                      All removed — nice.
                    </span>
                  )}
                </div>
              </Card>

              {/* Inputs */}
              <Card className="lg:col-span-2">
                <SubLabel>Form inputs</SubLabel>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="Email"
                    type="email"
                    icon={<Mail className="h-4 w-4" />}
                    hint="We'll never share it."
                  />
                  <Input
                    label="Password"
                    type="password"
                    icon={<Lock className="h-4 w-4" />}
                  />
                  <Input
                    label="Search"
                    placeholder="Try 'confit'..."
                    icon={<Search className="h-4 w-4" />}
                  />
                  <Input
                    label="Username"
                    error="That handle is taken."
                    defaultValue="chef"
                  />
                </div>
              </Card>

              {/* Logos */}
              <Card className="lg:col-span-2">
                <SubLabel>Logo suite — themeable via color</SubLabel>
                <div className="flex flex-wrap items-center gap-8">
                  <div className="flex flex-col items-center gap-2">
                    <PrimaryLogo className="text-foreground h-9 w-auto" />
                    <span className="text-muted-foreground font-mono text-xs">
                      PrimaryLogo
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <PrimaryLogo gradient className="h-9 w-auto" />
                    <span className="text-muted-foreground font-mono text-xs">
                      gradient
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Lettermark className="text-primary h-11 w-11" />
                    <span className="text-muted-foreground font-mono text-xs">
                      Lettermark
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <MicroIcon className="text-accent h-9 w-9" />
                    <span className="text-muted-foreground font-mono text-xs">
                      MicroIcon
                    </span>
                  </div>
                  {/* Arbitrary colors: just set text color */}
                  <div className="flex items-center gap-3">
                    <MicroIcon
                      className="h-8 w-8"
                      style={{ color: "#f43f5e" }}
                    />
                    <MicroIcon
                      className="h-8 w-8"
                      style={{ color: "#f59e0b" }}
                    />
                    <MicroIcon
                      className="h-8 w-8"
                      style={{ color: "#10b981" }}
                    />
                  </div>
                </div>
              </Card>
            </div>
          </Section>
          <Section
            id="app-icons"
            eyebrow="Identity"
            title="One mark, tuned for every surface"
            description="A production icon family with purpose-built micro artwork for browser tabs, safe-zone-aware launcher assets, native desktop exports, and live favicon status states."
          >
            <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <Card className="overflow-hidden p-0">
                <div className="border-border/70 border-b px-6 py-5">
                  <SubLabel>Browser tab legibility</SubLabel>
                  <div className="border-border/80 mt-4 overflow-hidden rounded-[var(--radius-md)] border bg-[#151821] shadow-2xl">
                    <div className="flex h-11 items-end gap-1 bg-[#0d1017] px-3 pt-2">
                      <div className="flex h-9 max-w-64 min-w-0 flex-1 items-center gap-2 rounded-t-xl bg-[#20242f] px-3 text-[#f2f4f8]">
                        <Image
                          src="/icons/favicon.svg"
                          alt="ChefOS favicon at browser tab size"
                          width={18}
                          height={18}
                          className="shrink-0"
                        />
                        <span className="truncate text-xs">
                          ChefOS — Kitchen overview
                        </span>
                        <span className="ml-auto text-sm text-white/45">×</span>
                      </div>
                      <div className="mb-2 ml-1 h-5 w-5 rounded-full text-center text-sm text-white/50">
                        +
                      </div>
                    </div>
                    <div className="flex h-10 items-center gap-3 border-t border-white/5 px-4">
                      <span className="h-2 w-2 rounded-full bg-white/20" />
                      <div className="h-5 flex-1 rounded-full bg-white/5" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-end gap-7 px-6 py-6">
                  {[16, 24, 32, 48, 64].map((size) => (
                    <div
                      key={size}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className="flex h-16 items-center justify-center">
                        <Image
                          src={
                            size <= 32
                              ? "/icons/favicon.svg"
                              : "/icons/icon.svg"
                          }
                          alt=""
                          width={size}
                          height={size}
                        />
                      </div>
                      <span className="text-muted-foreground font-mono text-[10px]">
                        {size}px
                      </span>
                    </div>
                  ))}
                  <p className="text-muted-foreground max-w-xs text-xs leading-5">
                    The 16–32 px cut uses heavier strokes and less padding,
                    keeping the chef silhouette recognizable instead of
                    shrinking the full app artwork.
                  </p>
                </div>
              </Card>

              <Card>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <SubLabel>Live tab status lab</SubLabel>
                    <p className="text-muted-foreground mt-2 text-sm">
                      These controls update the real favicon in this browser
                      tab.
                    </p>
                  </div>
                  <span
                    aria-live="polite"
                    className="border-primary/30 bg-primary/10 text-primary rounded-full border px-3 py-1 font-mono text-[10px] tracking-wider uppercase"
                  >
                    {statusLabel(status)}
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button
                    variant={status.type === "idle" ? "primary" : "glass"}
                    onClick={() => update({ type: "idle" })}
                  >
                    Idle
                  </Button>
                  <Button
                    variant={status.type === "loading" ? "primary" : "glass"}
                    onClick={() => update({ type: "loading" })}
                  >
                    Animated loading
                  </Button>
                  <Button
                    variant={status.type === "count" ? "primary" : "glass"}
                    onClick={() => update({ type: "count", count: 7 })}
                  >
                    <Bell className="h-4 w-4" />
                    Count 7
                  </Button>
                  <Button
                    variant={status.type === "completed" ? "primary" : "glass"}
                    onClick={() => update({ type: "completed" })}
                  >
                    <Check className="h-4 w-4" />
                    Completed
                  </Button>
                  <Button
                    variant={status.type === "alert" ? "primary" : "glass"}
                    onClick={() => update({ type: "alert" })}
                  >
                    <CircleAlert className="h-4 w-4" />
                    Alert
                  </Button>
                </div>
                <div className="border-border/70 bg-background/45 mt-6 rounded-[var(--radius-md)] border p-4">
                  <p className="text-muted-foreground font-mono text-[10px] tracking-wider uppercase">
                    Runtime contract
                  </p>
                  <code className="text-accent mt-2 block text-xs">
                    setFaviconStatus({`{ type: "completed" }`})
                  </code>
                  <p className="text-muted-foreground mt-3 text-xs leading-5">
                    Counts clamp to 99+. Installed-app badge APIs remain a
                    native runtime concern; this controller intentionally owns
                    browser-tab state only.
                  </p>
                </div>
              </Card>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {platforms.map((platform) => (
                <Card key={platform.name} className="group overflow-hidden p-0">
                  <div className="flex min-h-48 items-center justify-center bg-[radial-gradient(circle_at_50%_35%,color-mix(in_srgb,var(--primary)_15%,transparent),transparent_62%)] p-8">
                    <div
                      className={`relative h-28 w-28 overflow-hidden shadow-[0_24px_50px_-24px_var(--primary)] ${platform.frame}`}
                    >
                      <Image
                        src={platform.src}
                        alt={`${platform.name} ChefOS icon`}
                        fill
                        sizes="112px"
                        className="object-cover"
                      />
                      {platform.name.includes("maskable") && (
                        <span className="pointer-events-none absolute inset-[10%] rounded-full border border-dashed border-white/45" />
                      )}
                    </div>
                  </div>
                  <div className="border-border/70 border-t px-5 py-4">
                    <div className="text-foreground flex items-center gap-2 text-sm font-medium">
                      {platform.name.includes("macOS") ||
                      platform.name.includes("Windows") ||
                      platform.name.includes("Linux") ? (
                        <Monitor className="text-primary h-4 w-4" />
                      ) : (
                        <Smartphone className="text-primary h-4 w-4" />
                      )}
                      {platform.name}
                    </div>
                    <p className="text-muted-foreground mt-1 font-mono text-[10px]">
                      {platform.detail}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="mt-6">
              <SubLabel>Export inventory</SubLabel>
              <div className="divide-border/60 mt-4 divide-y">
                {inventory.map(([name, sizes, href]) => (
                  <a
                    key={name}
                    href={href}
                    download
                    className="hover:text-primary flex items-center gap-4 py-3 text-sm transition-colors first:pt-0 last:pb-0"
                  >
                    <span className="text-foreground w-20 font-medium">
                      {name}
                    </span>
                    <span className="text-muted-foreground min-w-0 flex-1 font-mono text-[10px]">
                      {sizes}
                    </span>
                    <Download className="text-muted-foreground h-4 w-4" />
                  </a>
                ))}
              </div>
            </Card>
          </Section>
          <Section
            id="loaders"
            eyebrow="Progress"
            title="Loaders with personality"
            description="The brand loader draws the sous.tools mark stroke-by-stroke — a first-class progress option alongside the classic spinner, dots, and bar."
          >
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="items-center">
                <SubLabel>Brand mark</SubLabel>
                <div className="flex flex-1 items-center justify-center py-4">
                  <BrandLoader size="lg" />
                </div>
              </Card>
              <Card className="items-center">
                <SubLabel>Spinner</SubLabel>
                <div className="flex flex-1 items-center justify-center py-4">
                  <Spinner size="lg" />
                </div>
              </Card>
              <Card className="items-center">
                <SubLabel>Dots</SubLabel>
                <div className="flex flex-1 items-center justify-center py-4">
                  <DotsLoader />
                </div>
              </Card>
              <Card className="items-center">
                <SubLabel>Mark sizes</SubLabel>
                <div className="flex flex-1 items-center justify-center gap-3 py-4">
                  <BrandLoader size="sm" />
                  <BrandLoader size="md" />
                </div>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Card>
                <SubLabel>Determinate</SubLabel>
                <div className="flex flex-col gap-3 pt-2">
                  <ProgressBar value={progress} />
                  <span className="text-muted-foreground font-mono text-xs">
                    {progress}%
                  </span>
                </div>
              </Card>
              <Card>
                <SubLabel>Indeterminate</SubLabel>
                <div className="pt-2">
                  <ProgressBar />
                </div>
              </Card>
            </div>

            <div className="mt-6">
              <Card className="relative overflow-hidden">
                {/* Pinned to this card for the demo; in-app it pins to the viewport. */}
                <TopProgress active={routeLoading} absolute />
                <SubLabel>Top bar (NProgress-style)</SubLabel>
                <div className="flex flex-col items-start gap-4 pt-2">
                  <p className="text-muted-foreground text-sm">
                    A slim neon bar that trickles toward the top edge during
                    navigation, then snaps to 100% and fades. Trigger a mock
                    page load to watch it run along the top of this card.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={simulateRoute}
                    disabled={routeLoading}
                  >
                    {routeLoading ? "Loading…" : "Simulate page load"}
                  </Button>
                </div>
              </Card>
            </div>
          </Section>
        </main>
        <footer className="mx-auto max-w-6xl px-5 py-12">
          <div className="ds-glass flex flex-col items-center gap-3 rounded-[var(--radius-lg)] px-6 py-8 text-center">
            <MicroIcon className="text-primary h-8 w-8" />
            <p className="font-display text-foreground text-sm font-medium">
              <span className="font-bold">sous</span>
              <span className="text-muted-foreground font-mono">.tools</span>
            </p>
            <p className="text-muted-foreground text-xs">
              Neon-glass design system — React, Tailwind v4, Framer Motion.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
