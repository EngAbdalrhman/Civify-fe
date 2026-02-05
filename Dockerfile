# -----------------------------------------------------------------------------
# 1. Base Stage
# -----------------------------------------------------------------------------
FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# -----------------------------------------------------------------------------
# 2. Deps Stage
# -----------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# 3. Builder Stage (ARGS ADDED HERE)
# -----------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --- NEW: Build Args & Envs ---
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_CLARITY_PROJECT_ID
ARG NEXT_TELEMETRY_DISABLED

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_CLARITY_PROJECT_ID=$NEXT_PUBLIC_CLARITY_PROJECT_ID
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED
# ------------------------------

RUN pnpm run build

# -----------------------------------------------------------------------------
# 4. Runner Stage
# -----------------------------------------------------------------------------
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
# Re-declare Telemetry disabled for runtime efficiency
ENV NEXT_TELEMETRY_DISABLED=1

# Install Puppeteer/Chromium dependencies
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && apt-get install -y chromium \
    && apt-get install -y fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Extract and decompress chromium binary from tar
# The tar contains Brotli-compressed files (.br), we need to decompress them
RUN apk add --no-cache brotli && \
    mkdir -p /app/chromium && \
    tar -xf ./public/chromium-pack.tar -C /app/chromium && \
    brotli -d /app/chromium/chromium.br -o /app/chromium/chromium && \
    chmod +x /app/chromium/chromium && \
    rm /app/chromium/chromium.br && \
    chown -R nextjs:nodejs /app/chromium && \
    ls -la /app/chromium/ && \
    echo "Chromium binary size:" && \
    du -h /app/chromium/chromium

# Set environment variable for the chromium executable path
ENV CHROMIUM_EXECUTABLE_PATH=/app/chromium/chromium

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]