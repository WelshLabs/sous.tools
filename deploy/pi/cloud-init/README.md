# Sous Tools Signage Node — Provisioning Guide

This directory contains the `cloud-init` configuration for zero-touch provisioning of
a Raspberry Pi 5 signage node. No custom OS image build is needed — uses stock
Raspberry Pi OS Lite (arm64).

---

## How it Works

```
Flash SD card (Raspberry Pi Imager)
  └─ Stock RPi OS Lite + user-data + Wi-Fi/SSH config
        │
        ▼ (first boot)
cloud-init runs firstboot-bootstrap.sh
  └─ Fetches GITHUB_PAT and VAULT_PASS from Infisical (one-time token)
        │
        ▼
ansible-pull from conarwelsh/sous.tools
  └─ Applies all 5 Ansible roles:
       system → user → secrets_bootstrap → config → services
        │
        ▼
Reboot → Kiosk launches automatically
```

---

## Step-by-Step Provisioning

### Prerequisites

1. A Raspberry Pi 5 with an SD card (≥16 GB)
2. Access to [app.infisical.com](https://app.infisical.com) to generate a one-time bootstrap token
3. [Raspberry Pi Imager](https://www.raspberrypi.com/software/) on your computer

### Step 1 — Generate a One-Time Bootstrap Token

In Infisical:
1. Navigate to your project → **Machine Identities**
2. Create a temporary identity with read-only access to the `prod` environment
3. Copy the **access token** (or use Universal Auth credentials)
4. Set an expiry (e.g. 24 hours) for security

### Step 2 — Edit `user-data`

Open `user-data` and replace the placeholder:
```
INFISICAL_ONETIME_TOKEN="REPLACE_WITH_ONETIME_INFISICAL_TOKEN"
```
with your actual token. **Do not commit this edited file.**

### Step 3 — Flash the SD Card

1. Open **Raspberry Pi Imager**
2. Click **Choose OS** → **Other** → **Raspberry Pi OS Lite (64-bit)**
3. Click **⚙️ Advanced Options**:
   - Set hostname (e.g. `signage-pi-01`)
   - Enable SSH, add your public key
   - Configure Wi-Fi (SSID + password)
4. Click **Write** → SD card is flashed

### Step 4 — Copy `user-data` to Boot Partition

After writing, the SD card's boot partition will be mounted. Copy the edited `user-data`:

**macOS:**
```bash
cp deploy/pi/cloud-init/user-data /Volumes/bootfs/user-data
```

**Linux / WSL:**
```bash
cp deploy/pi/cloud-init/user-data /media/$USER/bootfs/user-data
```

**Windows (PowerShell):**
```powershell
Copy-Item deploy\pi\cloud-init\user-data D:\user-data
```

### Step 5 — Boot the Pi

1. Insert the SD card into the Pi
2. Power on
3. Wait ~5–10 minutes for first-boot configuration to complete
4. The Pi will reboot automatically when done
5. After the second boot, the kiosk should launch

### Step 6 — Monitor Progress (optional)

SSH into the Pi and watch the log:
```bash
ssh soustools@<PI_IP>
sudo tail -f /var/log/sous-firstboot.log
```

Or check systemd journal for cloud-init:
```bash
sudo journalctl -u cloud-init -f
```

---

## Ongoing Updates

The Pi self-updates during its configured maintenance window (set in the Sous Tools admin UI):
- `sync-watchtower.js` detects the maintenance window
- Triggers `ansible-pull` from `conarwelsh/sous.tools` using the stored GitHub PAT
- All changes to the Ansible playbook are applied automatically

To manually push updates to a running Pi:
```bash
# From your dev machine
ansible-playbook -i deploy/ansible/inventory.ini deploy/ansible/playbook.yml --ask-vault-pass

# Specific tags only (e.g. just update scripts)
ansible-playbook -i deploy/ansible/inventory.ini deploy/ansible/playbook.yml --tags config --ask-vault-pass
```

---

## Required Infisical Secrets for Pi Bootstrap

The following secrets must exist in your Infisical project for the firstboot bootstrap to work:

| Secret Key | Description |
|---|---|
| `SIGNAGE_GITHUB_PAT` | GitHub fine-grained PAT with read-only access to `conarwelsh/sous.tools` |
| `SIGNAGE_VAULT_PASS` | Ansible vault password (the same one used to encrypt `vault.yml`) |
| `INFISICAL_CLIENT_ID` | Machine identity client ID for ongoing secret fetching |
| `INFISICAL_CLIENT_SECRET` | Machine identity client secret |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Cloud-init didn't run | Check that `user-data` is in the root of the boot partition (not a subdirectory) |
| ansible-pull failed | Check `/var/log/sous-firstboot.log` and confirm the GitHub PAT has correct repo access |
| Kiosk doesn't launch | Run `sudo journalctl -u signage-kiosk` to see labwc/chromium errors |
| Secrets not fetched | Run `sudo journalctl -u signage-secrets-fetch` to see Infisical auth errors |
