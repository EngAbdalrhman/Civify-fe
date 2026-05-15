# -----------------------------------------------------------------------------
# 1. Base Stage
# -----------------------------------------------------------------------------
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# -----------------------------------------------------------------------------
# 2. Deps Stage
# -----------------------------------------------------------------------------
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN PNPM_ALLOW_BUILT_DEPENDENCIES=true pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# 3. Builder Stage (ARGS ADDED HERE)
# -----------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --- Build Args & Envs ---
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_CLARITY_PROJECT_ID
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_ADS_ENABLED
ARG NEXT_TELEMETRY_DISABLED
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_CLARITY_PROJECT_ID=$NEXT_PUBLIC_CLARITY_PROJECT_ID
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_ADS_ENABLED=$NEXT_PUBLIC_ADS_ENABLED
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED
# ------------------------------

RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    export SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) && \
    pnpm run build

# -----------------------------------------------------------------------------
# 4. Runner Stage
# -----------------------------------------------------------------------------
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Install Chromium and required dependencies for Puppeteer
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
       ca-certificates \
       chromium \
       fonts-ipafont-gothic \
       fonts-wqy-zenhei \
       fonts-thai-tlwg \
       fonts-kacst \
       fonts-freefont-ttf \
       fonts-liberation \
       fonts-noto-color-emoji \
       libxss1 \
       libgbm1 \
       libnss3 \
       libatk-bridge2.0-0 \
       libgtk-3-0 \
       libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Set Puppeteer environment variables
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create writable directories for Chromium crash handler, user data, and XDG dirs
RUN mkdir -p /tmp/chromium-crashes /tmp/chromium-data /tmp/.chromium \
    && chown -R nextjs:nodejs /tmp/chromium-crashes /tmp/chromium-data /tmp/.chromium

# Set XDG directories so chrome_crashpad_handler can find a writable database path
ENV XDG_CONFIG_HOME=/tmp/.chromium
ENV XDG_CACHE_HOME=/tmp/.chromium

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]