#!/bin/bash
# =============================================================================
# labwc-autostart-setup.sh — Setup Portal Mode
# Launches fullscreen setup portal on HDMI-A-1 and mirrors to HDMI-A-2 via wl-mirror.
# =============================================================================

# Disable DPMS / screen blanking during setup
wlopm --on \* 2>/dev/null || true

# Mirror to second display if connected
pkill -x wl-mirror || true
if wlr-randr | grep -q "HDMI-A-2"; then
  wl-mirror HDMI-A-1 &
fi

# Launch Chromium Setup Portal
exec chromium-browser \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --no-first-run \
    --disable-features=Translate \
    --enable-features=UseOzonePlatform \
    --ozone-platform=wayland \
    --user-data-dir=/tmp/chromium-setup \
    http://localhost:3000
