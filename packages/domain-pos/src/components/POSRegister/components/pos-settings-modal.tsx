/* eslint-disable max-lines */
"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  ThemeToggle,
} from "@soustools/design-system";
import { X, Sliders, Shield, Printer, Palette, DollarSign } from "lucide-react";
import { type POSSettings, type OrderType } from "../pos.types";

export interface POSSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: POSSettings;
  onSaveSettings: (newSettings: POSSettings) => void;
  onTestPrint?: () => void;
  onTestCashDrawer?: () => void;
}

export function POSSettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onTestPrint,
  onTestCashDrawer,
}: POSSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<
    "general" | "security" | "hardware" | "appearance"
  >("general");

  const [taxRateInput, setTaxRateInput] = useState(
    (settings.taxRate * 100).toString(),
  );
  const [defaultOrderType, setDefaultOrderType] = useState<OrderType>(
    settings.defaultOrderType || "for_here",
  );
  const [layoutGrid, setLayoutGrid] = useState<
    "compact" | "standard" | "large"
  >(settings.layoutGrid || "standard");
  const [pinRequired, setPinRequired] = useState(settings.pinRequired ?? false);
  const [pinCode, setPinCode] = useState(settings.pinCode || "1234");
  const [printerIp, setPrinterIp] = useState(
    settings.printerIp || "192.168.1.150:9100",
  );

  if (!isOpen) return null;

  const handleSave = () => {
    const parsedTax = parseFloat(taxRateInput);
    const validTaxRate = isNaN(parsedTax) ? 0.06 : parsedTax / 100;

    onSaveSettings({
      taxRate: validTaxRate,
      defaultOrderType,
      layoutGrid,
      pinRequired,
      pinCode,
      printerIp,
      cashDrawerEnabled: true,
    });
    onClose();
  };

  return (
    <div className="bg-background/80 animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <Card className="border-border bg-card shadow-glow-sm flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border">
        <CardHeader className="border-border/50 flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-2 text-sky-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-foreground text-lg font-black">
                POS Register Settings
              </CardTitle>
              <p className="text-muted-foreground text-xs">
                Configure tax, layout, PIN security & hardware
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/5 bg-black/20 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "general"
                ? "border-sky-400 font-black text-sky-400"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            General
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("security")}
            className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "security"
                ? "border-sky-400 font-black text-sky-400"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            PIN & Security
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("hardware")}
            className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "hardware"
                ? "border-sky-400 font-black text-sky-400"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            <Printer className="h-3.5 w-3.5" />
            Hardware
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("appearance")}
            className={`flex cursor-pointer items-center gap-1.5 border-b-2 px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === "appearance"
                ? "border-sky-400 font-black text-sky-400"
                : "text-muted-foreground hover:text-foreground border-transparent"
            }`}
          >
            <Palette className="h-3.5 w-3.5" />
            Appearance
          </button>
        </div>

        <CardContent className="flex-1 space-y-5 overflow-y-auto p-6">
          {activeTab === "general" && (
            <div className="space-y-4">
              {/* Sales Tax Rate */}
              <div className="space-y-1.5">
                <label className="text-foreground text-xs font-bold tracking-wider uppercase">
                  Sales Tax Rate (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    value={taxRateInput}
                    onChange={(e) => setTaxRateInput(e.target.value)}
                    className="text-foreground focus:ring-primary w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm font-bold focus:ring-2 focus:outline-none"
                  />
                  <span className="text-muted-foreground absolute top-2.5 right-3.5 text-xs font-bold">
                    %
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Default standard is 6.0%. Tax is calculated automatically on
                  all non-exempt items.
                </p>
              </div>

              {/* Default Order Type */}
              <div className="space-y-1.5">
                <label className="text-foreground text-xs font-bold tracking-wider uppercase">
                  Default Order Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDefaultOrderType("for_here")}
                    className={`cursor-pointer rounded-xl border p-3 text-xs font-bold transition-all ${
                      defaultOrderType === "for_here"
                        ? "border-primary bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground border-white/10 bg-black/20"
                    }`}
                  >
                    For Here (Dine-in)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDefaultOrderType("to_go")}
                    className={`cursor-pointer rounded-xl border p-3 text-xs font-bold transition-all ${
                      defaultOrderType === "to_go"
                        ? "border-primary bg-primary/15 text-primary"
                        : "text-muted-foreground hover:text-foreground border-white/10 bg-black/20"
                    }`}
                  >
                    To Go (Takeout)
                  </button>
                </div>
              </div>

              {/* POS Catalog Layout Density */}
              <div className="space-y-1.5">
                <label className="text-foreground text-xs font-bold tracking-wider uppercase">
                  Menu Grid Density
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["compact", "standard", "large"] as const).map(
                    (density) => (
                      <button
                        key={density}
                        type="button"
                        onClick={() => setLayoutGrid(density)}
                        className={`cursor-pointer rounded-xl border p-3 text-xs font-bold capitalize transition-all ${
                          layoutGrid === density
                            ? "border-primary bg-primary/15 text-primary"
                            : "text-muted-foreground hover:text-foreground border-white/10 bg-black/20"
                        }`}
                      >
                        {density}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3">
                <div>
                  <h4 className="text-foreground text-sm font-bold">
                    Require PIN Lock
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    Lock register when idle or upon manual lock button
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={pinRequired}
                  onChange={(e) => setPinRequired(e.target.checked)}
                  className="text-primary h-4 w-4 rounded border-white/20 accent-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-foreground text-xs font-bold tracking-wider uppercase">
                  Manager / Register PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="text-foreground focus:ring-primary w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-center font-mono text-lg tracking-widest focus:ring-2 focus:outline-none"
                />
                <p className="text-muted-foreground text-[11px]">
                  Default PIN is 1234. Used to unlock the terminal and access
                  settings.
                </p>
              </div>
            </div>
          )}

          {activeTab === "hardware" && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-foreground text-xs font-bold tracking-wider uppercase">
                  Receipt Printer IP / Network Port (RPi)
                </label>
                <input
                  type="text"
                  value={printerIp}
                  onChange={(e) => setPrinterIp(e.target.value)}
                  placeholder="e.g. 192.168.1.150:9100"
                  className="text-foreground focus:ring-primary w-full rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 font-mono text-sm focus:ring-2 focus:outline-none"
                />
                <p className="text-muted-foreground text-[11px]">
                  Configured ESC/POS thermal printer registered over local
                  network or Raspberry Pi hub.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onTestPrint}
                  className="flex items-center gap-1.5 font-bold"
                >
                  <Printer className="h-3.5 w-3.5 text-sky-400" />
                  Test Print Receipt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onTestCashDrawer}
                  className="flex items-center gap-1.5 font-bold"
                >
                  <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                  Test Cash Drawer
                </Button>
              </div>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-4">
                <div>
                  <h4 className="text-foreground text-sm font-bold">
                    Color Theme Mode
                  </h4>
                  <p className="text-muted-foreground text-xs">
                    Toggle between dark Midnight Slate and light theme
                  </p>
                </div>
                <ThemeToggle />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="border-border/50 bg-card/30 flex flex-row items-center justify-end gap-2 border-t p-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            className="font-black"
            onClick={handleSave}
          >
            Save Settings
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
POSSettingsModal.displayName = "POSSettingsModal";
