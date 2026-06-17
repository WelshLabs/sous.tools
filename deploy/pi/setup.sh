#!/bin/bash
# setup.sh - Raspberry Pi 5 Signage Node Setup Installer
# Sets up dependencies, configurations, auto-starts, and updates.

set -e

echo "=== Starting Sous Tools Signage Client Setup ==="

# 1. Update system packages
echo "Updating packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install dependencies (Labwc, Chromium, Docker)
echo "Installing Labwc, Chromium, and Docker..."
sudo apt-get install -y labwc chromium-browser docker.io curl git nodejs npm

# 3. Enable user lingering for background execution and console autologin
echo "Enabling linger and console autologin for soustools..."
sudo loginctl enable-linger soustools
sudo raspi-config nonint do_boot_behaviour B2

# 4. Create config directories and copy Labwc rules
echo "Configuring Labwc rules..."
mkdir -p /home/soustools/.config/labwc
cp ./labwc-rc.xml /home/soustools/.config/labwc/rc.xml
chown -R soustools:soustools /home/soustools/.config/labwc

# 5. Copy kiosk script and make executable
echo "Configuring Kiosk script..."
mkdir -p /home/soustools/signage
cp ./kiosk.sh /home/soustools/signage/kiosk.sh
chmod +x /home/soustools/signage/kiosk.sh
chown -R soustools:soustools /home/soustools/signage

# 6. Setup systemd service for auto-start on boot
echo "Creating systemd auto-start kiosk service..."
sudo bash -c 'cat > /etc/systemd/system/signage-kiosk.service <<EOF
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
EOF'

# Enable the service
sudo systemctl daemon-reload
sudo systemctl enable signage-kiosk.service

# 7. Configure Watchtower for headless docker auto-updates (handled dynamically by sync-watchtower)
echo "Setting up sync-watchtower daemon..."
mkdir -p /home/soustools/signage/sync
cp ./sync-watchtower.js /home/soustools/signage/sync/sync-watchtower.js
chown -R soustools:soustools /home/soustools/signage/sync

# Create service for sync-watchtower
sudo bash -c 'cat > /etc/systemd/system/signage-sync.service <<EOF
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
EOF'

# 8. Create template Infisical env file if not present
if [ ! -f /etc/sous-infisical.env ]; then
  sudo bash -c 'cat > /etc/sous-infisical.env <<EOF
INFISICAL_CLIENT_ID=your-client-id
INFISICAL_CLIENT_SECRET=your-client-secret
INFISICAL_PROJECT_ID=your-project-id
INFISICAL_ENV=prod
SIGNAGE_IMAGE_TAG=production
EOF'
  echo "Template /etc/sous-infisical.env created. Please configure it with your Infisical credentials."
fi

# 9. Configure fetch-secrets script
echo "Configuring fetch-secrets script..."
mkdir -p /home/soustools/signage/secrets
cp ./fetch-secrets.js /home/soustools/signage/secrets/fetch-secrets.js
chmod +x /home/soustools/signage/secrets/fetch-secrets.js
chown -R soustools:soustools /home/soustools/signage/secrets

# Create systemd service for fetching secrets on boot
sudo bash -c 'cat > /etc/systemd/system/signage-secrets-fetch.service <<EOF
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
EOF'

# 10. Create systemd service for signage app container
echo "Creating systemd service for signage docker container..."
sudo bash -c 'cat > /etc/systemd/system/signage-app.service <<EOF
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
EOF'

sudo systemctl daemon-reload
sudo systemctl enable signage-sync.service
sudo systemctl enable signage-secrets-fetch.service
sudo systemctl enable signage-app.service

echo "=== Signage Client Setup Completed Successfully ==="
echo "Please reboot your Raspberry Pi to initiate the kiosk."
