#!/bin/bash
export PATH="$HOME/.local/node/bin:$PATH"
cd ~/code/sous.tools
pnpm build --filter app
