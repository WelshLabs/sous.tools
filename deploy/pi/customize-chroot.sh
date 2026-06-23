#!/bin/bash
# customize-chroot.sh - Raspberry Pi OS image customization script (runs inside chroot)
# Configures the signage system settings directly on the OS image.

# SDM calls this script 3 times. 
# We only want to execute our configuration inside the chroot (Phase 1).
if [ "$1" != "1" ]; then
    exit 0
fi

set -e

echo "=== Customizing OS Image Chroot ==="

# Non-interactive apt and alternate cache to avoid filling /var/cache
export DEBIAN_FRONTEND=noninteractive
mkdir -p /tmp/apt-archives
chmod 1777 /tmp/apt-archives

# 1. Install Node.js, Docker, Labwc, and Chromium
echo "Installing base packages..."
apt-get -o Dir::Cache::archives=/tmp/apt-archives update
apt-get -o Dir::Cache::archives=/tmp/apt-archives install -y --no-install-recommends labwc chromium-browser docker.io curl git nodejs npm

# Aggressive cleanup to free disk space immediately
echo "Cleaning up package cache..."
apt-get clean
apt-get autoclean
apt-get autoremove -y
rm -rf /var/lib/apt/lists/*
rm -rf /var/cache/apt/archives/*
rm -rf /tmp/*

echo "Disk space after cleanup:"
df -h

# 2. Add soustools user to the docker group
echo "Configuring user permissions..."
usermod -aG docker soustools
loginctl enable-linger soustools

# 3. Create directories for config and signage app
echo "Creating application directories..."
mkdir -p /home/soustools/.config/labwc
mkdir -p /home/soustools/signage/sync
mkdir -p /home/soustools/signage/secrets

# 4. Copy files (placed in chroot /tmp by build-signage-image.sh)
echo "Deploying client scripts..."
cp /tmp/labwc-rc.xml /home/soustools/.config/labwc/rc.xml
cp /tmp/kiosk.sh /home/soustools/signage/kiosk.sh
cp /tmp/sync-watchtower.js /home/soustools/signage/sync/sync-watchtower.js
cp /tmp/fetch-secrets.js /home/soustools/signage/secrets/fetch-secrets.js
cp /tmp/tv-sleep.sh /home/soustools/signage/tv-sleep.sh
cp /tmp/tv-wake.sh /home/soustools/signage/tv-wake.sh

chmod +x /home/soustools/signage/kiosk.sh
chmod +x /home/soustools/signage/tv-sleep.sh
chmod +x /home/soustools/signage/tv-wake.sh
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
After=network.target signage-secrets-fetch.service
Requires=signage-secrets-fetch.service

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

# 7. Create systemd service for fetching secrets on boot
cat > /etc/systemd/system/signage-secrets-fetch.service <<EOF
[Unit]
Description=Sous Tools Signage Secrets Fetcher
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=root
ExecStart=/usr/bin/node /home/soustools/signage/secrets/fetch-secrets.js
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

# 8. Create systemd service for signage app container
cat > /etc/systemd/system/signage-app.service <<EOF
[Unit]
Description=Sous Tools Signage Docker Application
After=docker.service network.target signage-secrets-fetch.service
Requires=docker.service signage-secrets-fetch.service

[Service]
TimeoutStartSec=0
Restart=always
EnvironmentFile=/etc/sous-infisical.env
ExecStartPre=-/usr/bin/docker stop signage
ExecStartPre=-/usr/bin/docker rm signage
ExecStart=/usr/bin/docker run --name signage \\
  -p 5003:5003 \\
  -e INFISICAL_CLIENT_ID=\${INFISICAL_CLIENT_ID} \\
  -e INFISICAL_CLIENT_SECRET=\${INFISICAL_CLIENT_SECRET} \\
  -e INFISICAL_PROJECT_ID=\${INFISICAL_PROJECT_ID} \\
  -e INFISICAL_ENV=\${INFISICAL_ENV} \\
  conarwelsh/sous-signage:\${SIGNAGE_IMAGE_TAG}

[Install]
WantedBy=multi-user.target
EOF

# Enable services
systemctl enable signage-kiosk.service
systemctl enable signage-sync.service
systemctl enable signage-secrets-fetch.service
systemctl enable signage-app.service

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
