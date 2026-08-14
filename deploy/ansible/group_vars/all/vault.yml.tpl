# vault.yml.tpl — Template for the encrypted Ansible Vault secrets file.
#
# SETUP:
#   1. Copy this file:
#        cp vault.yml.tpl vault.yml
#   2. Fill in all values below.
#   3. Encrypt the file:
#        ansible-vault encrypt vault.yml
#   4. NEVER commit vault.yml — it is in .gitignore.
#
# To edit later:
#   ansible-vault edit vault.yml
#
# To view:
#   ansible-vault view vault.yml

vault_infisical_client_id: ""
vault_infisical_client_secret: ""
vault_infisical_project_id: "4e40fdc4-358b-4216-b7c4-30e5506f9277"
vault_infisical_env: "prod"
vault_signage_image_tag: "production"

# GitHub fine-grained PAT with read-only access to WelshLabs/sous.tools
# Used by ansible-pull on the Pi during maintenance window self-updates
vault_github_pat: ""

# Ansible vault password written to /etc/sous-ansible-vault-pass on the Pi
# so ansible-pull can decrypt vault.yml without interactive prompt.
# Generate: openssl rand -base64 32
vault_ansible_vault_pass: ""
