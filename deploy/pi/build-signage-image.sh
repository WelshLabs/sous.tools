#!/bin/bash
# build-signage-image.sh - Automated script to build customized Raspberry Pi 5 Signage OS image using sdm.
# Should be executed on a Debian/Ubuntu host (or WSL2 with systemd-nspawn enabled).

set -e

WORKDIR=$(pwd)
DEPLOY_DIR="$WORKDIR/deploy/pi"
BUILD_DIR="$WORKDIR/build-signage"
IMAGE_URL="https://downloads.raspberrypi.com/raspios_lite_arm64/images/raspios_lite_arm64-2024-07-04/2024-07-04-raspios-bookworm-arm64-lite.img.xz"
BASE_IMAGE_NAME="2024-07-04-raspios-bookworm-arm64-lite.img"
# Determine target environment
ENV_TARGET=${1:-prod}
if [ "$ENV_TARGET" = "staging" ]; then
  OUTPUT_IMAGE_NAME="sous-tools-signage-rpi5-staging.img"
  INFISICAL_ENV="staging"
  SIGNAGE_IMAGE_TAG="staging"
else
  OUTPUT_IMAGE_NAME="sous-tools-signage-rpi5-prod.img"
  INFISICAL_ENV="prod"
  SIGNAGE_IMAGE_TAG="production"
fi

echo "=== Starting Customized OS Image Build Pipeline ($ENV_TARGET) ==="

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
cp "$DEPLOY_DIR/fetch-secrets.js" "$BUILD_DIR/sysfiles/"

# Generate the infisical.env configuration to be copied into the image
cat > "$BUILD_DIR/sysfiles/sous-infisical.env" <<EOF
INFISICAL_CLIENT_ID=f4ed7880-ba12-4d75-9894-0771c7fb14c0
INFISICAL_CLIENT_SECRET=c97c2f8014896437b7af8ef00791e3f92beebfd39e8929140d9fb86dad5181a8
INFISICAL_PROJECT_ID=4e40fdc4-358b-4216-b7c4-30e5506f9277
INFISICAL_ENV=$INFISICAL_ENV
SIGNAGE_IMAGE_TAG=$SIGNAGE_IMAGE_TAG
EOF

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
  --plugin copyfile '{"source":"sysfiles/fetch-secrets.js", "destination":"/tmp/fetch-secrets.js"}' \
  --plugin copyfile '{"source":"sysfiles/sous-infisical.env", "destination":"/etc/sous-infisical.env"}' \
  --plugin chroot "script=$DEPLOY_DIR/customize-chroot.sh"

# 6. Compress customized image for distribution
echo "Compressing final signage OS image..."
xz -f -k -9 "$OUTPUT_IMAGE_NAME"

echo "=== Build Pipeline Completed Successfully ==="
echo "Customized image is ready: $BUILD_DIR/${OUTPUT_IMAGE_NAME}.xz"
