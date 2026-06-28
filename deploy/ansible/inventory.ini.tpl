# Inventory template — copy to inventory.ini and fill in real values.
# inventory.ini is gitignored and must never be committed.
#
# Usage:
#   cp inventory.ini.tpl inventory.ini
#   # Edit inventory.ini with your Pi's real IP and SSH key path
#
[signage_nodes]
signage-pi-01 ansible_host=<PI_IP_ADDRESS> ansible_user=soustools ansible_ssh_private_key_file=~/.ssh/id_rsa

# Add more nodes as needed:
# signage-pi-02 ansible_host=<PI_IP_ADDRESS_2> ansible_user=soustools ansible_ssh_private_key_file=~/.ssh/id_rsa

[signage_nodes:vars]
# Ansible will connect as soustools and escalate to root via sudo
ansible_become=true
ansible_become_method=sudo
