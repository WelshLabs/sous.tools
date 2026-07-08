# Base image explicitly targeting ARM64
FROM node:24-alpine AS base
ARG APP_VERSION
ENV APP_VERSION=${APP_VERSION}
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
# Set working directory
WORKDIR /app
RUN npm install -g turbo
COPY . .
# Prune the workspace for the NestJS api app
RUN turbo prune api --docker

FROM base AS installer
WORKDIR /app

# First install dependencies
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm turbo build --filter=api

FROM base AS runner
WORKDIR /app

# Create a system user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copy built files from installer
COPY --from=installer /app .

USER nestjs

# Expose the NestJS API port (3001 in the 3000-3003 block)
EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["pnpm", "--filter", "api", "start:prod"]
