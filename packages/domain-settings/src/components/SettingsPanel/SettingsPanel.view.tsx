/* eslint-disable max-lines */
"use client";

import { Button } from "@soustools/design-system";
import { type GlobalDesignTokens } from "@soustools/api-types";
import {
  User,
  Mail,
  Shield,
  Save,
  Loader2,
  Key,
  Check,
  X,
  Download,
  Monitor,
  HardDrive,
  Cpu,
  AlertCircle,
  Type,
  Code,
  Palette,
  CheckCircle,
  RefreshCw,
  Search,
  Folder,
  FileText,
} from "lucide-react";
// Removed unused react-hook-form types

// ----------------------------------------------------------------------
// TYPES (Can be exported or moved to a shared file, kept here for simplicity)
// ----------------------------------------------------------------------
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

export type TokenKey = keyof GlobalDesignTokens;

// ----------------------------------------------------------------------
// INTERNAL VIEW COMPONENTS
// ----------------------------------------------------------------------

export function GeneralSettingsView({
  register,
  errors,
  password,
  confirmPassword,
  initialData,
  saving,
  success,
  serverError,
  onSubmit,
}: any) {
  return (
    <form onSubmit={onSubmit} className="animate-in fade-in max-w-xl space-y-6">
      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-400">
          General settings saved successfully!
        </div>
      )}
      {serverError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-4 text-sm text-rose-400">
          {serverError}
        </div>
      )}
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
            <User className="h-3.5 w-3.5" /> Full Name
          </label>
          <input
            type="text"
            {...register("name")}
            className={`bg-background dark:bg-background w-full border ${errors.name ? "border-rose-500" : "border-border"} rounded-xl px-4 py-2.5 text-sm text-zinc-900 transition-all outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:text-zinc-100`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
            <Mail className="h-3.5 w-3.5" /> Email Address
          </label>
          <input
            type="email"
            {...register("email")}
            className={`bg-background dark:bg-background w-full border ${errors.email ? "border-rose-500" : "border-border"} rounded-xl px-4 py-2.5 text-sm text-zinc-900 transition-all outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:text-zinc-100`}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
            <Shield className="h-3.5 w-3.5" /> Role
          </label>
          <div className="border-border bg-background dark:bg-background w-full rounded-xl border px-4 py-2.5 text-sm text-zinc-200">
            {initialData.role === "admin" ? "Admin" : "Member"}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
              <Key className="h-3.5 w-3.5" /> New Password
            </label>
            <input
              type="password"
              {...register("password")}
              placeholder="Leave blank to keep current password"
              className={`bg-background dark:bg-background w-full border ${errors.password ? "border-rose-500" : "border-border"} rounded-xl px-4 py-2.5 text-sm text-zinc-900 transition-all outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:text-zinc-100`}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs font-semibold text-zinc-400">
              <span>Confirm Password</span>
              {password &&
                confirmPassword &&
                (password === confirmPassword ? (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400">
                    <Check className="h-3 w-3" /> Passwords match
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-rose-400">
                    <X className="h-3 w-3" /> Passwords mismatch
                  </span>
                ))}
            </label>
            <div className="relative">
              <input
                type="password"
                {...register("confirmPassword")}
                placeholder="Confirm new password"
                className={`bg-background dark:bg-background w-full border ${errors.confirmPassword ? "border-rose-500" : "border-border"} rounded-xl px-4 py-2.5 pr-10 text-sm text-zinc-900 transition-all outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 dark:text-zinc-100`}
              />
              {password && confirmPassword && (
                <div className="pointer-events-none absolute top-3 right-3 flex items-center">
                  {password === confirmPassword ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <X className="h-4 w-4 text-rose-400" />
                  )}
                </div>
              )}
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  );
}

export function DownloadsPanelView() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
      <div className="space-y-2">
        <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">
          <Download className="h-5 w-5 text-sky-400" />
          OS Downloads
        </h2>
        <p className="text-sm text-zinc-400">
          Download the latest Signage OS images for your hardware and view
          instructions for flashing them to an SD card.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-card border-border flex flex-col justify-between rounded-2xl border p-6">
          <div>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-3">
                  <Monitor className="h-6 w-6 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-foreground text-lg font-semibold">
                    Raspberry Pi 4 / 5 (ARM64)
                  </h3>
                  <p className="text-muted-foreground text-xs">
                    Latest Stable Release
                  </p>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 text-sm">
              This is a custom-built, lightweight OS image based on Raspberry Pi
              OS Lite (Bookworm). It includes all necessary dependencies,
              hardware acceleration, and the kiosk daemon pre-configured.
            </p>
            <div className="bg-muted border-border mb-6 flex items-center gap-2 rounded-lg border p-3">
              <Cpu className="text-muted-foreground h-4 w-4" />
              <span className="text-muted-foreground text-xs">
                Architecture:{" "}
                <strong className="text-foreground">AArch64</strong>
              </span>
              <span className="text-border">|</span>
              <span className="text-muted-foreground text-xs">
                Size: <strong className="text-foreground">~415 MB (.xz)</strong>
              </span>
            </div>
          </div>
          <a
            href="https://github.com/conarwelsh/signage-os/releases/latest/download/sous-signage-os.img.xz"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 font-semibold text-zinc-950 shadow-lg shadow-sky-500/20 transition-all hover:bg-sky-400 hover:shadow-sky-400/40"
          >
            <Download className="h-4 w-4" />
            Download Latest Image
          </a>
        </div>
        <div className="bg-card border-border rounded-2xl border p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3">
              <HardDrive className="h-6 w-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-foreground text-lg font-semibold">
                Flashing Instructions
              </h3>
              <p className="text-muted-foreground text-xs">
                How to write the OS to your SD card
              </p>
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
                <span className="bg-muted text-muted-foreground flex h-5 w-5 items-center justify-center rounded-full text-[10px]">
                  1
                </span>
                Option A: Raspberry Pi Imager (Recommended)
              </h4>
              <p className="text-muted-foreground ml-7 text-xs">
                Using{" "}
                <a
                  href="https://www.raspberrypi.com/software/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  Raspberry Pi Imager
                </a>
                , choose "Use custom" from the OS selection menu and select the
                downloaded image file.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-foreground flex items-center gap-2 text-sm font-semibold">
                <span className="bg-muted text-muted-foreground flex h-5 w-5 items-center justify-center rounded-full text-[10px]">
                  2
                </span>
                Option B: Balena Etcher
              </h4>
              <p className="text-muted-foreground ml-7 text-xs">
                Download and install{" "}
                <a
                  href="https://etcher.balena.io/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  Balena Etcher
                </a>
                . Select the downloaded `.img.xz` file, select your SD card, and
                click Flash. Etcher will automatically extract and write the
                image.
              </p>
            </div>
            <div className="bg-destructive/10 border-destructive/20 mt-4 rounded-xl border p-4">
              <p className="text-destructive flex gap-2 text-xs">
                <AlertCircle className="text-destructive h-4 w-4 shrink-0" />
                <span>
                  <strong>Warning:</strong> Flashing the image will completely
                  erase all data on the target SD card or USB drive. Double
                  check that you have selected the correct drive before
                  proceeding.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IntegrationCardView({
  status,
  onConnect,
  onDisconnect,
  onSync,
  isActionLoading,
}: any) {
  const isSquare = status.provider === "SQUARE";
  const displayName = isSquare ? "Square POS" : "Google Workspace";
  const desc = isSquare
    ? "Sync menu catalog, inventory status, and pricing directly from your Square merchant account."
    : "Connect with Google Drive to auto-ingest culinary invoices, vendor lists, and recipes.";
  return (
    <div
      className={`relative flex min-h-[280px] flex-col justify-between overflow-hidden rounded-2xl border p-6 backdrop-blur-md transition-all duration-300 ${status.connected ? "border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)] dark:border-emerald-500/30 dark:bg-emerald-950/10" : "bg-card border-border shadow-xl hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950/40 dark:hover:border-zinc-700"}`}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              {displayName}
            </h3>
            <p className="text-muted-foreground mt-1 max-w-md text-xs">
              {desc}
            </p>
          </div>
          {status.connected ? (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
              <CheckCircle className="h-3.5 w-3.5" /> Connected
            </span>
          ) : (
            <span className="bg-card border-border flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs text-zinc-500 dark:text-zinc-400">
              <AlertCircle className="h-3.5 w-3.5" /> Disconnected
            </span>
          )}
        </div>
        {status.connected && (
          <div className="bg-card/50 dark:bg-card/40 border-border rounded-xl border p-3 text-xs">
            <span className="block text-zinc-500 dark:text-zinc-400">
              Connected Account:
            </span>
            <span className="block truncate font-mono font-medium text-zinc-800 dark:text-zinc-200">
              {status.connectedAs || "Active Session"}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 pt-4">
        {status.connected ? (
          <>
            {isSquare && onSync && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSync}
                disabled={isActionLoading}
                className="flex items-center gap-1.5"
              >
                {isActionLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Sync Data
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={onDisconnect}
              disabled={isActionLoading}
            >
              Disconnect
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={onConnect}
            disabled={isActionLoading}
          >
            Connect To {displayName}
          </Button>
        )}
      </div>
    </div>
  );
}

export function IntegrationsPanelView({
  integrations,
  onConnect,
  onDisconnect,
  onSquareAction,
  actionLoading,
  notification,
}: any) {
  return (
    <div className="space-y-6">
      {notification && (
        <div
          className={`animate-in fade-in rounded-xl border p-4 text-sm transition-all duration-300 ${notification.type === "success" ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-400" : "border-red-500/30 bg-red-950/20 text-red-400"}`}
        >
          {notification.message}
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {["SQUARE", "GOOGLE"].map((provider) => {
          const status = integrations.find(
            (i: any) => i.provider === provider,
          ) || { provider, connected: false };
          return (
            <IntegrationCardView
              key={provider}
              status={status}
              onConnect={() => onConnect(provider)}
              onDisconnect={() => onDisconnect(provider)}
              onSync={
                provider === "SQUARE" ? () => onSquareAction("sync") : undefined
              }
              isActionLoading={actionLoading}
            />
          );
        })}
      </div>
    </div>
  );
}

export function StylingColorsSectionView({ tokens, onChange }: any) {
  const primaryHex = /^#[0-9A-Fa-f]{6}$/i.test(tokens.primaryColor ?? "")
    ? tokens.primaryColor!
    : "#00f0ff";
  const accentHex = /^#[0-9A-Fa-f]{6}$/i.test(tokens.accentColor ?? "")
    ? tokens.accentColor!
    : "#00f0ff";
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 border-b border-black/5 pb-2 text-sm font-bold text-zinc-700 dark:border-white/5 dark:text-zinc-300">
        <Palette className="h-4 w-4 text-cyan-400" />
        Brand Colors
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">
            Primary Color (OKLCH, HEX, RGB)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryHex}
              onChange={(e) => onChange("primaryColor", e.target.value)}
              onClick={() => {
                if (!tokens.primaryColor) onChange("primaryColor", "#00f0ff");
              }}
              className="h-10 w-10 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            <input
              type="text"
              placeholder="e.g. oklch(0.7 0.15 200) or #00f0ff"
              value={tokens.primaryColor ?? ""}
              onChange={(e) => onChange("primaryColor", e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-all outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">
            Accent Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={accentHex}
              onChange={(e) => onChange("accentColor", e.target.value)}
              onClick={() => {
                if (!tokens.accentColor) onChange("accentColor", "#00f0ff");
              }}
              className="h-10 w-10 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            <input
              type="text"
              placeholder="e.g. oklch(0.8 0.1 250)"
              value={tokens.accentColor ?? ""}
              onChange={(e) => onChange("accentColor", e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-50 px-4 py-2.5 text-sm text-zinc-900 transition-all outline-none focus:border-cyan-500 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const FONT_OPTIONS = [
  "",
  "Inter",
  "Roboto",
  "Plus Jakarta Sans",
  "Outfit",
  "Oswald",
  "Playfair Display",
  "Merriweather",
  "Montserrat",
  "Lora",
  "Lato",
  "Poppins",
  "Nunito",
  "Raleway",
];
const WEIGHT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "normal", label: "Normal" },
  { value: "bold", label: "Bold" },
  { value: "100", label: "100 - Thin" },
  { value: "300", label: "300 - Light" },
  { value: "500", label: "500 - Medium" },
  { value: "700", label: "700 - Bold" },
  { value: "900", label: "900 - Black" },
];

function FontGroup({
  label,
  fontKey,
  colorKey,
  weightKey,
  tokens,
  onChange,
}: any) {
  const colorValue = String(tokens[colorKey] ?? "");
  const hexColor = /^#[0-9A-Fa-f]{6}$/i.test(colorValue)
    ? colorValue
    : "#ffffff";
  return (
    <div className="bg-card/30 space-y-2 rounded-xl border border-black/5 p-4 dark:border-white/5">
      <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
        {label}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
            Font Family
          </label>
          <select
            value={String(tokens[fontKey] ?? "")}
            onChange={(e) => onChange(fontKey, e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-all outline-none focus:border-cyan-500 dark:bg-zinc-950 dark:text-zinc-100"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f || "Default Font"}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
            Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={hexColor}
              onChange={(e) => onChange(colorKey, e.target.value)}
              className="h-8 w-8 shrink-0 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            <input
              type="text"
              placeholder="e.g. #ffffff"
              value={colorValue}
              onChange={(e) => onChange(colorKey, e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-all outline-none focus:border-cyan-500 dark:bg-zinc-950 dark:text-zinc-100"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
            Weight
          </label>
          <select
            value={String(tokens[weightKey] ?? "")}
            onChange={(e) => onChange(weightKey, e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 transition-all outline-none focus:border-cyan-500 dark:bg-zinc-950 dark:text-zinc-100"
          >
            {WEIGHT_OPTIONS.map(({ value, label: wl }) => (
              <option key={value} value={value}>
                {wl}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export function StylingTypographySectionView({ tokens, onChange }: any) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <FontGroup
        label="Heading Typography"
        fontKey="headingFont"
        colorKey="headingColor"
        weightKey="headingWeight"
        tokens={tokens}
        onChange={onChange}
      />
      <FontGroup
        label="Subtitle Typography"
        fontKey="subtitleFont"
        colorKey="subtitleColor"
        weightKey="subtitleWeight"
        tokens={tokens}
        onChange={onChange}
      />
      <FontGroup
        label="Body Typography"
        fontKey="bodyFont"
        colorKey="bodyColor"
        weightKey="bodyWeight"
        tokens={tokens}
        onChange={onChange}
      />
    </div>
  );
}

export function GlobalStylingSettingsView({
  tokens,
  saving,
  success,
  onSubmit,
  handleTokenChange,
}: any) {
  return (
    <form
      onSubmit={onSubmit}
      className="animate-in fade-in max-w-2xl space-y-6"
    >
      {success && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-400">
          Global styling settings saved successfully!
        </div>
      )}
      <div className="space-y-6">
        <StylingColorsSectionView
          tokens={tokens}
          onChange={handleTokenChange}
        />
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 border-b border-black/5 pb-2 text-sm font-bold text-zinc-700 dark:border-white/5 dark:text-zinc-300">
            <Type className="h-4 w-4 text-cyan-400" />
            Global Typography
          </h3>
          <StylingTypographySectionView
            tokens={tokens}
            onChange={handleTokenChange}
          />
        </div>
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 border-b border-black/5 pb-2 text-sm font-bold text-zinc-700 dark:border-white/5 dark:text-zinc-300">
            <Code className="h-4 w-4 text-cyan-400" />
            Global Custom CSS
          </h3>
          <p className="text-xs leading-relaxed text-zinc-400 dark:text-zinc-500">
            Write raw CSS to define utility classes (e.g., .ambient-wrapper,
            .glass-panel, .menu-glow-text) that can be attached to layout
            containers and blocks in the signage editor.
          </p>
          <div className="space-y-1">
            <textarea
              rows={8}
              placeholder=".glass-panel { backdrop-filter: blur(10px); }"
              value={tokens.globalCss ?? ""}
              onChange={(e) => handleTokenChange("globalCss", e.target.value)}
              className="w-full resize-y rounded-xl border border-zinc-800 bg-zinc-50 px-4 py-2.5 font-mono text-sm text-sky-400 transition-all outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 dark:bg-zinc-950"
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 bg-cyan-600 px-6 font-bold text-zinc-950 hover:bg-cyan-500"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? "Saving..." : "Save Design Tokens"}
        </Button>
      </div>
    </form>
  );
}

export function GoogleDriveBrowserView({
  isOpen,
  onClose,
  query,
  setQuery,
  files,
  loading,
  selectedIds,
  toggleSelect,
  currentFolder,
  setCurrentFolder,
  handleSearch,
  handleImport,
}: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 p-4 backdrop-blur-sm dark:bg-black/60">
      <div className="dark:bg-card animate-in fade-in zoom-in-95 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-black/10 bg-zinc-100 shadow-2xl duration-200 dark:border-white/10">
        <div className="flex items-center justify-between border-b border-black/5 p-4 dark:border-white/5">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
            Import from Google Drive
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="bg-card/50 border-b border-black/5 p-4 dark:border-white/5">
          {currentFolder && (
            <div className="mb-3 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <button
                onClick={() => {
                  setCurrentFolder(null);
                  handleSearch(query, "");
                }}
                className="cursor-pointer text-sky-500 hover:text-sky-600 dark:text-sky-400"
              >
                Root
              </button>
              <span className="text-zinc-400">/</span>
              <span className="text-zinc-900 dark:text-zinc-100">
                {currentFolder.name}
              </span>
            </div>
          )}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search files and folders..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
              className="w-full rounded-xl border border-black/10 bg-white py-2 pr-4 pl-10 text-sm text-zinc-900 placeholder-zinc-500 focus:border-sky-500/50 focus:outline-none dark:border-white/10 dark:bg-black/50 dark:text-white"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
          ) : files.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-400">
              No files found.
            </div>
          ) : (
            <div className="space-y-1">
              {files.map((f: any) => {
                const isSelected = selectedIds.has(f.id);
                const isFolder =
                  f.mimeType === "application/vnd.google-apps.folder";
                return (
                  <div
                    key={f.id}
                    onClick={() => toggleSelect(f.id)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-colors ${isSelected ? "border border-sky-500/30 bg-sky-500/10" : "border border-transparent hover:bg-black/5 dark:bg-white/5"}`}
                  >
                    <div className="text-sky-500 dark:text-sky-400">
                      {isFolder ? (
                        <Folder className="h-5 w-5 fill-current opacity-80" />
                      ) : (
                        <FileText className="h-5 w-5 opacity-80" />
                      )}
                    </div>
                    <span className="flex-1 truncate text-sm text-zinc-800 dark:text-zinc-200">
                      {f.name}
                    </span>
                    {isFolder && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentFolder({ id: f.id, name: f.name });
                          setQuery("");
                          handleSearch("", f.id);
                        }}
                        className="cursor-pointer rounded-lg bg-zinc-200 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      >
                        Open
                      </button>
                    )}
                    {isSelected && (
                      <CheckCircle className="h-4 w-4 text-sky-500" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="bg-card/80 flex items-center justify-between rounded-b-2xl border-t border-black/5 p-4 dark:border-white/5">
          <span className="text-xs text-zinc-400">
            {selectedIds.size} file(s) selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-black/5 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={selectedIds.size === 0 || loading}
              className="flex cursor-pointer items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-400 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}Import
              Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MAIN VIEW COMPONENT
// ----------------------------------------------------------------------

export interface SettingsPanelViewProps {
  generalProps: any;
  stylingProps: any;
  integrationsProps: any;
  driveBrowserProps: any;
}

export function SettingsPanelView({
  generalProps,
  stylingProps,
  integrationsProps,
  driveBrowserProps,
}: SettingsPanelViewProps) {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="mb-6 text-2xl font-bold">General Settings</h2>
        <GeneralSettingsView {...generalProps} />
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">Global Styling</h2>
        <GlobalStylingSettingsView {...stylingProps} />
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-bold">Integrations</h2>
        <IntegrationsPanelView {...integrationsProps} />
      </section>

      <section>
        <DownloadsPanelView />
      </section>

      <GoogleDriveBrowserView {...driveBrowserProps} />
    </div>
  );
}
