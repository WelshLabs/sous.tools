#!/bin/bash -e
# =============================================================================
# sous-labwc-config-select.sh
# Reads /etc/sous/kiosk-mode and symlinks the appropriate labwc autostart script.
# Called by sous-labwc.service ExecStartPre= before labwc starts.
# =============================================================================

KIOSK_MODE_FILE="/etc/sous/kiosk-mode"
LABWC_DIR="/etc/xdg/labwc"
AUTOSTART_LINK="${LABWC_DIR}/autostart"
SETUP_AUTOSTART="${LABWC_DIR}/autostart-setup.sh"
KIOSK_AUTOSTART="${LABWC_DIR}/autostart-kiosk.sh"

mkdir -p "${LABWC_DIR}"

MODE="$(cat "${KIOSK_MODE_FILE}" 2>/dev/null | tr -d '[:space:]' || echo 'setup')"

case "${MODE}" in
  kiosk)
    TARGET="${KIOSK_AUTOSTART}"
    ;;
  setup|*)
    TARGET="${SETUP_AUTOSTART}"
    ;;
esac

if [ ! -f "${TARGET}" ]; then
  echo "[sous-labwc-config-select] ERROR: target autostart script not found: ${TARGET}" >&2
  exit 1
fi

ln -sf "${TARGET}" "${AUTOSTART_LINK}"
echo "[sous-labwc-config-select] Mode='${MODE}' → autostart symlinked to ${TARGET}"
