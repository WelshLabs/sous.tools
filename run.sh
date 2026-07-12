#!/bin/bash
export PATH=/home/conar/.nvm/versions/node/v22.22.0/bin:$PATH
cd /home/conar/code/sous.tools
pnpm install
pnpm run lint
pnpm run build
