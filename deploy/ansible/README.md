# Sous Tools — Ansible Playbook for Pi Signage Nodes

Manages configuration of Raspberry Pi 5 signage nodes over SSH.

## Directory Structure

```
deploy/ansible/
├── ansible.cfg               # Ansible settings (inventory, roles path, etc.)
├── playbook.yml              # Main entry point
├── inventory.ini.tpl         # Template — copy to inventory.ini (gitignored)
├── group_vars/
│   └── all/
│       ├── vars.yml          # Non-secret vars (paths, usernames) — committed
│       ├── vault.yml.tpl     # Template for encrypted secrets — committed
│       └── vault.yml         # GITIGNORED — encrypted with ansible-vault
└── roles/
    ├── system/               # OS packages (labwc, chromium, docker, nodejs, ansible)
    ├── user/                 # soustools user, docker group, linger, directories
    ├── secrets_bootstrap/    # Writes Infisical env + ansible-vault pass + GitHub PAT
    ├── config/               # Deploys kiosk.sh, sync-watchtower.js, fetch-secrets.js, etc.
    └── services/             # All systemd units (kiosk, app, sync, secrets-fetch, ansible-update)
```

## First-Time Setup

### 1. Create inventory.ini

```bash
cp inventory.ini.tpl inventory.ini
# Edit inventory.ini with your Pi's IP address
```

### 2. Create and encrypt vault.yml

```bash
cp group_vars/all/vault.yml.tpl group_vars/all/vault.yml
# Edit vault.yml with real secrets (see vault.yml.tpl for descriptions)
ansible-vault encrypt group_vars/all/vault.yml
```

### 3. Run the playbook

```bash
# From deploy/ansible/
ansible-playbook playbook.yml --ask-vault-pass

# Or from repo root:
ansible-playbook -i deploy/ansible/inventory.ini deploy/ansible/playbook.yml --ask-vault-pass
```

### 4. Dry-run (check mode)

```bash
ansible-playbook playbook.yml --check --ask-vault-pass
```

## Targeted Updates

Use tags to run specific roles without the full playbook:

```bash
# Update only runtime scripts
ansible-playbook playbook.yml --tags config --ask-vault-pass

# Update only systemd services
ansible-playbook playbook.yml --tags services --ask-vault-pass

# Update only secrets
ansible-playbook playbook.yml --tags secrets --ask-vault-pass
```

## Self-Update on Pi (ansible-pull)

The Pi automatically runs `ansible-pull` during its configured maintenance window.
See `roles/config/files/sync-watchtower.js` for the implementation.

Manual trigger on Pi:

```bash
sudo ansible-pull \
  -U "https://$(cat /etc/sous-github-pat)@github.com/conarwelsh/sous.tools.git" \
  deploy/ansible/playbook.yml \
  --vault-password-file /etc/sous-ansible-vault-pass \
  --accept-host-key
```

## Security Notes

- `vault.yml` is **gitignored** — never commit it
- `inventory.ini` is **gitignored** — never commit it
- All secrets flow from Ansible vault → `/etc/*` files on-device with `chmod 600`
- Infisical fetches runtime secrets at boot (Supabase keys, etc.)
