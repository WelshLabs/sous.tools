#!/bin/bash
# kiosk.sh - Dual TV Signage Chromium launcher
# Launches two full-screen instances of Chromium with custom window titles
# to allow Labwc composition rules to map them onto separate HDMI outputs.

export WAYLAND_DISPLAY=wayland-0
export XDG_RUNTIME_DIR=/run/user/1000

# Define screen URLs (can be paired display IDs or channels)
TV_ONE_URL="http://localhost:5003/display/dtown-left"
TV_TWO_URL="http://localhost:5003/display/dtown-right"

# Delay to ensure Labwc is fully running
sleep 3

# Launch Left Screen instance (HDMI-A-1)
chromium-browser --new-window \
  --ozone-platform=wayland \
  --enable-features=UseOzonePlatform \
  --title="SignageDisplay1" \
  --kiosk \
  --no-first-run \
  --no-default-browser-check \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --user-data-dir=/home/soustools/.config/chromium-display1 \
  "$TV_ONE_URL" &

# Launch Right Screen instance (HDMI-A-2)
chromium-browser --new-window \
  --ozone-platform=wayland \
  --enable-features=UseOzonePlatform \
  --title="SignageDisplay2" \
  --kiosk \
  --no-first-run \
  --no-default-browser-check \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --user-data-dir=/home/soustools/.config/chromium-display2 \
  "$TV_TWO_URL" &

# Wait for background processes to exit
wait
