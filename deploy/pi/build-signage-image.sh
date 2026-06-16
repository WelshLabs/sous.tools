#!/bin/bash
# build-signage-image.sh - Automated script to build customized Raspberry Pi 5 Signage OS image using sdm.
# Should be executed on a Debian/Ubuntu host (or WSL2 with systemd-nspawn enabled).

set -e

WORKDIR=$(pwd)
DEPLOY_DIR="$WORKDIR/deploy/pi"
BUILD_DIR="$WORKDIR/build-signage"
IMAGE_URL="https://downloads.raspberrypi.com/raspios_lite_arm64/images/raspios_lite_arm64-2024-07-04/2024-07-04-raspios-bookworm-arm64-lite.img.xz"
BASE_IMAGE_NAME="2024-07-04-raspios-bookworm-arm64-lite.img"
OUTPUT_IMAGE_NAME="sous-tools-signage-rpi5.img"

echo "=== Starting Customized OS Image Build Pipeline ==="

# 1. Install sdm if not present
if ! command -v sdm &> /dev/null; then
  echo "sdm not found. Installing sdm..."
  curl -L https://raw.githubusercontent.com/gitbls/sdm/master/EZsdmInstaller | sudo bash
fi

# 2. Setup build directory
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

# 3. Download base Raspberry Pi OS image
if [ ! -f "$BASE_IMAGE_NAME" ]; then
  echo "Downloading base Raspberry Pi OS image..."
  curl -L -O "$IMAGE_URL"
  echo "Decompressing base image..."
  xz -d "${BASE_IMAGE_NAME}.xz"
fi

# 4. Copy files to copy into chroot
echo "Staging configuration files..."
cp "$BASE_IMAGE_NAME" "$OUTPUT_IMAGE_NAME"

# Copy deployment scripts to temporary location for sdm to import
mkdir -p "$BUILD_DIR/sysfiles"
cp "$DEPLOY_DIR/labwc-rc.xml" "$BUILD_DIR/sysfiles/"
cp "$DEPLOY_DIR/kiosk.sh" "$BUILD_DIR/sysfiles/"
cp "$DEPLOY_DIR/sync-watchtower.js" "$BUILD_DIR/sysfiles/"

# 5. Run sdm to customize image
echo "Running sdm image customization..."
# Inject staging files into image /tmp directory so chroot script can find them
sudo sdm --customize "$OUTPUT_IMAGE_NAME" \
  --user soustools \
  --password-clear password \
  --hostname signage-node \
  --restart \
  --plugin copyfile '{"source":"sysfiles/labwc-rc.xml", "destination":"/tmp/labwc-rc.xml"}' \
  --plugin copyfile '{"source":"sysfiles/kiosk.sh", "destination":"/tmp/kiosk.sh"}' \
  --plugin copyfile '{"source":"sysfiles/sync-watchtower.js", "destination":"/tmp/sync-watchtower.js"}' \
  --plugin chroot "script=$DEPLOY_DIR/customize-chroot.sh"

# 6. Compress customized image for distribution
echo "Compressing final signage OS image..."
xz -k -9 "$OUTPUT_IMAGE_NAME"

echo "=== Build Pipeline Completed Successfully ==="
echo "Customized image is ready: $BUILD_DIR/${OUTPUT_IMAGE_NAME}.xz"
