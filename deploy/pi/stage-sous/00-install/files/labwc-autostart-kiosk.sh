#!/bin/bash
# =============================================================================
# labwc-autostart-kiosk.sh — Production Dual-Head Signage Kiosk Mode
# Launches distinct Chromium instances for HDMI-A-1 and HDMI-A-2.
# =============================================================================

# Disable DPMS / screen blanking during active signage hours
wlopm --on \* 2>/dev/null || true

# Kill any lingering mirror processes
pkill -x wl-mirror || true

# Launch Screen 1 on HDMI-A-1
chromium-browser \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --no-first-run \
    --disable-features=Translate \
    --enable-features=UseOzonePlatform \
    --ozone-platform=wayland \
    --user-data-dir=/tmp/chromium-1 \
    --window-name="sous-screen-1" \
    http://localhost:3000/display/screen-1 &

# If HDMI-A-2 is connected, launch Screen 2
if wlr-randr | grep -q "HDMI-A-2"; then
  chromium-browser \
      --kiosk \
      --noerrdialogs \
      --disable-infobars \
      --no-first-run \
      --disable-features=Translate \
      --enable-features=UseOzonePlatform \
      --ozone-platform=wayland \
      --user-data-dir=/tmp/chromium-2 \
      --window-name="sous-screen-2" \
      http://localhost:3000/display/screen-2 &
fi
