#!/bin/bash
# =============================================================================
# maintenance-ota.sh  —  OTA Update Engine
# Triggered by sous-ota.timer during the configured maintenance_window.
# Uses a lockfile to prevent concurrent runs (e.g. if a previous OTA hung).
# =============================================================================

set -euo pipefail

LOCK_FILE="/var/lock/sous-ota.lock"
LOG_FILE="/var/log/sous-ota.log"
CONFIG_FILE="/etc/sous/device-config.json"
REPO_DIR="/opt/sous.tools"
ANSIBLE_VAULT_PASS="/etc/sous/secrets/ansible-vault-pass"
REPO_SSH="git@github.com:WelshLabs/sous.tools.git"
API_URL="${SOUS_API_URL:-https://api.sous.tools}"
DEVICE_ID="$(jq -r '.device_id // ""' "${CONFIG_FILE}" 2>/dev/null)"

exec > >(tee -a "${LOG_FILE}") 2>&1

echo "================================================="
echo " Sous OTA Update — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "================================================="

# ── Step 1: Acquire exclusive lock ────────────────────────────────────────────
exec 9>"${LOCK_FILE}"
if ! flock -n 9; then
  echo "[OTA] Another OTA run is active — aborting"
  exit 0
fi
echo "[OTA] Lock acquired"

# ── Step 2: Pull latest monorepo ─────────────────────────────────────────────
echo "[OTA] Pulling latest from ${REPO_SSH}..."
export GIT_SSH_COMMAND="ssh -i /home/sous/.ssh/id_ed25519 -o StrictHostKeyChecking=accept-new -o BatchMode=yes"

BEFORE_SHA="$(git -C "${REPO_DIR}" rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
git -C "${REPO_DIR}" fetch origin main --depth=1
git -C "${REPO_DIR}" reset --hard origin/main
AFTER_SHA="$(git -C "${REPO_DIR}" rev-parse --short HEAD)"

if [ "${BEFORE_SHA}" = "${AFTER_SHA}" ]; then
  echo "[OTA] No code changes since last run (${BEFORE_SHA}) — skipping build"
  BUILD_NEEDED=false
else
  echo "[OTA] Code updated: ${BEFORE_SHA} → ${AFTER_SHA}"
  BUILD_NEEDED=true
fi

# ── Step 3: Install dependencies + build (only if code changed) ──────────────
if [ "${BUILD_NEEDED}" = "true" ]; then
  echo "[OTA] Running pnpm install..."
  cd "${REPO_DIR}"
  pnpm install --frozen-lockfile --filter=@soustools/setup-portal

  echo "[OTA] Building setup-portal..."
  pnpm build --filter=@soustools/setup-portal
  echo "[OTA] Build complete"
fi

# ── Step 4: Run ansible-pull (OS-level config changes) ───────────────────────
echo "[OTA] Running ansible-pull..."
VAULT_ARGS=""
[ -f "${ANSIBLE_VAULT_PASS}" ] && VAULT_ARGS="--vault-password-file ${ANSIBLE_VAULT_PASS}"

ansible-pull \
  --url "${REPO_SSH}" \
  "${REPO_DIR}/deploy/ansible/playbook.yml" \
  --inventory localhost, \
  --connection local \
  --tags "config,services" \
  ${VAULT_ARGS} \
  2>&1 || echo "[OTA] WARN: ansible-pull exited non-zero"
echo "[OTA] ansible-pull done"

# ── Step 5: Restart setup-portal ──────────────────────────────────────────────
echo "[OTA] Restarting sous-setup-portal.service..."
systemctl restart sous-setup-portal.service || true

# ── Step 6: Soft-reload Chromium kiosk instances (SIGUSR1 = page reload) ─────
KIOSK_MODE="$(cat /etc/sous/kiosk-mode 2>/dev/null || echo 'setup')"
if [ "${KIOSK_MODE}" = "kiosk" ]; then
  echo "[OTA] Soft-reloading Chromium instances..."
  systemctl kill -s SIGUSR1 "chromium-kiosk@screen-1.service" 2>/dev/null || true
  systemctl kill -s SIGUSR1 "chromium-kiosk@screen-2.service" 2>/dev/null || true
  echo "[OTA] Chromium reload signals sent"
fi

# ── Step 7: Stamp last_ota_at in device config ────────────────────────────────
NOW_ISO="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
jq --arg ts "${NOW_ISO}" --arg sha "${AFTER_SHA}" \
  '.last_ota_at = $ts | .last_ota_sha = $sha' \
  "${CONFIG_FILE}" | sponge "${CONFIG_FILE}"
echo "[OTA] Stamped last_ota_at=${NOW_ISO} sha=${AFTER_SHA}"

# ── Step 8: Heartbeat report to Sous API ─────────────────────────────────────
if [ -n "${DEVICE_ID}" ]; then
  curl -sf --max-time 10 \
    -X POST "${API_URL}/api/devices/heartbeat" \
    -H "Content-Type: application/json" \
    -d "{\"device_id\":\"${DEVICE_ID}\",\"event\":\"ota_complete\",\"sha\":\"${AFTER_SHA}\"}" \
    > /dev/null 2>&1 || echo "[OTA] WARN: heartbeat API call failed (offline?)"
fi

echo "================================================="
echo " OTA complete — sha=${AFTER_SHA} at ${NOW_ISO}"
echo "================================================="

# Release lock automatically when script exits (flock releases on fd close)
