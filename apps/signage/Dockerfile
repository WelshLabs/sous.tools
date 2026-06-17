# Base image
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
# Set working directory
WORKDIR /app
RUN npm install -g turbo
COPY . .
# Prune the workspace for the signage app
RUN turbo prune signage --docker

FROM base AS installer
WORKDIR /app

# First install dependencies
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
# Inject Infisical mock during build to allow static build without real secrets
ENV INFISICAL_MOCK=true
RUN pnpm turbo build --filter=signage

FROM base AS runner
WORKDIR /app

# Create a system user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=installer /app .

USER nextjs

EXPOSE 5003

ENV PORT=5003
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["pnpm", "--filter", "signage", "start"]
