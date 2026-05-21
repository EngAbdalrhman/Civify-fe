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
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm install --frozen-lockfile

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
ENV IS_BUILD="true"

RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
    export SENTRY_AUTH_TOKEN=$(cat /run/secrets/SENTRY_AUTH_TOKEN) && \
    node -e "const u=(process.env.NEXT_PUBLIC_API_URL||'https://civify.cv/apis')+'/v1/blogs';fetch(u).then(r=>{if(!r.ok)console.warn('WARN: blog API',r.status,'during build');}).catch(e=>console.warn('WARN: blog API unreachable during build:',e.message))" && \
    pnpm run build

# -----------------------------------------------------------------------------
# 4. Runner Stage
# -----------------------------------------------------------------------------
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Prefer IPv4 DNS resolution (mitigates EAI_AGAIN in Docker Swarm)
ENV NODE_OPTIONS="--dns-result-order=ipv4first"

# Ensure /etc/hosts is consulted by getaddrinfo (debian:slim ships without nsswitch.conf,
# so Swarm host-add / extra_hosts entries are otherwise ignored → EAI_AGAIN).
RUN echo "hosts: files dns" > /etc/nsswitch.conf

# Inject build args as ENVs for runtime
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
# INTERNAL_API_URL: set only in Dokploy (frontend service env), NOT in GitHub — see docs/BLOG_DEPLOY.md

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

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && chown nextjs:nodejs /app

# Entrypoint starts as root (chmod /etc/hosts), then drops to nextjs via runuser
USER root

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Entrypoint runs as root briefly to chmod /etc/hosts, then exec node (standalone server)
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]