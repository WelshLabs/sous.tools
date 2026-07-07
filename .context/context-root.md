This file is a merged representation of a subset of the codebase, containing specifically included files and files not matching ignore patterns, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of a subset of the repository's contents that is considered the most important context.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
5. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Only files matching these patterns are included: package.json, turbo.json, tsconfig.json, docker-compose.dev.yml, docker-compose.yml, Dockerfile.dev
- Files matching these patterns are excluded: **/node_modules/**, **/dist/**, **/.next/**, **/out/**, **/build/**, package-lock.json, yarn.lock, pnpm-lock.yaml, **/.git/**, **/*.png, **/*.jpg, **/*.jpeg, **/*.svg, **/*.ico
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

# Directory Structure
```
docker-compose.dev.yml
docker-compose.yml
Dockerfile.dev
package.json
turbo.json
```

# Files

## File: Dockerfile.dev
```
FROM node:22-bookworm-slim

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
```

## File: docker-compose.dev.yml
```yaml
version: "3.8"

services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--providers.docker.endpoint=unix:///var/run/docker.sock"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
    restart: unless-stopped

  redis:
    image: redis:alpine
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  api:
    build:
      context: .
      dockerfile: Dockerfile.dev
    depends_on:
      - redis
    ports:
      - "6001:6001"
    environment:
      - NODE_ENV=development
      - VISION_PROVIDER=ollama
      - OLLAMA_URL=http://ollama:11434
      - REDIS_URL=redis://redis:6379
      - INFISICAL_CLIENT_ID=${INFISICAL_CLIENT_ID}
      - INFISICAL_CLIENT_SECRET=${INFISICAL_CLIENT_SECRET}
      - INFISICAL_PROJECT_ID=${INFISICAL_PROJECT_ID}
      - CI=true
      - REDIS_HOST=redis
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./:/app
    command: sh -c "cd apps/api && npm run dev"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.sous.localhost`)"
      - "traefik.http.services.api.loadbalancer.server.port=6001"
    restart: unless-stopped

  web:
    build:
      context: .
      dockerfile: Dockerfile.dev
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_URL=http://api.sous.localhost
      - INFISICAL_CLIENT_ID=${INFISICAL_CLIENT_ID}
      - INFISICAL_CLIENT_SECRET=${INFISICAL_CLIENT_SECRET}
      - INFISICAL_PROJECT_ID=${INFISICAL_PROJECT_ID}
      - CI=true
    depends_on:
      - api
    volumes:
      - ./:/app
    command: sh -c "cd apps/web && npm run dev"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.web.rule=Host(`sous.localhost`)"
      - "traefik.http.services.web.loadbalancer.server.port=3000"
    restart: unless-stopped

  pos-simulator:
    build:
      context: .
      dockerfile: Dockerfile.dev
    environment:
      - NODE_ENV=development
      - INFISICAL_CLIENT_ID=${INFISICAL_CLIENT_ID}
      - INFISICAL_CLIENT_SECRET=${INFISICAL_CLIENT_SECRET}
      - INFISICAL_PROJECT_ID=${INFISICAL_PROJECT_ID}
      - CI=true
    depends_on:
      - api
    volumes:
      - ./:/app
    command: sh -c "cd apps/pos-simulator && npm run dev"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.pos.rule=Host(`pos.sous.localhost`)"
    restart: unless-stopped

  setup-portal:
    build:
      context: .
      dockerfile: Dockerfile.dev
    environment:
      - NODE_ENV=development
      - INFISICAL_CLIENT_ID=${INFISICAL_CLIENT_ID}
      - INFISICAL_CLIENT_SECRET=${INFISICAL_CLIENT_SECRET}
      - INFISICAL_PROJECT_ID=${INFISICAL_PROJECT_ID}
      - CI=true
    depends_on:
      - api
    volumes:
      - ./:/app
    command: sh -c "cd apps/setup-portal && npm run dev"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.setup.rule=Host(`setup.sous.localhost`)"
    restart: unless-stopped

  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

  ollama-pull:
    image: ollama/ollama:latest
    entrypoint: /bin/sh
    command: -c "sleep 10 && ollama pull llama3.2-vision"
    depends_on:
      - ollama

volumes:
  redis_data:
  ollama_data:
```

## File: docker-compose.yml
```yaml
version: "3.8"

services:
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=false"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=conar@sous.tools"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "letsencrypt:/letsencrypt"
    restart: unless-stopped

  redis:
    image: redis:alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  ollama:
    image: ollama/ollama:latest
    container_name: ollama
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped
    # Ports deliberately not exposed to the outside world

  api:
    image: ghcr.io/conarwelsh/soustools-api:latest
    depends_on:
      - redis
    environment:
      - VISION_PROVIDER=ollama
      - OLLAMA_URL=http://ollama:11434
      - INFISICAL_CLIENT_ID=${INFISICAL_CLIENT_ID}
      - INFISICAL_CLIENT_SECRET=${INFISICAL_CLIENT_SECRET}
      - INFISICAL_PROJECT_ID=${INFISICAL_PROJECT_ID}
      - REDIS_HOST=redis
      - REDIS_URL=redis://redis:6379
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.sous.tools`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
    restart: unless-stopped

  editor:
    image: lscr.io/linuxserver/code-server:latest
    container_name: code-server
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=America/New_York
      - PASSWORD=sousToolsPassword
      - SUDO_PASSWORD=sousToolsPassword
    volumes:
      - /code/sous.tools:/config/workspace
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.editor.rule=Host(`editor.sous.tools`)"
      - "traefik.http.routers.editor.entrypoints=websecure"
      - "traefik.http.routers.editor.tls.certresolver=myresolver"

  ollama-pull:
    image: ollama/ollama:latest
    container_name: ollama-pull
    depends_on:
      - ollama
    environment:
      - OLLAMA_HOST=http://ollama:11434
    command: >
      sh -c "sleep 10 && ollama pull qwen2.5-coder:3b && ollama pull nomic-embed-text && ollama pull llama3.2-vision"

volumes:
  letsencrypt:
  redis_data:
  ollama_data:
```

## File: turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalEnv": [
    "INFISICAL_MOCK",
    "INFISICAL_CLIENT_ID",
    "INFISICAL_CLIENT_SECRET",
    "INFISICAL_PROJECT_ID",
    "INFISICAL_ENV"
  ],
  "tasks": {
    "secrets:sync": {
      "cache": false
    },
    "build": {
      "dependsOn": ["secrets:sync", "^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "dependsOn": ["secrets:sync", "^build"],
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"]
    }
  }
}
```

## File: package.json
```json
{
  "name": "sous-tools-monorepo",
  "private": true,
  "scripts": {
    "build": "INFISICAL_MOCK=true turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "test": "INFISICAL_MOCK=true turbo test",
    "secrets:sync": "pnpm --filter @soustools/config secrets:sync",
    "audit:secrets": "npx tsx scripts/audit-secrets.ts",
    "clean:all": "rm -rf node_modules apps/*/node_modules packages/*/node_modules apps/*/.next apps/*/dist packages/*/dist .turbo apps/*/.turbo packages/*/.turbo && pnpm install",
    "clean:dockerimages": "sudo bash -c 'rm -rf node_modules apps/*/node_modules packages/*/node_modules .pnpm-store'",
    "push:all": "git push origin HEAD:main HEAD:staging",
    "context:tree": "repomix . --include-full-directory-structure --no-files --output .context/context-tree.md",
    "context:root": "repomix . --include \"package.json,turbo.json,tsconfig.json,docker-compose.dev.yml,docker-compose.yml,Dockerfile.dev\" --output .context/context-root.md",
    "context:agents": "repomix .agents --output .context/context-agents.md",
    "context:api": "repomix apps/api/src --ignore \"**/*.spec.ts\" --output .context/context-api.md",
    "context:web": "repomix apps/web/src --ignore \"**/*.test.tsx\" --output .context/context-web.md",
    "context:design-system": "repomix packages/design-system/src --output .context/context-design-system.md",
    "context:domains": "repomix packages/domain-*/src packages/api-types/src --output .context/context-domains.md",
    "context:db": "repomix supabase --output .context/context-db.md",
    "context:wearos": "repomix apps/wearos --output .context/context-wearos.md",
    "context:all": "pnpm run context:tree && pnpm run context:root && pnpm run context:agents && pnpm run context:api && pnpm run context:web && pnpm run context:design-system && pnpm run context:domains && pnpm run context:db && pnpm run context:wearos",
    "docker": "docker-compose -f docker-compose.dev.yml up -d",
    "import:book": "infisical run -- pnpm --filter cli run start -- import:textbook 'https://play.google.com/books/reader?id=H39zEAAAQBAJ&pg=GBS.PA150' --pages 5",
    "build:packages": "pnpm --filter './packages/**' build",
    "restart:traefik": "docker compose -f docker-compose.dev.yml restart traefik"
  },
  "devDependencies": {
    "prettier": "^3.0.0",
    "repomix": "^1.16.0",
    "turbo": "^2.9.17"
  },
  "engines": {
    "node": ">=22.22.0"
  },
  "packageManager": "pnpm@11.5.2",
  "dependencies": {
    "jsonwebtoken": "^9.0.3"
  }
}
```
