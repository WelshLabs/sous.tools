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
sudo apt-get install -y labwc chromium-browser docker.io curl git

# 3. Create config directories and copy Labwc rules
echo "Configuring Labwc rules..."
mkdir -p /home/conar/.config/labwc
cp ./labwc-rc.xml /home/conar/.config/labwc/rc.xml
chown -R conar:conar /home/conar/.config/labwc

# 4. Copy kiosk script and make executable
echo "Configuring Kiosk script..."
mkdir -p /home/conar/signage
cp ./kiosk.sh /home/conar/signage/kiosk.sh
chmod +x /home/conar/signage/kiosk.sh
chown -R conar:conar /home/conar/signage

# 5. Setup systemd service for auto-start on boot
echo "Creating systemd auto-start kiosk service..."
sudo bash -c 'cat > /etc/systemd/system/signage-kiosk.service <<EOF
[Unit]
Description=Sous Tools Digital Signage Kiosk Launcher
After=network.target sound.target

[Service]
Type=simple
User=conar
Environment=XDG_RUNTIME_DIR=/run/user/1000
ExecStart=/usr/bin/labwc -s /home/conar/signage/kiosk.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF'

# Enable the service
sudo systemctl daemon-reload
sudo systemctl enable signage-kiosk.service

# 6. Configure Watchtower for headless docker auto-updates
echo "Configuring Watchtower container updates..."
if sudo docker ps -a | grep -q watchtower; then
  echo "Watchtower is already configured."
else
  sudo docker run -d \
    --name watchtower \
    --restart always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    containrrr/watchtower \
    --cleanup \
    --interval 300
fi

echo "=== Signage Client Setup Completed Successfully ==="
echo "Please reboot your Raspberry Pi to initiate the kiosk."
