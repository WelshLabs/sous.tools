#!/bin/bash -e

# Move the captive portal to a dedicated opt/ directory
mkdir -p "${ROOTFS_DIR}/opt/sous-tools/portal"
cp -r files/setup-portal/* "${ROOTFS_DIR}/opt/sous-tools/portal/"

# Install the dual-screen Chromium launch script
install -m 755 files/kiosk.sh "${ROOTFS_DIR}/usr/local/bin/kiosk.sh"

# Install the Wayland window rules mapping SignageOne to TV1 and SignageTwo to TV2
mkdir -p "${ROOTFS_DIR}/etc/labwc"
install -m 644 files/labwc-rc.xml "${ROOTFS_DIR}/etc/labwc/rc.xml"

on_chroot << EOF
systemctl enable signage-kiosk.service
systemctl set-default graphical.target
EOF
