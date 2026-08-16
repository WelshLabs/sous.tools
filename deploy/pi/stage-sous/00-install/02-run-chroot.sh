#!/bin/bash -e
# =============================================================================
# 02-run-chroot.sh  —  stage-sous CHROOT-SIDE setup
# Runs INSIDE the Pi's root filesystem (ARM64 chroot).
# This script configures: Node 22, pnpm, SSH, sudoers, systemd services,
# autologin, and the graphical target.
# =============================================================================

set -euo pipefail

echo "=== [stage-sous chroot] Starting Sous Signage Node configuration ==="

# ── Node.js 22 (LTS) via NodeSource ──────────────────────────────────────────
echo "--- Installing Node.js 22 via NodeSource..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs
node --version
npm --version

# ── pnpm (global, pinned major) ───────────────────────────────────────────────
echo "--- Installing pnpm..."
npm install -g pnpm@9
pnpm --version

# ── Fix ownership of sous home and baked SSH key ──────────────────────────────
echo "--- Configuring SSH for sous user..."
chown -R sous:sous /home/sous/.ssh || true
chmod 700 /home/sous/.ssh          || true

if [ -f /home/sous/.ssh/id_ed25519 ]; then
  chmod 600 /home/sous/.ssh/id_ed25519
  chown sous:sous /home/sous/.ssh/id_ed25519
fi

# ── SSH config stanza (deploy key → GitHub) ───────────────────────────────────
cat > /home/sous/.ssh/config <<'EOSSH'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519
  StrictHostKeyChecking accept-new
  AddKeysToAgent no
  BatchMode yes
EOSSH
chmod 600 /home/sous/.ssh/config
chown sous:sous /home/sous/.ssh/config

# ── Pre-scan GitHub host key so first git pull is non-interactive ─────────────
# We use the official fingerprint; ssh-keyscan inside chroot may not have network.
# The key is also seeded via StrictHostKeyChecking=accept-new on first real pull.
cat >> /home/sous/.ssh/known_hosts <<'EOKNOWN'
github.com ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOMqqnkVzrm0SdG6UOoqKLsabgH5C9okWi0dh2l9GKJl
EOKNOWN
chmod 644 /home/sous/.ssh/known_hosts
chown sous:sous /home/sous/.ssh/known_hosts

# ── sudoers: allow Next.js API routes to run kiosk helpers without password ───
echo "--- Configuring sudoers for kiosk helpers..."
cat > /etc/sudoers.d/99-sous-kiosk <<'EOSUDO'
# Allow the sous user (running the setup-portal Node server) to perform
# compositor mode switches and hostapd toggling without a password prompt.
Defaults:sous !requiretty
sous ALL=(ALL) NOPASSWD: /usr/local/bin/sous-labwc-config-select.sh
sous ALL=(ALL) NOPASSWD: /bin/systemctl restart sous-labwc.service
sous ALL=(ALL) NOPASSWD: /bin/systemctl start   sous-labwc.service
sous ALL=(ALL) NOPASSWD: /bin/systemctl stop    sous-labwc.service
sous ALL=(ALL) NOPASSWD: /usr/bin/pkill -x wl-mirror
sous ALL=(ALL) NOPASSWD: /usr/bin/tee /etc/sous/kiosk-mode
sous ALL=(ALL) NOPASSWD: /bin/nmcli connection up   Sous-Signage-Setup
sous ALL=(ALL) NOPASSWD: /bin/nmcli connection down Sous-Signage-Setup
EOSUDO
chmod 440 /etc/sudoers.d/99-sous-kiosk
# Validate — fail the build if sudoers syntax is broken
visudo -c

# ── Ensure /etc/sous is owned by sous ────────────────────────────────────────
chown -R sous:sous /etc/sous
chmod 755 /etc/sous
chmod 600 /etc/sous/kiosk-mode

# ── Autologin for 'sous' on tty1 (required for Wayland/DRM access) ───────────
echo "--- Configuring autologin on tty1..."
mkdir -p /etc/systemd/system/getty@tty1.service.d/
cat > /etc/systemd/system/getty@tty1.service.d/autologin.conf <<'EOCNF'
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin sous --noclear %I $TERM
Type=idle
EOCNF

# ── Enable linger so sous user services can run at boot ──────────────────────
loginctl enable-linger sous 2>/dev/null || true

# ── Enable required systemd services ─────────────────────────────────────────
echo "--- Enabling systemd services..."
systemctl enable sous-labwc.service
systemctl enable sous-setup-portal.service
systemctl enable sous-ota.timer
systemctl enable NetworkManager.service

# ── Set graphical.target as the default boot target ──────────────────────────
systemctl set-default graphical.target

# ── Bootstrap log placeholder (writable by sous) ─────────────────────────────
touch /var/log/sous-bootstrap.log
chown sous:sous /var/log/sous-bootstrap.log
chmod 644 /var/log/sous-bootstrap.log

echo "=== [stage-sous chroot] Configuration complete ==="
