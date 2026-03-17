# CV Builder Backend Dockerfile
# Multi-stage build for production — includes Chromium for Puppeteer

# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Skip Puppeteer's bundled Chromium download — we use system Chromium at runtime
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

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
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# Tell Puppeteer to use the system-installed Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install Chromium and its runtime dependencies
RUN apt-get update && apt-get install -y \
  chromium \
  fonts-liberation \
  fonts-noto-color-emoji \
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

# Create required directories
RUN mkdir -p uploads thumbnails && chown -R backend:nodejs uploads thumbnails

USER backend

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/monitoring/health || exit 1

CMD ["node", "dist/server.js"]
