import React from "react";
import { Download, Monitor, HardDrive, Cpu, AlertCircle } from "lucide-react";

export const DownloadsPanel: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
          <Download className="w-5 h-5 text-sky-400" />
          OS Downloads
        </h2>
        <p className="text-sm text-zinc-400">
          Download the latest Signage OS images for your hardware and view
          instructions for flashing them to an SD card.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Download Card */}
        <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20">
                  <Monitor className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-lg">
                    Raspberry Pi 4 / 5 (ARM64)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Latest Stable Release
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              This is a custom-built, lightweight OS image based on Raspberry Pi
              OS Lite (Bookworm). It includes all necessary dependencies,
              hardware acceleration, and the kiosk daemon pre-configured.
            </p>

            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg border border-border mb-6">
              <Cpu className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Architecture:{" "}
                <strong className="text-foreground">
                  AArch64
                </strong>
              </span>
              <span className="text-border">|</span>
              <span className="text-xs text-muted-foreground">
                Size:{" "}
                <strong className="text-foreground">
                  ~415 MB (.xz)
                </strong>
              </span>
            </div>
          </div>

          <a
            href="https://github.com/conarwelsh/signage-os/releases/latest/download/sous-signage-os.img.xz"
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-sky-500 hover:bg-sky-400 text-zinc-950 font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/20 hover:shadow-sky-400/40"
          >
            <Download className="w-4 h-4" />
            Download Latest Image
          </a>
        </div>

        {/* Flashing Instructions */}
        <div className="p-6 rounded-2xl bg-card border border-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <HardDrive className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-lg">
                Flashing Instructions
              </h3>
              <p className="text-xs text-muted-foreground">
                How to write the OS to your SD card
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px] text-muted-foreground">
                  1
                </span>
                Option A: Raspberry Pi Imager (Recommended)
              </h4>
              <p className="text-xs text-muted-foreground ml-7">
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
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-[10px] text-muted-foreground">
                  2
                </span>
                Option B: Balena Etcher
              </h4>
              <p className="text-xs text-muted-foreground ml-7">
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

            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl mt-4">
              <p className="text-xs text-destructive flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
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
};
