#!/bin/bash -e
# =============================================================================
# 01-run.sh  —  stage-sous HOST-SIDE setup (runs on the build machine)
# Installs all files from files/ into the target rootfs image.
# ROOTFS_DIR is provided by pi-gen pointing to the mounted target filesystem.
# =============================================================================

STAGE_DIR="$(cd "$(dirname "$0")" && pwd)"
FILES_DIR="${STAGE_DIR}/files"

# ── Create required directories in the rootfs ─────────────────────────────────
install -d -m 755 "${ROOTFS_DIR}/usr/local/bin"
install -d -m 755 "${ROOTFS_DIR}/etc/sway"
install -d -m 755 "${ROOTFS_DIR}/etc/sous"
install -d -m 700 "${ROOTFS_DIR}/etc/sous/secrets"
install -d -m 755 "${ROOTFS_DIR}/etc/NetworkManager/dispatcher.d"
install -d -m 700 "${ROOTFS_DIR}/etc/NetworkManager/system-connections"
install -d -m 700 "${ROOTFS_DIR}/home/sous/.ssh"
install -d -m 755 "${ROOTFS_DIR}/var/log"

# ── Sway compositor configs ───────────────────────────────────────────────────
install -m 644 "${FILES_DIR}/sway-base.conf"  "${ROOTFS_DIR}/etc/sway/sway-base.conf"
install -m 644 "${FILES_DIR}/sway-setup.conf" "${ROOTFS_DIR}/etc/sway/sway-setup.conf"
install -m 644 "${FILES_DIR}/sway-kiosk.conf" "${ROOTFS_DIR}/etc/sway/sway-kiosk.conf"

# Default symlink → setup mode on first boot
ln -sf /etc/sway/sway-setup.conf "${ROOTFS_DIR}/etc/sway/config"

# ── systemd unit files ────────────────────────────────────────────────────────
install -m 644 "${FILES_DIR}/sous-sway.service"          "${ROOTFS_DIR}/etc/systemd/system/sous-sway.service"
install -m 644 "${FILES_DIR}/sous-setup-portal.service"  "${ROOTFS_DIR}/etc/systemd/system/sous-setup-portal.service"
install -m 644 "${FILES_DIR}/sous-ota.service"           "${ROOTFS_DIR}/etc/systemd/system/sous-ota.service"
install -m 644 "${FILES_DIR}/sous-ota.timer"             "${ROOTFS_DIR}/etc/systemd/system/sous-ota.timer"
install -m 644"${FILES_DIR}/chromium-kiosk@.service"    "${ROOTFS_DIR}/etc/systemd/system/chromium-kiosk@.service"

# ── Executable helper scripts ─────────────────────────────────────────────────
install -m 755 "${FILES_DIR}/sous-sway-config-select.sh"  "${ROOTFS_DIR}/usr/local/bin/sous-sway-config-select.sh"
install -m 755 "${FILES_DIR}/sous-ota-scheduler.sh"       "${ROOTFS_DIR}/usr/local/bin/sous-ota-scheduler.sh"
install -m 755 "${FILES_DIR}/maintenance-ota.sh"          "${ROOTFS_DIR}/usr/local/bin/maintenance-ota.sh"
install -m 755 "${FILES_DIR}/bootstrap.sh"                "${ROOTFS_DIR}/usr/local/bin/bootstrap.sh"

# ── NetworkManager ────────────────────────────────────────────────────────────
install -m 755 "${FILES_DIR}/nm-dispatcher-captive" \
  "${ROOTFS_DIR}/etc/NetworkManager/dispatcher.d/90-captive-portal"

install -m 600 "${FILES_DIR}/sous-hotspot.nmconnection" \
  "${ROOTFS_DIR}/etc/NetworkManager/system-connections/Sous-Signage-Setup.nmconnection"

# ── SSH Deploy Key  (signage-deploy-key written by CI from Infisical) ─────────
if [ -f "${FILES_DIR}/signage-deploy-key" ]; then
  install -m 600 "${FILES_DIR}/signage-deploy-key" \
    "${ROOTFS_DIR}/home/sous/.ssh/id_ed25519"
else
  echo "WARNING: signage-deploy-key not found — SSH pull from GitHub will fail on device."
fi

# ── Default device configuration ─────────────────────────────────────────────
cat > "${ROOTFS_DIR}/etc/sous/device-config.json" <<'EOJSON'
{
  "kiosk_mode": "setup",
  "maintenance_window": { "hour": 2, "minute": 0, "dayOfWeek": null },
  "operating_hours": { "wake_hour": 6, "wake_minute": 0, "sleep_hour": 22, "sleep_minute": 0 },
  "pairing_code": null,
  "device_id": null,
  "paired_at": null,
  "last_ota_at": null
}
EOJSON

# ── Phase state file (setup → kiosk after pairing) ────────────────────────────
echo "setup" > "${ROOTFS_DIR}/etc/sous/kiosk-mode"

# ── Bootstrap log placeholder ─────────────────────────────────────────────────
touch "${ROOTFS_DIR}/var/log/sous-bootstrap.log"
