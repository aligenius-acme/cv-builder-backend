# CV Builder Backend Dockerfile
# Multi-stage build for production

# ─── Stage 1: Build TypeScript ────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Skip Chrome download in the build stage — we install it in the runner stage
# directly so there is no cross-stage cache copy that can silently fail.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# ─── Stage 2: Production runner ───────────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer

# Install runtime libraries required by Puppeteer's Chrome on Debian slim
RUN apt-get update && apt-get install -y \
  fonts-liberation \
  fonts-noto-color-emoji \
  libnspr4 \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2 \
  libpango-1.0-0 \
  libcairo2 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs backend

# Copy node_modules first — stable layer, only invalidated when package.json changes
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Download Puppeteer's Chrome directly into the runner image.
# Placed after node_modules so it is layer-cached unless dependencies change.
# PUPPETEER_CACHE_DIR is already set above; this command is authoritative and
# will fail the build if Chrome cannot be downloaded.
RUN npx puppeteer browsers install chrome \
  && echo "=== Puppeteer Chrome install complete ===" \
  && find /app/.cache/puppeteer -type f -name "chrome" -o -name "chrome-headless-shell" 2>/dev/null

# Copy remaining build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Create required directories and fix ownership
RUN mkdir -p uploads thumbnails \
  && chown -R backend:nodejs uploads thumbnails /app/.cache

USER backend

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/monitoring/health || exit 1

CMD ["node", "dist/server.js"]
