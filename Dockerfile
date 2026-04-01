# CV Builder Backend Dockerfile
# Multi-stage build for production

# ─── Stage 1: Build TypeScript ────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

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
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install system Chromium (apt-managed, guaranteed compatible with this container's
# glibc/kernel) and fonts for PDF rendering.
# Using system Chromium avoids @sparticuz/chromium binary incompatibilities
# that occur when the Lambda-targeted binary runs on non-Lambda container runtimes.
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  fonts-noto-color-emoji \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use the system-installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Create non-root user
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs backend

# Copy build artifacts
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Create required directories
RUN mkdir -p uploads thumbnails && chown -R backend:nodejs uploads thumbnails

USER backend

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/monitoring/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
