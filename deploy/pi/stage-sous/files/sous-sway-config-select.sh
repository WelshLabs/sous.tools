#!/bin/bash -e
# =============================================================================
# sous-sway-config-select.sh
# Reads /etc/sous/kiosk-mode and symlinks the appropriate sway config.
# Called by sous-sway.service ExecStartPre= before the compositor launches.
# =============================================================================

KIOSK_MODE_FILE="/etc/sous/kiosk-mode"
SWAY_CONFIG_LINK="/etc/sway/config"
SETUP_CONF="/etc/sway/sway-setup.conf"
KIOSK_CONF="/etc/sway/sway-kiosk.conf"

MODE="$(cat "${KIOSK_MODE_FILE}" 2>/dev/null | tr -d '[:space:]' || echo 'setup')"

case "${MODE}" in
  kiosk)
    TARGET="${KIOSK_CONF}"
    ;;
  setup|*)
    TARGET="${SETUP_CONF}"
    ;;
esac

if [ ! -f "${TARGET}" ]; then
  echo "[sous-sway-config-select] ERROR: target config not found: ${TARGET}" >&2
  exit 1
fi

ln -sf "${TARGET}" "${SWAY_CONFIG_LINK}"
echo "[sous-sway-config-select] Mode='${MODE}' → config symlinked to ${TARGET}"
