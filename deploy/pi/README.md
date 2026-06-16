# Sous Tools Signage Node — Raspberry Pi OS Image

This directory contains all scripts and configuration needed to deploy a Sous Tools digital signage kiosk on a Raspberry Pi 5.

---

## Quick Start: Flash a Pre-Built Image

> **Staging image**: `sous-tools-signage-rpi5-staging.img.xz`  
> **Production image**: `sous-tools-signage-rpi5-prod.img.xz`

1. Download the appropriate `.img.xz` file from the GitHub Releases page
2. Open **Raspberry Pi Imager**
3. Click **"Choose OS" → "Use Custom"** and select the downloaded `.img.xz`
4. Select your SD card and click **Write**
5. Insert SD card into Raspberry Pi 5 and power it on
6. The kiosk will auto-start and display the signage content

The Pi will automatically receive software updates during the configured maintenance window.

---

## Building a Custom Image

### Prerequisites

- Ubuntu 22.04+ host (or WSL2 with systemd-nspawn enabled)
- `curl`, `xz-utils`, `git` installed
- `sdm` tool (auto-installed by build script)

### Build Steps

```bash
# From the repository root
chmod +x deploy/pi/build-signage-image.sh
chmod +x deploy/pi/customize-chroot.sh

./deploy/pi/build-signage-image.sh
```

This will:
1. Download the base Raspberry Pi OS Lite (arm64) image
2. Customize it with the `soustools` user and kiosk configuration
3. Install Labwc, Chromium, Docker, and Node.js inside the image
4. Configure auto-login and the systemd kiosk service
5. Output a compressed `.img.xz` file ready for Raspberry Pi Imager

---

## File Structure

| File | Purpose |
|------|---------|
| `setup.sh` | Initial setup script (run on a fresh Pi manually) |
| `kiosk.sh` | Chromium dual-screen launcher with Wayland flags |
| `labwc-rc.xml` | Window placement rules for HDMI-A-1 and HDMI-A-2 |
| `sync-watchtower.js` | Dynamic Watchtower update scheduler daemon |
| `build-signage-image.sh` | Automated image build pipeline using `sdm` |
| `customize-chroot.sh` | Chroot customization script run by `sdm` |

---

## System Architecture

```
Raspberry Pi 5
├── Labwc (Wayland compositor)
│   └── kiosk.sh (launches Chromium instances)
│       ├── HDMI-A-1 → Chromium window "SignageDisplay1" (kiosk mode)
│       └── HDMI-A-2 → Chromium window "SignageDisplay2" (kiosk mode)
├── sync-watchtower.js (Node.js daemon)
│   └── Reads maintenance_window from Supabase device record
│   └── Restarts Watchtower container at the configured time
└── systemd services
    ├── signage-kiosk.service (auto-starts Labwc + Chromium)
    └── signage-sync.service (runs sync-watchtower daemon)
```

---

## Maintenance Window

The maintenance window is configured per-device in the Sous Tools admin UI:

1. Navigate to **Signage → Display Manager**
2. Click the **⚙️ Settings** button on a paired TV device
3. Set **Timezone**, **Maintenance Hour**, and **Minute**
4. Save settings

The Pi will automatically check for Docker image updates and restart during the configured window.

---

## Kiosk Display URLs

The signage player uses display IDs to determine which content to show:

```bash
# kiosk.sh environment variables
TV_ONE_URL="http://localhost:5003/display/{display-id}"
TV_TWO_URL="http://localhost:5003/display/{display-id}"
```

These are automatically updated when a device is paired via the admin UI.

---

## Chromium Kiosk Flags

The following flags enable full-screen kiosk mode on Wayland:

```
--ozone-platform=wayland
--enable-features=UseOzonePlatform
--kiosk
--no-first-run
--no-default-browser-check
--disable-infobars
--disable-session-crashed-bubble
```

---

## User Account

The Pi uses a dedicated `soustools` system user (not `pi` or `conar`).

- **Username**: `soustools`
- **Auto-login**: Enabled via `raspi-config`
- **Linger**: Enabled via `loginctl` (allows systemd services to run without active session)
