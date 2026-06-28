# Sous Tools Signage Node — Raspberry Pi 5

This directory contains the provisioning configuration for Sous Tools digital signage kiosks
running on Raspberry Pi 5 hardware.

---

## Quick Start: Provision a New Pi

> See **[cloud-init/README.md](cloud-init/README.md)** for the full step-by-step guide.

**Summary:**
1. Download stock [Raspberry Pi OS Lite (64-bit)](https://www.raspberrypi.com/software/operating-systems/)
2. Flash with **Raspberry Pi Imager** — configure Wi-Fi and SSH key via the ⚙️ Advanced Options UI
3. Copy `cloud-init/user-data` to the SD card's boot partition
4. Insert SD card → Pi auto-configures on first boot (~5–10 min)
5. Pi reboots → kiosk launches automatically

No custom image build. No QEMU. No `sdm`.

---

## Directory Structure

```
deploy/pi/
└── cloud-init/
    ├── user-data     # cloud-init config for zero-touch firstboot provisioning
    └── README.md     # Full provisioning guide
```

**All runtime scripts and systemd service templates live in:**
```
deploy/ansible/roles/config/files/    # kiosk.sh, sync-watchtower.js, fetch-secrets.js, etc.
deploy/ansible/roles/services/templates/  # systemd .service.j2 templates
```

---

## System Architecture

```
Raspberry Pi 5
├── Labwc (Wayland compositor)
│   └── kiosk.sh (launches Chromium instances)
│       ├── HDMI-A-1 → Chromium "SignageDisplay1" (kiosk mode)
│       └── HDMI-A-2 → Chromium "SignageDisplay2" (kiosk mode)
├── signage-app (Docker container: conarwelsh/sous-signage)
│   └── Receives env vars from Infisical via fetch-secrets.js
├── sync-watchtower.js (Node.js daemon)
│   ├── Reads device settings from Supabase
│   ├── Schedules Watchtower container updates
│   └── Triggers ansible-pull during maintenance window
└── systemd services
    ├── signage-secrets-fetch   (fetches secrets from Infisical on boot)
    ├── signage-kiosk           (runs labwc + chromium)
    ├── signage-app             (runs Docker signage container)
    ├── signage-sync            (runs sync-watchtower daemon)
    └── signage-ansible-update  (self-update via ansible-pull)
```

---

## Ongoing Updates

The Pi self-updates automatically during the maintenance window configured in the admin UI:
- **Signage container**: Watchtower pulls new Docker image from Docker Hub
- **System config**: `ansible-pull` applies playbook changes from this repo

To manually push a configuration update to running Pi(s):
```bash
ansible-playbook -i deploy/ansible/inventory.ini deploy/ansible/playbook.yml --ask-vault-pass

# Update scripts only:
ansible-playbook -i deploy/ansible/inventory.ini deploy/ansible/playbook.yml --tags config --ask-vault-pass
```

---

## Security Model

| Secret | Location | How it gets there |
|---|---|---|
| Infisical client ID + secret | `/etc/sous-infisical.env` | Written by Ansible `secrets_bootstrap` role (from vault) |
| GitHub PAT (ansible-pull) | `/etc/sous-github-pat` | Written by Ansible `secrets_bootstrap` role (from vault) |
| Ansible vault password | `/etc/sous-ansible-vault-pass` | Written by Ansible `secrets_bootstrap` role (from vault) |
| Supabase URL + anon key | `/etc/sous-secrets.env` | Fetched from Infisical at boot by `fetch-secrets.js` |

**No secrets are stored in this repository.** The Ansible vault (`vault.yml`) is gitignored.

---

## User Account

- **Username**: `soustools`
- **Auto-login**: Enabled via systemd getty autologin
- **Linger**: Enabled via `loginctl` (allows systemd user services without active session)
