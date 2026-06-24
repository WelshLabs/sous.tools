#!/bin/bash
# install-chromium-firstboot.sh - Installs Chromium on first boot via systemd service
# This defers the heavy Chromium installation from the image build to runtime,
# saving ~400 MB of disk space during the signage OS image build.

set -e

echo "=== First-Boot Chromium Installation ==="
echo "Waiting for network connectivity..."

# Wait for network to be available (up to 120 seconds)
for i in {1..120}; do
  if ping -c 1 8.8.8.8 &> /dev/null; then
    echo "Network is available"
    break
  fi
  echo "Waiting for network... ($i/120)"
  sleep 1
done

echo "Installing Chromium..."
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends chromium-browser

# Clean up apt cache
apt-get clean
apt-get autoclean
rm -rf /var/lib/apt/lists/*
rm -rf /var/cache/apt/archives/*

echo "=== Chromium Installation Complete ==="
