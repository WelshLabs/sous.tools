#!/bin/bash
# =============================================================================
# bootstrap.sh  —  First-boot provisioning script
# Run once on first internet connection (triggered by NM dispatcher or manually).
# Clones the monorepo, runs ansible-pull, registers device with Supabase API,
# and writes the pairing code to /etc/sous/device-config.json.
#
# All output is tee'd to /var/log/sous-bootstrap.log for the SSE progress stream.
# =============================================================================

set -euo pipefail

LOG_FILE="/var/log/sous-bootstrap.log"
CONFIG_FILE="/etc/sous/device-config.json"
REPO_DIR="/opt/sous.tools"
REPO_SSH="git@github.com:conarwelsh/sous.tools.git"
ANSIBLE_VAULT_PASS="/etc/sous/secrets/ansible-vault-pass"
API_URL="${SOUS_API_URL:-https://api.sous.tools}"

# Re-exec with tee so all output flows to the log (read by /api/progress SSE)
exec > >(tee -a "${LOG_FILE}") 2>&1

echo "================================================="
echo " Sous Signage Node Bootstrap — $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "================================================="

# ── Step 1: Wait for network (max 60s) ────────────────────────────────────────
echo "[1/6] Waiting for internet connectivity..."
for i in $(seq 1 12); do
  if curl -sf --max-time 5 https://github.com > /dev/null 2>&1; then
    echo "  ✓ Network is up"
    break
  fi
  echo "  … attempt ${i}/12"
  sleep 5
  if [ "${i}" -eq 12 ]; then
    echo "  ✗ Network timeout — aborting bootstrap"
    exit 1
  fi
done

# ── Step 2: Clone or pull the monorepo ────────────────────────────────────────
echo "[2/6] Syncing monorepo from ${REPO_SSH}..."
export GIT_SSH_COMMAND="ssh -i /home/sous/.ssh/id_ed25519 -o StrictHostKeyChecking=accept-new -o BatchMode=yes"

if [ -d "${REPO_DIR}/.git" ]; then
  echo "  Repo exists — pulling latest..."
  git -C "${REPO_DIR}" pull --ff-only origin main
else
  echo "  Cloning fresh..."
  git clone --depth=1 "${REPO_SSH}" "${REPO_DIR}"
  chown -R sous:sous "${REPO_DIR}"
fi
echo "  ✓ Repo at $(git -C "${REPO_DIR}" rev-parse --short HEAD)"

# ── Step 3: Build setup-portal (standalone Next.js) ──────────────────────────
echo "[3/6] Installing dependencies and building setup-portal..."
cd "${REPO_DIR}"
pnpm install --frozen-lockfile --filter=@soustools/setup-portal
pnpm build --filter=@soustools/setup-portal
echo "  ✓ setup-portal built"

# ── Step 4: Run ansible-pull (OS-level configuration) ────────────────────────
echo "[4/6] Running ansible-pull for OS configuration..."
if [ -f "${ANSIBLE_VAULT_PASS}" ]; then
  VAULT_ARGS="--vault-password-file ${ANSIBLE_VAULT_PASS}"
else
  VAULT_ARGS=""
  echo "  WARN: No vault password file — skipping encrypted vars"
fi

ansible-pull \
  --url "${REPO_SSH}" \
  "${REPO_DIR}/deploy/ansible/playbook.yml" \
  --inventory localhost, \
  --connection local \
  --tags "config,services" \
  ${VAULT_ARGS} \
  2>&1 || echo "  WARN: ansible-pull exited non-zero — continuing"
echo "  ✓ ansible-pull complete"

# ── Step 5: Register device with Supabase API → get pairing code ─────────────
echo "[5/6] Registering device with Sous API..."
MACHINE_ID="$(cat /etc/machine-id 2>/dev/null || hostname)"
HOSTNAME="$(hostname)"
TIMEZONE="$(cat /etc/timezone 2>/dev/null || echo 'UTC')"

RESPONSE="$(curl -sf --max-time 15 \
  -X POST "${API_URL}/api/devices/register" \
  -H "Content-Type: application/json" \
  -d "{\"machine_id\":\"${MACHINE_ID}\",\"hostname\":\"${HOSTNAME}\",\"timezone\":\"${TIMEZONE}\"}" \
  2>&1)" || {
  echo "  ✗ Failed to register device — pairing code will be unavailable"
  echo "  ${RESPONSE}"
  RESPONSE='{"pairing_code":"ERROR","device_id":null}'
}

PAIRING_CODE="$(echo "${RESPONSE}" | jq -r '.pairing_code // "UNKNOWN"')"
DEVICE_ID="$(echo "${RESPONSE}" | jq -r '.device_id // null')"
echo "  ✓ Pairing code: ${PAIRING_CODE}  device_id: ${DEVICE_ID}"

# Write pairing code and device_id back to device config
jq \
  --arg code "${PAIRING_CODE}" \
  --arg did "${DEVICE_ID}" \
  '.pairing_code = $code | .device_id = $did' \
  "${CONFIG_FILE}" | sponge "${CONFIG_FILE}"

# ── Step 6: Restart setup-portal to pick up new build + pairing code ──────────
echo "[6/6] Restarting setup-portal service..."
systemctl restart sous-setup-portal.service || true
echo "  ✓ Setup portal restarted"

echo "================================================="
echo " Bootstrap complete — pairing code: ${PAIRING_CODE}"
echo " Connect to the web dashboard to complete setup."
echo "================================================="
