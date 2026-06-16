#!/bin/bash
# customize-chroot.sh - Raspberry Pi OS image customization script (runs inside chroot)
# Configures the signage system settings directly on the OS image.

set -e

echo "=== Customizing OS Image Chroot ==="

# 1. Install Node.js, Docker, Labwc, and Chromium
echo "Installing base packages..."
apt-get update
apt-get install -y labwc chromium-browser docker.io curl git nodejs npm

# 2. Add soustools user to the docker group
echo "Configuring user permissions..."
usermod -aG docker soustools
loginctl enable-linger soustools

# 3. Create directories for config and signage app
echo "Creating application directories..."
mkdir -p /home/soustools/.config/labwc
mkdir -p /home/soustools/signage/sync

# 4. Copy files (placed in chroot /tmp by build-signage-image.sh)
echo "Deploying client scripts..."
cp /tmp/labwc-rc.xml /home/soustools/.config/labwc/rc.xml
cp /tmp/kiosk.sh /home/soustools/signage/kiosk.sh
cp /tmp/sync-watchtower.js /home/soustools/signage/sync/sync-watchtower.js

chmod +x /home/soustools/signage/kiosk.sh
chown -R soustools:soustools /home/soustools/.config
chown -R soustools:soustools /home/soustools/signage

# 5. Create Systemd service for signage kiosk launcher
echo "Creating systemd kiosk service..."
cat > /etc/systemd/system/signage-kiosk.service <<EOF
[Unit]
Description=Sous Tools Digital Signage Kiosk Launcher
After=network.target sound.target

[Service]
Type=simple
User=soustools
Environment=XDG_RUNTIME_DIR=/run/user/1000
ExecStart=/usr/bin/labwc -s /home/soustools/signage/kiosk.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 6. Create Systemd service for Watchtower sync daemon
echo "Creating systemd sync service..."
cat > /etc/systemd/system/signage-sync.service <<EOF
[Unit]
Description=Sous Tools Signage Watchtower Sync Daemon
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/home/soustools/signage/sync
ExecStart=/usr/bin/node /home/soustools/signage/sync/sync-watchtower.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable services
systemctl enable signage-kiosk.service
systemctl enable signage-sync.service

# 7. Configure console autologin behavior
echo "Enabling console autologin behavior..."
# raspi-config autologin sets lightdm or systemd gettys. For console autologin:
systemctl set-default multi-user.target
ln -fs /lib/systemd/system/getty@.service /etc/systemd/system/getty.target.wants/getty@tty1.service

cat > /etc/systemd/system/getty@tty1.service.d/autologin.conf <<EOF
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin soustools --noclear %I \$TERM
EOF

echo "=== Chroot Customization Completed Successfully ==="
