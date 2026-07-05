# Tell — full-stack deployment (Option B: live Playwright capture)
#
# Build:  docker build -t tell .
# Run:    docker run --rm -p 3000:3000 --env-file .env tell
#
# Requires ~2 GB RAM for Chromium. Use Render/Railway/Fly with this Dockerfile.

FROM node:20-bookworm

RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# Playwright system deps for headless Chromium
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Workspace manifests first (layer cache)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/schema/package.json ./packages/schema/
COPY packages/core/package.json ./packages/core/
COPY packages/taste/package.json ./packages/taste/
COPY packages/redesign/package.json ./packages/redesign/
COPY packages/mcp/package.json ./packages/mcp/
COPY apps/web/package.json ./apps/web/
COPY fixtures/generic-app/package.json ./fixtures/generic-app/

RUN pnpm install --frozen-lockfile

# Source + fixtures (offline demo artifact)
COPY packages ./packages
COPY apps ./apps
COPY fixtures ./fixtures

# Chromium for capture pipeline
RUN pnpm exec playwright install --with-deps chromium

RUN pnpm -F @tell/web build

ENV NODE_ENV=production
ENV PORT=3000
ENV TELL_REPO_ROOT=/app
ENV TELL_DISABLE_REPO_SETUP=1
ENV TELL_CAPTURE_TIMEOUT_MS=90000

EXPOSE 3000

WORKDIR /app/apps/web
CMD ["pnpm", "start"]
