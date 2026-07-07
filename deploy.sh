#!/bin/bash

# 1. IaC Network Check: Create the shared bridge if it doesn't exist
docker network inspect traefik_public >/dev/null 2>&1 || docker network create traefik_public

# 2. Build the new images natively in the background
docker compose build

# 3. Hot-swap the containers
docker compose up -d

# 4. Clean up old artifacts
docker image prune -f
docker builder prune -f