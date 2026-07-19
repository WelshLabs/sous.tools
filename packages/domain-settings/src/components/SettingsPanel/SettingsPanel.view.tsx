/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@soustools/design-system";
import { type GlobalDesignTokens } from "@soustools/api-types";
import {
  User, Mail, Shield, Save, Loader2, Key, Check, X,
  Download, Monitor, HardDrive, Cpu, AlertCircle,
  Type, Code, Palette,
  CheckCircle, RefreshCw, Database,
  Search, Folder, FileText
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
    <form onSubmit={onSubmit} className="space-y-6 max-w-xl animate-in fade-in">
      {success && <div className="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/30 text-emerald-400 text-sm">General settings saved successfully!</div>}
      {serverError && <div className="p-4 rounded-xl border bg-rose-950/20 border-rose-500/30 text-rose-400 text-sm">{serverError}</div>}
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</label>
          <input type="text" {...register("name")} className={`w-full bg-background dark:bg-background border ${errors.name ? "border-rose-500" : "border-border"} rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all`} />
          {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email Address</label>
          <input type="email" {...register("email")} className={`w-full bg-background dark:bg-background border ${errors.email ? "border-rose-500" : "border-border"} rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all`} />
          {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Role</label>
          <div className="w-full rounded-xl border border-border bg-background dark:bg-background px-4 py-2.5 text-sm text-zinc-200">{initialData.role === "admin" ? "Admin" : "Member"}</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5"><Key className="w-3.5 h-3.5" /> New Password</label>
            <input type="password" {...register("password")} placeholder="Leave blank to keep current password" className={`w-full bg-background dark:bg-background border ${errors.password ? "border-rose-500" : "border-border"} rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all`} />
            {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400 flex justify-between items-center">
              <span>Confirm Password</span>
              {password && confirmPassword && (password === confirmPassword ? <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5"><Check className="w-3 h-3" /> Passwords match</span> : <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5"><X className="w-3 h-3" /> Passwords mismatch</span>)}
            </label>
            <div className="relative">
              <input type="password" {...register("confirmPassword")} placeholder="Confirm new password" className={`w-full bg-background dark:bg-background border ${errors.confirmPassword ? "border-rose-500" : "border-border"} rounded-xl px-4 py-2.5 pr-10 text-sm text-zinc-900 dark:text-zinc-100 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all`} />
              {password && confirmPassword && <div className="absolute right-3 top-3 flex items-center pointer-events-none">{password === confirmPassword ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-rose-400" />}</div>}
            </div>
            {errors.confirmPassword && <p className="text-rose-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>
        </div>
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={saving} className="flex items-center gap-1.5">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? "Saving..." : "Save Settings"}</Button>
      </div>
    </form>
  );
}

export function DownloadsPanelView() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100"><Download className="w-5 h-5 text-sky-400" />OS Downloads</h2>
        <p className="text-sm text-zinc-400">Download the latest Signage OS images for your hardware and view instructions for flashing them to an SD card.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20"><Monitor className="w-6 h-6 text-sky-400" /></div>
                <div><h3 className="font-semibold text-foreground text-lg">Raspberry Pi 4 / 5 (ARM64)</h3><p className="text-xs text-muted-foreground">Latest Stable Release</p></div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-6">This is a custom-built, lightweight OS image based on Raspberry Pi OS Lite (Bookworm). It includes all necessary dependencies, hardware acceleration, and the kiosk daemon pre-configured.</p>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border mb-6">
              <Cpu className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Architecture: <strong className="text-foreground">AArch64</strong></span>
              <span className="text-border">|</span><span className="text-xs text-muted-foreground">Size: <strong className="text-foreground">~415 MB (.xz)</strong></span>
            </div>
          </div>
          <a href="https://github.com/conarwelsh/signage-os/releases/latest/download/sous-signage-os.img.xz" className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/20 hover:shadow-sky-400/40"><Download className="w-4 h-4" />Download Latest Image</a>
        </div>
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20"><HardDrive className="w-6 h-6 text-amber-400" /></div>
            <div><h3 className="font-semibold text-foreground text-lg">Flashing Instructions</h3><p className="text-xs text-muted-foreground">How to write the OS to your SD card</p></div>
          </div>
          <div className="space-y-6">
            <div className="space-y-2"><h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px] text-muted-foreground">1</span>Option A: Raspberry Pi Imager (Recommended)</h4><p className="text-xs text-muted-foreground ml-7">Using <a href="https://www.raspberrypi.com/software/" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">Raspberry Pi Imager</a>, choose "Use custom" from the OS selection menu and select the downloaded image file.</p></div>
            <div className="space-y-2"><h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px] text-muted-foreground">2</span>Option B: Balena Etcher</h4><p className="text-xs text-muted-foreground ml-7">Download and install <a href="https://etcher.balena.io/" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">Balena Etcher</a>. Select the downloaded `.img.xz` file, select your SD card, and click Flash. Etcher will automatically extract and write the image.</p></div>
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl mt-4"><p className="text-xs text-destructive flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 text-destructive" /><span><strong>Warning:</strong> Flashing the image will completely erase all data on the target SD card or USB drive. Double check that you have selected the correct drive before proceeding.</span></p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IntegrationCardView({ status, onConnect, onDisconnect, onSync, onSeed, isDev, isActionLoading }: any) {
  const isSquare = status.provider === "SQUARE";
  const displayName = isSquare ? "Square POS" : "Google Workspace";
  const desc = isSquare ? "Sync menu catalog, inventory status, and pricing directly from your Square merchant account." : "Connect with Google Drive to auto-ingest culinary invoices, vendor lists, and recipes.";
  return (
    <div className={`p-6 rounded-2xl border transition-all duration-300 backdrop-blur-md relative overflow-hidden flex flex-col justify-between min-h-[280px] ${status.connected ? "bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/20 dark:border-emerald-500/30 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]" : "bg-card border-border dark:bg-zinc-950/40 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xl"}`}>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div><h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{displayName}</h3><p className="text-xs text-muted-foreground mt-1 max-w-md">{desc}</p></div>
          {status.connected ? <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50"><CheckCircle className="w-3.5 h-3.5" /> Connected</span> : <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 bg-card px-2.5 py-1 rounded-full border border-border"><AlertCircle className="w-3.5 h-3.5" /> Disconnected</span>}
        </div>
        {status.connected && <div className="bg-card/50 dark:bg-card/40 border border-border rounded-xl p-3 text-xs"><span className="text-zinc-500 dark:text-zinc-400 block">Connected Account:</span><span className="text-zinc-800 dark:text-zinc-200 font-medium font-mono truncate block">{status.connectedAs || "Active Session"}</span></div>}
      </div>
      <div className="pt-4 flex flex-wrap gap-2 items-center justify-end">
        {status.connected ? (
          <>
            {isSquare && onSync && <Button variant="outline" size="sm" onClick={onSync} disabled={isActionLoading} className="flex items-center gap-1.5">{isActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}Sync Catalog</Button>}
            {isSquare && isDev && onSeed && <Button variant="outline" size="sm" onClick={onSeed} disabled={isActionLoading} className="flex items-center gap-1.5 border-amber-500/30 hover:bg-amber-500/10 text-amber-400 animate-pulse"><Database className="w-3.5 h-3.5" />Seed Sandbox</Button>}
            <Button variant="secondary" size="sm" onClick={onDisconnect} disabled={isActionLoading}>Disconnect</Button>
          </>
        ) : <Button variant="primary" size="sm" onClick={onConnect} disabled={isActionLoading}>Connect To {displayName}</Button>}
      </div>
    </div>
  );
}

export function IntegrationsPanelView({ integrations, onConnect, onDisconnect, onSquareAction, isDev, actionLoading, notification }: any) {
  return (
    <div className="space-y-6">
      {notification && (
        <div className={`p-4 rounded-xl border text-sm transition-all duration-300 animate-in fade-in ${notification.type === "success" ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400" : "bg-red-950/20 border-red-500/30 text-red-400"}`}>{notification.message}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {["SQUARE", "GOOGLE"].map((provider) => {
          const status = integrations.find((i: any) => i.provider === provider) || { provider, connected: false };
          return (
            <IntegrationCardView
              key={provider}
              status={status}
              onConnect={() => onConnect(provider)}
              onDisconnect={() => onDisconnect(provider)}
              onSync={provider === "SQUARE" ? () => onSquareAction("sync") : undefined}
              onSeed={provider === "SQUARE" ? () => onSquareAction("seed") : undefined}
              isDev={isDev}
              isActionLoading={actionLoading}
            />
          );
        })}
      </div>
    </div>
  );
}

export function StylingColorsSectionView({ tokens, onChange }: any) {
  const primaryHex = /^#[0-9A-Fa-f]{6}$/i.test(tokens.primaryColor ?? "") ? tokens.primaryColor! : "#00f0ff";
  const accentHex = /^#[0-9A-Fa-f]{6}$/i.test(tokens.accentColor ?? "") ? tokens.accentColor! : "#00f0ff";
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2"><Palette className="w-4 h-4 text-cyan-400" />Brand Colors</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">Primary Color (OKLCH, HEX, RGB)</label>
          <div className="flex items-center gap-3">
            <input type="color" value={primaryHex} onChange={(e) => onChange("primaryColor", e.target.value)} onClick={() => { if (!tokens.primaryColor) onChange("primaryColor", "#00f0ff"); }} className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0" />
            <input type="text" placeholder="e.g. oklch(0.7 0.15 200) or #00f0ff" value={tokens.primaryColor ?? ""} onChange={(e) => onChange("primaryColor", e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-400">Accent Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={accentHex} onChange={(e) => onChange("accentColor", e.target.value)} onClick={() => { if (!tokens.accentColor) onChange("accentColor", "#00f0ff"); }} className="w-10 h-10 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0" />
            <input type="text" placeholder="e.g. oklch(0.8 0.1 250)" value={tokens.accentColor ?? ""} onChange={(e) => onChange("accentColor", e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:border-cyan-500 outline-none transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
}

const FONT_OPTIONS = ["", "Inter", "Roboto", "Plus Jakarta Sans", "Outfit", "Oswald", "Playfair Display", "Merriweather", "Montserrat", "Lora", "Lato", "Poppins", "Nunito", "Raleway"];
const WEIGHT_OPTIONS = [{ value: "", label: "Default" }, { value: "normal", label: "Normal" }, { value: "bold", label: "Bold" }, { value: "100", label: "100 - Thin" }, { value: "300", label: "300 - Light" }, { value: "500", label: "500 - Medium" }, { value: "700", label: "700 - Bold" }, { value: "900", label: "900 - Black" }];

function FontGroup({ label, fontKey, colorKey, weightKey, tokens, onChange }: any) {
  const colorValue = String(tokens[colorKey] ?? "");
  const hexColor = /^#[0-9A-Fa-f]{6}$/i.test(colorValue) ? colorValue : "#ffffff";
  return (
    <div className="space-y-2 border border-black/5 dark:border-white/5 rounded-xl p-4 bg-card/30">
      <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{label}</div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">Font Family</label>
          <select value={String(tokens[fontKey] ?? "")} onChange={(e) => onChange(fontKey, e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-cyan-500 outline-none transition-all">
            {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f || "Default Font"}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">Color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={hexColor} onChange={(e) => onChange(colorKey, e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent shrink-0" />
            <input type="text" placeholder="e.g. #ffffff" value={colorValue} onChange={(e) => onChange(colorKey, e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-cyan-500 outline-none transition-all" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">Weight</label>
          <select value={String(tokens[weightKey] ?? "")} onChange={(e) => onChange(weightKey, e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:border-cyan-500 outline-none transition-all">
            {WEIGHT_OPTIONS.map(({ value, label: wl }) => <option key={value} value={value}>{wl}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

export function StylingTypographySectionView({ tokens, onChange }: any) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <FontGroup label="Heading Typography" fontKey="headingFont" colorKey="headingColor" weightKey="headingWeight" tokens={tokens} onChange={onChange} />
      <FontGroup label="Subtitle Typography" fontKey="subtitleFont" colorKey="subtitleColor" weightKey="subtitleWeight" tokens={tokens} onChange={onChange} />
      <FontGroup label="Body Typography" fontKey="bodyFont" colorKey="bodyColor" weightKey="bodyWeight" tokens={tokens} onChange={onChange} />
    </div>
  );
}

export function GlobalStylingSettingsView({ tokens, saving, success, onSubmit, handleTokenChange }: any) {
  return (
    <form onSubmit={onSubmit} className="space-y-6 max-w-2xl animate-in fade-in">
      {success && <div className="p-4 rounded-xl border bg-emerald-950/20 border-emerald-500/30 text-emerald-400 text-sm">Global styling settings saved successfully!</div>}
      <div className="space-y-6">
        <StylingColorsSectionView tokens={tokens} onChange={handleTokenChange} />
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2"><Type className="w-4 h-4 text-cyan-400" />Global Typography</h3>
          <StylingTypographySectionView tokens={tokens} onChange={handleTokenChange} />
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-2 border-b border-black/5 dark:border-white/5 pb-2"><Code className="w-4 h-4 text-cyan-400" />Global Custom CSS</h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">Write raw CSS to define utility classes (e.g., .ambient-wrapper, .glass-panel, .menu-glow-text) that can be attached to layout containers and blocks in the signage editor.</p>
          <div className="space-y-1">
            <textarea rows={8} placeholder=".glass-panel { backdrop-filter: blur(10px); }" value={tokens.globalCss ?? ""} onChange={(e) => handleTokenChange("globalCss", e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-sky-400 font-mono focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all resize-y" />
          </div>
        </div>
      </div>
      <div className="pt-4 flex justify-end">
        <Button type="submit" disabled={saving} className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-zinc-950 font-bold px-6">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{saving ? "Saving..." : "Save Design Tokens"}
        </Button>
      </div>
    </form>
  );
}

export function GoogleDriveBrowserView({ isOpen, onClose, query, setQuery, files, loading, selectedIds, toggleSelect, currentFolder, setCurrentFolder, handleSearch, handleImport }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/50 dark:bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-100 dark:bg-card border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Import from Google Drive</h2>
          <button onClick={onClose} className="text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 border-b border-black/5 dark:border-white/5 bg-card/50">
          {currentFolder && (
            <div className="mb-3 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <button onClick={() => { setCurrentFolder(null); handleSearch(query, ""); }} className="text-sky-500 dark:text-sky-400 hover:text-sky-600 cursor-pointer">Root</button>
              <span className="text-zinc-400">/</span><span className="text-zinc-900 dark:text-zinc-100">{currentFolder.name}</span>
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input type="text" placeholder="Search files and folders..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch(query)} className="w-full bg-white dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-zinc-900 dark:text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500/50" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-zinc-400" /></div> : files.length === 0 ? <div className="text-center py-12 text-zinc-400 text-sm">No files found.</div> : (
            <div className="space-y-1">
              {files.map((f: any) => {
                const isSelected = selectedIds.has(f.id);
                const isFolder = f.mimeType === "application/vnd.google-apps.folder";
                return (
                  <div key={f.id} onClick={() => toggleSelect(f.id)} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isSelected ? "bg-sky-500/10 border border-sky-500/30" : "hover:bg-black/5 dark:bg-white/5 border border-transparent"}`}>
                    <div className="text-sky-500 dark:text-sky-400">{isFolder ? <Folder className="w-5 h-5 fill-current opacity-80" /> : <FileText className="w-5 h-5 opacity-80" />}</div>
                    <span className="flex-1 text-sm text-zinc-800 dark:text-zinc-200 truncate">{f.name}</span>
                    {isFolder && <button onClick={(e) => { e.stopPropagation(); setCurrentFolder({ id: f.id, name: f.name }); setQuery(""); handleSearch("", f.id); }} className="px-3 py-1 text-xs font-medium bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 cursor-pointer">Open</button>}
                    {isSelected && <CheckCircle className="w-4 h-4 text-sky-500" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center bg-card/80 rounded-b-2xl">
          <span className="text-xs text-zinc-400">{selectedIds.size} file(s) selected</span>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-black/5 cursor-pointer">Cancel</button>
            <button onClick={handleImport} disabled={selectedIds.size === 0 || loading} className="px-4 py-2 rounded-lg text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer">{loading && <Loader2 className="w-4 h-4 animate-spin" />}Import Selected</button>
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
  driveBrowserProps
}: SettingsPanelViewProps) {
  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-2xl font-bold mb-6">General Settings</h2>
        <GeneralSettingsView {...generalProps} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Global Styling</h2>
        <GlobalStylingSettingsView {...stylingProps} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Integrations</h2>
        <IntegrationsPanelView {...integrationsProps} />
      </section>

      <section>
        <DownloadsPanelView />
      </section>
      
      <GoogleDriveBrowserView {...driveBrowserProps} />
    </div>
  );
}
