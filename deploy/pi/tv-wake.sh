#!/bin/bash
# tv-wake.sh
# Turns on HDMI displays for Wayland labwc session on Raspberry Pi.
# @tenant-docs-export

export WAYLAND_DISPLAY=${WAYLAND_DISPLAY:-wayland-1}
export XDG_RUNTIME_DIR=${XDG_RUNTIME_DIR:-/run/user/1000}

# Check if labwc is running
if ! pgrep -x labwc > /dev/null; then
  echo "labwc is not running. Exiting."
  exit 0
fi

echo "Turning on HDMI displays..."
wlr-randr --output HDMI-A-1 --on || true
wlr-randr --output HDMI-A-2 --on || true
