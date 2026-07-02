#!/bin/bash
mkdir -p ~/.local/node
curl -fsSL https://nodejs.org/dist/v22.14.0/node-v22.14.0-linux-x64.tar.xz | tar -xJ -C ~/.local/node --strip-components=1
export PATH="$HOME/.local/node/bin:$PATH"
cd ~/code/sous.tools
npm i -g pnpm@11.9.0
pnpm install
