#!/bin/bash
ssh -i ssh-key.key -o StrictHostKeyChecking=no ubuntu@129.158.244.62 "export PATH=/home/ubuntu/.config/code-server/.nvm/versions/node/v22.23.1/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin && cd /home/ubuntu/dev.sous.tools && $*"
