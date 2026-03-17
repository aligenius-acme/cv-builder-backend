# CV Builder Backend Dockerfile
# Multi-stage build — Puppeteer downloads its own Chrome in the builder stage,
# which is then copied to the runner so no system Chromium install is needed.

# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Allow Puppeteer to download its own Chrome during npm ci.
# The cache lands in /root/.cache/puppeteer and is copied to the runner below.
ENV PUPPETEER_CACHE_DIR=/root/.cache/puppeteer

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Stage 2: Production
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
# Point Puppeteer at the cache directory we copy from the builder
ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer
# Skip re-download — Chrome is already in the cache
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install runtime libraries required by Puppeteer's bundled Chrome on Debian slim
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

# Copy build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Copy Puppeteer's downloaded Chrome from the builder stage
COPY --from=builder /root/.cache/puppeteer /app/.cache/puppeteer

# Create required directories and fix ownership
RUN mkdir -p uploads thumbnails \
  && chown -R backend:nodejs uploads thumbnails /app/.cache

USER backend

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/monitoring/health || exit 1

CMD ["node", "dist/server.js"]
